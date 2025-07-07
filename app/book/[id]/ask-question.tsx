import { useAppStyles } from "@/hooks/useAppStyles";
import layout from "@/constants/layout";
import { questionsApiClient, progressApiClient } from "@/services";
import { useAuthStore } from "@/store/auth-store";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useRef, useMemo } from "react";
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
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { QuestionWithTitle } from "@/types/database"; // Make sure this is correctly exported

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const bookId = params.id as string;
  const bookName = params.bookName as string;

  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProgress, setUserProgress] = useState<number>(0);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [history, setHistory] = useState<QuestionWithTitle[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  const { colors, typography } = useAppStyles();

  const loadUserProgress = async () => {
    if (!user || !bookId) return;
    try {
      setIsLoadingProgress(true);
      const response = await progressApiClient.getProgressByTitle(bookId);
      setUserProgress(
        (response.success && response.data?.current_chapter) || 0
      );
    } catch (error) {
      console.error("Error loading progress:", error);
      setUserProgress(0);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const loadChatHistory = async () => {
    if (!user || !bookId) return;
    try {
      setIsLoadingHistory(true);
      const response = await questionsApiClient.getQuestionsByTitle(bookId);
      if (response.success && response.data) {
        // Sort by created_at to ensure consistent chronological order (oldest first)
        const sortedHistory = response.data.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        setHistory(sortedHistory);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("Error loading history:", error);
      setHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadUserProgress();
    loadChatHistory();
  }, [bookId, user]);

  // Scroll to bottom when history loads or updates
  useEffect(() => {
    if (!isLoadingHistory && history.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [history, isLoadingHistory]);

  const handleSubmitQuestion = async () => {
    if (!question.trim()) return;

    if (!user) {
      Alert.alert("Error", "You must be logged in to ask questions.");
      return;
    }

    if (userProgress === 0) {
      Alert.alert("No Progress Yet", "Please set your progress first.");
      return;
    }

    const tempQuestion = {
      id: Date.now().toString(),
      user_id: user.id,
      title_id: bookId,
      chapter_limit: userProgress,
      question_text: question.trim(),
      answer_text: null,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      setIsSubmitting(true);

      // Add to the end of history (chronological order)
      setHistory((prev) => [...prev, tempQuestion as QuestionWithTitle]);
      setQuestion("");

      // Scroll to bottom after adding the question
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      const response = await questionsApiClient.createQuestion({
        title_id: bookId,
        question_text: tempQuestion.question_text,
        chapter_limit: userProgress,
      });

      if (!response.success) {
        Alert.alert("Error", response.error || "Failed to submit.");
        setHistory((prev) =>
          prev.filter((item) => item.id !== tempQuestion.id)
        );
        return;
      }

      // 🔥 NEW: Update the temporary question with the real ID
      const realQuestionId = response.data.id;
      setHistory((prev) =>
        prev.map((item) =>
          item.id === tempQuestion.id ? { ...item, id: realQuestionId } : item
        )
      );

      // 🔥 NEW: Trigger AI answer generation
      try {
        // Update status to show we're generating answer
        setHistory((prev) =>
          prev.map((item) =>
            item.id === realQuestionId
              ? { ...item, status: "pending", answer_text: "Thinking..." }
              : item
          )
        );

        await questionsApiClient.generateAnswer(realQuestionId);

        // 🔥 NEW: Poll for the answer
        await pollForAnswer(realQuestionId);
      } catch (aiError) {
        console.error("AI generation failed:", aiError);

        // Update status to show failure
        setHistory((prev) =>
          prev.map((item) =>
            item.id === realQuestionId
              ? {
                  ...item,
                  status: "failed",
                  answer_text: "Failed to generate answer. Please try again.",
                }
              : item
          )
        );
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong.");
      setHistory((prev) => prev.filter((item) => item.id !== tempQuestion.id));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 NEW: Add polling function
  const pollForAnswer = async (questionId: string) => {
    const maxAttempts = 60; // 60 seconds max
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await questionsApiClient.getQuestionById(questionId);
        if (response.success && response.data) {
          const question = response.data;

          // Update the history with the latest question data
          setHistory((prev) =>
            prev.map((q) => (q.id === questionId ? question : q))
          );

          // Return true if we have an answer or if it failed
          return question.answer_text || question.status === "failed";
        }
        return false;
      } catch (error) {
        console.error("Polling error:", error);
        return false;
      }
    };

    while (attempts < maxAttempts) {
      const completed = await poll();
      if (completed) break;

      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    // If we've exhausted attempts, mark as failed
    if (attempts >= maxAttempts) {
      setHistory((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? {
                ...q,
                status: "failed",
                answer_text: "Answer generation timed out.",
              }
            : q
        )
      );
    }
  };

  const styles = useMemo(
      () => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      flex: 1,
    },
    backButton: {
      padding: layout.spacing.xs,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: layout.spacing.lg,
    },
    scrollContent: {
      paddingBottom: layout.spacing.xl,
    },
    bookTitle: {
      ...typography.h3,
      color: colors.text,
      marginTop: layout.spacing.lg,
      marginBottom: layout.spacing.sm,
    },
    progressNotice: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginBottom: layout.spacing.md,
    },
    noMessages: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: layout.spacing.lg,
    },
    chatItem: {
      marginBottom: layout.spacing.md,
    },
    userBubble: {
      alignSelf: "flex-end",
      backgroundColor: colors.userChat,
      borderRadius: 12,
      padding: 10,
      maxWidth: "80%",
    },
    aiBubble: {
      alignSelf: "flex-start",
      backgroundColor: colors.aiChat, 
      borderRadius: 12,
      padding: 10,
      maxWidth: "80%",
      marginTop: 4,
    },
    bubbleText: {
      ...typography.body,
      color: colors.text,
    },
    inputContainer: {
      flexDirection: "row",
      padding: layout.spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.card,
    },
    textInput: {
      flex: 1,
      ...typography.body,
      color: colors.text,
      paddingVertical: layout.spacing.sm,
      paddingHorizontal: layout.spacing.md,
      backgroundColor: colors.background,
      borderRadius: 20,
      maxHeight: 120,
    },
    submitButton: {
      backgroundColor: colors.primary,
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: layout.spacing.sm,
    },
    submitButtonDisabled: {
      backgroundColor: colors.textSecondary,
      opacity: 0.6,
    },
  }),
  [colors, typography]
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Chat",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerTitleStyle: { ...typography.h3, fontWeight: "600" },
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
        <View style={styles.contentContainer}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header Info */}
            <Text style={styles.bookTitle}>{bookName}</Text>
            <Text style={styles.progressNotice}>
              {isLoadingProgress
                ? "Loading progress..."
                : `Answers limited to chapter ${userProgress}`}
            </Text>

            {/* Chat Messages */}
            {isLoadingHistory ? (
              <ActivityIndicator size="small" />
            ) : history.length === 0 ? (
              <Text style={styles.noMessages}>
                No questions yet. Ask your first one!
              </Text>
            ) : (
              history.map((item) => (
                <View key={item.id} style={styles.chatItem}>
                  {/* User Message */}
                  <View style={styles.userBubble}>
                    <Text style={styles.bubbleText}>{item.question_text}</Text>
                  </View>

                  {/* AI Answer */}
                  {item.answer_text && (
                    <View style={styles.aiBubble}>
                      <Text style={styles.bubbleText}>{item.answer_text}</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>

          {/* Input Bar with KeyboardAvoidingView */}
          {userProgress > 0 && (
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ask something..."
                  placeholderTextColor={colors.textSecondary}
                  value={question}
                  onChangeText={setQuestion}
                  multiline
                  editable={!isSubmitting}
                />
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!question.trim() || isSubmitting) &&
                      styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmitQuestion}
                  disabled={!question.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={colors.card} />
                  ) : (
                    <Ionicons name="send" size={20} color={colors.card} />
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}