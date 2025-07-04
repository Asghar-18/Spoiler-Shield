import layout from "@/constants/layout";
import { useTheme } from "@/contexts/ThemeContext";
import { useAppStyles } from "@/hooks/useAppStyles";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "expo-router";
import {
    Bell,
    ChevronRight,
    HelpCircle,
    LogOut,
    Moon,
    Shield,
    Smartphone,
    Sun,
    User,
} from "lucide-react-native";
import React from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { themeMode, setThemeMode } = useTheme();
  const { colors, typography } = useAppStyles();
  
  const [strictMode, setStrictMode] = React.useState(true);
  const [notifications, setNotifications] = React.useState(true);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          signOut();
          router.replace("/auth");
        },
      },
    ]);
  };

  const handleThemeChange = () => {
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
        return <Sun size={22} color={colors.primary} />;
      case 'dark':
        return <Moon size={22} color={colors.primary} />;
      case 'system':
        return <Smartphone size={22} color={colors.primary} />;
      default:
        return <Sun size={22} color={colors.primary} />;
    }
  };

  const getThemeText = () => {
    switch (themeMode) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      case 'system':
        return 'System Default';
      default:
        return 'Light Mode';
    }
  };

  const getThemeSubtext = () => {
    switch (themeMode) {
      case 'light':
        return 'Always use light theme';
      case 'dark':
        return 'Always use dark theme';
      case 'system':
        return 'Follow system settings';
      default:
        return 'Always use light theme';
    }
  };

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    subtitle?: string,
    rightElement?: React.ReactNode,
    onPress?: () => void
  ) => {
    return (
      <TouchableOpacity
        style={styles.settingItem}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={styles.settingIconContainer}>{icon}</View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        {rightElement}
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: layout.spacing.lg,
    },
    header: {
      marginBottom: layout.spacing.lg,
    },
    title: {
      ...typography.h1,
      color: colors.text,
    },
    subtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    scrollView: {
      flex: 1,
    },
    profileSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.card,
      borderRadius: layout.borderRadius.lg,
      padding: layout.spacing.lg,
      marginBottom: layout.spacing.lg,
    },
    profileInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    profileAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: layout.spacing.md,
    },
    profileInitial: {
      color: "white",
      fontSize: 24,
      fontWeight: "bold",
    },
    profileName: {
      ...typography.h3,
      color: colors.text,
    },
    profileEmail: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    editButton: {
      paddingVertical: layout.spacing.xs,
      paddingHorizontal: layout.spacing.md,
      borderRadius: layout.borderRadius.md,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    editButtonText: {
      ...typography.button,
      color: colors.primary,
      fontSize: 14,
    },
    settingsGroup: {
      marginBottom: layout.spacing.lg,
    },
    groupTitle: {
      ...typography.h4,
      color: colors.text,
      marginBottom: layout.spacing.md,
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: layout.borderRadius.md,
      padding: layout.spacing.md,
      marginBottom: layout.spacing.sm,
    },
    settingIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary + "20", // 20% opacity
      alignItems: "center",
      justifyContent: "center",
      marginRight: layout.spacing.md,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      ...typography.body,
      color: colors.text,
      fontWeight: "500",
    },
    settingSubtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.error + "20", // 20% opacity
      borderRadius: layout.borderRadius.md,
      padding: layout.spacing.md,
      marginTop: layout.spacing.lg,
      marginBottom: layout.spacing.md,
    },
    logoutText: {
      ...typography.button,
      color: colors.error,
      marginLeft: layout.spacing.sm,
    },
    versionText: {
      ...typography.caption,
      textAlign: "center",
      color: colors.textSecondary,
      marginBottom: layout.spacing.xl,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your experience</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitial}>
                {user?.name ? user.name[0].toUpperCase() : "U"}
              </Text>
            </View>
            <View>
              <Text style={styles.profileName}>{user?.name || "User"}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>App Settings</Text>

          {renderSettingItem(
            <Shield size={22} color={colors.primary} />,
            "Strict Spoiler Mode",
            "Maximum protection against spoilers",
            <Switch
              value={strictMode}
              onValueChange={setStrictMode}
              trackColor={{ false: colors.border, true: colors.primary + "40" }}
              thumbColor={strictMode ? colors.primary : colors.disabled}
            />
          )}

          {renderSettingItem(
            <Bell size={22} color={colors.primary} />,
            "Notifications",
            "Get updates about your stories",
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.border, true: colors.primary + "40" }}
              thumbColor={notifications ? colors.primary : colors.disabled}
            />
          )}

          {renderSettingItem(
            getThemeIcon(),
            getThemeText(),
            getThemeSubtext(),
            <TouchableOpacity 
              onPress={handleThemeChange}
              style={{
                backgroundColor: colors.primary + "20",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                minWidth: 70,
                alignItems: 'center'
              }}
            >
              <Text style={{
                color: colors.primary,
                fontSize: 12,
                fontWeight: '600'
              }}>
                {themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}
              </Text>
            </TouchableOpacity>,
            handleThemeChange
          )}
        </View>

        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>Support</Text>

          {renderSettingItem(
            <HelpCircle size={22} color={colors.primary} />,
            "Help & Support",
            "Get help with using the app",
            <ChevronRight size={20} color={colors.textSecondary} />,
            () => {}
          )}

          {renderSettingItem(
            <User size={22} color={colors.primary} />,
            "About Us",
            "Learn more about SpoilerShield",
            <ChevronRight size={20} color={colors.textSecondary} />,
            () => {}
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}