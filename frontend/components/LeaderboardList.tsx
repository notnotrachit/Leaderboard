import React, { useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { LeaderboardItem } from './LeaderboardItem';
import { User } from '../services/types';
import { theme } from '../constants/theme';

interface Props {
  searchResults?: User[]; // Optional search results
  isSearching?: boolean;  // Are we in search mode?
  isLoadingSearch?: boolean; // Is the search query loading?
}

export function LeaderboardList({ searchResults, isSearching, isLoadingSearch }: Props) {
  const {
    data,
    isLoading: isLoadingLeaderboard,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useLeaderboard();

  // Use search results if searching, otherwise use leaderboard data
  const users = isSearching
    ? (searchResults ?? [])
    : (data?.pages.flatMap((page) => page.users) ?? []);

  const renderItem = useCallback(
    ({ item }: { item: User }) => <LeaderboardItem user={item} isHighlight={isSearching} />,
    [isSearching]
  );

  const handleEndReached = () => {
    if (!isSearching && hasNextPage) {
      fetchNextPage();
    }
  };

  // Show loader while search is fetching
  if (isSearching && isLoadingSearch) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isLoadingLeaderboard && !isSearching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isError && !isSearching) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load leaderboard</Text>
      </View>
    );
  }

  if (isSearching && users.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No users found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={users}
        renderItem={renderItem}
        estimatedItemSize={72}
        keyExtractor={(item) => item.username}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          isFetchingNextPage && !isSearching ? (
            <ActivityIndicator style={{ margin: 20 }} color={theme.colors.primary} />
          ) : <View style={{ height: 20 }} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontStyle: 'italic',
  },
  listContent: {
    paddingTop: theme.spacing.s,
    paddingBottom: theme.spacing.xl,
  },
});
