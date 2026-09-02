import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function DictionaryEntryCard({ item, router, styles }) {
    const translations = item.translations || [];

    const translationDisplay = translations.map(t => t?.target_entry?.word_term).filter(Boolean).join(' / ') || 'No translation';

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
                        translationsStr: JSON.stringify(translations),
                    },
                });
            }}
        >
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={styles.entryWord}>{item.word_term}</Text>
                <Text style={styles.entryTranslation}>{translationDisplay}</Text>
                
                {translations[0]?.target_entry?.definition ? (
                    <Text style={{ fontSize: 12, color: '#78909C', marginTop: 4 }} numberOfLines={1}>
                        Def: {translations[0]?.target_entry?.definition}
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
