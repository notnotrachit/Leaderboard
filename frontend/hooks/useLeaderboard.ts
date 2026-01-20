import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { useInfiniteQuery, useQuery, focusManager } from '@tanstack/react-query';
import { leaderboardApi } from '../services/api';

// Hook to sync React Query with App State (Foreground/Background)
function useAppState() {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => {
      focusManager.setFocused(status === 'active');
    });

    return () => subscription.remove();
  }, []);
}

export function useLeaderboard() {
  useAppState(); // Activate app state listener

  return useInfiniteQuery({
    queryKey: ['leaderboard'],
    queryFn: ({ pageParam = 0 }) => leaderboardApi.getLeaderboard(50, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.has_more
        ? lastPage.pagination.offset + lastPage.pagination.limit
        : undefined,
    // Poll every 5s, but only if screen is focused (smart polling)
    refetchInterval: 5000,
    refetchIntervalInBackground: false, // PAUSE polling when app is in background to save battery
  });
}

export function useUserRank(username: string) {
  return useQuery({
    queryKey: ['user', username],
    queryFn: () => leaderboardApi.getUserRank(username),
    enabled: username.length >= 2,
    retry: false,
  });
}

export function useUserSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => leaderboardApi.searchUsers(query),
    enabled: query.length >= 2,
    retry: false,
    staleTime: 1000 * 60, // Cache search results for 1 minute
  });
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: leaderboardApi.getStats,
    refetchInterval: 10000, // Slower poll for stats
    refetchIntervalInBackground: false,
  });
}
