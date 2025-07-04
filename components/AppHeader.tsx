import layout from "@/constants/layout";
import { useAppStyles } from "@/hooks/useAppStyles";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface AppHeaderProps {
  title: string;
  discoverTitle?: string;
  discoverSubtitle?: string;
  onLogout: () => void;
  showLogout?: boolean;
  loading?: boolean; // Add this optional prop
}

export default function AppHeader({
  title,
  discoverTitle = "Discover",
  discoverSubtitle = "Find stories to explore",
  onLogout,
  showLogout = true,
}: AppHeaderProps) {
  const { colors, typography } = useAppStyles();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        header: {
          paddingHorizontal: layout.spacing.lg,
          paddingTop: layout.spacing.md,
          paddingBottom: layout.spacing.lg,
          backgroundColor: colors.card,
        },
        headerTop: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: layout.spacing.lg,
        },
        headerTitle: {
          ...typography.h3,
        },
        logoutButton: {
          padding: layout.spacing.xs,
        },
        discoverTitle: {
          ...typography.h1,
          marginBottom: layout.spacing.xs,
        },
        discoverSubtitle: {
          ...typography.body,
          color: colors.textSecondary,
        },
      }),
    [colors, typography]
  );

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>{title}</Text>
        {showLogout && (
          <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
            <Ionicons
              name="log-out-outline"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.discoverTitle}>{discoverTitle}</Text>
      <Text style={styles.discoverSubtitle}>{discoverSubtitle}</Text>
    </View>
  );
}
  
