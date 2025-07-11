import { StyleSheet } from 'react-native';

// Create a function that returns typography styles based on colors
export const createTypography = (colors: any) => StyleSheet.create({
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.25,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.25,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.25,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.25,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    letterSpacing: 0.25,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
    letterSpacing: 0.4,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

// Export default for backward compatibility (you'll need to update this)
export default createTypography({
  text: "#1F2937",
  textSecondary: "#6B7280",
});