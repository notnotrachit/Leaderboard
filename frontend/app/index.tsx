import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { LeaderboardList } from '../components/LeaderboardList';
import { SearchBar } from '../components/SearchBar';
import { leaderboardApi } from '../services/api';

export default function LeaderboardScreen() {
  // Optional: Auto-seed if empty on mount (for demo purposes)
  // In a real app, this would be admin controlled
  useEffect(() => {
    // Check stats and seed if empty?
    // For now we assume backend is running and seeded.
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SearchBar />
      <LeaderboardList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
