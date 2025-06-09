// // app/(tabs)/profile.tsx
// import { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ScrollView,
// } from 'react-native';
// import { router } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { useAuthStore } from '../../store/authStore';
// import { supabase } from '../../lib/supabase';

// interface UserStats {
//   totalBooks: number;
//   totalChaptersRead: number;
//   averageProgress: number;
// }

// export default function ProfileScreen() {
//   const { user, signOut } = useAuthStore();
//   const [stats, setStats] = useState<UserStats>({
//     totalBooks: 0,
//     totalChaptersRead: 0,
//     averageProgress: 0,
//   });

//   useEffect(() => {
//     if (user) {
//       fetchUserStats();
//     }
//   }, [user]);

//   const fetchUserStats = async () => {
//     try {
//       // Get user progress data
//       const { data: progressData } = await supabase
//         .from('user_progress')
//         .select(`
//           max_chapter,
//           titles (
//             id,
//             name
//           )
//         `)
//         .eq('user_id', user?.id);

//       if (progressData) {
//         const totalBooks = progressData.length;
//         const totalChaptersRead = progressData.reduce((sum, progress) => sum + progress.max_chapter, 0);
//         const averageProgress = totalBooks > 0 ? Math.round(totalChaptersRead / totalBooks) : 0;

//         setStats({
//           totalBooks,
//           totalChaptersRead,
//           averageProgress,
//         });
//       }
//     } catch (error) {
//       console.error('Error fetching user stats:', error);
//     }
//   };

//   const handleSignOut = async () => {
//     Alert.alert(
//       'Sign Out',
//       'Are you sure you want to sign out?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Sign Out',
//           style: 'destructive',
//           onPress: async () => {
//             await signOut();
//             router.replace('/auth');
//           },
//         },
//       ]
//     );
//   };

//   const StatCard = ({ icon, title, value, subtitle }: {
//     icon: string;
//     title: string;
//     value: string | number;
//     subtitle?: string;
//   }) => (
//     <View style={styles.statCard}>
//       <Ionicons name={icon as any} size={24} color="#007AFF" />
//       <Text style={styles.statValue}>{value}</Text>
//       <Text style={styles.statTitle}>{title}</Text>
//       {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
//     </View>
//   );

//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.header}>
//         <View style={styles.profileInfo}>
//           <View style={styles.avatar}>
//             <Ionicons name="person" size={40} color="#007AFF" />
//           </View>
//           <Text style={styles.userName}>{user?.name || 'Reader'}</Text>
//           <Text style={styles.userEmail}>{user?.email}</Text>
//         </View>
//       </View>

//       <View style={styles.statsContainer}>
//         <Text style={styles.sectionTitle}>Reading Stats</Text>
//         <View style={styles.statsGrid}>
//           <StatCard
//             icon="library-outline"
//             title="Books Started"
//             value={stats.totalBooks}
//           />
//           <StatCard
//             icon="book-outline"
//             title="Chapters Read"
//             value={stats.totalChaptersRead}
//           />
//           <StatCard
//             icon="trending-up-outline"
//             title="Avg. Progress"
//             value={stats.averageProgress}
//             subtitle="chapters per book"
//           />
//         </View>
//       </View>

//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Settings</Text>
        
//         <TouchableOpacity style={styles.menuItem}>
//           <Ionicons name="notifications-outline" size={24} color="#666" />
//           <Text style={styles.menuText}>Notifications</Text>
//           <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.menuItem}>
//           <Ionicons name="help-circle-outline" size={24} color="#666" />
//           <Text style={styles.menuText}>Help & Support</Text>
//           <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.menuItem}>
//           <Ionicons name="information-circle-outline" size={24} color="#666" />
//           <Text style={styles.menuText}>About SpoilerShield</Text>
//           <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.section}>
//         <TouchableOpacity style={[styles.menuItem, styles.signOutButton]} onPress={handleSignOut}>
//           <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
//           <Text style={[styles.menuText, styles.signOutText]}>Sign Out</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   header: {
//     backgroundColor: 'white',
//     paddingTop: 60,
//     paddingBottom: 30,
//     alignItems: 'center',
//   },
//   profileInfo: {
//     alignItems: 'center',
//   },
//   avatar: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: '#E3F2FD',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   userName: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 5,
//   },
//   userEmail: {
//     fontSize: 16,
//     color: '#666',
//   },
//   statsContainer: {
//     backgroundColor: 'white',
//     margin: 20,
//     padding: 20,
//     borderRadius: 12,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 15,
//   },
//   statsGrid: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   statCard: {
//     flex: 1,
//     alignItems: 'center',
//     padding: 15,
//   },
//   statValue: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//     marginTop: 8,
//   },
//   statTitle: {
//     fontSize: 12,
//     color: '#666',
//     textAlign: 'center',
//     marginTop: 4,
//   },
//   statSubtitle: {
//     fontSize: 10,
//     color: '#999',
//     textAlign: 'center',
//     marginTop: 2,
//   },
//   section: {
//     backgroundColor: 'white',
//     marginHorizontal: 20,
//     marginBottom: 20,
//     borderRadius: 12,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   menuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 20,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//     borderBottomColor: '#E5E5EA',
//   },
//   menuText: {
//     flex: 1,
//     fontSize: 16,
//     color: '#333',
//     marginLeft: 15,
//   },
//   signOutButton: {
//     borderBottomWidth: 0,
//   },
//   signOutText: {
//     color: '#FF3B30',
//   },
// });