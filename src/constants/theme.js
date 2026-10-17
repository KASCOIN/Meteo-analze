export const getTheme = (isDarkMode) => ({
  bg: isDarkMode ? '#121212' : '#f8f9fa',
  cardBg: isDarkMode ? '#1e1e1e' : '#ffffff',
  textPrimary: isDarkMode ? '#f8f9fa' : '#212529',
  textSecondary: isDarkMode ? '#a0a0a0' : '#6c757d',
  borderColor: isDarkMode ? '#2c2c2c' : '#e9ecef',
  inputBg: isDarkMode ? '#2a2a2a' : '#ffffff',
});

export const CHART_CONFIG = (isDarkMode, cardBg) => ({
  backgroundColor: cardBg,
  backgroundGradientFrom: cardBg,
  backgroundGradientTo: cardBg,
  decimalPlaces: 1,
  color: (opacity = 1) => (isDarkMode ? `rgba(248, 249, 250, ${opacity})` : `rgba(33, 37, 41, ${opacity})`),
  labelColor: (opacity = 1) => (isDarkMode ? `rgba(160, 160, 160, ${opacity})` : `rgba(108, 117, 125, ${opacity})`),
  propsForDots: { r: '3', strokeWidth: '1' },
});
