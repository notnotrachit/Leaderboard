import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { User } from '../services/types';
import { theme } from '../constants/theme';

interface Props {
  user: User;
  isHighlight?: boolean;
}

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1: return theme.colors.gold;
    case 2: return theme.colors.silver;
    case 3: return theme.colors.bronze;
    default: return theme.colors.textSecondary;
  }
};

const getAvatarColor = (rank: number) => {
  if (rank <= 3) return getRankColor(rank);
  // Generate consistent pseudo-random color for others
  const hue = (rank * 137.508) % 360;
  return `hsl(${hue}, 60%, 65%)`;
};

export const LeaderboardItem = memo(({ user, isHighlight }: Props) => {
  const isTop3 = user.rank <= 3;
  const rankColor = getRankColor(user.rank);

  return (
    <View style={[styles.container, isHighlight && styles.highlight]}>
      {/* Rank Badge */}
      <View style={styles.rankContainer}>
        {isTop3 ? (
          <Text style={[styles.rankEmoji]}>{user.rank === 1 ? '👑' : user.rank === 2 ? '🥈' : '🥉'}</Text>
        ) : (
          <Text style={styles.rankText}>#{user.rank}</Text>
        )}
      </View>

      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: getAvatarColor(user.rank) }]}>
        <Text style={styles.avatarText}>
          {user.username.slice(0, 2).toUpperCase()}
        </Text>
      </View>

      {/* User Info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.username, isTop3 && styles.topUsername]} numberOfLines={1}>
          {user.username}
        </Text>
        <Text style={styles.subtitle}>Rank {user.rank}</Text>
      </View>

      {/* Rating */}
      <View style={styles.ratingContainer}>
        <Text style={[styles.rating, { color: isTop3 ? rankColor : theme.colors.primary }]}>
          {user.rating}
        </Text>
        <Text style={styles.ratingLabel}>MMR</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.m,
    marginHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.s,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.l,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  highlight: {
    borderColor: theme.colors.primary,
    backgroundColor: '#312e81', // Dark Indigo
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  rankEmoji: {
    fontSize: 20,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.m,
  },
  avatarText: {
    color: '#1e293b', // Dark text on bright avatars
    fontWeight: '800',
    fontSize: 16,
  },
  infoContainer: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  topUsername: {
    fontWeight: '800',
    fontSize: 17,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  rating: {
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  ratingLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
});
