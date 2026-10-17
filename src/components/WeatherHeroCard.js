import React from 'react';
import { View, Text, Animated } from 'react-native';
import { getWMOWeather } from '../utils/weatherHelpers';
import { convertTemp, convertSpeed } from '../utils/unitConverters';
import { styles } from '../styles/globalStyles';

export const WeatherHeroCard = ({
  location,
  current,
  forecast3Hr,
  pulseAnim,
  tempUnit,
  speedUnit,
}) => {
  if (!current) return null;

  const currWmo = getWMOWeather(current.weatherCode);
  const forecastWmo = getWMOWeather(forecast3Hr?.weatherCode);

  return (
    <View style={styles.heroCard}>
      <View style={styles.heroTopBar}>
        <View>
          <Text style={styles.heroLocation}>
            📍 {location.name}
            {location.country ? `, ${location.country}` : ''}
          </Text>
          <Text style={styles.heroTimeDate}>
            {current.date} | {current.time}
          </Text>
        </View>
        <View style={styles.liveBadge}>
          <Animated.View style={[styles.pulseDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <View style={styles.currentWeatherRow}>
        <View style={styles.tempGroup}>
          <Text style={styles.heroIcon}>{currWmo.icon}</Text>
          <Text style={styles.currentTemp}>
            {convertTemp(current.temp, tempUnit)}°{tempUnit}
          </Text>
        </View>
        <View style={styles.currentMeta}>
          <Text style={styles.weatherDesc}>{currWmo.desc}</Text>
          <Text style={styles.metaDetail}>Feels like: {convertTemp(current.apparentTemp, tempUnit)}°{tempUnit}</Text>
          <Text style={styles.metaDetail}>Humidity: {current.humidity}%</Text>
          <Text style={styles.metaDetail}>Wind: {convertSpeed(current.windSpeed, speedUnit)} {speedUnit}</Text>
        </View>
      </View>

      {forecast3Hr && (
        <View style={styles.forecastBox}>
          <Text style={styles.forecastTitle}>EXPECTED IN 3 HOURS ({forecast3Hr.time})</Text>
          <View style={styles.forecastContent}>
            <Text style={styles.forecastIcon}>{forecastWmo.icon}</Text>
            <View style={styles.forecastDetails}>
              <Text style={styles.forecastTemp}>
                {convertTemp(forecast3Hr.temp, tempUnit)}°{tempUnit} — {forecastWmo.desc}
              </Text>
              <Text style={styles.forecastMeta}>
                🌧️ Precip: {forecast3Hr.precipProb}% | 💨 Wind: {convertSpeed(forecast3Hr.windSpeed, speedUnit)} {speedUnit}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};
  
