import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { theme } from '../constants/theme';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.background, // Match dark background
            },
            headerTintColor: theme.colors.textPrimary,
            headerTitleStyle: {
              fontWeight: '800',
              fontSize: 24,
            },
            headerShadowVisible: false, // Remove default header shadow for seamless look
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Leaderboard' }} />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
