import layout from '@/constants/layout';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppStyles } from '@/hooks/useAppStyles';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function ThemeToggle() {
  const { themeMode, setThemeMode, isDark } = useTheme();
  const { colors } = useAppStyles();

  const toggleTheme = () => {
    if (themeMode === 'light') {
      setThemeMode('dark');
    } else if (themeMode === 'dark') {
      setThemeMode('system');
    } else {
      setThemeMode('light');
    }
  };

  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light':
        return 'sunny';
      case 'dark':
        return 'moon';
      case 'system':
        return 'phone-portrait';
      default:
        return 'sunny';
    }
  };

  const getThemeText = () => {
    switch (themeMode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'Light';
    }
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: layout.spacing.md,
      backgroundColor: colors.card,
      borderRadius: layout.borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    icon: {
      marginRight: layout.spacing.sm,
    },
    text: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
  });

  return (
    <TouchableOpacity style={styles.container} onPress={toggleTheme}>
      <Ionicons 
        name={getThemeIcon()} 
        size={20} 
        color={colors.primary} 
        style={styles.icon}
      />
      <Text style={styles.text}>{getThemeText()}</Text>
    </TouchableOpacity>
  );
}