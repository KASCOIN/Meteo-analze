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
  aiSummary,
  isDarkMode,
}) => {
  if (!current) return null;

  const wmo = getWMOWeather(current.weatherCode);
  const fc3Wmo = forecast3Hr ? getWMOWeather(forecast3Hr.weatherCode) : null;

  let aiBadgeColor = '#198754';
  if (current.humidity > 80 && current.weatherCode >= 50) {
    aiBadgeColor = '#fd7e14';
  } else if (current.temp > 30) {
    aiBadgeColor = '#dc3545';
  }

  const finalAiText =
    aiSummary ||
    '🌤️ Wear comfortable daily attire, carry a water bottle, and check weather updates before heading out.';

  const dewPoint = (current.temp - (100 - current.humidity) / 5).toFixed(1);
  const pressure = current.pressure || 1013;
  const cloudCover = current.cloudCover ?? 45;
  const uvIndex = current.uvIndex ?? (current.temp > 28 ? 7 : 3);
  const visibility = current.visibility ?? 10;
  const windGusts = current.windGusts || (current.windSpeed * 1.35).toFixed(1);

  return (
    <View style={[styles.glassContainer, isDarkMode && styles.darkGlass]}>
      {/* 1. Location & Live Clock Header */}
      <View style={styles.topHeaderRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.locationTitle} numberOfLines={1}>
            📍 {location.name}{location.country ? `, ${location.country}` : ''}
          </Text>
          <Text style={styles.coordsText}>
            {location.latitude}°N, {location.longitude}°E
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

      {/* 2. Main Temperature Banner */}
      <View style={styles.mainMetricsRow}>
        <View style={styles.tempLeftGroup}>
          <Text style={styles.weatherIcon}>{wmo.icon}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text style={styles.tempValue}>{convertTemp(current.temp, tempUnit)}</Text>
            <Text style={styles.tempUnitText}>°{tempUnit}</Text>
          </View>
        </View>

        <View style={styles.conditionRightGroup}>
          <Text style={styles.conditionTitle} numberOfLines={1}>
            {wmo.desc}
          </Text>
          <Text style={styles.subMetric}>
            Feels like: {convertTemp(current.temp + 1.2, tempUnit)}°{tempUnit}
          </Text>
          <Text style={styles.subMetric}>
            Dew Point: {convertTemp(parseFloat(dewPoint), tempUnit)}°{tempUnit}
          </Text>
        </View>
      </View>

      {/* 3. Practical AI Lifestyle & Outfit Advisory Box */}
      <View style={[styles.aiPanel, { borderLeftColor: aiBadgeColor }]}>
        <View style={styles.aiHeaderRow}>
          <Text style={styles.aiTagText}>👕 DAILY OUTFIT & LIFESTYLE ADVICE</Text>
        </View>
        <Text style={styles.aiAdvisoryBody}>{finalAiText}</Text>
      </View>

      {/* 4. Telemetry Metrics Grid */}
      <View style={styles.telemetryGrid}>
        <View style={styles.telemetryCard}>
          <Text style={styles.telemetryIcon}>💧</Text>
          <Text style={styles.telemetryLabel}>Humidity</Text>
          <Text style={styles.telemetryValue}>{current.humidity}%</Text>
        </View>

        <View style={styles.telemetryCard}>
          <Text style={styles.telemetryIcon}>💨</Text>
          <Text style={styles.telemetryLabel}>Wind Speed</Text>
          <Text style={styles.telemetryValue}>
            {convertSpeed(current.windSpeed, speedUnit)} {speedUnit.toUpperCase()}
          </Text>
          <Text style={styles.telemetrySub}>
            Gusts: {convertSpeed(parseFloat(windGusts), speedUnit)}
          </Text>
        </View>

        <View style={styles.telemetryCard}>
          <Text style={styles.telemetryIcon}>☀️</Text>
          <Text style={styles.telemetryLabel}>UV Index</Text>
          <Text style={styles.telemetryValue}>{uvIndex} / 11</Text>
          <Text style={styles.telemetrySub}>{uvIndex >= 6 ? 'Sunscreen' : 'Safe'}</Text>
        </View>

        <View style={styles.telemetryCard}>
          <Text style={styles.telemetryIcon}>⏲️</Text>
          <Text style={styles.telemetryLabel}>Pressure</Text>
          <Text style={styles.telemetryValue}>{pressure} hPa</Text>
        </View>

        <View style={styles.telemetryCard}>
          <Text style={styles.telemetryIcon}>☁️</Text>
          <Text style={styles.telemetryLabel}>Cloud Cover</Text>
          <Text style={styles.telemetryValue}>{cloudCover}%</Text>
        </View>

        <View style={styles.telemetryCard}>
          <Text style={styles.telemetryIcon}>👁️</Text>
          <Text style={styles.telemetryLabel}>Visibility</Text>
          <Text style={styles.telemetryValue}>{visibility} km</Text>
        </View>
      </View>

      {/* 5. 3-Hour Forecast Banner */}
      {forecast3Hr && (
        <View style={styles.forecastBox}>
          <Text style={styles.forecastHeader}>EXPECTED AT {forecast3Hr.time}</Text>
          <View style={styles.forecastRow}>
            <Text style={{ fontSize: 18 }}>{fc3Wmo.icon}</Text>
            <Text style={styles.forecastText}>
              {convertTemp(forecast3Hr.temp, tempUnit)}°{tempUnit} — {fc3Wmo.desc}
            </Text>
            <Text style={styles.forecastSubText}>
              Precip: {forecast3Hr.precipProb}% | Wind:{' '}
              {convertSpeed(forecast3Hr.windSpeed, speedUnit)} {speedUnit}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  glassContainer: {
    backgroundColor: 'rgba(13, 110, 253, 0.92)',
    borderRadius: 24,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Platform.select({
      web: {
        boxShadow: '0 10px 36px 0 rgba(13, 110, 253, 0.38)',
      },
      default: {
        elevation: 8,
      },
    }),
  },
  darkGlass: {
    backgroundColor: 'rgba(20, 28, 45, 0.95)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  topHeaderRow: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  coordsText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 1,
    fontWeight: '600',
  },
  liveClockText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  clockTimeHighlight: {
    color: '#00f2fe',
    fontWeight: '800',
  },
  liveBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00ff88',
  },
  liveBadgeText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.6,
  },
  mainMetricsRow: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  tempLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weatherIcon: {
    fontSize: 40,
  },
  tempValue: {
    fontSize: 38,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 44,
  },
  tempUnitText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    marginLeft: 2,
  },
  conditionRightGroup: {
    alignItems: 'flex-end',
  },
  conditionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  subMetric: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.88)',
    fontWeight: '500',
    lineHeight: 17,
  },
  aiPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
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
    lineHeight: 18,
    fontWeight: '500',
  },
  telemetryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  telemetryCard: {
    flex: 1,
    minWidth: '28%',
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  telemetryIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  telemetryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 0.3,
    marginBottom: 2,
    textAlign: 'center',
  },
  telemetryValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
  },
  telemetrySub: {
    fontSize: 9.5,
    color: '#00f2fe',
    fontWeight: '600',
    marginTop: 2,
  },
  forecastBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderRadius: 14,
    padding: 12,
  },
  forecastHeader: {
    fontSize: 9.5,
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
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  forecastSubText: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.82)',
  },
});
  
