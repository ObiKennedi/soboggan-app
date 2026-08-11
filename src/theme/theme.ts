export const colors = {
  navy: '#0F1F3D',
  navyDark: '#0A1530',
  navyLight: '#1E3A66',
  gold: '#C9A227',
  goldLight: '#E0C158',
  gray: '#9CA3AF',
  white: '#FFFFFF',
  offWhite: '#F7F8FA',
  black: '#111417',

  success: '#1E9E5A',
  danger: '#D14343',
  warning: '#D19A2B',

  textPrimary: '#111417',
  textSecondary: '#5B6472',
  border: '#E4E7EC',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: colors.navy },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.navy },
  h3: { fontSize: 18, fontWeight: '600' as const, color: colors.navy },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.textPrimary },
  bodyMuted: { fontSize: 14, fontWeight: '400' as const, color: colors.textSecondary },
  caption: { fontSize: 12, fontWeight: '500' as const, color: colors.textSecondary },
  amount: { fontSize: 32, fontWeight: '700' as const, color: colors.navy },
};

export const theme = { colors, spacing, radii, typography };
export type Theme = typeof theme;
