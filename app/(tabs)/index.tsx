// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
//   Alert,
//   RefreshControl,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';
// import { router } from 'expo-router';
// import { authService, titlesService } from '@/services';
// import type { Title } from '@/types/database';
// import colors from '@/constants/colors';
// import typography from '@/constants/typography';
// import layout from '@/constants/layout';

// export default function HomePage() {
//   const [books, setBooks] = useState<Title[]>([]);
//   const [filteredBooks, setFilteredBooks] = useState<Title[]>([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [searchLoading, setSearchLoading] = useState(false);
//   const [user, setUser] = useState<any>(null);

//   // Check authentication and load books
//   useEffect(() => {
//     checkUser();
//     loadBooks();
//   }, []);

//   // Handle search with debouncing
//   useEffect(() => {
//     const debounceTimer = setTimeout(() => {
//       handleSearch();
//     }, 300);

//     return () => clearTimeout(debounceTimer);
//   }, [searchQuery]);

//   const checkUser = async () => {
//     try {
//       const { user, error } = await authService.getCurrentUser();
//       if (error || !user) {
//         router.replace('/auth' as any);
//         return;
//       }
//       setUser(user);
//     } catch (error) {
//       console.error('Error checking user:', error);
//       router.replace('/auth' as any);
//     }
//   };

//   const loadBooks = async () => {
//     try {
//       setLoading(true);
//       const { data, error } = await titlesService.getTitles();
      
//       if (error) {
//         Alert.alert('Error', 'Failed to load books');
//         console.error('Error loading books:', error);
//         return;
//       }

//       setBooks(data || []);
//       // If no search query, show all books
//       if (!searchQuery.trim()) {
//         setFilteredBooks(data || []);
//       }
//     } catch (error) {
//       console.error('Error in loadBooks:', error);
//       Alert.alert('Error', 'Something went wrong');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = async () => {
//     if (searchQuery.trim() === '') {
//       setFilteredBooks(books);
//       return;
//     }

//     try {
//       setSearchLoading(true);
//       const { data, error } = await titlesService.searchTitles(searchQuery.trim());
      
//       if (error) {
//         console.error('Search error:', error);
//         // Fallback to local filtering if search fails
//         const localFiltered = books.filter(book =>
//           book.name?.toLowerCase().includes(searchQuery.toLowerCase())
//         );
//         setFilteredBooks(localFiltered);
//         return;
//       }

//       setFilteredBooks(data || []);
//     } catch (error) {
//       console.error('Error in handleSearch:', error);
//       // Fallback to local filtering
//       const localFiltered = books.filter(book =>
//         book.name?.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//       setFilteredBooks(localFiltered);
//     } finally {
//       setSearchLoading(false);
//     }
//   };

//   const handleBookPress = (book: Title) => {
//     router.push({
//       pathname: '/book/[id]' as any,
//       params: { 
//         id: book.id,
//         bookName: book.name || 'Untitled Book',
//         coverImage: book.coverImage || ''
//       }
//     });
//   };

//   const handleLogout = async () => {
//     try {
//       const { error } = await authService.signOut();
//       if (error) {
//         Alert.alert('Error', 'Failed to sign out');
//         return;
//       }
//       router.replace('/auth' as any);
//     } catch (error) {
//       console.error('Logout error:', error);
//       Alert.alert('Error', 'Something went wrong');
//     }
//   };

//   const clearSearch = () => {
//     setSearchQuery('');
//     setFilteredBooks(books);
//   };

//   const renderBookItem = ({ item: book }: { item: Title }) => (
//     <TouchableOpacity
//       style={styles.bookItem}
//       onPress={() => handleBookPress(book)}
//       activeOpacity={0.7}
//     >
//       <View style={styles.bookImageContainer}>
//         {book.coverImage ? (
//           <Image
//             source={{ uri: book.coverImage }}
//             style={styles.bookImage}
//             resizeMode="cover"
//           />
//         ) : (
//           <View style={styles.placeholderImage}>
//             <Ionicons name="book" size={32} color={colors.textSecondary} />
//           </View>
//         )}
//       </View>
      
//       <View style={styles.bookInfo}>
//         <Text style={styles.bookTitle} numberOfLines={2}>
//           {book.name || 'Untitled Book'}
//         </Text>
//         <Text style={styles.bookType}>Book</Text>
//         <Text style={styles.bookDate}>
//           Added {new Date(book.created_at).toLocaleDateString()}
//         </Text>
//       </View>
      
//       <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
//     </TouchableOpacity>
//   );

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={colors.primary} />
//           <Text style={styles.loadingText}>Loading books...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.headerTop}>
//           <Text style={styles.headerTitle}>Home</Text>
//           <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
//             <Ionicons name="log-out-outline" size={24} color={colors.textSecondary} />
//           </TouchableOpacity>
//         </View>
        
//         <Text style={styles.discoverTitle}>Discover</Text>
//         <Text style={styles.discoverSubtitle}>Find stories to explore</Text>
//       </View>

