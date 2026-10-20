export const getTheme = (isDarkMode) => ({
  // Core backgrounds
  bg: isDarkMode ? '#0b1120' : '#f0f4f9',
  cardBg: isDarkMode ? 'rgba(20, 27, 45, 0.72)' : 'rgba(255, 255, 255, 0.82)',
  cardBgSolid: isDarkMode ? '#131b2e' : '#ffffff',
  
  // Google Glassmorphism translucent surfaces
  glassBg: isDarkMode ? 'rgba(18, 25, 42, 0.65)' : 'rgba(255, 255, 255, 0.72)',
  glassBgElevated: isDarkMode ? 'rgba(28, 38, 58, 0.82)' : 'rgba(255, 255, 255, 0.88)',
  glassBgSubtle: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.55)',
  
  // Specular borders
  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.65)',
  borderLight: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  
  // Inputs & controls
  inputBg: isDarkMode ? 'rgba(255, 255, 255, 0.10)' : 'rgba(255, 255, 255, 0.75)',
  pillBg: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.60)',
  pillActiveBg: '#1a73e8', // Google Blue
  
  // Typography
  textPrimary: isDarkMode ? '#f8fafc' : '#0f172a',
  textSecondary: isDarkMode ? 'rgba(255, 255, 255, 0.72)' : '#475569',
  textMuted: isDarkMode ? 'rgba(255, 255, 255, 0.45)' : '#94a3b8',
  textHeader: '#ffffff', // High-contrast for header over atmospheric sky

  // Google Material You accent accents
  accentBlue: isDarkMode ? '#8ab4f8' : '#1a73e8',
  accentGreen: isDarkMode ? '#81c995' : '#1e8e3e',
  accentAmber: isDarkMode ? '#fdd663' : '#f9ab00',
  accentRed: isDarkMode ? '#f28b82' : '#d93025',
  accentPurple: isDarkMode ? '#c58af9' : '#9334e6',
  accentCyan: isDarkMode ? '#78d9ec' : '#12b5cb',
});

export const CHART_CONFIG = (isDarkMode, cardBg) => ({
  backgroundColor: cardBg || (isDarkMode ? 'rgba(18, 25, 42, 0.7)' : 'rgba(255, 255, 255, 0.8)'),
  backgroundGradientFrom: cardBg || (isDarkMode ? 'rgba(18, 25, 42, 0.7)' : 'rgba(255, 255, 255, 0.8)'),
  backgroundGradientTo: cardBg || (isDarkMode ? 'rgba(18, 25, 42, 0.7)' : 'rgba(255, 255, 255, 0.8)'),
  decimalPlaces: 1,
  color: (opacity = 1) => (isDarkMode ? `rgba(248, 250, 252, ${opacity})` : `rgba(15, 23, 42, ${opacity})`),
  labelColor: (opacity = 1) => (isDarkMode ? `rgba(255, 255, 255, ${opacity * 0.7})` : `rgba(71, 85, 105, ${opacity})`),
  propsForDots: { r: '4', strokeWidth: '1.5', stroke: '#1a73e8' },
});
