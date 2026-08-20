import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * A highly reusable Base Card component.
 * Standardizes drop-shadows, padding, and border radius across the app.
 * Commonly used for the Home Screen's Streak and Promo sections.
 * 
 * @param {string} title - Optional card title
 * @param {string} subtitle - Optional card subtitle
 * @param {ReactNode} rightBadge - Optional element rendered in the top right corner
 * @param {ReactNode} children - The main content
 * @param {object} style - Additional style overrides for the container
 */
export default function HomeCard({ title, subtitle, rightBadge, children, style }) {
  return (
    <View style={styles.cardContainer}>
      {/* Optional Card Header */}
      {(title || subtitle || rightBadge) && (
        <View style={styles.headerRow}>
          <View style={styles.headerTitles}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          {rightBadge && (
            <View style={styles.badgeContainer}>
              {rightBadge}
            </View>
          )}
        </View>
      )}

      {/* Card Content Wrapper */}
      <View style={[styles.contentContainer, style]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Modulus-Bold',
    color: '#374151', // colors.textDark
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  badgeContainer: {
    marginLeft: 12,
  },
  contentContainer: {
    backgroundColor: '#FFFDF5', // colors.surface
    borderRadius: 32,
    padding: 22,
    shadowColor: '#8A6200', // colors.shadowGold
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 7,
    borderWidth: 1,
    borderColor: '#F4E7BF', // colors.border
  },
});
