export const getTheme = (isDarkMode) => ({
  // Core backgrounds
  bg: isDarkMode ? '#030712' : '#f0f4f9',
  cardBg: isDarkMode ? 'rgba(20, 27, 45, 0.72)' : 'rgba(255, 255, 255, 0.85)',
  cardBgSolid: isDarkMode ? '#131b2e' : '#ffffff',

  // Google Glassmorphism translucent surfaces
  glassBg: isDarkMode ? 'rgba(15, 23, 42, 0.68)' : 'rgba(255, 255, 255, 0.75)',
  glassBgElevated: isDarkMode ? 'rgba(24, 34, 54, 0.82)' : 'rgba(255, 255, 255, 0.90)',
  glassBgSubtle: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.72)',

  // Specular borders
  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.90)',
  borderLight: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',

  // Inputs & controls
  inputBg: isDarkMode ? 'rgba(255, 255, 255, 0.10)' : 'rgba(255, 255, 255, 0.88)',
  pillBg: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.80)',
  pillActiveBg: '#1a73e8', // Google Blue

  // High-contrast Typography
  textPrimary: isDarkMode ? '#f8fafc' : '#0f172a',
  textSecondary: isDarkMode ? 'rgba(255, 255, 255, 0.75)' : '#475569',
  textMuted: isDarkMode ? 'rgba(255, 255, 255, 0.50)' : '#64748b',
  textHeader: isDarkMode ? '#ffffff' : '#0f172a',

  // Google Material You accents
  accentBlue: isDarkMode ? '#38bdf8' : '#1a73e8',
  accentGreen: isDarkMode ? '#81c995' : '#1e8e3e',
  accentAmber: isDarkMode ? '#fdd663' : '#d97706',
  accentRed: isDarkMode ? '#f28b82' : '#dc2626',
  accentPurple: isDarkMode ? '#c58af9' : '#9334e6',
  accentCyan: isDarkMode ? '#78d9ec' : '#0284c7',
});

export const CHART_CONFIG = (isDarkMode, cardBg) => ({
  backgroundColor: cardBg || (isDarkMode ? 'rgba(18, 25, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)'),
  backgroundGradientFrom: cardBg || (isDarkMode ? 'rgba(18, 25, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)'),
  backgroundGradientTo: cardBg || (isDarkMode ? 'rgba(18, 25, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)'),
  decimalPlaces: 1,
  color: (opacity = 1) => (isDarkMode ? `rgba(248, 250, 252, ${opacity})` : `rgba(15, 23, 42, ${opacity})`),
  labelColor: (opacity = 1) => (isDarkMode ? `rgba(255, 255, 255, ${opacity * 0.7})` : `rgba(71, 85, 105, ${opacity})`),
  propsForDots: { r: '4', strokeWidth: '1.5', stroke: '#1a73e8' },
});
