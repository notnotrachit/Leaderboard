import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { leaderboardApi } from '../services/api';

export function useLeaderboard() {
  return useInfiniteQuery({
    queryKey: ['leaderboard'],
    queryFn: ({ pageParam = 0 }) => leaderboardApi.getLeaderboard(50, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.has_more
        ? lastPage.pagination.offset + lastPage.pagination.limit
        : undefined,
    refetchInterval: 3000, // Poll every 3 seconds for live feel
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

// New hook for fuzzy search
export function useUserSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => leaderboardApi.searchUsers(query),
    enabled: query.length >= 2,
    retry: false,
  });
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: leaderboardApi.getStats,
    refetchInterval: 5000,
  });
}
