import React, { useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { LeaderboardItem } from './LeaderboardItem';
import { User } from '../services/types';
import { theme } from '../constants/theme';

export function LeaderboardList() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useLeaderboard();

  const users = data?.pages.flatMap((page) => page.users) ?? [];

  const renderItem = useCallback(
    ({ item }: { item: User }) => <LeaderboardItem user={item} />,
    []
  );

  const handleEndReached = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load leaderboard</Text>
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
          isFetchingNextPage ? (
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
  listContent: {
    paddingTop: theme.spacing.s,
    paddingBottom: theme.spacing.xl,
  },
});
