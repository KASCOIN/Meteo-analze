import React from 'react';
import { View, Text, Animated, StyleSheet, Platform } from 'react-native';
import { getWMOWeather } from '../utils/weatherHelpers';
import { convertTemp, convertSpeed } from '../utils/unitConverters';
import { GlassView } from './GlassView';

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

  let aiBadgeColor = '#34a853'; // Google Green
  if (current.humidity > 80 && current.weatherCode >= 50) {
    aiBadgeColor = '#fbbc04'; // Google Amber
  } else if (current.temp > 30) {
    aiBadgeColor = '#ea4335'; // Google Red
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
    <GlassView
      isDarkMode={isDarkMode}
      intensity={isDarkMode ? 45 : 60}
      variant="card"
      borderRadius={28}
      style={styles.heroOuter}
    >
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

        <GlassView
          isDarkMode={isDarkMode}
          variant="chip"
          borderRadius={20}
          intensity={30}
          style={styles.liveBadgeContainer}
        >
          <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.liveBadgeText}>LIVE</Text>
        </GlassView>
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
      <GlassView
        isDarkMode={isDarkMode}
        variant="chip"
        borderRadius={18}
        intensity={30}
        style={[styles.aiPanel, { borderLeftColor: aiBadgeColor }]}
      >
        <View style={styles.aiHeaderRow}>
          <Text style={styles.aiTagText}>✨ AI METEO ADVISORY & OUTFIT</Text>
        </View>
        <Text style={styles.aiAdvisoryBody}>{finalAiText}</Text>
      </GlassView>

      {/* 4. Telemetry Metrics Grid */}
      <View style={styles.telemetryGrid}>
        <GlassView
          isDarkMode={isDarkMode}
          variant="chip"
          borderRadius={18}
          intensity={25}
          style={styles.telemetryCard}
        >
          <Text style={styles.telemetryIcon}>💧</Text>
          <Text style={styles.telemetryLabel}>Humidity</Text>
          <Text style={styles.telemetryValue}>{current.humidity}%</Text>
        </GlassView>

        <GlassView
          isDarkMode={isDarkMode}
          variant="chip"
          borderRadius={18}
          intensity={25}
          style={styles.telemetryCard}
        >
          <Text style={styles.telemetryIcon}>💨</Text>
          <Text style={styles.telemetryLabel}>Wind Speed</Text>
          <Text style={styles.telemetryValue}>
            {convertSpeed(current.windSpeed, speedUnit)} {speedUnit.toUpperCase()}
          </Text>
          <Text style={styles.telemetrySub}>
            Gusts: {convertSpeed(parseFloat(windGusts), speedUnit)}
          </Text>
        </GlassView>

        <GlassView
          isDarkMode={isDarkMode}
          variant="chip"
          borderRadius={18}
          intensity={25}
          style={styles.telemetryCard}
        >
          <Text style={styles.telemetryIcon}>☀️</Text>
          <Text style={styles.telemetryLabel}>UV Index</Text>
          <Text style={styles.telemetryValue}>{uvIndex} / 11</Text>
          <Text style={styles.telemetrySub}>{uvIndex >= 6 ? 'Sunscreen' : 'Safe'}</Text>
        </GlassView>

        <GlassView
          isDarkMode={isDarkMode}
          variant="chip"
          borderRadius={18}
          intensity={25}
          style={styles.telemetryCard}
        >
          <Text style={styles.telemetryIcon}>⏲️</Text>
          <Text style={styles.telemetryLabel}>Pressure</Text>
          <Text style={styles.telemetryValue}>{pressure} hPa</Text>
        </GlassView>

        <GlassView
          isDarkMode={isDarkMode}
          variant="chip"
          borderRadius={18}
          intensity={25}
          style={styles.telemetryCard}
        >
          <Text style={styles.telemetryIcon}>☁️</Text>
          <Text style={styles.telemetryLabel}>Cloud Cover</Text>
          <Text style={styles.telemetryValue}>{cloudCover}%</Text>
        </GlassView>

        <GlassView
          isDarkMode={isDarkMode}
          variant="chip"
          borderRadius={18}
          intensity={25}
          style={styles.telemetryCard}
        >
          <Text style={styles.telemetryIcon}>👁️</Text>
          <Text style={styles.telemetryLabel}>Visibility</Text>
          <Text style={styles.telemetryValue}>{visibility} km</Text>
        </GlassView>
      </View>

      {/* 5. 3-Hour Forecast Banner */}
      {forecast3Hr && (
        <GlassView
          isDarkMode={isDarkMode}
          variant="chip"
          borderRadius={18}
          intensity={30}
          style={styles.forecastBox}
        >
          <Text style={styles.forecastHeader}>EXPECTED AT {forecast3Hr.time}</Text>
          <View style={styles.forecastRow}>
            <Text style={{ fontSize: 20 }}>{fc3Wmo.icon}</Text>
            <Text style={styles.forecastText}>
              {convertTemp(forecast3Hr.temp, tempUnit)}°{tempUnit} — {fc3Wmo.desc}
            </Text>
            <Text style={styles.forecastSubText}>
              Precip: {forecast3Hr.precipProb}% | Wind:{' '}
              {convertSpeed(forecast3Hr.windSpeed, speedUnit)} {speedUnit}
            </Text>
          </View>
        </GlassView>
      )}
    </GlassView>
  );
};

const styles = StyleSheet.create({
  heroOuter: {
    padding: 22,
    marginVertical: 10,
    ...Platform.select({
      web: {
        boxShadow: '0 16px 40px 0 rgba(0, 0, 0, 0.18)',
      },
      default: {
        elevation: 8,
      },
    }),
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.2,
    ...Platform.select({
      web: {
        textShadow: '0 2px 8px rgba(0,0,0,0.3)',
      },
    }),
  },
  coordsText: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.78)',
    marginTop: 2,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  liveClockText: {
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.92)',
    marginTop: 4,
    fontWeight: '600',
  },
  clockTimeHighlight: {
    color: '#67e8f9',
    fontWeight: '800',
  },
  liveBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  liveBadgeText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.8,
  },
  mainMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  tempLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weatherIcon: {
    fontSize: 46,
  },
  tempValue: {
    fontSize: 44,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 50,
    letterSpacing: -1,
    ...Platform.select({
      web: {
        textShadow: '0 4px 16px rgba(0,0,0,0.25)',
      },
    }),
  },
  tempUnitText: {
    fontSize: 22,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    marginLeft: 2,
    marginTop: 4,
  },
  conditionRightGroup: {
    alignItems: 'flex-end',
  },
  conditionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  subMetric: {
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.88)',
    fontWeight: '600',
    lineHeight: 18,
  },
  aiPanel: {
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  aiHeaderRow: {
    marginBottom: 4,
  },
  aiTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 0.6,
  },
  aiAdvisoryBody: {
    fontSize: 13,
    color: '#ffffff',
    lineHeight: 19,
    fontWeight: '500',
  },
  telemetryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  telemetryCard: {
    flex: 1,
    minWidth: '28%',
    padding: 12,
    alignItems: 'center',
  },
  telemetryIcon: {
    fontSize: 20,
    marginBottom: 3,
  },
  telemetryLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.78)',
    letterSpacing: 0.4,
    marginBottom: 2,
    textAlign: 'center',
  },
  telemetryValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
  },
  telemetrySub: {
    fontSize: 9.5,
    color: '#67e8f9',
    fontWeight: '700',
    marginTop: 2,
  },
  forecastBox: {
    padding: 14,
  },
  forecastHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 0.8,
    marginBottom: 6,
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
    color: 'rgba(255, 255, 255, 0.85)',
  },
});
