// import React from 'react';
// import { Tabs } from 'expo-router';
// // import { Home, BookOpen, Settings } from 'lucide-react-native';
// import { Ionicons } from '@expo/vector-icons';
// import colors from '@/constants/colors';

// export default function TabLayout() {
//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: colors.primary,
//         tabBarInactiveTintColor: colors.textSecondary,
//         tabBarStyle: {
//           backgroundColor: colors.card,
//           borderTopColor: colors.border,
//         },
//         tabBarLabelStyle: {
//           fontSize: 12,
//           fontWeight: '500',
//         },
//         headerStyle: {
//           backgroundColor: colors.background,
//         },
//         headerShadowVisible: false,
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: 'Home',
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="shield" size={size} color="#fff" />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="library"
//         options={{
//           title: 'Library',
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="book" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="settings"
//         options={{
//           title: 'Settings',
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="settings" size={size} color={color} />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }