import layout from "@/constants/layout";
import { useAppStyles } from "@/hooks/useAppStyles";
import { progressApiClient, titlesApiClient } from "@/services";
import { useAuthStore } from "@/store/auth-store";
import type { Title } from "@/types/database";
import { Ionicons } from "@expo/vector-icons";
import {
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BookDetailsScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const bookId = params.id as string;

  const [book, setBook] = useState<Title | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [totalChapters, setTotalChapters] = useState(0);

  const { colors, typography } = useAppStyles();

  useEffect(() => {
    if (bookId) {
      loadBookDetails();
    }
  }, [bookId]);

  // Reload progress when screen comes into focus (e.g., after returning from set progress screen)
  useFocusEffect(
    useCallback(() => {
      if (user && bookId) {
        loadUserProgress();
      }
    }, [user, bookId])
  );

  const loadBookDetails = async () => {
    try {
      setLoading(true);
      const response = await titlesApiClient.getTitleById(bookId);

      if (response.success) {
        setBook(response.data);

        // Load user progress after book details are loaded
        if (user) {
          await loadUserProgress();
        }
      } else {
        console.error("Error loading book details:", response.error);
        Alert.alert("Error", "Book not found");
      }
    } catch (error) {
      console.error("Error in loadBookDetails:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = async () => {
    if (!user || !bookId) return;

    try {
      const response = await progressApiClient.getProgressByTitle(bookId);
      console.log("Fetched user progress:", response);

      if (response.success && response.data) {
        const data = response.data;
        setProgress(Math.round(data.progress_percentage || 0));
        setCurrentChapter(data.current_chapter || 0);
        setTotalChapters(data.total_chapters || 0);
        console.log("Loaded user progress:", data);
      } else {
        // No progress found, reset to defaults
        setProgress(0);
        setCurrentChapter(0);
        setTotalChapters(0);
      }
    } catch (error) {
      console.error("Error loading user progress:", error);
      // Reset to defaults on error
      setProgress(0);
      setCurrentChapter(0);
      setTotalChapters(0);
    }
  };
  const handleAskQuestion = () => {
    router.push({
      pathname: "/book/[id]/ask-question" as any,
      params: {
        id: bookId,
        bookName: book?.name || "Untitled Book",
      },
    });
  };

  const handleSetProgress = () => {
    router.push({
      pathname: "/book/[id]/set-progress" as any,
      params: {
        id: bookId,
      },
    });
  };

  const handleUpdateProgress = () => {
    // Navigate to set progress screen
    handleSetProgress();
  };

  const getProgressText = () => {
    if (progress === 0) {
      return "Not started";
    }
    if (totalChapters > 0) {
      return `Chapter ${currentChapter} of ${totalChapters} (${progress}% complete)`;
    }
    return `${progress}% complete`;
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },
        notFound: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: layout.spacing.xl,
        },
        notFoundText: {
          fontSize: 20,
          fontWeight: "600",
          color: colors.text,
          marginTop: layout.spacing.md,
          marginBottom: layout.spacing.lg,
        },
        backButtonError: {
          backgroundColor: colors.primary,
          paddingHorizontal: layout.spacing.lg,
          paddingVertical: layout.spacing.sm,
          borderRadius: layout.borderRadius.sm,
        },
        backButtonText: {
          color: colors.card,
          fontSize: 16,
          fontWeight: "600",
        },
        header: {
          height: 300,
          position: "relative",
        },
        coverImage: {
          width: "100%",
          height: "100%",
        },
        placeholderCoverImage: {
          width: "100%",
          height: "100%",
          backgroundColor: colors.card,
          justifyContent: "center",
          alignItems: "center",
        },
        overlay: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        },
        backButton: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          alignItems: "center",
          justifyContent: "center",
        },
        content: {
          flex: 1,
          padding: layout.spacing.lg,
          marginTop: -40,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: colors.background,
        },
        titleContainer: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: layout.spacing.md,
        },
        titleInfo: {
          flex: 1,
          marginRight: layout.spacing.md,
        },
        title: {
          fontSize: 28,
          fontWeight: "bold",
          color: colors.text,
          marginBottom: layout.spacing.xs,
        },
        creator: {
          fontSize: 16,
          color: colors.textSecondary,
        },
        typeContainer: {
          backgroundColor: colors.primaryLight,
          paddingVertical: layout.spacing.xs,
          paddingHorizontal: layout.spacing.sm,
          borderRadius: layout.borderRadius.md,
        },
        typeText: {
          fontSize: 12,
          color: colors.card,
          fontWeight: "600",
        },
        genreContainer: {
          flexDirection: "row",
          flexWrap: "wrap",
          marginBottom: layout.spacing.lg,
        },
        genreTag: {
          backgroundColor: colors.primary + "20",
          paddingVertical: layout.spacing.xs,
          paddingHorizontal: layout.spacing.sm,
          borderRadius: layout.borderRadius.md,
          marginRight: layout.spacing.xs,
          marginBottom: layout.spacing.xs,
        },
        genreText: {
          fontSize: 12,
          color: colors.primary,
          fontWeight: "500",
        },
        progressCard: {
          backgroundColor: colors.card,
          padding: layout.spacing.lg,
          borderRadius: layout.borderRadius.md,
          marginBottom: layout.spacing.lg,
          shadowColor: colors.shadow,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3.84,
          elevation: 5,
        },
        progressHeader: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: layout.spacing.md,
        },
        progressTitle: {
          fontSize: 18,
          fontWeight: "600",
          color: colors.text,
        },
        updateText: {
          fontSize: 14,
          color: colors.primary,
          fontWeight: "600",
        },
        progressBar: {
          height: 8,
          backgroundColor: colors.background,
          borderRadius: 4,
          marginBottom: layout.spacing.sm,
          overflow: "hidden",
        },
        progressFill: {
          height: "100%",
          backgroundColor: colors.primary,
          borderRadius: 4,
        },
        progressStatus: {
          fontSize: 14,
          color: colors.textSecondary,
        },
        sectionTitle: {
          fontSize: 20,
          fontWeight: "600",
          color: colors.text,
          marginBottom: layout.spacing.md,
        },
        description: {
          fontSize: 16,
          color: colors.text,
          lineHeight: 24,
          marginBottom: layout.spacing.xl,
        },
        actionButtons: {
          marginBottom: layout.spacing.xxl,
        },
        actionButton: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: layout.spacing.md,
          borderRadius: layout.borderRadius.md,
          gap: layout.spacing.sm,
          marginBottom: layout.spacing.md,
        },
        askButton: {
          backgroundColor: colors.primary,
        },
        askButtonText: {
          color: colors.card,
          fontSize: 16,
          fontWeight: "600",
        },
        progressButton: {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: colors.primary,
        },
        progressButtonText: {
          color: colors.primary,
          fontSize: 16,
          fontWeight: "600",
        },
      }),
    [colors, typography]
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="book-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.notFoundText}>Book not found</Text>
        <TouchableOpacity
          style={styles.backButtonError}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
          headerTransparent: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerTitleStyle: { ...typography.h3, fontWeight: "600" },
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {book.coverImage ? (
            <Image
              source={{ uri: book.coverImage }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderCoverImage}>
              <Ionicons name="book" size={64} color={colors.textSecondary} />
            </View>
          )}
          <View style={styles.overlay} />
        </View>

        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <View style={styles.titleInfo}>
              <Text style={styles.title}>{book.name || "Untitled Book"}</Text>
              <Text style={styles.creator}>{book.author}</Text>
            </View>
            <View style={styles.typeContainer}>
              <Text style={styles.typeText}>Book</Text>
            </View>
          </View>

          <View style={styles.genreContainer}>
            <View style={styles.genreTag}>
              <Text style={styles.genreText}>Fiction</Text>
            </View>
            <View style={styles.genreTag}>
              <Text style={styles.genreText}>Fantasy</Text>
            </View>
            <View style={styles.genreTag}>
              <Text style={styles.genreText}>Contemporary</Text>
            </View>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Your Progress</Text>
              <TouchableOpacity onPress={handleUpdateProgress}>
                <Text style={styles.updateText}>Update</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressStatus}>{getProgressText()}</Text>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {book.description || "No description available."}
          </Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.askButton]}
              onPress={handleAskQuestion}
            >
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={colors.card}
              />
              <Text style={styles.askButtonText}>Ask a Question</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.progressButton]}
              onPress={handleSetProgress}
            >
              <Ionicons
                name="bookmark-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.progressButtonText}>Set Progress</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
