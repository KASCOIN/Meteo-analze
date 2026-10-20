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
 */
export const getWeatherGradient = (weatherCode, isDarkMode) => {
  if (isDarkMode) {
    if (weatherCode === 0 || weatherCode === 1) {
      // Clear sky at night: deep cosmic indigo & starry navy
      return ['#080e1c', '#0f172a', '#1e293b'];
    }
    if (weatherCode === 2 || weatherCode === 3) {
      // Overcast / Cloudy night: moody atmospheric slate
      return ['#090d16', '#121824', '#1e2838'];
    }
    if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
      // Rainy night: oceanic midnight rain
      return ['#070f1a', '#0d1d2d', '#152b3e'];
    }
    if (weatherCode >= 95) {
      // Thunderstorm: moody electric violet
      return ['#110c1c', '#1b142d', '#2c1e45'];
    }
    if (weatherCode >= 71 && weatherCode <= 77) {
      // Snow: glacial dusk blue
      return ['#0c1422', '#142136', '#1e324e'];
    }
    if (weatherCode === 45 || weatherCode === 48) {
      // Fog: mystical mist grey-navy
      return ['#0d1117', '#161c24', '#212936'];
    }
    // Default dark
    return ['#080e1c', '#0f172a', '#1a2744'];
  } else {
    // Day time
    if (weatherCode === 0 || weatherCode === 1) {
      // Sunny clear sky: Google vibrant azure
      return ['#1a73e8', '#4285f4', '#8ab4f8'];
    }
    if (weatherCode === 2 || weatherCode === 3) {
      // Partly cloudy / Overcast: soft atmospheric cumulus blue
      return ['#2d5b88', '#507eab', '#8db3d6'];
    }
    if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
      // Rain: deep oceanic rain cloud
      return ['#274765', '#3d6487', '#648dae'];
    }
    if (weatherCode >= 95) {
      // Thunderstorm: dramatic deep indigo
      return ['#262243', '#40386b', '#625899'];
    }
    if (weatherCode >= 71 && weatherCode <= 77) {
      // Snow: crisp winter crystalline cyan
      return ['#456d8e', '#6d95b8', '#a8c7e2'];
    }
    if (weatherCode === 45 || weatherCode === 48) {
      // Fog: soft silver mist
      return ['#425363', '#627587', '#93a5b5'];
    }
    // Default day
    return ['#1967d2', '#3f83f8', '#76a9fa'];
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

  // Graceful fallback if LinearGradient is not available
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

