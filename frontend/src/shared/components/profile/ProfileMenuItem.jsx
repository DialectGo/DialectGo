import React from 'react';
import { TouchableOpacity, View, Image, Text, StyleSheet } from 'react-native';

export default function ProfileMenuItem({ iconSource, text, onPress, isDanger, isLogout }) {
  if (isLogout) {
    return (
      <TouchableOpacity style={styles.logoutBtn} onPress={onPress}>
        <View style={styles.menuLeft}>
          <Image source={iconSource} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>{text}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Image source={iconSource} style={styles.menuIcon} />
        <Text style={[styles.menuText, isDanger && { color: '#D32F2F' }]}>{text}</Text>
      </View>
      {!isDanger && <Image source={require('../../../../assets/icons/nav/forward_arrow.png')} style={styles.arrowIcon} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0', 
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 28,
    height: 28,
    marginRight: 20,
    resizeMode: 'contain',
  },
  menuText: {
    fontSize: 18,
    color: '#2D1606',
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
  },
  arrowIcon: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
    opacity: 0.3,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 25,
    marginTop: 10,
  },
  logoutIcon: {
    width: 28,
    height: 28,
    marginRight: 20,
    resizeMode: 'contain',
  },
  logoutText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
    fontFamily: 'Poppins-Bold',
  },
});
