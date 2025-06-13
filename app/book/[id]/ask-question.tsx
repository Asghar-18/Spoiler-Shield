import colors from "@/constants/colors";
import layout from "@/constants/layout";
import typography from "@/constants/typography";
import { questionsService } from "@/services";
import { useAuthStore } from "@/store/auth-store";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AskQuestionScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const bookId = params.id as string;
  const bookName = (params.bookName as string) || "The Midnight Library";

  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const exampleQuestions = [
    "Who is this character?",
    "What happened in chapter 3?",
    "Why did they make that decision?",
  ];

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      Alert.alert("Error", "Please enter a question");
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in to ask questions");
      return;
    }

    try {
      setIsLoading(true);

      // For now, we'll use a default chapter limit of 10
      // In a real app, you'd get this from user's reading progress
      const chapterLimit = 10;

      const { data, error } = await questionsService.createQuestion(
        user.id,
        bookId,
        question.trim(),
        chapterLimit
      );

      if (error) {
        Alert.alert("Error", "Failed to submit question. Please try again.");
        console.error("Error creating question:", error);
        return;
      }

      // Navigate to question detail or show success
      Alert.alert(
        "Question Submitted",
        "Your question has been submitted and will be answered shortly.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error("Error in handleAskQuestion:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleQuestion = (exampleQuestion: string) => {
    setQuestion(exampleQuestion);
    setHasStarted(true);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Ask Questions",
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            ...typography.h3,
          },
          headerTintColor: colors.primary,
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardContainer}
        >
          {/* Header Info */}
          <View style={styles.header}>
            <Text style={styles.bookTitle}>{bookName}</Text>
            <Text style={styles.headerSubtitle}>
              You haven&apos;t started this yet
            </Text>
          </View>

          {/* Warning Banner */}
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={20} color="#F59E0B" />
            <Text style={styles.warningText}>
              Answers will be filtered based on your progress
            </Text>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {!hasStarted ? (
              <>
                {/* Main Question Section */}
                <View style={styles.questionSection}>
                  <Text style={styles.questionTitle}>
                    Ask Your First Question
                  </Text>
                  <Text style={styles.questionSubtitle}>
                    Ask anything about {bookName} without worrying about
                    spoilers. We&apos;ll only reveal information up to where you
                    are in the story.
                  </Text>
                </View>

                {/* Example Questions */}
                <View style={styles.exampleSection}>
                  <Text style={styles.exampleTitle}>Example questions:</Text>
                  {exampleQuestions.map((example, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.exampleItem}
                      onPress={() => handleExampleQuestion(example)}
                    >
                      <Text style={styles.exampleText}>• {example}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.chatContainer}>
                <Text style={styles.chatTitle}>
                  What would you like to know?
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Input Section */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Ask a question..."
                placeholderTextColor={colors.textSecondary}
                value={question}
                onChangeText={setQuestion}
                multiline
                maxLength={500}
                onFocus={() => setHasStarted(true)}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!question.trim() || isLoading) && styles.sendButtonDisabled,
                ]}
                onPress={handleAskQuestion}
                disabled={!question.trim() || isLoading}
              >
                {isLoading ? (
                  <Ionicons name="hourglass" size={20} color={colors.card} />
                ) : (
                  <Ionicons name="send" size={20} color={colors.card} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  backButton: {
    padding: layout.spacing.xs,
  },
  header: {
    paddingHorizontal: layout.spacing.lg,
    paddingTop: layout.spacing.md,
    paddingBottom: layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bookTitle: {
    ...typography.h3,
    marginBottom: layout.spacing.xs,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: layout.spacing.lg,
    paddingVertical: layout.spacing.md,
    marginHorizontal: layout.spacing.lg,
    marginVertical: layout.spacing.md,
    borderRadius: layout.borderRadius.md,
  },
  warningText: {
    ...typography.bodySmall,
    color: "#92400E",
    marginLeft: layout.spacing.sm,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: layout.spacing.lg,
  },
  questionSection: {
    alignItems: "center",
    paddingVertical: layout.spacing.xl,
  },
  questionTitle: {
    ...typography.h2,
    textAlign: "center",
    marginBottom: layout.spacing.md,
  },
  questionSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  exampleSection: {
    marginTop: layout.spacing.lg,
  },
  exampleTitle: {
    ...typography.h4,
    marginBottom: layout.spacing.md,
  },
  exampleItem: {
    paddingVertical: layout.spacing.sm,
  },
  exampleText: {
    ...typography.body,
    color: colors.primary,
  },
  chatContainer: {
    paddingVertical: layout.spacing.xl,
    alignItems: "center",
  },
  chatTitle: {
    ...typography.h3,
    textAlign: "center",
  },
  inputContainer: {
    paddingHorizontal: layout.spacing.lg,
    paddingVertical: layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: colors.background,
    borderRadius: layout.borderRadius.lg,
    paddingHorizontal: layout.spacing.md,
    paddingVertical: layout.spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textInput: {
    flex: 1,
    ...typography.body,
    maxHeight: 100,
    paddingVertical: layout.spacing.xs,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: layout.borderRadius.full,
    padding: layout.spacing.sm,
    marginLeft: layout.spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
});
