import React from 'react';
import { View, Text, Animated, StyleSheet, Platform, Dimensions } from 'react-native';
import { getWMOWeather } from '../utils/weatherHelpers';
import { convertTemp, convertSpeed } from '../utils/unitConverters';
import { GlassView } from './GlassView';
import { getResponsiveScale, getDeviceProfile } from '../styles/responsive';

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

  const screenWidth = Dimensions.get('window').width;
  const deviceProfile = getDeviceProfile(screenWidth, Dimensions.get('window').height);
  const responsiveScale = getResponsiveScale(screenWidth);

  const wmo = getWMOWeather(current.weatherCode);
  const fc3Wmo = forecast3Hr ? getWMOWeather(forecast3Hr.weatherCode) : null;

  let aiBadgeColor = isDarkMode ? '#81c995' : '#1e8e3e'; // Google Green
  if (current.humidity > 80 && current.weatherCode >= 50) {
    aiBadgeColor = isDarkMode ? '#fdd663' : '#d97706'; // Google Amber
  } else if (current.temp > 30) {
    aiBadgeColor = isDarkMode ? '#f28b82' : '#dc2626'; // Google Red
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

  // High-contrast semantic color palette for Google Glassmorphism
  const palette = {
    title: isDarkMode ? '#ffffff' : '#0f172a',
    coords: isDarkMode ? 'rgba(255, 255, 255, 0.72)' : '#475569',
    clock: isDarkMode ? 'rgba(255, 255, 255, 0.88)' : '#334155',
    clockHighlight: isDarkMode ? '#38bdf8' : '#0284c7',
    liveBadgeBg: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(34, 197, 94, 0.16)',
    liveBadgeBorder: isDarkMode ? 'rgba(255, 255, 255, 0.22)' : 'rgba(34, 197, 94, 0.35)',
    liveBadgeText: isDarkMode ? '#ffffff' : '#15803d',
    temp: isDarkMode ? '#ffffff' : '#0f172a',
    tempUnit: isDarkMode ? 'rgba(255, 255, 255, 0.82)' : '#64748b',
    condition: isDarkMode ? '#ffffff' : '#0f172a',
    subMetric: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : '#475569',
    aiTag: isDarkMode ? '#38bdf8' : '#0369a1',
    aiBody: isDarkMode ? '#f8fafc' : '#1e293b',
    telemLabel: isDarkMode ? 'rgba(255, 255, 255, 0.72)' : '#64748b',
    telemValue: isDarkMode ? '#ffffff' : '#0f172a',
    telemSub: isDarkMode ? '#38bdf8' : '#0284c7',
    forecastHeader: isDarkMode ? 'rgba(255, 255, 255, 0.72)' : '#64748b',
    forecastText: isDarkMode ? '#ffffff' : '#0f172a',
    forecastSub: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : '#475569',
  };

  return (
    <GlassView
      isDarkMode={isDarkMode}
      intensity={isDarkMode ? 45 : 60}
      variant="card"
      borderRadius={28}
      style={[
        styles.heroOuter,
        deviceProfile === 'tablet' && styles.heroOuterTablet,
        deviceProfile === 'largeTablet' && styles.heroOuterLargeTablet,
      ]}
    >
      {/* 1. Location & Live Clock Header */}
      <View style={[styles.topHeaderRow, screenWidth < 390 && styles.topHeaderRowCompact]}>
        <View style={{ flex: 1, marginRight: 8, minWidth: 0 }}>
          <Text
            style={[
              styles.locationTitle,
              { color: palette.title, fontSize: 22 * responsiveScale },
              screenWidth < 390 && styles.locationTitleCompact,
            ]}
            numberOfLines={2}
            adjustsFontSizeToFit={false}
          >
            📍 {location.name}{location.country ? `, ${location.country}` : ''}
          </Text>
          <Text style={[styles.coordsText, { color: palette.coords, fontSize: 11.5 * responsiveScale }, screenWidth < 390 && styles.coordsTextCompact]}>
            {location.latitude}°N, {location.longitude}°E
          </Text>
          <Text style={[styles.liveClockText, { color: palette.clock, fontSize: 12.5 * responsiveScale }, screenWidth < 390 && styles.liveClockTextCompact]}>
            {liveDate} | <Text style={[styles.clockTimeHighlight, { color: palette.clockHighlight }]}>{liveTime}</Text>
          </Text>
        </View>

        <View
          style={[
            styles.liveBadgeContainer,
            {
              backgroundColor: palette.liveBadgeBg,
              borderColor: palette.liveBadgeBorder,
            },
          ]}
        >
          <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={[styles.liveBadgeText, { color: palette.liveBadgeText, fontSize: 10.5 * responsiveScale }]}>LIVE</Text>
        </View>
      </View>

      {/* 2. Main Temperature Banner */}
      <View
        style={[
          styles.mainMetricsRow,
          deviceProfile === 'tablet' && styles.mainMetricsRowTablet,
          (deviceProfile === 'smallPhone' || deviceProfile === 'tinyPhone' || deviceProfile === 'standardPhone') && styles.mainMetricsRowPhone,
        ]}
      >
        <View style={styles.tempLeftGroup}>
          <Text style={[styles.weatherIcon, { fontSize: 50 * responsiveScale }]}>{wmo.icon}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 2 }}>
            <Text style={[styles.tempValue, { color: palette.temp, fontSize: 52 * responsiveScale, lineHeight: 54 * responsiveScale }]}>{convertTemp(current.temp, tempUnit)}</Text>
            <Text style={[styles.tempUnitText, { color: palette.tempUnit, fontSize: 22 * responsiveScale }]} >°{tempUnit}</Text>
          </View>
        </View>

        <View style={[(deviceProfile === 'smallPhone' || deviceProfile === 'tinyPhone' || deviceProfile === 'standardPhone') && styles.conditionRightGroupPhone, styles.conditionRightGroup]}>
          <Text style={[styles.conditionTitle, { color: palette.condition, fontSize: 19 * responsiveScale }]} numberOfLines={1}>
            {wmo.desc}
          </Text>
          <Text style={[styles.subMetric, { color: palette.subMetric, fontSize: 12.5 * responsiveScale }]}>
            Feels like: {convertTemp(current.temp + 1.2, tempUnit)}°{tempUnit}
          </Text>
          <Text style={[styles.subMetric, { color: palette.subMetric, fontSize: 12.5 * responsiveScale }]}>
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
          <Text style={[styles.aiTagText, { color: palette.aiTag, fontSize: 11 * responsiveScale }]}>✨ AI METEO ADVISORY & OUTFIT</Text>
        </View>
        <Text style={[styles.aiAdvisoryBody, { color: palette.aiBody, fontSize: 13.5 * responsiveScale }]}>{finalAiText}</Text>
      </GlassView>

      {/* 4. Telemetry Metrics Grid */}
      <View style={[styles.telemetryGrid, screenWidth < 420 && styles.telemetryGridCompact]}>
        <GlassView
          isDarkMode={isDarkMode}
          variant="chip"
          borderRadius={18}
          intensity={25}
          style={[styles.telemetryCard, screenWidth < 420 && styles.telemetryCardCompact]}
        >
          <Text style={[styles.telemetryIcon, { fontSize: 20 * responsiveScale }]}>💧</Text>
          <Text style={[styles.telemetryLabel, { color: palette.telemLabel, fontSize: 10 * responsiveScale }]}>HUMIDITY</Text>
          <Text style={[styles.telemetryValue, { color: palette.telemValue, fontSize: 14.5 * responsiveScale }]}>{current.humidity}%</Text>
          <Text style={[styles.telemetrySub, { color: current.humidity > 70 ? (isDarkMode ? '#38bdf8' : '#0284c7') : (isDarkMode ? '#81c995' : '#16a34a'), fontSize: 10 * responsiveScale }]}>
            {current.humidity > 75 ? 'Humid' : current.humidity < 40 ? 'Dry' : 'Balanced'}
          </Text>
        </GlassView>

        <GlassView
          isDarkMode={isDarkMode}
          variant="chip"
          borderRadius={18}
          intensity={25}
          style={[styles.telemetryCard, screenWidth < 420 && styles.telemetryCardCompact]}
        >
          <Text style={[styles.telemetryIcon, { fontSize: 20 * responsiveScale }]}>💨</Text>
          <Text style={[styles.telemetryLabel, { color: palette.telemLabel, fontSize: 10 * responsiveScale }]}>WIND SPEED</Text>
          <Text style={[styles.telemetryValue, { color: palette.telemValue, fontSize: 14.5 * responsiveScale }]}>
            {convertSpeed(current.windSpeed, speedUnit)} {speedUnit.toUpperCase()}
          </Text>
          <Text style={[styles.telemetrySub, { color: palette.telemSub, fontSize: 10 * responsiveScale }]}>
            Gusts: {convertSpeed(parseFloat(windGusts), speedUnit)}
          </Text>
        </GlassView>

        <GlassView
          isDarkMode={isDarkMode}
          variant="chip"
          borderRadius={18}
          intensity={25}
          style={[styles.telemetryCard, screenWidth < 420 && styles.telemetryCardCompact]}
        >
          <Text style={[styles.telemetryIcon, { fontSize: 20 * responsiveScale }]}>☀️</Text>
          <Text style={[styles.telemetryLabel, { color: palette.telemLabel, fontSize: 10 * responsiveScale }]}>UV INDEX</Text>
          <Text style={[styles.telemetryValue, { color: palette.telemValue, fontSize: 14.5 * responsiveScale }]}>{uvIndex} / 11</Text>
          <Text style={[styles.telemetrySub, { color: uvIndex >= 6 ? (isDarkMode ? '#fdd663' : '#d97706') : (isDarkMode ? '#81c995' : '#16a34a'), fontSize: 10 * responsiveScale }]}>
            {uvIndex >= 6 ? 'Sunscreen' : 'Safe'}
          </Text>
        </GlassView>

        <GlassView
          isDarkMode={isDarkMode}
          variant="chip"
          borderRadius={18}
          intensity={25}
          style={[styles.telemetryCard, screenWidth < 420 && styles.telemetryCardCompact]}
        >
          <Text style={[styles.telemetryIcon, { fontSize: 20 * responsiveScale }]}>⏲️</Text>
          <Text style={[styles.telemetryLabel, { color: palette.telemLabel, fontSize: 10 * responsiveScale }]}>PRESSURE</Text>
          <Text style={[styles.telemetryValue, { color: palette.telemValue, fontSize: 14.5 * responsiveScale }]}>{pressure} hPa</Text>
          <Text style={[styles.telemetrySub, { color: palette.telemSub, fontSize: 10 * responsiveScale }]}>
            {pressure > 1013 ? 'High' : 'Normal'}
          </Text>
        </GlassView>

        <GlassView
          isDarkMode={isDarkMode}
          variant="chip"
          borderRadius={18}
          intensity={25}
          style={[styles.telemetryCard, screenWidth < 420 && styles.telemetryCardCompact]}
        >
          <Text style={[styles.telemetryIcon, { fontSize: 20 * responsiveScale }]}>☁️</Text>
          <Text style={[styles.telemetryLabel, { color: palette.telemLabel, fontSize: 10 * responsiveScale }]}>CLOUD COVER</Text>
          <Text style={[styles.telemetryValue, { color: palette.telemValue, fontSize: 14.5 * responsiveScale }]}>{cloudCover}%</Text>
          <Text style={[styles.telemetrySub, { color: palette.telemSub, fontSize: 10 * responsiveScale }]}>
            {cloudCover > 60 ? 'Overcast' : cloudCover > 25 ? 'Partly' : 'Clear'}
          </Text>
        </GlassView>

        <GlassView
          isDarkMode={isDarkMode}
          variant="chip"
          borderRadius={18}
          intensity={25}
          style={[styles.telemetryCard, screenWidth < 420 && styles.telemetryCardCompact]}
        >
          <Text style={[styles.telemetryIcon, { fontSize: 20 * responsiveScale }]}>👁️</Text>
          <Text style={[styles.telemetryLabel, { color: palette.telemLabel, fontSize: 10 * responsiveScale }]}>VISIBILITY</Text>
          <Text style={[styles.telemetryValue, { color: palette.telemValue, fontSize: 14.5 * responsiveScale }]}>{visibility} km</Text>
          <Text style={[styles.telemetrySub, { color: isDarkMode ? '#81c995' : '#16a34a', fontSize: 10 * responsiveScale }]}>
            {visibility >= 10 ? 'Clear' : 'Moderate'}
          </Text>
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
          <Text style={[styles.forecastHeader, { color: palette.forecastHeader }]}>
            EXPECTED AT {forecast3Hr.time}
          </Text>
          <View style={styles.forecastRow}>
            <Text style={{ fontSize: 22 }}>{fc3Wmo.icon}</Text>
            <Text style={[styles.forecastText, { color: palette.forecastText }]}>
              {convertTemp(forecast3Hr.temp, tempUnit)}°{tempUnit} — {fc3Wmo.desc}
            </Text>
            <Text style={[styles.forecastSubText, { color: palette.forecastSub }]}>
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
    padding: 12,
    marginVertical: 0,
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 16px 40px 0 rgba(15, 23, 42, 0.12)',
      },
      default: {
        elevation: 8,
      },
    }),
  },
  heroOuterTablet: {
    padding: 28,
    maxWidth: 980,
    alignSelf: 'center',
    width: '100%',
  },
  heroOuterLargeTablet: {
    padding: 32,
    maxWidth: 1100,
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  topHeaderRowCompact: {
    alignItems: 'center',
  },
  locationTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  locationTitleCompact: {
    lineHeight: 26,
    maxWidth: '100%',
  },
  coordsText: {
    fontSize: 11.5,
    marginTop: 2,
    fontWeight: '600',
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  coordsTextCompact: {
    maxWidth: '100%',
  },
  liveClockText: {
    fontSize: 12.5,
    marginTop: 4,
    fontWeight: '600',
    flexShrink: 1,
  },
  liveClockTextCompact: {
    maxWidth: '100%',
  },
  clockTimeHighlight: {
    fontWeight: '800',
  },
  liveBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
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
    letterSpacing: 0.8,
  },
  mainMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 4,
    marginBottom: 4,
    gap: 10,
  },
  mainMetricsRowTablet: {
    alignItems: 'flex-start',
    gap: 16,
  },
  mainMetricsRowPhone: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tempLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  weatherIcon: {
    fontSize: 48,
  },
  tempValue: {
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 52,
    letterSpacing: -1,
  },
  tempUnitText: {
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 2,
    marginTop: 4,
  },
  conditionRightGroup: {
    alignItems: 'flex-start',
    flex: 1,
    minWidth: 0,
  },
  conditionRightGroupPhone: {
    alignItems: 'center',
    width: '100%',
  },
  conditionTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 4,
  },
  subMetric: {
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 18,
  },
  aiPanel: {
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  aiHeaderRow: {
    marginBottom: 4,
  },
  aiTagText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  aiAdvisoryBody: {
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: '500',
  },
  telemetryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 8,
  },
  telemetryGridCompact: {
    gap: 10,
  },
  telemetryCard: {
    flexBasis: '31%',
    minWidth: 108,
    padding: 12,
    alignItems: 'center',
  },
  telemetryCardCompact: {
    flexBasis: '48%',
    minWidth: 0,
  },
  telemetryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  telemetryLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 3,
    textAlign: 'center',
  },
  telemetryValue: {
    fontSize: 14.5,
    fontWeight: '800',
    textAlign: 'center',
  },
  telemetrySub: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
    textAlign: 'center',
  },
  forecastBox: {
    padding: 14,
  },
  forecastHeader: {
    fontSize: 10,
    fontWeight: '800',
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
  },
  forecastSubText: {
    fontSize: 12,
  },
});
