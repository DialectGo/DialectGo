import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import finalBeeImg from '@assets/logo/Logo.png'; 
const { height } = Dimensions.get('window');

export default function AuthLayout({ children, title, description, step = 1, totalSteps = 3, logoSource }) {
  const router = useRouter();

  const renderPagination = () => (
    <View style={styles.pagination}>
      {[...Array(totalSteps)].map((_, i) => (
        <View 
          key={i} 
          style={[
            styles.pageDot, 
            i + 1 === step ? styles.activeDot : styles.inactiveDot
          ]} 
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="black" />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>{title}</Text>
          {renderPagination()}
        </View>
      </View>

      <View style={styles.imageSection}>
        <Image source={logoSource || finalBeeImg} style={styles.beeLogo} resizeMode="contain" />
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.description}>{description}</Text>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: { marginRight: 20 },
  titleContainer: { flex: 1, alignItems: 'center', marginRight: 48 },
  headerTitle: { 
    fontSize: 26, 
    fontWeight: '900', 
    color: '#FFBC00', 
    tracking: -0.5
  },
  pagination: { flexDirection: 'row', marginTop: 8, gap: 5 },
  pageDot: { width: 45, height: 6, borderRadius: 3 },
  activeDot: { backgroundColor: '#FFBC00' },
  inactiveDot: { backgroundColor: '#FFBC0050' }, 

  imageSection: {
    height: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  beeLogo: { width: 180, height: 180 },

  contentSection: {
    paddingHorizontal: 35,
    marginTop: -height * 0.05,
  },
  description: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#000000', 
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20
  }
});