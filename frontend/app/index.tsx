import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { LeaderboardList } from '../components/LeaderboardList';
import { SearchBar } from '../components/SearchBar';
import { useUserSearch } from '../hooks/useLeaderboard';
import { theme } from '../constants/theme';

export default function LeaderboardScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch search results only if query is long enough
  const isSearching = searchQuery.length >= 2;
  const { data: searchResults, isLoading: isSearchLoading } = useUserSearch(isSearching ? searchQuery : '');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.contentWrapper}>
        <SearchBar onSearch={setSearchQuery} />
        <LeaderboardList
          searchResults={searchResults}
          isSearching={isSearching}
          isLoadingSearch={isSearchLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center', // Center content for wide screens
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 800, // Limit width on large screens
    backgroundColor: theme.colors.background,
    ...(Platform.OS === 'web' && {
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: theme.colors.border,
    }),
  },
});
