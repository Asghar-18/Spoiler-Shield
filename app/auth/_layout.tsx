import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Prevent going back to auth pages once authenticated
        gestureEnabled: false,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          title: 'Authentication',
        }}
      />
    </Stack>
  );
}