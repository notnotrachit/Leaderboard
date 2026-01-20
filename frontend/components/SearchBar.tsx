import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator, Text, FlatList, TouchableOpacity } from 'react-native';
import { useUserSearch } from '../hooks/useLeaderboard';
import { LeaderboardItem } from './LeaderboardItem';
import { theme } from '../constants/theme';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const { data: users, isLoading, isError } = useUserSearch(debouncedQuery);

  return (
    <View style={styles.container}>
      <View style={[
        styles.searchBox,
        isFocused && styles.searchBoxFocused
      ]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search username..."
          placeholderTextColor={theme.colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setDebouncedQuery(''); }}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {debouncedQuery.length >= 2 && (
        <View style={styles.resultWrapper}>
          <View style={styles.resultContainer}>
            {isLoading ? (
              <ActivityIndicator color={theme.colors.primary} style={{ padding: 20 }} />
            ) : isError ? (
              <Text style={styles.errorText}>Error searching users</Text>
            ) : users && users.length > 0 ? (
              <>
                <View style={styles.headerRow}>
                  <Text style={styles.resultLabel}>Found {users.length} results</Text>
                </View>
                <View style={{ maxHeight: 400 }}>
                  <FlatList
                    data={users}
                    keyExtractor={(item) => item.username}
                    renderItem={({ item }) => <LeaderboardItem user={item} isHighlight />}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: 8 }}
                  />
                </View>
              </>
            ) : (
              <Text style={styles.errorText}>No users found matching "{debouncedQuery}"</Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.background,
    zIndex: 100,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.m,
    height: 50,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  searchBoxFocused: {
    borderColor: theme.colors.primary,
    ...theme.shadows.glow,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: theme.spacing.s,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textPrimary,
    height: '100%',
  },
  clearIcon: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    padding: 4,
  },
  resultWrapper: {
    position: 'absolute',
    top: 70, // Height of search box + padding
    left: theme.spacing.m,
    right: theme.spacing.m,
    zIndex: 1000,
  },
  resultContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.l,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    ...theme.shadows.card,
    elevation: 10,
  },
  headerRow: {
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: 'rgba(99, 102, 241, 0.1)', // Tinted background
  },
  resultLabel: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  errorText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
});
