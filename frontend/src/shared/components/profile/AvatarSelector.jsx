import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import SwipeableBottomSheet from '../SwipeableBottomSheet';

export default function AvatarSelector({ currentAvatar, availableAvatars, isModalVisible, setIsModalVisible, onSelect }) {
  if (!currentAvatar) return null;
  return (
    <>
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          <Image source={currentAvatar.source} style={styles.avatarImg} />
          <TouchableOpacity 
            style={styles.editBadge} 
            onPress={() => setIsModalVisible(true)}
          >
            <Image 
              source={require('../../../../assets/icons/actions/edit_icon.png')} 
              style={styles.editIcon} 
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.changeText}>Tap to change avatar</Text>
      </View>

      <SwipeableBottomSheet
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Choose Avatar</Text>
          <View style={styles.avatarGrid}>
            {availableAvatars.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                onPress={() => onSelect(item)}
                style={[
                  styles.avatarOption,
                  currentAvatar.id === item.id && styles.activeAvatarOption
                ]}
              >
                <Image source={item.source} style={styles.modalAvatarImg} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SwipeableBottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    marginTop: 40, 
    marginBottom: 10,
    zIndex: 10,
  },
  avatarWrapper: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatarImg: {
    width: 115,
    height: 115,
    borderRadius: 57.5,
    resizeMode: 'contain',
  },
  editBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#3E2723',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  editIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFD54F',
  },
  changeText: {
    marginTop: 10,
    fontSize: 14,
    color: '#8D8D8D',
    fontFamily: 'Poppins-Medium',
  },
  modalContent: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#2D1606',
    marginBottom: 20,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 20,
  },
  avatarOption: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  activeAvatarOption: {
    borderColor: '#FFD54F',
  },
  modalAvatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  closeBtn: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 25,
    backgroundColor: '#F0F2F5',
    borderRadius: 20,
  },
  closeBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#2D1606',
  },
});
