export function formatDictionaryTerms({
  languageId,
  wordTerm,
  definition,
  translations,
}) {
  const currentLangId = parseInt(languageId, 10);

  let cebuanoTerm = '---';
  let cebuanoDef = 'Walay kahulugan.';
  let tagalogTerm = '---';
  let tagalogDef = 'Walang kahulugan.';
  let englishTerm = '---';
  let englishDef = 'No English translation available.';

  // Assign the primary term based on its language
  if (currentLangId === 3) {
    cebuanoTerm = wordTerm;
    cebuanoDef = definition || 'Walay kahulugan.';
  } else if (currentLangId === 2) {
    tagalogTerm = wordTerm;
    tagalogDef = definition || 'Walang kahulugan.';
  } else if (currentLangId === 1) {
    englishTerm = wordTerm;
    englishDef = definition || 'No English translation available.';
  }

  // Iterate through translations to fill the rest
  if (Array.isArray(translations)) {
    translations.forEach((t) => {
      const target = t?.target_entry;
      if (target) {
        if (target.language_id === 3) {
          cebuanoTerm = target.word_term || cebuanoTerm;
          cebuanoDef = target.definition || cebuanoDef;
        } else if (target.language_id === 2) {
          tagalogTerm = target.word_term || tagalogTerm;
          tagalogDef = target.definition || tagalogDef;
        } else if (target.language_id === 1) {
          englishTerm = target.word_term || englishTerm;
          englishDef = target.definition || englishDef;
        }
      }
    });
  }

  return {
    currentLangId,
    cebuanoTerm,
    cebuanoDef,
    tagalogTerm,
    tagalogDef,
    englishTerm,
    englishDef,
  };
}
