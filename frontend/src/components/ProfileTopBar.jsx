import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { Image,  StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

/**
 * @param {string} title - The text to display in the center (defaults to "Profile")
 */
const ProfileTopBar = ({ title = "Profile" }) => {
  const router = useRouter();

  return (
    <View style={styles.transparentWrapper}>
      <SafeAreaView edges={['top']}>
        <View style={styles.topBar}>
          
          {/* LEFT: Back Button */}
          <View style={styles.sectionLeft}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backBtn}
              activeOpacity={0.7}
            >
               <Image 
                source={require('../../assets/icons/nav/backArrow.png')} 
                style={styles.backIcon} 
                resizeMode="contain"
               />
            </TouchableOpacity>
          </View>

          {/* CENTER: Dynamic Title */}
          <View style={styles.sectionCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
          </View>

          {/* RIGHT: Empty ghost view to keep the title centered */}
          <View style={styles.sectionRight} />

        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  transparentWrapper: {
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sectionLeft: {
    flex: 1, // Balance weight
    alignItems: 'flex-start',
  },
  sectionCenter: {
    flex: 3, // More space for long titles
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionRight: {
    flex: 1, // Balance weight (matches sectionLeft)
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  backBtn: {
    width: 64,
    height: 64,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: 'transparent',

    // iOS shadow
    shadowColor: '#421C00',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,

    // Android shadow
    elevation: 5,
  },

  backIcon: {
    width: 54,
    height: 54,

    resizeMode: 'contain',
  },
});

export default ProfileTopBar;