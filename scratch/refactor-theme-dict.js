const fs = require('fs');

const path = 'frontend/src/features/dictionary/styles/DictionaryStyles.js';
let content = fs.readFileSync(path, 'utf8');

// Add imports
if (!content.includes('import { colors }')) {
  content = content.replace(
    "import { StyleSheet } from 'react-native';",
    "import { StyleSheet } from 'react-native';\nimport { colors } from '../../../shared/theme/colorPalette';\nimport { fonts } from '../../../shared/theme/typography';"
  );
}

// Replacements
const replacements = [
  // Fonts
  { from: /'Poppins-Bold'/g, to: 'fonts.bold' },
  { from: /'Poppins-Medium'/g, to: 'fonts.medium' },
  { from: /'Poppins-Regular'/g, to: 'fonts.regular' },
  { from: /'Poppins-SemiBold'/g, to: 'fonts.semiBold' },

  // Colors
  { from: /'#FFD54F'/gi, to: 'colors.primary' },
  { from: /'#F4B400'/gi, to: 'colors.primaryDark' },
  { from: /'#D89B00'/gi, to: 'colors.primaryDeep' },
  { from: /'#421C00'/gi, to: 'colors.accent' },
  { from: /'#634F4B'/gi, to: 'colors.accentLight' },
  { from: /'#FFFFFF'/gi, to: 'colors.background' },
  { from: /'#FFFDF5'/gi, to: 'colors.surface' },
  { from: /'#FFF7D6'/gi, to: 'colors.surfaceLight' },
  { from: /'#F5F1EA'/gi, to: 'colors.surfaceMuted' },
  { from: /'#F5F5F5'/gi, to: 'colors.surfaceGray' },
  { from: /'#F4E7BF'/gi, to: 'colors.border' },
  { from: /'#F3E9D8'/gi, to: 'colors.borderLight' },
  { from: /'#FFE28A'/gi, to: 'colors.borderGold' },
  { from: /'#E8DED0'/gi, to: 'colors.borderMuted' },
  { from: /'#E5E7EB'/gi, to: 'colors.divider' },
  { from: /'#9A8177'/gi, to: 'colors.textMuted' },
  { from: /'#A58D80'/gi, to: 'colors.textHint' },
  { from: /'#9CA3AF'/gi, to: 'colors.textGray' },
  { from: /'#374151'/gi, to: 'colors.textDark' },
  { from: /'#FFD044'/gi, to: 'colors.greetingYellow' },
  { from: /'#8A6200'/gi, to: 'colors.shadowGold' },
  { from: /'#B97800'/gi, to: 'colors.shadowAmber' },
  { from: /'#4CAF50'/gi, to: 'colors.success' },
  { from: /'rgba\(0, 0, 0, 0.5\)'/gi, to: 'colors.overlay' },
  { from: /'#A47700'/gi, to: 'colors.chatPromoLabel' },
  
  // General fallbacks
  { from: /'#FFF'/g, to: 'colors.white' }, 
  { from: /'#000'/g, to: "'#000000'" }, 
  { from: /'#FFF0B3'/gi, to: "colors.surfaceLight" }, 
  { from: /'#F2D98B'/gi, to: "colors.border" },
  { from: /'#75635B'/gi, to: "colors.textMuted" }, 
  { from: /'#4B5563'/gi, to: "colors.textDark" }, 
  { from: /'#B45309'/gi, to: "colors.primaryDeep" }, 
  { from: /'#806F65'/gi, to: "colors.textMuted" },
];

for (const { from, to } of replacements) {
  content = content.replace(from, to);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Done replacing DictionaryStyles.js');
