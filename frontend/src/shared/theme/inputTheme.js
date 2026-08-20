/**
 * DialectGo — Input Theme
 * 
 * Standardized theme object for TextInput components (search bars, auth forms, etc.)
 * Compatible with react-native-paper's <TextInput> if used.
 * 
 * Usage:
 *   import { theme } from '@src/shared/theme/inputTheme';
 */

import { colors } from './colorPalette';

export const theme = {
  colors: {
    primary: colors.primary,
    background: colors.background,
    surface: colors.surface,
    text: colors.textPrimary,
    placeholder: colors.textHint,
    outline: colors.border,
    outlineVariant: colors.borderLight,
  },
  roundness: 16,
};

export default theme;
