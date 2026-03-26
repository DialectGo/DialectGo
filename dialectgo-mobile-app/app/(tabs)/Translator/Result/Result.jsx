// import React, { useState } from 'react'; 
// import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
// import ResultCard from '../../../../shared/components/ResultCard';
// import pronounceIcon from '../../../../assets/icons/pronounceIcon.png';

// export default function Result({ onBack, sourceText, translatedText, targetLang, sourceLang }) {
//   const [activeTab, setActiveTab] = useState('examples');

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//       {/* Reusable Card Component */}
//       <ResultCard 
//         sourceText={sourceText}
//         translatedText={translatedText}
//         sourceLang={sourceLang}
//         targetLang={targetLang}
//         onClose={onBack}
//         pronounceIcon={pronounceIcon}
//       />

//       {/* Tab bar and sub-content remain the same... */}
//     </ScrollView>
//   );
// }
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     padding: 15,
//   },
// });