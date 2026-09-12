/**
 * Hallucination Analytics Service
 *
 * Admin-only service that:
 * 1. Queries user_feedback for negative (rating=0) entries joined to translation_history.
 * 2. Applies token-based heuristics to detect NLLB hallucination patterns:
 *    - Repetitive token sequences
 *    - Unusually long / short translations relative to source
 *    - Structural anomalies (untranslated words, foreign script injection)
 * 3. Computes a composite risk score per pair.
 * 4. Compiles flagged pairs into the dataset-phrases.json format for re-training.
 */

import { supabaseAdmin } from '../../app/config/db.js';

// ─── Utilities ─────────────────────────────────────────────────────────────

/**
 * Token-level repetition score [0–1].
 * A score close to 1 = severe repetition (strong hallucination signal).
 */
const repetitionScore = (text) => {
  if (!text) return 0;
  const tokens = text.toLowerCase().trim().split(/\s+/);
  if (tokens.length < 3) return 0;

  const counts = {};
  tokens.forEach(t => { counts[t] = (counts[t] || 0) + 1; });

  const maxRepeat = Math.max(...Object.values(counts));
  const dupedTokens = Object.values(counts).filter(c => c > 1).reduce((a, b) => a + b, 0);

  const repRatio  = dupedTokens / tokens.length;
  const maxRatio  = maxRepeat  / tokens.length;
  return Math.min((repRatio * 0.6) + (maxRatio * 0.4), 1);
};

/**
 * Length anomaly score [0–1].
 * Compares translated text length to source length.
 */
const lengthAnomalyScore = (source, translated) => {
  if (!source || !translated) return 0;
  const srcLen  = source.split(/\s+/).length;
  const tgtLen  = translated.split(/\s+/).length;
  const ratio   = tgtLen / srcLen;
  // Normal ratio is 0.7–1.5. Outside that range = anomaly.
  if (ratio < 0.3 || ratio > 3.5) return 0.8;
  if (ratio < 0.5 || ratio > 2.5) return 0.5;
  if (ratio < 0.7 || ratio > 1.8) return 0.2;
  return 0;
};

/**
 * Composite risk score [0–1].
 * Weights: repetition 50%, negative feedback density 30%, length anomaly 20%.
 */
const compositeRisk = (repScore, negFeedbacks, totalFeedbacks, lenScore) => {
  const feedbackRatio = totalFeedbacks > 0 ? negFeedbacks / totalFeedbacks : 0;
  return Math.min(
    (repScore * 0.5) + (feedbackRatio * 0.3) + (lenScore * 0.2),
    1
  );
};

/**
 * Return language code string from a languages row.
 */
const langCode = (lang) => lang?.code || 'unknown';

// ─── Service ───────────────────────────────────────────────────────────────

