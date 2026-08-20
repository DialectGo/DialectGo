/**
 * DialectGo — Unified Color Palette
 * 
 * Single source of truth for every color used across the app.
 * Import this file instead of hardcoding hex values in StyleSheets.
 * 
 * Usage:
 *   import { colors } from '@src/shared/theme/colorPalette';
 *   ...
 *   color: colors.primary
 */

export const colors = {
  // ── Brand ──
  primary: '#FFD54F',         // Golden Yellow (buttons, accents, badges)
  primaryDark: '#F4B400',     // Darker amber (borders, active day circles)
  primaryDeep: '#D89B00',     // Deep gold (active shadows)
  accent: '#421C00',          // Deep brown (headings, CTA backgrounds)
  accentLight: '#634F4B',     // Warm brown (body text, subtitles)

  // ── Surfaces ──
  background: '#FFFFFF',      // App background
  surface: '#FFFDF5',         // Warm off-white (cards, progress card)
  surfaceLight: '#FFF7D6',    // Light honey (promo cards, badges)
  surfaceMuted: '#F5F1EA',    // Muted beige (inactive day circles)
  surfaceGray: '#F5F5F5',     // Light gray (button backgrounds)

  // ── Borders ──
  border: '#F4E7BF',          // Card borders
  borderLight: '#F3E9D8',     // Subtle separators (weekly container)
  borderGold: '#FFE28A',      // Badge borders
  borderMuted: '#E8DED0',     // Inactive circle borders
  divider: '#E5E7EB',         // Modal dividers

  // ── Text ──
  textPrimary: '#421C00',     // Headings, streak numbers
  textSecondary: '#634F4B',   // Body text, translations
  textMuted: '#9A8177',       // Subtitles, progress subtitle
  textHint: '#A58D80',        // Small labels (CURRENT STREAK, THIS WEEK)
  textGray: '#9CA3AF',        // Date text
  textDark: '#374151',        // General dark text

  // ── Greeting ──
  greetingYellow: '#FFD044',  // Cebuano greeting color

  // ── Shadows ──
  shadowGold: '#8A6200',      // Card shadows, word bubble shadows
  shadowDark: '#421C00',      // Promo card shadows
  shadowAmber: '#B97800',     // Chat promo shadows

  // ── Status ──
  success: '#4CAF50',         // Online/active indicator
  error: '#EF4444',           // Error state
  info: '#3B82F6',            // Info banner

  // ── Misc ──
  white: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // ── Link / Detail ──
  linkGold: '#8A6200',        // "View More Details" underline text
  chatPromoLabel: '#A47700',  // "NEED A LITTLE HELP?" label
};
