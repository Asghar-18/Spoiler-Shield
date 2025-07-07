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
  AlertButton,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/auth-store";
import { useAppStyles } from "../../hooks/useAppStyles";
import layout from "../../constants/layout";

// Type definitions
type ValidationErrors = {
  email?: string;
  password?: string;
  fullName?: string;
}

type AuthError = {
  message: string;
  code?: string;
}

type AuthResult = {
  error?: AuthError;
  data?: any;
}

type InputField = 'email' | 'password' | 'fullName';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [errors, setErrors] = useState<ValidationErrors>({});

  const { signIn, signUp, resetPassword, isLoading } = useAuthStore();
  const { colors, typography } = useAppStyles();

  // ✅ Updated validateForm
  const validateForm = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = "Please enter a valid email address (e.g., user@example.com)";
      }
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    } else if (isSignUp) {
      if (!/(?=.*[a-z])/.test(password)) {
        newErrors.password = "Password must contain at least one lowercase letter";
      } else if (!/(?=.*[A-Z])/.test(password)) {
        newErrors.password = "Password must contain at least one uppercase letter";
      } else if (!/(?=.*\d)/.test(password)) {
        newErrors.password = "Password must contain at least one number";
      }
    }

    if (isSignUp) {
      if (!fullName.trim()) {
        newErrors.fullName = "Full name is required";
      } else if (fullName.trim().length < 2) {
        newErrors.fullName = "Full name must be at least 2 characters long";
      } else if (!/^[a-zA-Z\s]+$/.test(fullName.trim())) {
        newErrors.fullName = "Full name can only contain letters and spaces";
      }
    }

    setErrors(newErrors);
    return newErrors;
  };

  const parseAuthError = (error: AuthError): string => {
    const message = error.message || error.toString();
    if (message.includes('invalid-email')) return "The email address is not valid.";
    if (message.includes('user-disabled')) return "This account has been disabled.";
    if (message.includes('user-not-found')) return "No account found with this email.";
    if (message.includes('wrong-password')) return "Incorrect password.";
    if (message.includes('email-already-in-use')) return "Email is already in use.";
    if (message.includes('weak-password')) return "Password is too weak.";
    if (message.includes('too-many-requests')) return "Too many attempts. Try again later.";
    if (message.includes('network')) return "Network error. Check your connection.";
    if (message.includes('invalid-credential')) return "Invalid email or password.";
    return message;
  };

  const showErrorAlert = (
    title: string,
    message: string,
    suggestions: string[] = []
  ): void => {
    const buttons: AlertButton[] = [
      { text: "OK", style: "default" }
    ];
    if (suggestions.length > 0) {
      buttons.unshift({
        text: "Help",
        onPress: () => {
          Alert.alert("Suggestions", suggestions.join('\n\n'), [
            { text: "Got it", style: "default" }
          ]);
        }
      });
    }
    Alert.alert(title, message, buttons);
  };

  // ✅ Updated handleAuth using validationErrors
  const handleAuth = async (): Promise<void> => {
    setErrors({});
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      const errorMessages = Object.values(validationErrors);
      showErrorAlert(
        "Please fix the following issues:",
        errorMessages.join('\n\n'),
        [
          "• Make sure all required fields are filled",
          "• Check that your email is in the correct format",
          "• Ensure your password meets the requirements"
        ]
      );
      return;
    }

    try {
      if (isSignUp) {
        const result: AuthResult = await signUp(email.trim(), password, fullName.trim());
        if (result.error) {
          showErrorAlert(
            "Sign Up Failed",
            parseAuthError(result.error),
            [
              "• Use a valid email",
              "• Check if the email is already used",
              "• Use a stronger password"
            ]
          );
        } else {
          Alert.alert(
            "Account Created 🎉",
            "Please verify your email before signing in.",
            [{ text: "OK", onPress: () => {
              setIsSignUp(false);
              setPassword("");
              setFullName("");
              setErrors({});
            }}]
          );
        }
      } else {
        const result: AuthResult = await signIn(email.trim(), password);
        if (result.error) {
          showErrorAlert(
            "Sign In Failed",
            parseAuthError(result.error),
            [
              "• Double-check your email and password",
              "• Make sure your account is verified",
              "• Try resetting your password"
            ]
          );
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      showErrorAlert(
        "Something Went Wrong",
        "Unexpected error occurred. Try again later.",
        [
          "• Check your internet connection",
          "• Refresh the app",
          "• Contact support"
        ]
      );
    }
  };

  const toggleMode = (): void => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
    setFullName("");
    setErrors({});
  };

  const handleForgotPassword = async (): Promise<void> => {
    if (!email.trim()) {
      showErrorAlert("Email Required", "Please enter your email first.", [
        "• Enter the email linked to your account"
      ]);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showErrorAlert("Invalid Email", "Please enter a valid email address.", [
        "• Example: user@example.com"
      ]);
      return;
    }

    try {
      const result: AuthResult = await resetPassword(email.trim());
      if (result.error) {
        showErrorAlert("Reset Failed", parseAuthError(result.error), [
          "• Ensure the email is correct",
          "• Check your account status"
        ]);
      } else {
        Alert.alert("Email Sent 📧", "Check your inbox for the reset link.");
      }
    } catch (error) {
      console.error("Reset error:", error);
      showErrorAlert("Reset Failed", "Could not send reset email.", [
        "• Check your internet",
        "• Try again in a few minutes"
      ]);
    }
  };

  const clearFieldError = (field: InputField): void => {
    if (errors[field]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleInputChange = (field: InputField, value: string): void => {
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    if (field === "fullName") setFullName(value);
    clearFieldError(field);
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        keyboardContainer: { flex: 1 },
        scrollContent: {
          flexGrow: 1,
          paddingHorizontal: layout.spacing.lg,
          paddingTop: layout.spacing.xxl,
          paddingBottom: layout.spacing.lg,
        },
        logoContainer: { alignItems: "center", marginBottom: layout.spacing.lg },
        logoCircle: {
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.primary,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: layout.spacing.md,
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        },
        brandText: { ...typography.h1, fontWeight: "600" },
        readText: { color: colors.primary },
        shieldText: { color: colors.secondary },
        welcomeContainer: { alignItems: "center", marginBottom: layout.spacing.xxl },
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
        formContainer: { marginBottom: layout.spacing.xl },
        inputContainer: { marginBottom: layout.spacing.lg },
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
        },
        inputWrapperError: { borderColor: '#ff4444', borderWidth: 1.5 },
        inputIcon: { marginRight: layout.spacing.sm },
        textInput: { flex: 1, ...typography.body, color: colors.text },
        errorText: {
          ...typography.bodySmall,
          color: '#ff4444',
          marginTop: layout.spacing.xs,
          marginLeft: layout.spacing.sm,
        },
        forgotPasswordContainer: { alignItems: "flex-end", marginTop: layout.spacing.sm },
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
        },
        buttonDisabled: { opacity: 0.6 },
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
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="shield" size={32} color={colors.card} />
            </View>
            <Text style={styles.brandText}>
              <Text style={styles.readText}>Spoiler</Text>
              <Text style={styles.shieldText}>Shield</Text>
            </Text>
          </View>

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

          <View style={styles.formContainer}>
            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={[styles.inputWrapper, errors.fullName && styles.inputWrapperError]}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={errors.fullName ? '#ff4444' : colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.textSecondary}
                    value={fullName}
                    onChangeText={(text) => handleInputChange('fullName', text)}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
                {errors.fullName && (
                  <Text style={styles.errorText}>{errors.fullName}</Text>
                )}
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={errors.email ? '#ff4444' : colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email address"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!isLoading}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={errors.password ? '#ff4444' : colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder={isSignUp ? "Create a strong password" : "Enter your password"}
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  secureTextEntry
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleAuth}
                  editable={!isLoading}
                />
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

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

          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.dividerText}>or</Text>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={toggleMode}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>
              {isSignUp ? "Already have an account? Sign In" : "New here? Create an Account"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
