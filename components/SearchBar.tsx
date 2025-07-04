import React, { useMemo } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppStyles } from "@/hooks/useAppStyles";
import layout from "@/constants/layout";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClear: () => void;
  loading?: boolean;
  placeholder?: string;
}

export default function SearchBar({
  searchQuery,
  onSearchChange,
  onClear,
  loading = false,
  placeholder = "Search books...",
}: SearchBarProps) {
  const { colors, typography } = useAppStyles();
  
  const styles = useMemo(
    () =>
      StyleSheet.create({
        searchContainer: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.card,
          marginHorizontal: layout.spacing.lg,
          marginVertical: layout.spacing.md,
          paddingHorizontal: layout.spacing.md,
          paddingVertical: layout.spacing.md,
          borderRadius: layout.borderRadius.md,
          shadowColor: colors.shadowColor,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3.84,
          elevation: 5,
          borderWidth: 1,
          borderColor: colors.border,
        },
        searchIcon: {
          marginRight: layout.spacing.md,
        },
        searchInput: {
          flex: 1,
          ...typography.body,
          color: colors.text, // Ensure text color is theme-aware
        },
        searchLoader: {
          marginHorizontal: layout.spacing.sm,
        },
        clearButton: {
          padding: layout.spacing.xs,
        },
      }),
    [colors, typography]
  );

  return (
    <View style={styles.searchContainer}>
      <Ionicons
        name="search"
        size={20}
        color={colors.textSecondary}
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholderTextColor={colors.textSecondary}
        selectionColor={colors.primary}
        cursorColor={colors.primary}
      />
      {loading && (
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.searchLoader}
        />
      )}
      {searchQuery.length > 0 && !loading && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Ionicons
            name="close-circle"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}