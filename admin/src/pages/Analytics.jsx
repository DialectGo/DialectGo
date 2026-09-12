import React, { useState, useEffect, useCallback } from 'react';
import {
  Line, Bar
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Tooltip, Legend, Filler
} from 'chart.js';
import {
  BarChart2, AlertTriangle, ThumbsDown, ThumbsUp,
  Download, RefreshCw, Filter, Layers, Info,
  TrendingDown, Zap, Database, ChevronRight, CheckCircle, X
} from 'lucide-react';
import JsonView from '@uiw/react-json-view';
import { apiFetch } from '../services/apiService';

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Tooltip, Legend, Filler
);

// ─── Shared chart defaults ─────────────────────────────────────────────────
const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: { family: 'Inter', size: 12, weight: '600' },
        color: '#634F4B',
        usePointStyle: true,
        pointStyleWidth: 8,
        padding: 20,
      },
    },
    tooltip: {
      backgroundColor: '#FFFFFF',
      titleColor: '#421C00',
      bodyColor: '#634F4B',
      borderColor: '#F0E8D5',
      borderWidth: 1,
      padding: 12,
      titleFont: { family: 'Inter', size: 12, weight: '700' },
      bodyFont: { family: 'Inter', size: 12 },
      cornerRadius: 10,
      displayColors: true,
      boxWidth: 10,
      boxHeight: 10,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(240,232,213,0.6)', drawBorder: false },
      ticks: { color: '#9A8177', font: { family: 'Inter', size: 11 } },
    },
    y: {
      grid: { color: 'rgba(240,232,213,0.6)', drawBorder: false },
      ticks: { color: '#9A8177', font: { family: 'Inter', size: 11 } },
      beginAtZero: true,
    },
  },
};

// Build labels for last N days
const buildDayLabels = (n) => {
  const labels = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  return labels;
};

// ─── Stat Card ─────────────────────────────────────────────────────────────
const AnalyticStat = ({ icon: Icon, label, value, sub, color, bg }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: bg, color }}>
      <Icon size={20} />
    </div>
    <div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-trend down">{sub}</div>}
    </div>
  </div>
);

// ─── Risk Score Bar ────────────────────────────────────────────────────────
const RiskBar = ({ score }) => {
  const pct = Math.min(Math.round(score * 100), 100);
  const color = pct >= 70 ? 'var(--danger)' : pct >= 40 ? 'var(--warning)' : 'var(--success)';
  return (
    <div className="risk-bar">
      <div className="risk-bar-track">
        <div className="risk-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color, minWidth: 32, textAlign: 'right' }}>{pct}%</span>
    </div>
  );
};

// ─── Helper: compute repetition score ─────────────────────────────────────
const computeRepetitionScore = (text) => {
  if (!text) return 0;
  const tokens = text.toLowerCase().split(/\s+/);
  if (tokens.length < 2) return 0;
  const counts = {};
  tokens.forEach(t => { counts[t] = (counts[t] || 0) + 1; });
  const dupes = Object.values(counts).filter(c => c > 1).reduce((a, b) => a + b, 0);
  return dupes / tokens.length;
};

