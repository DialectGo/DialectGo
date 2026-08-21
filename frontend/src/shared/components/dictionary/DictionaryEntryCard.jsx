import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function DictionaryEntryCard({ item, router, styles }) {
    const translations = item.translations || [];

    const trans1 = translations[0]?.target_entry?.word_term || '';
    const trans2 = translations[1]?.target_entry?.word_term || '';
    const usage1 = translations[0]?.target_entry?.example_usage || '';
    const usage2 = translations[1]?.target_entry?.example_usage || '';

    const translationDisplay = [trans1, trans2].filter(Boolean).join(' / ') || 'No translation';

    const def1 = translations[0]?.target_entry?.definition || '';
    const def2 = translations[1]?.target_entry?.definition || '';

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            style={styles.entryCard}
            onPress={() => {
                router.push({
                    pathname: '/Dictionary/ResultDictionary',
                    params: {
                        id: item.id,
                        wordTerm: item.word_term || '',
                        languageId: item.language_id,
                        definition: item.definition || '',
                        partOfSpeech: item.part_of_speech || 'Word',
                        exampleUsage: item.example_usage || '',
                        phoneticTranscription: item.phonetic_transcription || '',
                        translation1: trans1,
                        translation2: trans2,
                        translationDef1: def1,
                        translationDef2: def2,
                        usage1: usage1,
                        usage2: usage2,
                    },
                });
            }}
        >
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={styles.entryWord}>{item.word_term}</Text>
                <Text style={styles.entryTranslation}>{translationDisplay}</Text>
                
                {def1 ? (
                    <Text style={{ fontSize: 12, color: '#78909C', marginTop: 4 }} numberOfLines={1}>
                        Def: {def1}
                    </Text>
                ) : null}
            </View>

            {item.part_of_speech && (
                <View style={styles.tagContainer}>
                    <Text style={styles.tagText}>
                        {item.part_of_speech.toUpperCase()}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}
