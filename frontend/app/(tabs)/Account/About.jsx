import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  View,
  SafeAreaView,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import ProfileTopBar from '../../../shared/components/ProfileTopBar';

export default function AboutDialectGo() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFD54F" barStyle="dark-content" />
      <ProfileTopBar title="About DialectGo" />

      {/* ✅ Now uniform white backdrop across all device screens */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.topSection}>
          <View style={styles.logoWrapper}>
            <Image 
              source={require('../../../assets/logo/bee.png')} 
              style={styles.mainLogo} 
            />
          </View>
          <Text style={styles.appName}>DialectGo</Text>
          <Text style={styles.versionTag}>Version 1.0.4</Text>
        </View>

        {/* ✅ Clean white container instead of yellow */}
        <View style={styles.contentContainer}>
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Our Mission</Text>
            <Text style={styles.cardText}>
              Ang DialectGo ay binuo upang mapadali ang komunikasyon sa pagitan ng mga gumagamit ng Cebuano, Tagalog, at English. Gamit ang Neural Machine Translation (NMT), layunin naming magbigay ng tumpak at mabilis na pagsasalin.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Key Features</Text>
            <View style={styles.featureItem}>
              <View style={styles.bullet} />
              <Text style={styles.featureText}>Trilingual Translation (Cebuano-Tagalog-English)</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.bullet} />
              <Text style={styles.featureText}>Daily Streak Tracking para sa tuloy-tuloy na pag-aaral</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.bullet} />
              <Text style={styles.featureText}>User-friendly na interface para sa madaling pag-navigate</Text>
            </View>
          </View>

          <View style={styles.footerInfo}>
            <Text style={styles.devText}>Developed by 3-1</Text>
            <Text style={styles.copyrightText}>© 2026 DialectGo Project</Text>
          </View>
          
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollBody: {
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: '#FFD54F',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  mainLogo: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D1606',
    marginTop: 15,
  },
  versionTag: {
    fontSize: 14,
    color: '#777',
  },
  contentContainer: {
    backgroundColor: '#FFFFFF', // ✅ Changed from yellow (#FFD54F) to pure white
    paddingHorizontal: 25,
    paddingTop: 20,
    flex: 1, 
  },
  infoCard: {
    backgroundColor: '#FFFDE7', // ✅ Soft warm tint so cards remain readable against the white backdrop
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFE082', // Adds a subtle border outline for clean element separation
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1606',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#2D1606',
    textAlign: 'justify',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFB300', // Cohesive gold accent tone for bullets
    marginRight: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#2D1606',
  },
  footerInfo: {
    marginTop: 'auto', 
    paddingTop: 30,
    alignItems: 'center',
  },
  devText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D1606',
  },
  copyrightText: {
    fontSize: 12,
    color: '#777777', // Slightly muted gray for standard secondary copyright look
    marginTop: 5,
  },
});