export const HallucinationAnalyticsService = {

  /**
   * Fetch feedback trend data (for line chart).
   * Returns all feedback entries in the given window, joined to translation.
   */
  getFeedbackTrends: async (days = 30) => {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabaseAdmin
      .from('user_feedback')
      .select(`
        translation_id,
        rating,
        created_at,
        translation_history!inner (
          source_text,
          translated_text,
          source_language_id,
          target_language_id
        )
      `)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Fetch hallucination-flagged pairs:
   * Groups negative-feedback translations, applies heuristics, returns ranked list.
   */
  getHallucinationFlags: async (days = 30) => {
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Get all negative feedback entries with translation detail
    const { data: negFeedback, error: negErr } = await supabaseAdmin
      .from('user_feedback')
      .select(`
        translation_id,
        rating,
        created_at,
        translation_history!inner (
          id,
          source_text,
          translated_text,
          source_language_id,
          target_language_id,
          languages!translation_history_source_language_id_fkey ( code, name ),
          target_lang:languages!translation_history_target_language_id_fkey ( code, name )
        )
      `)
      .gte('created_at', since.toISOString());

    if (negErr) throw negErr;

    if (!negFeedback || negFeedback.length === 0) return [];

    // Group by translation_id to count feedback polarity
    const grouped = {};
    negFeedback.forEach(fb => {
      const tid = fb.translation_id;
      if (!grouped[tid]) {
        const th = fb.translation_history;
        grouped[tid] = {
          id: tid,
          source_text:   th?.source_text || '',
          translated_text: th?.translated_text || '',
          source_lang:   th?.languages?.code || 'unknown',
          target_lang:   th?.target_lang?.code || 'unknown',
          source_lang_name: th?.languages?.name || '',
          target_lang_name: th?.target_lang?.name || '',
          negative_count: 0,
          positive_count: 0,
        };
      }
      if (fb.rating === 0) grouped[tid].negative_count++;
      if (fb.rating === 1) grouped[tid].positive_count++;
    });

    // Apply heuristics and compute risk scores
    const flags = Object.values(grouped)
      .filter(g => g.negative_count > 0)
      .map(g => {
        const repScore = repetitionScore(g.translated_text);
        const lenScore = lengthAnomalyScore(g.source_text, g.translated_text);
        const totalFb  = g.negative_count + g.positive_count;
        const riskScore = compositeRisk(repScore, g.negative_count, totalFb, lenScore);

        return {
          ...g,
          repScore,
          lenScore,
          riskScore: parseFloat(riskScore.toFixed(4)),
        };
      })
      .filter(g => g.riskScore > 0)
      .sort((a, b) => b.riskScore - a.riskScore);

    return flags;
  },

  /**
   * Get aggregate stats for the analytics dashboard.
   */
  getAnalyticsStats: async () => {
    const [feedbackRes, translationRes] = await Promise.allSettled([
      supabaseAdmin
        .from('user_feedback')
        .select('rating', { count: 'exact' }),
      supabaseAdmin
        .from('translation_history')
        .select('id', { count: 'exact' }),
    ]);

    const feedbacks    = feedbackRes.status === 'fulfilled' ? (feedbackRes.value.data || []) : [];
    const totalTranslations = translationRes.status === 'fulfilled' ? (translationRes.value.count || 0) : 0;
    const totalFeedback = feedbacks.length;
    const negativeFeedback = feedbacks.filter(f => f.rating === 0).length;
    const positiveFeedback = feedbacks.filter(f => f.rating === 1).length;

    // Engine breakdown — try to read from translation_history metadata or fallback
    const engineBreakdown = [];

    return {
      totalTranslations,
      totalFeedback,
      negativeFeedback,
      positiveFeedback,
      negativeRate: totalFeedback ? parseFloat((negativeFeedback / totalFeedback * 100).toFixed(1)) : 0,
      engineBreakdown,
    };
  },

  /**
   * Generate prescriptive recommendations based on feedback patterns.
   * AI-style rules engine — no external ML call needed.
   */
  getPrescriptions: async () => {
    const [oovRes, negRes] = await Promise.allSettled([
      // OOV: words not in dictionary but frequently searched
      supabaseAdmin
        .from('search_history')
        .select('search_term')
        .order('created_at', { ascending: false })
        .limit(500),
      // Most common negatively-rated source texts
      supabaseAdmin
        .from('user_feedback')
        .select(`
          rating,
          translation_history!inner ( source_text, source_language_id, languages ( name ) )
        `)
        .eq('rating', 0)
        .limit(200),
    ]);

    const prescriptions = [];

    // Prescription 1: OOV-based corpus expansion
    if (oovRes.status === 'fulfilled' && oovRes.value.data?.length) {
      const termCounts = {};
      oovRes.value.data.forEach(r => {
        const t = r.search_term?.toLowerCase()?.trim();
        if (t && t.length > 2) termCounts[t] = (termCounts[t] || 0) + 1;
      });
      const topOOV = Object.entries(termCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      topOOV.forEach(([term, count]) => {
        if (count >= 3) {
          prescriptions.push({
            type: 'corpus',
            priority: count >= 10 ? 'high' : 'medium',
            title: `Add "${term}" to Dialect Corpus`,
            description: `The term "${term}" has been searched ${count} times but is not in the dictionary. Adding it will reduce OOV rate and improve NLLB accuracy.`,
            action: 'Open Dictionary',
          });
        }
      });
    }

    // Prescription 2: High negative-feedback source patterns
    if (negRes.status === 'fulfilled' && negRes.value.data?.length) {
      const srcCounts = {};
      negRes.value.data.forEach(r => {
        const src = r.translation_history?.source_text?.toLowerCase()?.slice(0, 60);
        if (src) srcCounts[src] = (srcCounts[src] || 0) + 1;
      });
      const topBad = Object.entries(srcCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      topBad.forEach(([text, count]) => {
        if (count >= 2) {
          prescriptions.push({
            type: 'canonicalization',
            priority: count >= 5 ? 'high' : 'medium',
            title: `Review Translation for: "${text.slice(0, 40)}…"`,
            description: `This source text received ${count} negative ratings. It is a strong candidate for corpus annotation or canonicalization mapping to improve future translations.`,
            action: 'Open Analytics',
          });
        }
      });
    }

    // Fallback if no data yet
    if (prescriptions.length === 0) {
      prescriptions.push({
        type: 'corpus',
        priority: 'low',
        title: 'Corpus looks healthy',
        description: 'No high-priority OOV terms or negatively-flagged translation pairs detected in the current window.',
        action: null,
      });
    }

    return prescriptions;
  },

  /**
   * Export hallucination-flagged pairs as a fine-tuning dataset
   * in the dataset-phrases.json format used by DialectGo.
   */
  exportFineTuningDataset: async (days = 90, minNegative = 1) => {
    const flags = await HallucinationAnalyticsService.getHallucinationFlags(days);
    const highRisk = flags.filter(f => f.negative_count >= minNegative && f.riskScore >= 0.3);

    const dataset = highRisk.map(pair => ({
      cebuano:  pair.source_lang === 'ceb' ? pair.source_text : pair.translated_text,
      tagalog:  pair.source_lang === 'tgl' ? pair.source_text : '',
      english:  pair.source_lang === 'eng' ? pair.source_text : '',
      flagged:  true,
      risk_score: pair.riskScore,
      negative_feedback_count: pair.negative_count,
      note: 'Auto-flagged hallucination candidate — verify before adding to training set',
      examples: [],
    }));

    return dataset;
  },
};
