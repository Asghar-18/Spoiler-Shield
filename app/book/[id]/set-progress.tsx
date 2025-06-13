import colors from '@/constants/colors';
import layout from '@/constants/layout';
import typography from '@/constants/typography';
import { progressService, supabase, titlesService } from '@/services';
import { useAuthStore } from '@/store/auth-store';
import type { Title } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SetProgressScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const bookId = params.id as string;
  
  const [book, setBook] = useState<Title | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [totalChapters, setTotalChapters] = useState(24); // Default, should come from book data
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadBookDetails();
  }, [bookId]);

  const loadBookDetails = async () => {
    try {
      // Fetch title
      const { data, error } = await titlesService.getTitleById(bookId);
      if (error) {
        Alert.alert('Error', 'Failed to load book details');
        console.error('Error loading book:', error);
        return;
      }

      setBook(data);
      console.log('Loaded book:', data);

      // Count chapters
      const { count, error: countError } = await supabase
        .from('chapters')
        .select('*', { count: 'exact', head: true })
        .eq('title_id', bookId);

      console.log('Chapter count result:', { count, countError });

      if (countError) {
        console.error('Error counting chapters:', countError);
        Alert.alert('Error', 'Failed to count chapters');
      } else {
        setTotalChapters(count || 0);
      }

      // Load existing progress
      if (user) {
        await loadExistingProgress();
      }

    } catch (error) {
      console.error('Error in loadBookDetails:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setInitialLoading(false);
    }
  };

  const loadExistingProgress = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await progressService.getProgressByTitle(user.id, bookId);
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error loading progress:', error);
        return;
      }
      
      if (data) {
        setSelectedChapter(data.current_chapter || 0);
        console.log('Loaded existing progress:', data);
      }
    } catch (error) {
      console.error('Error loading existing progress:', error);
    }
  };

  const handleChapterSelect = (chapter: number) => {
    setSelectedChapter(chapter);
  };

  const handleSaveProgress = async () => {
    if (!user || !book) {
      Alert.alert('Error', 'Unable to save progress');
      return;
    }

    try {
      setIsLoading(true);
      
      const { error } = await progressService.updateProgress(
        user.id,
        bookId,
        selectedChapter,
        totalChapters
      );
      
      if (error) {
        Alert.alert('Error', 'Failed to save progress');
        return;
      }

      // Show success message
      Alert.alert(
        'Progress Saved',
        `Your progress has been set to chapter ${selectedChapter} of ${totalChapters}`,
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
      
    } catch (error) {
      console.error('Error saving progress:', error);
      Alert.alert('Error', 'Something went wrong while saving progress');
    } finally {
      setIsLoading(false);
    }
  };

  const renderChapterGrid = () => {
    const chapters = [];
    for (let i = 0; i <= totalChapters; i++) {
      chapters.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.chapterButton,
            selectedChapter === i && styles.chapterButtonSelected
          ]}
          onPress={() => handleChapterSelect(i)}
        >
          {selectedChapter === i && (
            <Ionicons 
              name="checkmark" 
              size={16} 
              color={colors.card} 
              style={styles.checkmark}
            />
          )}
          <Text style={[
            styles.chapterText,
            selectedChapter === i && styles.chapterTextSelected
          ]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }
    return chapters;
  };

  const getProgressPercentage = () => {
    if (totalChapters === 0) return 0;
    return Math.round((selectedChapter / totalChapters) * 100);
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Set Progress',
          headerStyle: {
            backgroundColor: colors.background,
            
          },
          headerTintColor: colors.shadowColor,
          headerTitleStyle: {
            ...typography.h3,
            
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
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                  <Ionicons name="book" size={32} color={colors.textSecondary} />
                </View>
              )}
            </View>
            
            <View style={styles.bookDetails}>
              <Text style={styles.bookTitle}>
                {book?.name || 'The Midnight Library'}
              </Text>
              <Text style={styles.bookType}>Book</Text>
            </View>
          </View>

          {/* Progress Question */}
          <View style={styles.questionSection}>
            <Text style={styles.questionTitle}>
              How far are you in {book?.name || 'The Midnight Library'}?
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
            <View style={styles.chapterGrid}>
              {renderChapterGrid()}
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSaveProgress}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Save Progress'}
            </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    padding: layout.spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: layout.spacing.lg,
  },
  bookInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: '600',
  },
  chapterSection: {
    marginBottom: layout.spacing.xl,
  },
  chapterSectionTitle: {
    ...typography.h4,
    marginBottom: layout.spacing.lg,
  },
  chapterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chapterButton: {
    width: '18%',
    aspectRatio: 1,
    backgroundColor: colors.card,
    borderRadius: layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: layout.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  chapterButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  chapterText: {
    ...typography.body,
    fontWeight: '600',
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
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.border,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.card,
    fontWeight: '600',
  },
});