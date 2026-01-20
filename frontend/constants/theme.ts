export const theme = {
  colors: {
    background: '#020617', // Very dark slate/black
    card: '#0F172A',       // Dark slate
    primary: '#10B981',    // Emerald 500 (Main Green)
    primaryDark: '#059669', // Emerald 600
    accent: '#34D399',     // Emerald 400 (Glows)

    textPrimary: '#F1F5F9', // Slate 100
    textSecondary: '#94A3B8', // Slate 400
    textMuted: '#64748B',    // Slate 500

    border: '#1E293B',     // Slate 800

    gold: '#FBBF24',       // Amber 400
    silver: '#E2E8F0',     // Slate 200
    bronze: '#B45309',     // Amber 700

    success: '#10B981',
    error: '#EF4444',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
  },
  borderRadius: {
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
  },
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    glow: {
      shadowColor: '#10B981', // Green Glow
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 6,
    },
  },
};
