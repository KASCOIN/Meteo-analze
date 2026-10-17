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
  } else if (current.temp > 32) {
    aiBadgeColor = '#dc3545';
  } else if (current.windSpeed > 25) {
    aiBadgeColor = '#0dcaf0';
  }

  const finalAiText = aiSummary || 'Analyzing live atmospheric telemetry via Kilo AI...';

  return (
    <View style={[styles.glassContainer, isDarkMode && styles.darkGlass]}>
      {/* Location Header */}
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

      {/* Main Meteorological Metrics Grid */}
      <View style={styles.mainMetricsRow}>
        <View style={styles.tempLeftGroup}>
          <Text style={styles.weatherIcon}>{wmo.icon}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text style={styles.tempValue}>{convertTemp(current.temp, tempUnit)}</Text>
            <Text style={styles.tempUnitText}>°{tempUnit}</Text>
          </View>
        </View>

        <View style={styles.conditionRightGroup}>
          <Text style={styles.conditionTitle} numberOfLines={1}>{wmo.desc}</Text>
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
            <Text style={{ fontSize: 18 }}>{fc3Wmo.icon}</Text>
            <Text style={styles.forecastText}>
              {convertTemp(forecast3Hr.temp, tempUnit)}°{tempUnit} — {fc3Wmo.desc}
            </Text>
            <Text style={styles.forecastSubText}>
              Precip: {forecast3Hr.precipProb}% | Wind: {convertSpeed(forecast3Hr.windSpeed, speedUnit)} {speedUnit}
            </Text>
          </View>
        </View>
      )}

      {/* Real-time Kilo AI Weather Advisory */}
      <View style={[styles.aiPanel, { borderLeftColor: aiBadgeColor }]}>
        <View style={styles.aiHeaderRow}>
          <Text style={styles.aiTagText}>🤖 KILO AI WEATHER ADVISORY</Text>
        </View>
        <Text style={styles.aiAdvisoryBody}>{finalAiText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  glassContainer: {
    backgroundColor: 'rgba(13, 110, 253, 0.92)',
    borderRadius: 22,
    padding: 18,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 32px 0 rgba(13, 110, 253, 0.37)',
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  liveClockText: {
    fontSize: 12,
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
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 16,
    gap: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#00ff88',
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.6,
  },
  mainMetricsRow: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 10,
  },
  tempLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  weatherIcon: {
    fontSize: 36,
  },
  tempValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 38,
  },
  tempUnitText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    marginLeft: 2,
  },
  conditionRightGroup: {
    alignItems: 'flex-end',
    flexShrink: 1,
  },
  conditionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  subMetric: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    lineHeight: 16,
  },
  forecastBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },
  forecastHeader: {
    fontSize: 9.5,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  forecastText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  forecastSubText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  aiPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    borderLeftWidth: 4,
  },
  aiHeaderRow: {
    marginBottom: 2,
  },
  aiTagText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#00f2fe',
    letterSpacing: 0.5,
  },
  aiAdvisoryBody: {
    fontSize: 12,
    color: '#ffffff',
    lineHeight: 16,
    fontWeight: '500',
  },
});
            
