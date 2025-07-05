import BookCard from "@/components/BookCard";
import EmptyState from "@/components/EmptyState";
import LoadingScreen from "@/components/LoadingScreen";
import layout from "@/constants/layout";
import { useAppStyles } from "@/hooks/useAppStyles";
import { progressApiClient, titlesApiClient } from "@/services";
import { useAuthStore } from "@/store/auth-store";
import type { Title } from "@/types/database";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface UserProgress {
  title_id: string;
  current_chapter?: number;
  total_chapters?: number;
  progress_percentage?: number; 
  updated_at: string;
}

interface LibraryState {
  books: Title[];
  userProgress: UserProgress[];
  loading: boolean;
  refreshing: boolean;
}

export default function LibraryScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { colors, typography } = useAppStyles();

  const [state, setState] = useState<LibraryState>({
    books: [],
    userProgress: [],
    loading: true,
    refreshing: false,
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        header: {
          paddingHorizontal: layout.spacing.lg,
          paddingTop: layout.spacing.md,
          paddingBottom: layout.spacing.lg,
          backgroundColor: colors.card,
        },
        title: {
          ...typography.h1,
          marginBottom: layout.spacing.xs,
        },
        subtitle: {
          ...typography.body,
          color: colors.textSecondary,
        },
        scrollView: {
          flex: 1,
        },
        booksContent: {
          paddingHorizontal: layout.spacing.lg,
          paddingTop: layout.spacing.lg,
          paddingBottom: layout.spacing.lg,
        },
        browseButton: {
          backgroundColor: colors.primary,
          paddingHorizontal: layout.spacing.lg,
          paddingVertical: layout.spacing.md,
          borderRadius: layout.borderRadius.md,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginTop: layout.spacing.md,
        },
        browseButtonText: {
          ...typography.button,
          color: colors.card,
          marginLeft: layout.spacing.sm,
        },
      }),
    [colors, typography]
  );

  const updateState = useCallback((updates: Partial<LibraryState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const loadLibraryData = useCallback(
    async (isRefreshing = false) => {
      if (!user) return;

      try {
        updateState({
          loading: !isRefreshing,
          refreshing: isRefreshing,
        });

        // Load user progress first
        const progressResponse = await progressApiClient.getUserProgress();

        if (progressResponse.success && progressResponse.data) {
          const userProgress: UserProgress[] = progressResponse.data.map(
            (p) => ({
              ...p,
              progress_percentage: p.progress_percentage ?? 0,
              updated_at: p.updated_at ?? p.created_at, // fallback to created_at if missing
            })
          );

          // Get unique title IDs from progress
          const titleIds = userProgress.map((p) => p.title_id);

          // Load books that have progress
          const booksPromises = titleIds.map((titleId) =>
            titlesApiClient.getTitleById(titleId)
          );

          const booksResponses = await Promise.all(booksPromises);
          const books = booksResponses
            .filter((response) => response.success && response.data)
            .map((response) => (response.success ? response.data : null))
            .filter((book) => book !== null)
            .sort((a, b) => {
              // Sort by last updated progress
              const progressA = userProgress.find((p) => p.title_id === a.id);
              const progressB = userProgress.find((p) => p.title_id === b.id);

              if (!progressA || !progressB) return 0;

              return (
                new Date(progressB.updated_at || 0).getTime() -
                new Date(progressA.updated_at || 0).getTime()
              );
            });

          updateState({
            books,
            userProgress,
            loading: false,
            refreshing: false,
          });
        } else {
          updateState({
            books: [],
            userProgress: [],
            loading: false,
            refreshing: false,
          });
        }
      } catch (error) {
        console.error("Error loading library data:", error);
        updateState({
          loading: false,
          refreshing: false,
        });
      }
    },
    [user, updateState]
  );

  const handleRefresh = useCallback(() => {
    loadLibraryData(true);
  }, [loadLibraryData]);

  const handleBookPress = useCallback(
    (book: Title) => {
      router.push({
        pathname: "/book/[id]" as any,
        params: {
          id: book.id,
          bookName: book.name || "Untitled Book",
          coverImage: book.coverImage || "",
        },
      });
    },
    [router]
  );

  const navigateToHome = useCallback(() => {
    router.push("/(tabs)");
  }, [router]);

  useEffect(() => {
    if (user) {
      loadLibraryData();
    }
  }, [user, loadLibraryData]);

  // Show loading screen while initial data loads
  if (state.loading) {
    return <LoadingScreen message="Loading your library..." />;
  }

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Library</Text>
        <Text style={styles.subtitle}>Track your progress</Text>
      </View>

      {/* Books List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.booksContent}
        refreshControl={
          <RefreshControl
            refreshing={state.refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {state.books.length === 0 ? (
          <EmptyState
            title="Your library is empty"
            subtitle="Start tracking your progress by adding books, shows, or games"
            icon="library-outline"
            showClearButton={true}
            onClearPress={navigateToHome}
            clearButtonText="Browse Titles"
          />
        ) : (
          state.books.map((book) => (
            <BookCard key={book.id} book={book} onPress={handleBookPress} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
