export function formatDictionaryTerms({
  languageId,
  wordTerm,
  definition,
  translation1,
  translation2,
  translationDef1,
  translationDef2,
}) {
  const currentLangId = parseInt(languageId, 10);

  let cebuanoTerm = '';
  let cebuanoDef = '';
  let tagalogTerm = '';
  let tagalogDef = '';

  if (currentLangId === 3) {
    cebuanoTerm = wordTerm;
    cebuanoDef = definition || 'Walay kahulugan.';

    tagalogTerm = translation1 || '---';
    tagalogDef = translationDef1 || 'Walang kahulugan.';
  } else {
    tagalogTerm = wordTerm;
    tagalogDef = definition || 'Walang kahulugan.';

    cebuanoTerm = translation2 || '---';
    cebuanoDef = translationDef2 || 'Walay kahulugan.';
  }

  return {
    currentLangId,
    cebuanoTerm,
    cebuanoDef,
    tagalogTerm,
    tagalogDef,
  };
}
