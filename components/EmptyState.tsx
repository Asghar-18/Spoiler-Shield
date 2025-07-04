import layout from "@/constants/layout";
import { useAppStyles } from "@/hooks/useAppStyles";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface EmptyStateProps {
  title: string;
  subtitle: string;
  icon?: string;
  showClearButton?: boolean;
  onClearPress?: () => void;
  clearButtonText?: string;
}

export default function EmptyState({
  title,
  subtitle,
  icon = "book-outline",
  showClearButton = false,
  onClearPress,
  clearButtonText = "Clear search",
}: EmptyStateProps) {
  const { colors, typography } = useAppStyles();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        emptyContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 100,
        },
        emptyTitle: {
          ...typography.h3,
          color: colors.textSecondary,
          marginTop: layout.spacing.md,
          marginBottom: layout.spacing.sm,
        },
        emptySubtitle: {
          ...typography.body,
          color: colors.textSecondary,
          textAlign: "center",
          marginBottom: layout.spacing.md,
        },
        clearSearchButton: {
          backgroundColor: colors.primary,
          paddingHorizontal: layout.spacing.lg,
          paddingVertical: layout.spacing.sm,
          borderRadius: layout.borderRadius.sm,
        },
        clearSearchText: {
          ...typography.button,
          color: colors.card,
        },
      }),
    [colors, typography]
  );
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name={icon as any} size={64} color={colors.border} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
      {showClearButton && onClearPress && (
        <TouchableOpacity
          onPress={onClearPress}
          style={styles.clearSearchButton}
        >
          <Text style={styles.clearSearchText}>{clearButtonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