//       {/* Search Bar */}
//       <View style={styles.searchContainer}>
//         <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search books..."
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//           placeholderTextColor={colors.textSecondary}
//         />
//         {searchLoading && (
//           <ActivityIndicator size="small" color={colors.primary} style={styles.searchLoader} />
//         )}
//         {searchQuery.length > 0 && !searchLoading && (
//           <TouchableOpacity
//             onPress={clearSearch}
//             style={styles.clearButton}
//           >
//             <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* Books Filter Tag */}
//       <View style={styles.filterContainer}>
//         <View style={styles.filterRow}>
//           <View style={styles.activeFilter}>
//             <Ionicons name="book" size={16} color={colors.card} />
//             <Text style={styles.activeFilterText}>Books</Text>
//           </View>
//           {searchQuery.trim() && (
//             <Text style={styles.resultCount}>
//               {filteredBooks.length} result{filteredBooks.length !== 1 ? 's' : ''}
//             </Text>
//           )}
//         </View>
//       </View>

//       {/* Books List */}
//       <ScrollView 
//         style={styles.booksContainer}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.booksContent}
//         refreshControl={
//           <RefreshControl
//             refreshing={loading}
//             onRefresh={loadBooks}
//             colors={[colors.primary]}
//             tintColor={colors.primary}
//           />
//         }
//       >
//         {filteredBooks.length === 0 ? (
//           <View style={styles.emptyContainer}>
//             <Ionicons name="book-outline" size={64} color={colors.border} />
//             <Text style={styles.emptyTitle}>
//               {searchQuery ? 'No books found' : 'No books available'}
//             </Text>
//             <Text style={styles.emptySubtitle}>
//               {searchQuery 
//                 ? 'Try adjusting your search terms' 
//                 : 'Books will appear here once added'
//               }
//             </Text>
//             {searchQuery && (
//               <TouchableOpacity onPress={clearSearch} style={styles.clearSearchButton}>
//                 <Text style={styles.clearSearchText}>Clear search</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         ) : (
//           filteredBooks.map((book) => (
//             <View key={book.id}>
//               {renderBookItem({ item: book })}
//             </View>
//           ))
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     ...typography.body,
//     marginTop: layout.spacing.md,
//   },
//   header: {
//     paddingHorizontal: layout.spacing.lg,
//     paddingTop: layout.spacing.sm,
//     paddingBottom: layout.spacing.lg,
//     backgroundColor: colors.card,
//   },
//   headerTop: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: layout.spacing.lg,
//   },
//   headerTitle: {
//     ...typography.h4,
//   },
//   logoutButton: {
//     padding: layout.spacing.xs,
//   },
//   discoverTitle: {
//     ...typography.h1,
//     marginBottom: layout.spacing.xs,
//   },
//   discoverSubtitle: {
//     ...typography.body,
//     color: colors.textSecondary,
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.card,
//     marginHorizontal: layout.spacing.lg,
//     marginVertical: layout.spacing.md,
//     paddingHorizontal: layout.spacing.md,
//     paddingVertical: layout.spacing.md,
//     borderRadius: layout.borderRadius.md,
//     shadowColor: colors.shadow,
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   searchIcon: {
//     marginRight: layout.spacing.md,
//   },
//   searchInput: {
//     flex: 1,
//     ...typography.body,
//   },
//   searchLoader: {
//     marginHorizontal: layout.spacing.sm,
//   },
//   clearButton: {
//     padding: layout.spacing.xs,
//   },
//   filterContainer: {
//     paddingHorizontal: layout.spacing.lg,
//     marginBottom: layout.spacing.md,
//   },
//   filterRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   activeFilter: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.primary,
//     paddingHorizontal: layout.spacing.md,
//     paddingVertical: layout.spacing.sm,
//     borderRadius: layout.borderRadius.full,
//   },
//   activeFilterText: {
//     ...typography.button,
//     color: colors.card,
//     marginLeft: layout.spacing.xs,
//   },
//   resultCount: {
//     ...typography.bodySmall,
//     fontWeight: '500',
//   },
//   booksContainer: {
//     flex: 1,
//   },
//   booksContent: {
//     paddingHorizontal: layout.spacing.lg,
//     paddingBottom: layout.spacing.lg,
//   },
//   bookItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.card,
//     padding: layout.spacing.md,
//     borderRadius: layout.borderRadius.md,
//     marginBottom: layout.spacing.md,
//     shadowColor: colors.shadow,
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   bookImageContainer: {
//     marginRight: layout.spacing.md,
//   },
//   bookImage: {
//     width: 60,
//     height: 80,
//     borderRadius: layout.borderRadius.sm,
//   },
//   placeholderImage: {
//     width: 60,
//     height: 80,
//     borderRadius: layout.borderRadius.sm,
//     backgroundColor: colors.background,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   bookInfo: {
//     flex: 1,
//   },
//   bookTitle: {
//     ...typography.h4,
//     marginBottom: layout.spacing.xs,
//   },
//   bookType: {
//     ...typography.bodySmall,
//     marginBottom: 2,
//   },
//   bookDate: {
//     ...typography.caption,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingTop: 100,
//   },
//   emptyTitle: {
//     ...typography.h3,
//     color: colors.textSecondary,
//     marginTop: layout.spacing.md,
//     marginBottom: layout.spacing.sm,
//   },
//   emptySubtitle: {
//     ...typography.body,
//     color: colors.textSecondary,
//     textAlign: 'center',
//     marginBottom: layout.spacing.md,
//   },
//   clearSearchButton: {
//     backgroundColor: colors.primary,
//     paddingHorizontal: layout.spacing.lg,
//     paddingVertical: layout.spacing.sm,
//     borderRadius: layout.borderRadius.sm,
//   },
//   clearSearchText: {
//     ...typography.button,
//     color: colors.card,
//   },
// });