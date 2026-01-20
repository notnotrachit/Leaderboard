import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  const hue = (rank * 137.508) % 360;
  return `hsl(${hue}, 60%, 65%)`;
};

export const LeaderboardItem = memo(({ user, isHighlight }: Props) => {
  const isTop3 = user.rank <= 3;
  const rankColor = getRankColor(user.rank);

  // Gradient colors based on rank/highlight
  const gradientColors = isHighlight
    ? ['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.05)'] // Active Green
    : isTop3
      ? ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)'] // Subtle Gold/Silver hint
      : [theme.colors.card, theme.colors.card]; // Flat for others

  return (
    <LinearGradient
      colors={gradientColors as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.container, isHighlight && styles.highlightBorder]}
    >
      {/* Rank Badge - Left Aligned */}
      <View style={styles.rankContainer}>
        {isTop3 ? (
          <Text style={styles.rankEmoji}>{user.rank === 1 ? '👑' : user.rank === 2 ? '🥈' : '🥉'}</Text>
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

      {/* User Info - Centered Vertical */}
      <View style={styles.infoContainer}>
        <Text style={[styles.username, isTop3 && styles.topUsername]} numberOfLines={1}>
          {user.username}
        </Text>
        {/* Removed redundant "Rank X" subtitle */}
      </View>

      {/* Rating - Right Aligned */}
      <View style={styles.ratingContainer}>
        <Text style={[styles.rating, { color: isTop3 ? rankColor : theme.colors.primary }]}>
          {user.rating}
        </Text>
        <Text style={styles.ratingLabel}>PTS</Text>
      </View>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)', // Subtle border
    ...theme.shadows.card,
  },
  highlightBorder: {
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8, // Reduced gap
  },
  rankText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  rankEmoji: {
    fontSize: 22,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16, // Consistent spacing to name
  },
  avatarText: {
    color: '#1e293b',
    fontWeight: '800',
    fontSize: 14,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    letterSpacing: 0.2,
  },
  topUsername: {
    fontWeight: '700',
    fontSize: 17,
    color: '#fff', // Brighter for top players
  },
  ratingContainer: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  rating: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  ratingLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '700',
    marginTop: 2,
  },
});
