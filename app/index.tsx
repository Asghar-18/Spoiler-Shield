import colors from '@/constants/colors';
import layout from '@/constants/layout';
import { titlesService } from '@/services';
import { useAuthStore } from '@/store/auth-store';
import type { Title } from '@/types/database';
import { router } from 'expo-router';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import the separated components
import AppHeader from '@/components/AppHeader';
import BookCard from '@/components/BookCard';
import EmptyState from '@/components/EmptyState';
import FilterSection from '@/components/FilterSection';
import LoadingScreen from '@/components/LoadingScreen';
import SearchBar from '@/components/SearchBar';

interface HomePageState {
  books: Title[];
  filteredBooks: Title[];
  searchQuery: string;
  loading: boolean;
  searchLoading: boolean;
  refreshing: boolean;
}

export default function HomePage() {
  const { user, signOut } = useAuthStore();
  const [state, setState] = useState<HomePageState>({
    books: [],
    filteredBooks: [],
    searchQuery: '',
    loading: true,
    searchLoading: false,
    refreshing: false,
  });

  // Refs for cleanup
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Check authentication - redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.replace('/auth' as any);
      return;
    }
  }, [user]);

  // Load books on mount
  useEffect(() => {
    if (user) {
      loadBooks();
    }
  }, [user]);

  // Handle search with debouncing
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        handleSearch();
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [state.searchQuery]);

  const updateState = useCallback((updates: Partial<HomePageState>) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  const loadBooks = useCallback(async (isRefreshing: boolean = false) => {
    try {
      updateState({ 
        loading: !isRefreshing, 
        refreshing: isRefreshing 
      });

      const { data, error } = await titlesService.getTitles();
      
      if (!isMountedRef.current) return;

      if (error) {
        console.error('Error loading books:', error);
        Alert.alert('Error', 'Failed to load books. Please try again.');
        return;
      }

      const books = data || [];
      updateState({
        books,
        filteredBooks: state.searchQuery.trim() ? state.filteredBooks : books,
        loading: false,
        refreshing: false,
      });

      // If we have a search query, re-run search with new data
      if (state.searchQuery.trim()) {
        handleSearch();
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      
      console.error('Error in loadBooks:', error);
      Alert.alert('Error', 'Something went wrong while loading books');
      updateState({ 
        loading: false, 
        refreshing: false 
      });
    }
  }, [state.searchQuery, updateState]);

  const handleSearch = useCallback(async () => {
    const query = state.searchQuery.trim();
    
    if (query === '') {
      updateState({ filteredBooks: state.books });
      return;
    }

    try {
      updateState({ searchLoading: true });
      
      const { data, error } = await titlesService.searchTitles(query);
      
      if (!isMountedRef.current) return;

      if (error) {
        console.error('Search error:', error);
        // Fallback to local filtering if search fails
        const localFiltered = state.books.filter(book =>
          book.name?.toLowerCase().includes(query.toLowerCase()) ||
          book.author?.toLowerCase().includes(query.toLowerCase())
        );
        updateState({ 
          filteredBooks: localFiltered,
          searchLoading: false 
        });
        return;
      }

      updateState({ 
        filteredBooks: data || [],
        searchLoading: false 
      });
    } catch (error) {
      if (!isMountedRef.current) return;
      
      console.error('Error in handleSearch:', error);
      // Fallback to local filtering
      const localFiltered = state.books.filter(book =>
        book.name?.toLowerCase().includes(query.toLowerCase()) ||
        book.author?.toLowerCase().includes(query.toLowerCase())
      );
      updateState({ 
        filteredBooks: localFiltered,
        searchLoading: false 
      });
    }
  }, [state.searchQuery, state.books, updateState]);

  const handleBookPress = useCallback((book: Title) => {
    router.push({
      pathname: '/book/[id]' as any,
      params: { 
        id: book.id,
        bookName: book.name || 'Untitled Book',
        coverImage: book.coverImage || ''
      }
    });
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              await signOut();
              // Navigation will be handled by auth state change in RootLayout
            },
          },
        ]
      );
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  }, [signOut]);

  const handleSearchChange = useCallback((query: string) => {
    updateState({ searchQuery: query });
  }, [updateState]);

  const clearSearch = useCallback(() => {
    updateState({ 
      searchQuery: '',
      filteredBooks: state.books 
    });
  }, [state.books, updateState]);

  const handleRefresh = useCallback(() => {
    loadBooks(true);
  }, [loadBooks]);

  // Show loading screen while initial data loads
  if (state.loading) {
    return <LoadingScreen message="Loading books..." />;
  }

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <AppHeader
        title="Home"
        discoverTitle="Discover"
        discoverSubtitle="Find stories to explore"
        onLogout={handleLogout}
      />

      {/* Search Bar */}
      <SearchBar
        searchQuery={state.searchQuery}
        onSearchChange={handleSearchChange}
        onClear={clearSearch}
        loading={state.searchLoading}
        placeholder="Search books and authors..."
      />

      {/* Filter Section */}
      <FilterSection
        resultCount={state.filteredBooks.length}
        showResultCount={!!state.searchQuery.trim()}
        filterText="Books"
        filterIcon="book"
      />

      {/* Books List */}
      <ScrollView 
        style={styles.booksContainer}
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
        {state.filteredBooks.length === 0 ? (
          <EmptyState
            title={state.searchQuery ? 'No books found' : 'No books available'}
            subtitle={
              state.searchQuery 
                ? 'Try adjusting your search terms or browse all books' 
                : 'Books will appear here once they are added to your library'
            }
            icon="book-outline"
            showClearButton={!!state.searchQuery}
            onClearPress={clearSearch}
            clearButtonText="Clear search"
          />
        ) : (
          state.filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onPress={handleBookPress}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  booksContainer: {
    flex: 1,
  },
  booksContent: {
    paddingHorizontal: layout.spacing.lg,
    paddingBottom: layout.spacing.lg,
  },
});