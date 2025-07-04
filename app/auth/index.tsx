import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/auth-store";
import { useAppStyles } from "../../hooks/useAppStyles";
import layout from "../../constants/layout";

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const { signIn, signUp, resetPassword, isLoading } = useAuthStore();
  const { colors, typography } = useAppStyles();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (isSignUp && !fullName.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    // Basic password validation
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await signUp(email.trim(), password, fullName.trim());
        if (error) {
          Alert.alert("Sign Up Error", error.message);
        } else {
          Alert.alert(
            "Success",
            "Account created successfully! Please check your email to verify your account.",
            [
              {
                text: "OK",
                onPress: () => {
                  // Switch to sign in mode after successful signup
                  setIsSignUp(false);
                  setPassword(""); // Clear password for security
                  setFullName("");
                },
              },
            ]
          );
        }
      } else {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          Alert.alert("Sign In Error", error.message);
          console.log("error " + error.message);
        }

        // Navigation will be handled by the auth state change in RootLayout
      }
    } catch (error) {
      console.error("Auth error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
    setFullName("");
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Email Required", "Please enter your email address first");
      return;
    }

    try {
      const { error } = await resetPassword(email.trim());
      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert(
          "Password Reset",
          "If an account with this email exists, you will receive a password reset link."
        );
      }
    } catch (error) {
      console.error("Password reset error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        keyboardContainer: {
          flex: 1,
        },
        scrollContent: {
          flexGrow: 1,
          paddingHorizontal: layout.spacing.lg,
          paddingTop: layout.spacing.xxl,
          paddingBottom: layout.spacing.lg,
        },
        logoContainer: {
          alignItems: "center",
          marginBottom: layout.spacing.lg,
        },
        logoCircle: {
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.primary,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: layout.spacing.md,
          shadowColor: colors.shadowColor,
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        },
        brandText: {
          ...typography.h1,
          fontWeight: "600",
        },
        readText: {
          color: colors.primary,
        },
        shieldText: {
          color: colors.secondary,
        },
        welcomeContainer: {
          alignItems: "center",
          marginBottom: layout.spacing.xxl,
        },
        welcomeTitle: {
          ...typography.h2,
          fontWeight: "700",
          color: colors.text,
          marginBottom: layout.spacing.sm,
        },
        welcomeSubtitle: {
          ...typography.body,
          color: colors.textSecondary,
          textAlign: "center",
          lineHeight: 24,
          paddingHorizontal: layout.spacing.sm,
        },
        formContainer: {
          marginBottom: layout.spacing.xl,
        },
        inputContainer: {
          marginBottom: layout.spacing.lg,
        },
        inputLabel: {
          ...typography.body,
          fontWeight: "500",
          color: colors.text,
          marginBottom: layout.spacing.sm,
        },
        inputWrapper: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.card,
          borderRadius: layout.borderRadius.md,
          paddingHorizontal: layout.spacing.md,
          paddingVertical: layout.spacing.sm,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: colors.shadowColor,
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
        },
        inputIcon: {
          marginRight: layout.spacing.sm,
        },
        textInput: {
          flex: 1,
          ...typography.body,
          color: colors.text,
        },
        forgotPasswordContainer: {
          alignItems: "flex-end",
          marginTop: layout.spacing.sm,
        },
        forgotPasswordText: {
          ...typography.bodySmall,
          color: colors.primary,
          fontWeight: "500",
        },
        primaryButton: {
          backgroundColor: colors.primary,
          borderRadius: layout.borderRadius.md,
          paddingVertical: layout.spacing.md,
          alignItems: "center",
          marginBottom: layout.spacing.lg,
          shadowColor: colors.shadowColor,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 4,
        },
        buttonDisabled: {
          opacity: 0.6,
        },
        primaryButtonText: {
          color: colors.text,
          ...typography.button,
          fontWeight: "600",
        },
        dividerText: {
          ...typography.bodySmall,
          textAlign: "center",
          color: colors.textSecondary,
          marginBottom: layout.spacing.lg,
        },
        secondaryButton: {
          borderWidth: 1,
          borderColor: colors.primary,
          borderRadius: layout.borderRadius.md,
          paddingVertical: layout.spacing.md,
          alignItems: "center",
          backgroundColor: colors.transparent,
        },
        secondaryButtonText: {
          color: colors.primary,
          ...typography.button,          
          fontWeight: "600",
        },
      }),
    [colors, typography]
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo and Branding */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="shield" size={32} color={colors.card} />
            </View>
            <Text style={styles.brandText}>
              <Text style={styles.readText}>Spoiler</Text>
              <Text style={styles.shieldText}>Shield</Text>
            </Text>
          </View>

          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>
              {isSignUp ? "Create Account" : "Welcome Back"}
            </Text>
            <Text style={styles.welcomeSubtitle}>
              {isSignUp
                ? "Join us to explore amazing stories and ask questions"
                : "Sign in to continue your reading journey"}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your name"
                    placeholderTextColor={colors.textSecondary}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    returnKeyType="next"
                    editable={!isLoading}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleAuth}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Forgot Password Link */}
            {!isSignUp && (
              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Primary Button */}
          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <Text style={styles.dividerText}>or</Text>

          {/* Secondary Button */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={toggleMode}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>
              {isSignUp
                ? "Already have an account? Sign In"
                : "New here? Create an Account"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
