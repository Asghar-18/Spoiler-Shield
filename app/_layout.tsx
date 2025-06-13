import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, router, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/auth-store';

export default function RootLayout() {
  const { user, isLoading, isInitialized, initialize } = useAuthStore();
  const segments = useSegments();

  useEffect(() => {
    // Initialize auth store
    initialize();
  }, []);

  useEffect(() => {
    // Only handle navigation after auth is initialized
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === 'auth' as any;

    if (user && inAuthGroup) {
      // User is authenticated and on auth pages, redirect to home
      router.replace('/');
    } else if (!user && !inAuthGroup) {
      // User is not authenticated and not on auth pages, redirect to auth
      router.replace('/auth' as any);
    }
  }, [user, segments, isInitialized]);

  // Show loading screen while initializing authentication
  if (!isInitialized || isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false, // Hide headers globally, you can override per screen
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen 
          name="book/[id]" 
          options={{
            headerShown: true,
            headerTitle: 'Book Details',
            headerBackTitle: 'Back',            
          }}
        />
        <Stack.Screen 
          name="book/[id]/ask-question" 
          options={{
            headerShown: true,
            headerTitle: 'Ask a Question',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen 
          name="book/[id]/set-progress" 
          options={{
            headerShown: true,
            headerTitle: 'Set Progress',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});