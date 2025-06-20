import colors from "@/constants/colors";
import layout from "@/constants/layout";
import typography from "@/constants/typography";
import { progressApiClient, titlesApiClient, chaptersApiClient } from "@/services";
import { useAuthStore } from "@/store/auth-store";
import type { Title } from "@/types/database";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface LoadingStates {
  initial: boolean;
  saving: boolean;
  refreshing: boolean;
}

export default function SetProgressScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const bookId = params.id as string;

  const [book, setBook] = useState<Title | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [totalChapters, setTotalChapters] = useState(0);
  const [loading, setLoading] = useState<LoadingStates>({
    initial: true,
    saving: false,
    refreshing: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Memoized chapter list for performance
  const chapterList = useMemo(() => {
    const chapters = [];
    for (let i = 0; i <= totalChapters; i++) {
      chapters.push(i);
    }
    return chapters;
  }, [totalChapters]);

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, [bookId]);

  // Main data loading function
  const loadAllData = useCallback(async (isRefresh = false) => {
    if (!user) {
      setError("User not authenticated");
      setLoading(prev => ({ ...prev, initial: false, refreshing: false }));
      return;
    }

    try {
      if (isRefresh) {
        setLoading(prev => ({ ...prev, refreshing: true }));
      } else {
        setLoading(prev => ({ ...prev, initial: true }));
      }
      
      setError(null);

      // Load book details and chapter count in parallel
      const [bookResponse, chapterCountResponse] = await Promise.all([
        loadBookDetails(),
        loadChapterCount(),
      ]);

      // Load existing progress if book loaded successfully
      if (bookResponse.success) {
        await loadExistingProgress();
      }

    } catch (error) {
      console.error("Error in loadAllData:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading({ initial: false, saving: false, refreshing: false });
    }
  }, [bookId, user]);

  const loadBookDetails = async () => {
    try {
      const response = await titlesApiClient.getTitleById(bookId);
      
      if (response.success && response.data) {
        setBook(response.data);
        return { success: true };
      } else {
        console.error("Error loading book:", response);
        setError("Failed to load book details");
        return { success: false };
      }
    } catch (error) {
      console.error("Error in loadBookDetails:", error);
      setError("Failed to load book details");
      return { success: false };
    }
  };

  const loadChapterCount = async () => {
    try {      
      const response = await chaptersApiClient.getChapterCount(bookId);
      
      if (response.success && response.data) {
        setTotalChapters(response.data.count || 0);
        return { success: true };
      } else {
        console.error("Error loading chapter count:", response);
        // Fallback to a reasonable default
        setTotalChapters(24);
        return { success: false };
      }
    } catch (error) {
      console.error("Error in loadChapterCount:", error);
      // Fallback to default if API call fails
      setTotalChapters(24);
      return { success: false };
    }
  };

  const loadExistingProgress = async () => {
    try {
      const response = await progressApiClient.getProgressByTitle(bookId);

      if (response.success && response.data) {
        setSelectedChapter(response.data.current_chapter || 0);
        console.log("Loaded existing progress:", response.data);
      } else if (!response.success) {
        // Only show error if it's not a "not found" error (which is expected for new progress)
        console.error("Error loading existing progress:", response);
      }
    } catch (error) {
      console.error("Error loading existing progress:", error);
      // Don't show error to user as this might be expected for new books
    }
  };

  const handleChapterSelect = useCallback((chapter: number) => {
    setSelectedChapter(chapter);
  }, []);

  const handleSaveProgress = async () => {
    if (!user || !book) {
      Alert.alert("Error", "Unable to save progress");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, saving: true }));

      const response = await progressApiClient.updateProgress({
        title_id: bookId,
        current_chapter: selectedChapter,
        total_chapters: totalChapters
      });

      if (!response.success) {
        Alert.alert("Error", response.error || "Failed to save progress");
        return;
      }

      // Show success message
      Alert.alert(
        "Progress Saved",
        `Your progress has been set to chapter ${selectedChapter} of ${totalChapters}`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error("Error saving progress:", error);
      Alert.alert("Error", "Something went wrong while saving progress");
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  const handleRefresh = useCallback(() => {
    loadAllData(true);
  }, [loadAllData]);

  const renderChapterButton = useCallback((chapter: number) => {
    const isSelected = selectedChapter === chapter;
    
    return (
      <TouchableOpacity
        key={chapter}
        style={[
          styles.chapterButton,
          isSelected && styles.chapterButtonSelected,
        ]}
        onPress={() => handleChapterSelect(chapter)}
        activeOpacity={0.7}
      >
        {isSelected && (
          <Ionicons
            name="checkmark"
            size={16}
            color={colors.card}
            style={styles.checkmark}
          />
        )}
        <Text
          style={[
            styles.chapterText,
            isSelected && styles.chapterTextSelected,
          ]}
        >
          {chapter}
        </Text>
      </TouchableOpacity>
    );
  }, [selectedChapter, handleChapterSelect]);

  const renderChapterGrid = () => {
    if (totalChapters === 0) {
      return (
        <View style={styles.noChaptersContainer}>
          <Text style={styles.noChaptersText}>No chapters available</Text>
        </View>
      );
    }

    return (
      <View style={styles.chapterGrid}>
        {chapterList.map(renderChapterButton)}
      </View>
    );
  };

  const getProgressPercentage = () => {
    if (totalChapters === 0) return 0;
    return Math.round((selectedChapter / totalChapters) * 100);
  };

  // Loading state
  if (loading.initial) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "Set Progress",
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.primary,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading book details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && !book) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "Set Progress",
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.primary,
          }}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadAllData()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Set Progress",
          headerStyle: {
            backgroundColor: colors.background,
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
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading.refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {/* Book Info */}
          <View style={styles.bookInfo}>
            <View style={styles.bookImageContainer}>
              {book?.coverImage ? (
                <Image
                  source={{ uri: book.coverImage }}
                  style={styles.bookImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons
                    name="book"
                    size={32}
                    color={colors.textSecondary}
                  />
                </View>
              )}
            </View>

            <View style={styles.bookDetails}>
              <Text style={styles.bookTitle}>
                {book?.name || "Unknown Book"}
              </Text>
              <Text style={styles.bookType}>Book</Text>
            </View>
          </View>

          {/* Progress Question */}
          <View style={styles.questionSection}>
            <Text style={styles.questionTitle}>
              How far are you in {book?.name || "this book"}?
            </Text>
            <Text style={styles.questionSubtitle}>
              Select your current chapter
            </Text>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressIndicator}>
            <Text style={styles.progressText}>
              {selectedChapter} of {totalChapters} chapters ({getProgressPercentage()}%)
            </Text>
          </View>

          {/* Chapter Selection */}
          <View style={styles.chapterSection}>
            <Text style={styles.chapterSectionTitle}>Select Chapter</Text>
            {renderChapterGrid()}
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={[
              styles.saveButton, 
              loading.saving && styles.saveButtonDisabled
            ]}
            onPress={handleSaveProgress}
            disabled={loading.saving}
            activeOpacity={0.8}
          >
            {loading.saving ? (
              <View style={styles.saveButtonContent}>
                <ActivityIndicator size="small" color={colors.card} />
                <Text style={[styles.saveButtonText, styles.saveButtonTextLoading]}>
                  Saving...
                </Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>Save Progress</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: layout.spacing.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: layout.spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: layout.spacing.lg,
  },
  errorTitle: {
    ...typography.h3,
    color: colors.error,
    marginTop: layout.spacing.md,
    marginBottom: layout.spacing.sm,
  },
  errorMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: layout.spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: layout.spacing.lg,
    paddingVertical: layout.spacing.md,
    borderRadius: layout.borderRadius.md,
  },
  retryButtonText: {
    ...typography.button,
    color: colors.card,
    fontWeight: "600",
  },
  backButton: {
    padding: layout.spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: layout.spacing.lg,
  },
  bookInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: layout.spacing.lg,
  },
  bookImageContainer: {
    marginRight: layout.spacing.md,
  },
  bookImage: {
    width: 60,
    height: 80,
    borderRadius: layout.borderRadius.sm,
  },
  placeholderImage: {
    width: 60,
    height: 80,
    borderRadius: layout.borderRadius.sm,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  bookDetails: {
    flex: 1,
  },
  bookTitle: {
    ...typography.h3,
    marginBottom: layout.spacing.xs,
  },
  bookType: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  questionSection: {
    marginBottom: layout.spacing.lg,
  },
  questionTitle: {
    ...typography.h3,
    marginBottom: layout.spacing.sm,
  },
  questionSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  progressIndicator: {
    marginBottom: layout.spacing.lg,
  },
  progressText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
  chapterSection: {
    marginBottom: layout.spacing.xl,
  },
  chapterSectionTitle: {
    ...typography.h4,
    marginBottom: layout.spacing.lg,
  },
  chapterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  noChaptersContainer: {
    padding: layout.spacing.lg,
    alignItems: "center",
  },
  noChaptersText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  chapterButton: {
    width: "18%",
    aspectRatio: 1,
    backgroundColor: colors.card,
    borderRadius: layout.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: layout.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    position: "relative",
  },
  chapterButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  chapterText: {
    ...typography.body,
    fontWeight: "600",
  },
  chapterTextSelected: {
    color: colors.card,
  },
  saveButtonContainer: {
    paddingHorizontal: layout.spacing.lg,
    paddingVertical: layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: layout.borderRadius.md,
    paddingVertical: layout.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  saveButtonDisabled: {
    backgroundColor: colors.border,
  },
  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveButtonText: {
    ...typography.button,
    color: colors.card,
    fontWeight: "600",
  },
  saveButtonTextLoading: {
    marginLeft: layout.spacing.sm,
  },
});