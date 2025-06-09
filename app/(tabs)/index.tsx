// // app/(tabs)/index.tsx
// import { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   ActivityIndicator,
//   TextInput,
// } from 'react-native';
// import { router } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { supabase, Title } from '../../lib/supabase';
// import { useAuthStore } from '../../store/authStore';

// export default function HomeScreen() {
//   const [titles, setTitles] = useState<Title[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const { user } = useAuthStore();

//   useEffect(() => {
//     fetchTitles();
//   }, []);

//   const fetchTitles = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('titles')
//         .select('*')        
//         .order('created_at', { ascending: false });

//       if (error) {
//         console.error('Error fetching titles:', error);
//       } else {
//         setTitles(data || []);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredTitles = titles.filter(title =>
//     title.name.toLowerCase().includes(searchQuery.toLowerCase())
//     // title.author?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const renderTitleItem = ({ item }: { item: Title }) => (
//     <TouchableOpacity
//       style={styles.titleCard}
//       onPress={() => router.push(`/novel/${item.id}` as any)}
//     >
//       <Image
//         source={{ uri: item.cover_image || 'https://via.placeholder.com/100x150' }}
//         style={styles.coverImage}
//         resizeMode="cover"
//       />
//       <View style={styles.titleInfo}>
//         <Text style={styles.titleName} numberOfLines={2}>
//           {item.name}
//         </Text>
//         {/*{item.author && (
//           <Text style={styles.titleAuthor} numberOfLines={1}>
//             by {item.author}
//           </Text>
//         )}
//         {item.description && (
//           <Text style={styles.titleDescription} numberOfLines={3}>
//             {item.description}
//           </Text>
//         )} */}
//       </View>
//       <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
//     </TouchableOpacity>
//   );

//   if (loading) {
//     return (
//       <View style={styles.centerContainer}>
//         <ActivityIndicator size="large" color="#007AFF" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Your Library</Text>
//         <Text style={styles.headerSubtitle}>
//           Welcome back, {user?.name || 'Reader'}!
//         </Text>
//       </View>

//       <View style={styles.searchContainer}>
//         <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search books..."
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//         />
//       </View>

//       <FlatList
//         data={filteredTitles}
//         renderItem={renderTitleItem}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={styles.listContainer}
//         showsVerticalScrollIndicator={false}
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Ionicons name="book-outline" size={64} color="#C7C7CC" />
//             <Text style={styles.emptyText}>No books found</Text>
//             <Text style={styles.emptySubtext}>
//               {searchQuery ? 'Try a different search term' : 'Books will appear here once added'}
//             </Text>
//           </View>
//         }
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   centerContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   header: {
//     paddingTop: 60,
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//     backgroundColor: 'white',
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   headerSubtitle: {
//     fontSize: 16,
//     color: '#666',
//     marginTop: 5,
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     marginHorizontal: 20,
//     marginVertical: 15,
//     paddingHorizontal: 15,
//     borderRadius: 10,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   searchIcon: {
//     marginRight: 10,
//   },
//   searchInput: {
//     flex: 1,
//     paddingVertical: 12,
//     fontSize: 16,
//   },
//   listContainer: {
//     paddingHorizontal: 20,
//   },
//   titleCard: {
//     flexDirection: 'row',
//     backgroundColor: 'white',
//     padding: 15,
//     marginBottom: 15,
//     borderRadius: 12,
//     alignItems: 'center',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   coverImage: {
//     width: 100,
//     height: 150,
//     borderRadius: 6,
//     marginRight: 15,
//   },
//   titleInfo: {
//     flex: 1,
//   },
//   titleName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 4,
//   },
//   titleAuthor: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 6,
//   },
//   titleDescription: {
//     fontSize: 13,
//     color: '#888',
//     lineHeight: 18,
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 60,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#666',
//     marginTop: 15,
//   },
//   emptySubtext: {
//     fontSize: 14,
//     color: '#999',
//     textAlign: 'center',
//     marginTop: 5,
//     paddingHorizontal: 40,
//   },
// });