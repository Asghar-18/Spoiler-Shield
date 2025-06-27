import colors from "@/constants/colors";
import layout from "@/constants/layout";
import typography from "@/constants/typography";
import { questionsApiClient, progressApiClient } from "@/services";
import { useAuthStore } from "@/store/auth-store";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
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

export default function AskQuestionsScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const bookId = params.id as string;
  const bookName = params.bookName as string;

  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProgress, setUserProgress] = useState<number>(0);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  const exampleQuestions = [
    "Who is this character?",
    "What happened in chapter 3?",
    "Why did they make that decision?",
  ];

  // Load user progress when component mounts
  useEffect(() => {
    loadUserProgress();
  }, [bookId, user]);

  const loadUserProgress = async () => {
    if (!user || !bookId) {
      setIsLoadingProgress(false);
      return;
    }

    try {
      setIsLoadingProgress(true);
      const response = await progressApiClient.getProgressByTitle(bookId);
      
      if (response.success && response.data) {
        // Use current_chapter as the chapter limit, default to 0 if no progress
        setUserProgress(response.data.current_chapter || 0);
      } else {
        // No progress found, user hasn't started yet
        setUserProgress(0);
      }
    } catch (error) {
      console.error("Error loading user progress:", error);
      // Default to 0 on error
      setUserProgress(0);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!question.trim()) {
      Alert.alert("Error", "Please enter a question");
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in to ask questions");
      return;
    }

    // Check if user has made progress
    if (userProgress === 0) {
      Alert.alert(
        "No Progress Yet", 
        "You haven't started reading this book yet. Please set your progress first to ask questions.",
        [
          {
            text: "Set Progress",
            onPress: () => {
              router.push({
                pathname: "/book/[id]/set-progress" as any,
                params: { id: bookId },
              });
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await questionsApiClient.createQuestion({
        title_id: bookId,
        question_text: question.trim(),
        chapter_limit: userProgress, // Use user's current chapter as limit
      });

      if (response.success) {
        Alert.alert(
          "Question Submitted",
          `Your question has been submitted successfully. Answers will be limited to chapter ${userProgress}. You'll be notified when it's answered.`,
          [
            {
              text: "OK",
              onPress: () => {
                setQuestion("");
                router.back();
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", response.error || "Failed to submit question");
      }
    } catch (error) {
      console.error("Error submitting question:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExampleQuestionPress = (exampleQuestion: string) => {
    setQuestion(exampleQuestion);
  };

  const getProgressText = () => {
    if (isLoadingProgress) {
      return "Loading your progress...";
    }
    
    if (userProgress === 0) {
      return "You haven't started this book yet";
    }
    
    return `You're at chapter ${userProgress}`;
  };

  const getNoticeText = () => {
    if (isLoadingProgress) {
      return "Loading progress information...";
    }
    
    if (userProgress === 0) {
      return "Set your progress first to ask spoiler-free questions";
    }
    
    return `Answers will be filtered to chapter ${userProgress} and earlier`;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Ask Questions",
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            ...typography.h3,
            fontWeight: "600",
          },
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
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Book Info */}
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle}>{bookName}</Text>
              <Text style={styles.bookStatus}>{getProgressText()}</Text>
            </View>

            {/* Progress Notice */}
            <View style={[
              styles.progressNotice,
              userProgress === 0 && styles.progressNoticeWarning
            ]}>
              <View style={styles.noticeIcon}>
                <Ionicons
                  name={userProgress === 0 ? "warning" : "information-circle"}
                  size={20}
                  color={userProgress === 0 ? colors.error : colors.warning}
                />
              </View>
              <View style={styles.noticeContent}>
                <Text style={[
                  styles.noticeText,
                  userProgress === 0 && styles.noticeTextWarning
                ]}>
                  {getNoticeText()}
                </Text>
                {userProgress === 0 && (
                  <TouchableOpacity
                    style={styles.setProgressButton}
                    onPress={() => router.push({
                      pathname: "/book/[id]/set-progress" as any,
                      params: { id: bookId },
                    })}
                  >
                    <Text style={styles.setProgressButtonText}>Set Progress</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Main Content */}
            <View style={styles.mainContent}>
              <Text style={styles.mainTitle}>
                {userProgress === 0 ? "Set Your Progress First" : "Ask Your Question"}
              </Text>
              <Text style={styles.mainDescription}>
                {userProgress === 0 
                  ? `Set your reading progress for ${bookName} to start asking spoiler-free questions about the story.`
                  : `Ask anything about ${bookName} without worrying about spoilers. We'll only reveal information up to chapter ${userProgress}.`
                }
              </Text>

              {/* Example Questions - Only show if user has progress */}
              {userProgress > 0 && (
                <View style={styles.exampleSection}>
                  <Text style={styles.exampleTitle}>Example questions:</Text>
                  <View style={styles.exampleList}>
                    {exampleQuestions.map((example, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.exampleItem}
                        onPress={() => handleExampleQuestionPress(example)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.exampleBullet} />
                        <Text style={styles.exampleText}>{example}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Question Input - Only show if user has progress */}
          {userProgress > 0 && (
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
                  editable={!isSubmitting && !isLoadingProgress}
                />
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!question.trim() || isSubmitting || isLoadingProgress) && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmitQuestion}
                  disabled={!question.trim() || isSubmitting || isLoadingProgress}
                  activeOpacity={0.7}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={colors.card} />
                  ) : (
                    <Ionicons name="send" size={20} color={colors.card} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
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
  keyboardAvoidingView: {
    flex: 1,
  },
  backButton: {
    padding: layout.spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.spacing.lg,
    paddingBottom: layout.spacing.xl,
  },
  bookInfo: {
    paddingVertical: layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: layout.spacing.lg,
  },
  bookTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: layout.spacing.xs,
  },
  bookStatus: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  progressNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.warning + "15",
    padding: layout.spacing.md,
    borderRadius: layout.borderRadius.md,
    marginBottom: layout.spacing.xl,
  },
  progressNoticeWarning: {
    backgroundColor: colors.error + "15",
  },
  noticeIcon: {
    marginRight: layout.spacing.sm,
    marginTop: 2,
  },
  noticeContent: {
    flex: 1,
  },
  noticeText: {
    ...typography.bodySmall,
    color: colors.warning,
    lineHeight: 18,
  },
  noticeTextWarning: {
    color: colors.error,
  },
  setProgressButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: layout.spacing.sm,
    paddingVertical: layout.spacing.xs,
    borderRadius: layout.borderRadius.sm,
    marginTop: layout.spacing.sm,
    alignSelf: "flex-start",
  },
  setProgressButtonText: {
    ...typography.bodySmall,
    color: colors.card,
    fontWeight: "600",
  },
  mainContent: {
    flex: 1,
  },
  mainTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: layout.spacing.md,
    fontWeight: "700",
  },
  mainDescription: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
    marginBottom: layout.spacing.xl,
  },
  exampleSection: {
    marginBottom: layout.spacing.xl,
  },
  exampleTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: layout.spacing.md,
    fontWeight: "600",
  },
  exampleList: {
    marginLeft: layout.spacing.sm,
  },
  exampleItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: layout.spacing.md,
    paddingRight: layout.spacing.md,
  },
  exampleBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: layout.spacing.md,
    marginTop: 8,
  },
  exampleText: {
    ...typography.body,
    color: colors.primary,
    flex: 1,
    lineHeight: 22,
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
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    maxHeight: 120,
    paddingVertical: layout.spacing.sm,
    paddingRight: layout.spacing.md,
  },
  submitButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
});