import React from 'react';
import { View, StyleSheet } from 'react-native';

let LinearGradient = null;
try {
  const ExpoLinearGradient = require('expo-linear-gradient');
  LinearGradient = ExpoLinearGradient.LinearGradient;
} catch (e) {
  LinearGradient = null;
}

/**
 * Returns a 3-stop dynamic atmospheric sky gradient based on WMO weather code & day/night
 * Tuned for professional Google Pixel Weather aesthetic with high contrast & legibility
 */
export const getWeatherGradient = (weatherCode, isDarkMode) => {
  if (isDarkMode) {
    if (weatherCode === 0 || weatherCode === 1) {
      // Clear sky at night: deep cosmic indigo & starry navy
      return ['#030712', '#0b1329', '#152243'];
    }
    if (weatherCode === 2 || weatherCode === 3) {
      // Overcast / Cloudy night: moody atmospheric slate
      return ['#050811', '#0f1728', '#1a2638'];
    }
    if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
      // Rainy night: oceanic midnight rain
      return ['#040a14', '#0c1a2d', '#14273d'];
    }
    if (weatherCode >= 95) {
      // Thunderstorm: moody electric violet
      return ['#0a0614', '#170f29', '#26183e'];
    }
    if (weatherCode >= 71 && weatherCode <= 77) {
      // Snow: glacial dusk blue
      return ['#060c18', '#0f1a2d', '#182b45'];
    }
    if (weatherCode === 45 || weatherCode === 48) {
      // Fog: mystical mist grey-navy
      return ['#080b10', '#111721', '#1c2432'];
    }
    // Default dark
    return ['#030712', '#0c1428', '#16223e'];
  } else {
    // Day time: luminous, fresh atmospheric daylight gradients
    if (weatherCode === 0 || weatherCode === 1) {
      // Sunny clear sky: radiant Google Sky Azure
      return ['#3b82f6', '#60a5fa', '#dbeafe'];
    }
    if (weatherCode === 2 || weatherCode === 3) {
      // Partly cloudy / Overcast: soft day cumulus
      return ['#5c7694', '#85a2c2', '#dbeafe'];
    }
    if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
      // Rain / Drizzle: fresh daylight slate rain
      return ['#4f6d8d', '#7b9cb8', '#d3e4f5'];
    }
    if (weatherCode >= 95) {
      // Thunderstorm: electric daylight indigo
      return ['#4f46e5', '#818cf8', '#e0e7ff'];
    }
    if (weatherCode >= 71 && weatherCode <= 77) {
      // Snow: crisp winter crystalline cyan
      return ['#0284c7', '#38bdf8', '#e0f2fe'];
    }
    if (weatherCode === 45 || weatherCode === 48) {
      // Fog: soft daylight silver mist
      return ['#64748b', '#94a3b8', '#e2e8f0'];
    }
    // Default day
    return ['#2563eb', '#60a5fa', '#dbeafe'];
  }
};

export const WeatherGradientBackground = ({
  children,
  weatherCode,
  isDarkMode = false,
  style,
}) => {
  const colors = getWeatherGradient(weatherCode, isDarkMode);

  if (LinearGradient) {
    return (
      <LinearGradient
        colors={colors}
        start={{ x: 0.1, y: 0.0 }}
        end={{ x: 0.9, y: 1.0 }}
        style={[styles.container, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  // Graceful fallback
  return (
    <View style={[styles.container, { backgroundColor: colors[0] }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
