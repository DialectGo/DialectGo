const fs = require('fs');

const path = 'frontend/app/(tabs)/Translator/Translate.jsx';
let content = fs.readFileSync(path, 'utf8');

const replacements = [
  { from: "'../../../shared/components/BottomNav'", to: "'../../../src/components/BottomNav'" },
  { from: "'../../../shared/components/TopBar'", to: "'../../../src/components/TopBar'" },
  { from: "'../../../shared/components/LanguageSelector'", to: "'../../../src/features/translator/components/LanguageSelector'" },
  { from: "'../../../shared/components/ContributionModal'", to: "'../../../src/features/wiki/components/ContributionModal'" },
  { from: "'../../../shared/components/BreakdownPanel'", to: "'../../../src/features/translator/components/BreakdownPanel'" },
  { from: "'../../../shared/components/LoadingModal'", to: "'../../../src/shared/components/LoadingModal'" },
  { from: "'../../../shared/components/CustomizeModal'", to: "'../../../src/shared/components/CustomizeModal'" },
  { from: "'../../../shared/components/DocumentUploadModal'", to: "'../../../src/features/translator/components/DocumentUploadModal'" },
  { from: "'../../../shared/components/TranslationResultModal'", to: "'../../../src/features/translator/components/TranslationResultModal'" },
  { from: "'../../../shared/components/SwipeableBottomSheet'", to: "'../../../src/shared/components/SwipeableBottomSheet'" },
  { from: "'../../../shared/components/SpeechModal'", to: "'../../../src/features/translator/components/SpeechModal'" },
  { from: "'../../../shared/styles/TranslateStyles'", to: "'../../../src/features/translator/styles/TranslateStyles'" },
  { from: "'../../../shared/lib/supabase'", to: "'../../../src/shared/api/supabase'" }, // Wait, lib or api? I'll use api, see if it exists
  { from: "'../../../shared/config/apiConfig'", to: "'../../../src/shared/api/client'" },
];

for (const { from, to } of replacements) {
  content = content.replace(from, to);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed imports in Translate.jsx');
