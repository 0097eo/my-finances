import { Stack } from "expo-router";
import { useAuth } from "@/components/AuthContext";
import { Redirect } from 'expo-router'



export default function AuthLayout() {
    const { user, isLoading } = useAuth();
  
    // If user is authenticated, redirect to main app
    if (!isLoading && user) {
      return <Redirect href="/(tabs)" />;
    }
  
    return (
      <Stack screenOptions={{
        headerShown: false,
        // Prevent going back to auth screens if already logged in
        gestureEnabled: false
      }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
    );
  }