// import React, { useEffect } from 'react';
// import { 
//   StyleSheet, 
//   View, 
//   Text, 
//   ScrollView, 
//   RefreshControl,
//   TouchableOpacity,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { PlusCircle } from 'lucide-react-native';
// import { useMediaStore } from '@/store/media-store';
// import MediaCard from '@/components/MediaCard';
// import Button from '@/components/Button';
// import colors from '@/constants/colors';
// import typography from '@/constants/typography';
// import layout from '@/constants/layout';

// export default function LibraryScreen() {
//   const router = useRouter();
//   const { media, userProgress, fetchMedia, isLoading } = useMediaStore();
//   const [refreshing, setRefreshing] = React.useState(false);

//   useEffect(() => {
//     fetchMedia();
//   }, []);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchMedia();
//     setRefreshing(false);
//   };

//   // Filter media that has progress
//   const mediaWithProgress = media.filter(item => 
//     userProgress.some(progress => progress.mediaId === item.id)
//   );

//   // Sort by last updated
//   const sortedMedia = [...mediaWithProgress].sort((a, b) => {
//     const progressA = userProgress.find(p => p.mediaId === a.id);
//     const progressB = userProgress.find(p => p.mediaId === b.id);
    
//     if (!progressA || !progressB) return 0;
    
//     return new Date(progressB.lastUpdated).getTime() - 
//            new Date(progressA.lastUpdated).getTime();
//   });

//   const getProgress = (mediaId: string) => {
//     const progress = userProgress.find(p => p.mediaId === mediaId);
//     return progress ? progress.progress : 0;
//   };

//   const getCurrentChapter = (mediaId: string) => {
//     const progress = userProgress.find(p => p.mediaId === mediaId);
//     return progress ? progress.currentChapter : 0;
//   };

//   const navigateToHome = () => {
//     router.push('/(tabs)');
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>My Library</Text>
//         <Text style={styles.subtitle}>Track your progress</Text>
//       </View>
      
//       <ScrollView
//         style={styles.scrollView}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={[colors.primary]}
//             tintColor={colors.primary}
//           />
//         }
//       >
//         {isLoading && !refreshing ? (
//           <Text style={styles.loadingText}>Loading...</Text>
//         ) : sortedMedia.length === 0 ? (
//           <View style={styles.emptyContainer}>
//             <Text style={styles.emptyText}>Your library is empty</Text>
//             <Text style={styles.emptySubtext}>
//               Start tracking your progress by adding books, shows, or games
//             </Text>
//             <Button
//               title="Browse Titles"
//               onPress={navigateToHome}
//               style={styles.browseButton}
//               icon={<PlusCircle size={20} color="white" />}
//             />
//           </View>
//         ) : (
//           <View style={styles.mediaList}>
//             {sortedMedia.map((item) => (
//               <MediaCard
//                 key={item.id}
//                 id={item.id}
//                 title={item.title}
//                 type={item.type}
//                 coverImage={item.coverImage}
//                 progress={getProgress(item.id)}
//                 totalChapters={item.totalChapters}
//                 currentChapter={getCurrentChapter(item.id)}
//               />
//             ))}
//           </View>
//         )}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//     padding: layout.spacing.lg,
//   },
//   header: {
//     marginBottom: layout.spacing.lg,
//   },
//   title: {
//     ...typography.h1,
//   },
//   subtitle: {
//     ...typography.bodySmall,
//     color: colors.textSecondary,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   mediaList: {
//     paddingBottom: layout.spacing.xl,
//   },
//   loadingText: {
//     ...typography.body,
//     textAlign: 'center',
//     marginTop: layout.spacing.xl,
//     color: colors.textSecondary,
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: layout.spacing.xxl,
//     padding: layout.spacing.lg,
//   },
//   emptyText: {
//     ...typography.h3,
//     marginBottom: layout.spacing.sm,
//   },
//   emptySubtext: {
//     ...typography.body,
//     color: colors.textSecondary,
//     textAlign: 'center',
//     marginBottom: layout.spacing.xl,
//   },
//   browseButton: {
//     marginTop: layout.spacing.md,
//   },
// });