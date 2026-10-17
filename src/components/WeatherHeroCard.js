import React from 'react';
import { View, Text, Animated, StyleSheet, Platform } from 'react-native';
import { getWMOWeather } from '../utils/weatherHelpers';
import { convertTemp, convertSpeed } from '../utils/unitConverters';

export const WeatherHeroCard = ({
  location,
  current,
  forecast3Hr,
  pulseAnim,
  tempUnit,
  speedUnit,
  liveDate,
  liveTime,
  isDarkMode,
}) => {
  if (!current) return null;

  const wmo = getWMOWeather(current.weatherCode);
  const fc3Wmo = forecast3Hr ? getWMOWeather(forecast3Hr.weatherCode) : null;

  // Real-time AI Micro-Advisory Logic based on Live Telemetry
  let aiAdvisory = "Conditions are optimal for field observations and outdoor activities.";
  let aiBadgeColor = "#198754"; // Green

  if (current.humidity > 80 && current.weatherCode >= 50) {
    aiAdvisory = "High relative humidity with precipitation expected. Secure climate instruments and plan for rain.";
    aiBadgeColor = "#fd7e14"; // Orange
  } else if (current.temp > 32) {
    aiAdvisory = "Elevated thermal index detected. High heat stress potential—stay hydrated during fieldwork.";
    aiBadgeColor = "#dc3545"; // Red
  } else if (current.windSpeed > 25) {
    aiAdvisory = "Strong surface wind speeds detected. Caution advised for atmospheric sensor deployments.";
    aiBadgeColor = "#0dcaf0"; // Cyan
  }

  return (
    <View style={[styles.glassContainer, isDarkMode && styles.darkGlass]}>
      {/* Header Section */}
      <View style={styles.topHeaderRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.locationTitle} numberOfLines={1}>
            📍 {location.name}{location.country ? `, ${location.country}` : ''}
          </Text>
          <Text style={styles.liveClockText}>
            {liveDate} | <Text style={styles.clockTimeHighlight}>{liveTime}</Text>
          </Text>
        </View>

        <View style={styles.liveBadgeContainer}>
          <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.liveBadgeText}>LIVE</Text>
        </View>
      </View>

      {/* Main Meteorological Metrics */}
      <View style={styles.mainMetricsRow}>
        <View style={styles.tempGroup}>
          <Text style={styles.weatherIcon}>{wmo.icon}</Text>
          <Text style={styles.tempText}>
            {convertTemp(current.temp, tempUnit)}°
            <Text style={styles.unitText}>{tempUnit}</Text>
          </Text>
        </View>

        <View style={styles.conditionGroup}>
          <Text style={styles.conditionTitle}>{wmo.desc}</Text>
          <Text style={styles.subMetric}>Feels like: {convertTemp(current.temp + 1.2, tempUnit)}°{tempUnit}</Text>
          <Text style={styles.subMetric}>Humidity: {current.humidity}%</Text>
          <Text style={styles.subMetric}>Wind: {convertSpeed(current.windSpeed, speedUnit)} {speedUnit.toUpperCase()}</Text>
        </View>
      </View>

      {/* 3-Hour Short Term Outlook */}
      {forecast3Hr && (
        <View style={styles.forecastBox}>
          <Text style={styles.forecastHeader}>EXPECTED AT {forecast3Hr.time}</Text>
          <View style={styles.forecastRow}>
            <Text style={{ fontSize: 20 }}>{fc3Wmo.icon}</Text>
            <Text style={styles.forecastText}>
              {convertTemp(forecast3Hr.temp, tempUnit)}°{tempUnit} — {fc3Wmo.desc}
            </Text>
            <Text style={styles.forecastSubText}>
              Precip: {forecast3Hr.precipProb}% | Wind: {convertSpeed(forecast3Hr.windSpeed, speedUnit)} {speedUnit}
            </Text>
          </View>
        </View>
      )}

      {/* AI Weather Advisory Panel */}
      <View style={[styles.aiPanel, { borderLeftColor: aiBadgeColor }]}>
        <View style={styles.aiHeaderRow}>
          <Text style={styles.aiTagText}>🤖 AI CLIMATE ADVISORY</Text>
        </View>
        <Text style={styles.aiAdvisoryBody}>{aiAdvisory}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  glassContainer: {
    backgroundColor: 'rgba(13, 110, 253, 0.90)',
    borderRadius: 24,
    padding: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 32px 0 rgba(13, 110, 253, 0.37)',
        backdropFilter: 'blur(12px)',
      },
      default: {
        elevation: 8,
        shadowColor: '#0d6efd',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
    }),
  },
  darkGlass: {
    backgroundColor: 'rgba(20, 28, 45, 0.92)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  topHeaderRow: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  locationTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  liveClockText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    fontWeight: '500',
  },
  clockTimeHighlight: {
    color: '#00f2fe',
    fontWeight: '700',
  },
  liveBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00ff88',
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.8,
  },
  mainMetricsRow: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  tempGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weatherIcon: {
    fontSize: 42,
  },
  tempText: {
    fontSize: 44,
    fontWeight: '900',
    color: '#ffffff',
  },
  unitText: {
    fontSize: 24,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  conditionGroup: {
    alignItems: 'flex-end',
  },
  conditionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  subMetric: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  forecastBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
  },
  forecastHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  forecastText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  forecastSubText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  aiPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderLeftWidth: 4,
  },
  aiHeaderRow: {
    marginBottom: 4,
  },
  aiTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00f2fe',
    letterSpacing: 0.5,
  },
  aiAdvisoryBody: {
    fontSize: 12.5,
    color: '#ffffff',
    lineHeight: 17,
    fontWeight: '500',
  },
});
            
