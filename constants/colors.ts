import { useColorScheme } from 'react-native';

const lightColors = {
  primary: "#6366F1",
  primaryLight: "#818CF8",
  primaryDark: "#4F46E5",
  secondary: "#06B6D4",
  secondaryLight: "#22D3EE",
  secondaryDark: "#0891B2",
  background: "#F9FAFB",
  card: "#FFFFFF",
  text: "#1F2937",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
  overlay: "rgba(0, 0, 0, 0.5)",
  shadow: "rgba(0, 0, 0, 0.1)",
  disabled: "#D1D5DB",
  highlight: "#F3F4F6",
  transparent: "rgba(0, 0, 0, 0)",
  accent: "#FBBF24",
  accentLight: "#FDE68A",
  accentDark: "#F59E0B",
  muted: "#9CA3AF",
  mutedLight: "#D1D5DB",
  mutedDark: "#6B7280",
  shadowColor: "#000",
  userChat: "#DCF8C6",
  aiChat: "#E5E5EA", 
};

const darkColors = {
  primary: "#818CF8",
  primaryLight: "#A5B4FC",
  primaryDark: "#6366F1",
  secondary: "#22D3EE",
  secondaryLight: "#67E8F9",
  secondaryDark: "#06B6D4",
  background: "#111827",
  card: "#1F2937",
  text: "#F9FAFB",
  textSecondary: "#D1D5DB",
  border: "#374151",
  success: "#34D399",
  error: "#F87171",
  warning: "#FBBF24",
  info: "#60A5FA",
  overlay: "rgba(0, 0, 0, 0.7)",
  shadow: "rgba(0, 0, 0, 0.3)",
  disabled: "#4B5563",
  highlight: "#374151",
  transparent: "rgba(0, 0, 0, 0)",
  accent: "#FBBF24",
  accentLight: "#FDE68A",
  accentDark: "#F59E0B",
  muted: "#9CA3AF",
  mutedLight: "#D1D5DB",
  mutedDark: "#6B7280",
  shadowColor: "#000",
  userChat : "#2E7D32",
  aiChat: "#3A3A3D", 
};

export const useColors = () => {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkColors : lightColors;
};

// Export default for backward compatibility
export default lightColors;