import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';

export default function AboutDialectGo() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFD54F" barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Image 
            source={require('../../../assets/icons/backArrow.png')} 
            style={styles.backIcon} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollBody}>
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

        {/* YELLOW BUBBLY CONTAINER */}
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
          
          <View style={{ height: 60 }} />
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD54F',
    paddingVertical: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    padding: 5,
  },
  backIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 24,
    color: '#2D1606',
    fontWeight: '900',
  },
  scrollBody: {
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    alignItems: 'center',
    paddingVertical: 40,
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
    backgroundColor: '#FFD54F',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingHorizontal: 25,
    paddingTop: 40,
    flex: 1,
    minHeight: 500,
  },
  infoCard: {
    backgroundColor: '#FFF176', 
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
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
    marginBottom: 8,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2D1606',
    marginRight: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#2D1606',
  },
  footerInfo: {
    marginTop: 20,
    alignItems: 'center',
  },
  devText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D1606',
  },
  copyrightText: {
    fontSize: 12,
    color: '#2D1606',
    opacity: 0.6,
    marginTop: 5,
  },
});