import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, router, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { authService } from '../services';

export default function RootLayout() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();

  useEffect(() => {
    // Check initial authentication state
    checkInitialAuth();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      
      // Handle navigation based on auth state
      if (session?.user) {
        // User is signed in, redirect to home if they're on auth page
        if (segments[0] === 'auth' as any) {
          router.replace('/');
        }
      } else {
        // User is signed out, redirect to auth if they're not already there
        if (segments[0] !== 'auth' as any) {
          router.replace('/auth' as any);
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [segments]);

  const checkInitialAuth = async () => {
    try {
      const { user: currentUser, error } = await authService.getCurrentUser();
      
      if (error) {
        console.error('Error checking auth:', error);
        setUser(null);
      } else {
        setUser(currentUser);
      }

      // Navigate based on initial auth state
      if (currentUser) {
        // User is authenticated, ensure they're not on auth page
        if (segments[0] === 'auth' as any) {
          router.replace('/');
        }
      } else {
        // User is not authenticated, redirect to auth
        if (segments[0] !== 'auth' as any) {
          router.replace('/auth' as any);
        }
      }
    } catch (error) {
      console.error('Error in checkInitialAuth:', error);
      setUser(null);
      router.replace('/auth' as any);
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while checking authentication
  if (loading) {
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
        <Stack.Screen name="(auth)" />
        <Stack.Screen 
          name="book/[id]" 
          options={{
            headerShown: true,
            headerTitle: 'Book Details',
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