// ─── Main Analytics Page ───────────────────────────────────────────────────
const Analytics = () => {
  const [activeTab, setActiveTab] = useState('hallucination');
  const [period, setPeriod] = useState('30d');
  const [feedbackData, setFeedbackData]     = useState([]);
  const [hallucinationData, setHallucinationData] = useState([]);
  const [analyticsStats, setAnalyticsStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportPreview, setExportPreview] = useState(null);
  const [selectedLang, setSelectedLang] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const PERIODS = [
    { label: '7D', value: '7d', days: 7 },
    { label: '30D', value: '30d', days: 30 },
    { label: '90D', value: '90d', days: 90 },
  ];

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const days = PERIODS.find(p => p.value === period)?.days ?? 30;
      const [feedbackRes, hallucinationRes, statsRes, presRes] = await Promise.allSettled([
        apiFetch(`/api/admin/analytics/feedback-trends?days=${days}`),
        apiFetch(`/api/admin/analytics/hallucination-flags?days=${days}`),
        apiFetch(`/api/admin/analytics/stats`),
        apiFetch(`/api/admin/analytics/prescriptions`),
      ]);

      if (feedbackRes.status === 'fulfilled') setFeedbackData(feedbackRes.value?.data ?? []);
      if (hallucinationRes.status === 'fulfilled') setHallucinationData(hallucinationRes.value?.data ?? []);
      if (statsRes.status === 'fulfilled') setAnalyticsStats(statsRes.value?.data ?? null);
      if (presRes.status === 'fulfilled') setRecommendations(presRes.value?.data ?? []);
    } catch {
      // silently fail — we show empty states
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  // ── Build chart data ───────────────────────────────────────────────────
  const days = PERIODS.find(p => p.value === period)?.days ?? 30;
  const labels = buildDayLabels(days);

  // Feedback trend line chart
  const feedbackChartData = {
    labels,
    datasets: [
      {
        label: 'Positive (Like)',
        data: (() => {
          const map = {};
          feedbackData.filter(f => f.rating === 1).forEach(f => {
            const day = new Date(f.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            map[day] = (map[day] || 0) + 1;
          });
          return labels.map(l => map[l] || 0);
        })(),
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.1)',
        borderWidth: 2.5,
        pointRadius: 3,
        pointBackgroundColor: '#16a34a',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Negative (Unlike)',
        data: (() => {
          const map = {};
          feedbackData.filter(f => f.rating === 0).forEach(f => {
            const day = new Date(f.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            map[day] = (map[day] || 0) + 1;
          });
          return labels.map(l => map[l] || 0);
        })(),
        borderColor: '#DC2626',
        backgroundColor: 'rgba(220, 38, 38, 0.08)',
        borderWidth: 2.5,
        pointRadius: 3,
        pointBackgroundColor: '#DC2626',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Hallucination bar chart by language pair
  const langPairCounts = {};
  hallucinationData.forEach(h => {
    const pair = `${h.source_lang || 'src'} → ${h.target_lang || 'tgt'}`;
    langPairCounts[pair] = (langPairCounts[pair] || 0) + 1;
  });
  const langPairLabels = Object.keys(langPairCounts).slice(0, 8);
  const langPairValues = langPairLabels.map(k => langPairCounts[k]);

  const hallucinationBarData = {
    labels: langPairLabels.length ? langPairLabels : ['No data yet'],
    datasets: [
      {
        label: 'Flagged Pairs',
        data: langPairValues.length ? langPairValues : [0],
        backgroundColor: 'rgba(220, 38, 38, 0.75)',
        borderColor: '#DC2626',
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  // Engine distribution bar chart
  const engineCounts = { HuggingFace: 0, Groq: 0, Corpus: 0 };
  (analyticsStats?.engineBreakdown || []).forEach(e => {
    if (e.engine === 'huggingface') engineCounts.HuggingFace = e.count;
    if (e.engine === 'groq') engineCounts.Groq = e.count;
    if (e.engine === 'corpus') engineCounts.Corpus = e.count;
  });

  const engineChartData = {
    labels: ['HuggingFace (NLLB)', 'Groq (LLM)', 'Corpus Lookup'],
    datasets: [
      {
        label: 'Translations Handled',
        data: Object.values(engineCounts),
        backgroundColor: [
          'rgba(255, 213, 79, 0.7)',
          'rgba(37, 99, 235, 0.7)',
          'rgba(22, 163, 74, 0.7)',
        ],
        borderColor: ['#F4B400', '#2563EB', '#16a34a'],
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  // ── Filtered hallucination table rows ─────────────────────────────────
  const flaggedRows = hallucinationData
    .map(h => ({
      ...h,
      repScore: computeRepetitionScore(h.translated_text),
      negativeFeedbacks: h.negative_count || 0,
      riskScore: Math.min(
        (computeRepetitionScore(h.translated_text) * 0.6) +
        (Math.min((h.negative_count || 0) / 10, 1) * 0.4),
        1
      ),
    }))
    .filter(h => {
      if (selectedLang !== 'ALL' && h.source_lang !== selectedLang && h.target_lang !== selectedLang) return false;
      if (filterSeverity === 'high' && h.riskScore < 0.7) return false;
      if (filterSeverity === 'medium' && (h.riskScore < 0.4 || h.riskScore >= 0.7)) return false;
      return true;
    })
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 50);

  // ── Export dataset ─────────────────────────────────────────────────────
  const handleExportDataset = async (downloadOnly = true) => {
    setExporting(true);
    try {
      const res = await apiFetch('/api/admin/analytics/export-dataset');
      const dataset = res?.data ?? [];
      const json = JSON.stringify(dataset, null, 2);
      
      // Keep up to 100 items for the interactive preview
      setExportPreview(dataset.slice(0, 100));

      if (!downloadOnly) {
        return;
      }

      // Trigger download
      const blob = new Blob([json], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `hallucination_dataset_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  // Summary stats
  const totalNegative = feedbackData.filter(f => f.rating === 0).length;
  const totalPositive = feedbackData.filter(f => f.rating === 1).length;
  const total         = totalNegative + totalPositive;
  const negativePct   = total ? Math.round((totalNegative / total) * 100) : 0;

  const TABS = [
    { id: 'hallucination', label: 'Hallucination Detection',  icon: <AlertTriangle size={15} /> },
    { id: 'feedback',      label: 'Feedback Trends',          icon: <ThumbsDown size={15} /> },
    { id: 'engine',        label: 'Engine Telemetry',         icon: <Zap size={15} /> },
    { id: 'prescriptions', label: 'AI Recommendations',       icon: <Database size={15} /> },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>

      {/* ── Period filter ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div className="info-box info" style={{ flex: 1, minWidth: 240 }}>
          <Info size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>This dashboard analyses <strong>user feedback</strong> to detect NLLB hallucinations and surface fine-tuning opportunities.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="chart-filters">
            {PERIODS.map(p => (
              <button key={p.value} className={`chart-filter-btn ${period === p.value ? 'active' : ''}`}
                onClick={() => setPeriod(p.value)}>
                {p.label}
              </button>
            ))}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={fetchAnalytics} title="Refresh">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Summary stat strip ────────────────────────────────────── */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <AnalyticStat icon={ThumbsDown} label="Negative Feedbacks" value={loading ? '—' : totalNegative.toLocaleString()}
          sub={`${negativePct}% of total`} color="var(--danger)" bg="var(--danger-bg)" />
        <AnalyticStat icon={ThumbsUp} label="Positive Feedbacks" value={loading ? '—' : totalPositive.toLocaleString()}
          sub={null} color="var(--success)" bg="var(--success-bg)" />
        <AnalyticStat icon={AlertTriangle} label="Flagged Pairs" value={loading ? '—' : hallucinationData.length.toLocaleString()}
          sub="Potential hallucinations" color="var(--warning)" bg="var(--warning-bg)" />
        <AnalyticStat icon={TrendingDown} label="High-Risk Pairs" value={loading ? '—' : flaggedRows.filter(r => r.riskScore >= 0.7).length.toLocaleString()}
          sub="Risk score ≥ 70%" color="var(--danger)" bg="var(--danger-bg)" />
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────── */}
      <div className="tab-bar" style={{ marginBottom: 20, width: '100%', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          TAB: Hallucination Detection
      ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'hallucination' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* ── Main Content: Chart & Table ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Bar chart */}
            <div className="chart-container" style={{ margin: 0 }}>
            <div className="chart-header">
              <div>
                <div className="chart-title">Flagged Translation Pairs — By Language</div>
                <div className="chart-subtitle">Number of hallucination-suspect pairs per language pair based on negative feedback</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => handleExportDataset(false)} disabled={exporting}>
                  {exporting ? <RefreshCw size={13} className="animate-spin" /> : <Database size={13} />}
                  View JSON
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => handleExportDataset(true)} disabled={exporting}>
                  {exporting ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
                  Export Dataset
                </button>
              </div>
            </div>
            <div style={{ height: 280 }}>
              <Bar data={hallucinationBarData} options={CHART_DEFAULTS} />
            </div>
          </div>

            {/* Filters + Table */}
            <div className="table-wrapper" style={{ margin: 0 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <Filter size={14} /> Filters:
              </div>
              <select className="select" style={{ width: 'auto', fontSize: '0.8rem', padding: '6px 28px 6px 10px' }}
                value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
                <option value="ALL">All Severity</option>
                <option value="high">High Risk (≥70%)</option>
                <option value="medium">Medium Risk (40–70%)</option>
              </select>
              <select className="select" style={{ width: 'auto', fontSize: '0.8rem', padding: '6px 28px 6px 10px' }}
                value={selectedLang} onChange={e => setSelectedLang(e.target.value)}>
                <option value="ALL">All Languages</option>
                <option value="ceb">Cebuano</option>
                <option value="tgl">Tagalog</option>
                <option value="eng">English</option>
                <option value="war">Waray</option>
                <option value="ilo">Ilocano</option>
              </select>
              <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {flaggedRows.length} pairs shown
              </span>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                <div>Analysing translation logs…</div>
              </div>
            ) : flaggedRows.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon" style={{ margin: '0 auto 12px' }}><CheckCircle size={26} /></div>
                <div className="empty-text">No hallucination pairs detected</div>
                <div className="empty-subtext">No negative-feedback translation pairs found for the selected period and filters.</div>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Source Text</th>
                    <th>Translated Text</th>
                    <th>Language Pair</th>
                    <th>Neg. Feedbacks</th>
                    <th>Repetition</th>
                    <th>Risk Score</th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedRows.map((row, idx) => {
                    const risk = row.riskScore;
                    const rowClass = risk >= 0.7 ? 'hallucination-row high-risk' : risk >= 0.4 ? 'hallucination-row medium-risk' : 'hallucination-row';
                    return (
                      <tr key={row.id || idx} className={rowClass}>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{idx + 1}</td>
                        <td>
                          <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.83rem', color: 'var(--text-primary)', fontWeight: 500 }}
                            title={row.source_text}>{row.source_text || '—'}</div>
                        </td>
                        <td>
                          <div style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.83rem', color: risk >= 0.7 ? 'var(--danger)' : 'var(--text-secondary)' }}
                            title={row.translated_text}>{row.translated_text || '—'}</div>
                        </td>
                        <td>
                          <span className="badge badge-pending">
                            {row.source_lang || '?'} → {row.target_lang || '?'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${row.negativeFeedbacks > 3 ? 'flagged' : 'pending'}`}>
                            {row.negativeFeedbacks}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {Math.round(row.repScore * 100)}%
                          </span>
                        </td>
                        <td style={{ minWidth: 140 }}>
                          <RiskBar score={row.riskScore} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              )}
            </div>
          </div>

          {/* ── Right Column: JSON Viewer (Fixed Drawer) ── */}
          {exportPreview && (
            <>
              <div 
                className="sidebar-overlay" 
                onClick={() => setExportPreview(null)} 
                style={{ zIndex: 100 }} 
              />
              <div 
                className="card" 
                style={{ 
                  margin: 0, 
                  position: 'fixed', 
                  right: 0, 
                  top: 0, 
                  bottom: 0,
                  width: 'min(90vw, 450px)',
                  height: '100vh',
                  borderRadius: 0,
                  zIndex: 101,
                  boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  animation: 'slideInRight 0.3s ease'
                }}
              >
                <div className="section-header" style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 0 }}>
                  <div>
                    <div className="section-title">Dataset Export Preview</div>
                    <div className="section-subtitle">Structured for NLLB fine-tuning</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setExportPreview(null)} aria-label="Close" style={{ padding: 8 }}>
                    <X size={18} />
                  </button>
                </div>
                <div className="dataset-preview" style={{ padding: 24, overflow: 'auto', flex: 1, background: 'var(--bg-primary)' }}>
                  <JsonView 
                    value={exportPreview} 
                    displayDataTypes={false} 
                    displayObjectSize={true} 
                    collapsed={2} 
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB: Feedback Trends
      ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'feedback' && (
        <div className="chart-container">
          <div className="chart-header">
            <div>
              <div className="chart-title">User Feedback Trends — Like vs. Unlike</div>
              <div className="chart-subtitle">Daily breakdown of positive and negative translation feedback over the selected period</div>
            </div>
          </div>
          <div style={{ height: 340 }}>
            <Line data={feedbackChartData} options={CHART_DEFAULTS} />
          </div>
          {!loading && total === 0 && (
            <div className="empty-state">
              <div className="empty-icon" style={{ margin: '16px auto 8px' }}><BarChart2 size={24} /></div>
              <div className="empty-text">No feedback data yet</div>
              <div className="empty-subtext">User feedback will appear here once translations have been rated.</div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB: Engine Telemetry
      ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'engine' && (
        <>
          <div className="chart-container">
            <div className="chart-header">
              <div>
                <div className="chart-title">Translation Engine Distribution</div>
                <div className="chart-subtitle">Volume of translations handled by each engine component</div>
              </div>
            </div>
            <div style={{ height: 300 }}>
              <Bar data={engineChartData} options={CHART_DEFAULTS} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {[
              { label: 'HuggingFace (NLLB)', count: engineCounts.HuggingFace, color: 'var(--warning)', bg: 'var(--warning-bg)', icon: Layers },
              { label: 'Groq (LLM Rescue)', count: engineCounts.Groq, color: 'var(--info)', bg: 'var(--info-bg)', icon: Zap },
              { label: 'Corpus Lookup', count: engineCounts.Corpus, color: 'var(--success)', bg: 'var(--success-bg)', icon: Database },
            ].map(e => (
              <div key={e.label} className="stat-card">
                <div className="stat-icon" style={{ background: e.bg, color: e.color }}>
                  <e.icon size={20} />
                </div>
                <div>
                  <div className="stat-label">{e.label}</div>
                  <div className="stat-value">{e.count.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="info-box warning mt-20">
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>High Groq rescue rates indicate HuggingFace NLLB is struggling with the current vocabulary. Consider expanding the dialect corpus or re-training on flagged pairs.</span>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB: AI Prescriptions
      ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'prescriptions' && (
        <div>
          <div className="info-box info" style={{ marginBottom: 20 }}>
            <Info size={16} style={{ flexShrink: 0 }} />
            <span>These recommendations are generated by analysing corpus OOV frequencies, negative feedback clusters, and dialect usage trends.</span>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
              <div>Generating recommendations…</div>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon" style={{ margin: '0 auto 12px' }}><CheckCircle size={26} /></div>
              <div className="empty-text">No prescriptions at this time</div>
              <div className="empty-subtext">Recommendations will appear as usage patterns emerge.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recommendations.map((rec, i) => (
                <div key={i} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: rec.type === 'corpus' ? 'var(--warning-bg)' : 'var(--info-bg)', color: rec.type === 'corpus' ? 'var(--warning)' : 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {rec.type === 'corpus' ? <Database size={18} /> : <Zap size={18} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: 4 }}>
                      {rec.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {rec.description}
                    </div>
                    {rec.action && (
                      <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }}>
                        {rec.action} <ChevronRight size={12} />
                      </button>
                    )}
                  </div>
                  <span className={`badge badge-${rec.priority === 'high' ? 'flagged' : rec.priority === 'medium' ? 'pending' : 'user'}`} style={{ flexShrink: 0 }}>
                    {rec.priority ?? 'info'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;
