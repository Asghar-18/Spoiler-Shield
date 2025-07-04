import layout from "@/constants/layout";
import { useAppStyles } from "@/hooks/useAppStyles";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface FilterSectionProps {
  resultCount?: number;
  showResultCount?: boolean;
  filterText?: string;
  filterIcon?: string;
}

export default function FilterSection({
  resultCount = 0,
  showResultCount = false,
  filterText = "Books",
  filterIcon = "book",
}: FilterSectionProps) {
  const { colors, typography } = useAppStyles();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        filterContainer: {
          paddingHorizontal: layout.spacing.lg,
          marginBottom: layout.spacing.md,
        },
        filterRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
        activeFilter: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.primary,
          paddingHorizontal: layout.spacing.md,
          paddingVertical: layout.spacing.sm,
          borderRadius: layout.borderRadius.full,
        },
        activeFilterText: {
          ...typography.button,
          color: colors.card,
          marginLeft: layout.spacing.xs,
        },
        resultCount: {
          ...typography.bodySmall,
          fontWeight: "500",
        },
      }),
    [colors, typography]
  );
  return (
    <View style={styles.filterContainer}>
      <View style={styles.filterRow}>
        <View style={styles.activeFilter}>
          <Ionicons name={filterIcon as any} size={16} color={colors.card} />
          <Text style={styles.activeFilterText}>{filterText}</Text>
        </View>
        {showResultCount && (
          <Text style={styles.resultCount}>
            {resultCount} result{resultCount !== 1 ? "s" : ""}
          </Text>
        )}
      </View>
    </View>
  );
}
