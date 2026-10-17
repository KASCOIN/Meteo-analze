import React from 'react';
import { View, Text, ActivityIndicator, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { downsampleData, getCardinalDirection } from '../utils/weatherHelpers';
import { convertTemp, convertSpeed, convertPrecip } from '../utils/unitConverters';
import { styles } from '../styles/globalStyles';

const screenWidth = Dimensions.get('window').width;

export const TrendAnalysis = ({
  activeTab,
  dailySeries,
  isTrendLoading,
  tempUnit,
  speedUnit,
  precipUnit,
  theme,
  chartConfig,
}) => {
  const recentData = downsampleData(dailySeries, 12);
  const dateLabels = recentData.map((d, idx) => (idx % 2 === 0 ? d.date.slice(5) : ''));
  const latest = dailySeries[dailySeries.length - 1] || {};

  return (
    <View style={styles.contentContainer}>
      {activeTab === 'thermal' && (
        <View>
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Max Temp</Text>
              <Text style={[styles.statValue, { color: '#dc3545' }]}>{convertTemp(latest.tempMax, tempUnit)}°{tempUnit}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Min Temp</Text>
              <Text style={[styles.statValue, { color: '#0d6efd' }]}>{convertTemp(latest.tempMin, tempUnit)}°{tempUnit}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Apparent Max</Text>
              <Text style={[styles.statValue, { color: '#fd7e14' }]}>{convertTemp(latest.apparentTempMax, tempUnit)}°{tempUnit}</Text>
            </View>
          </View>

          <View style={[styles.chartCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
            <Text style={[styles.chartTitle, { color: theme.textPrimary }]}>Temperature Profile (°{tempUnit})</Text>
            {isTrendLoading ? (
              <ActivityIndicator size="large" color="#0d6efd" style={{ marginVertical: 80 }} />
            ) : (
              <LineChart
                data={{
                  labels: dateLabels,
                  datasets: [
                    { data: recentData.map((d) => parseFloat(convertTemp(d.tempMax, tempUnit)) || 0), color: () => '#dc3545', strokeWidth: 2 },
                    { data: recentData.map((d) => parseFloat(convertTemp(d.tempMin, tempUnit)) || 0), color: () => '#0d6efd', strokeWidth: 2 },
                  ],
                  legend: [`Max (°${tempUnit})`, `Min (°${tempUnit})`],
                }}
                width={screenWidth - 50}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chartStyle}
              />
            )}
          </View>
        </View>
      )}

      {activeTab === 'hydro' && (
        <View>
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Precipitation</Text>
              <Text style={[styles.statValue, { color: '#0d6efd' }]}>{convertPrecip(latest.precipSum, precipUnit)} {precipUnit}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Rain Hours</Text>
              <Text style={[styles.statValue, { color: '#6f42c1' }]}>{latest.precipHours} hrs</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Evapotranspiration</Text>
              <Text style={[styles.statValue, { color: '#198754' }]}>{convertPrecip(latest.et0Evapotranspiration, precipUnit)} {precipUnit}</Text>
            </View>
          </View>

          <View style={[styles.chartCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
            <Text style={[styles.chartTitle, { color: theme.textPrimary }]}>Precipitation Volume ({precipUnit})</Text>
            {isTrendLoading ? (
              <ActivityIndicator size="large" color="#0d6efd" style={{ marginVertical: 70 }} />
            ) : (
              <BarChart
                data={{
                  labels: dateLabels,
                  datasets: [{ data: recentData.map((d) => parseFloat(convertPrecip(d.precipSum, precipUnit)) || 0) }],
                }}
                width={screenWidth - 50}
                height={200}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(13, 110, 253, ${opacity})`,
                }}
                style={styles.chartStyle}
              />
            )}
          </View>
        </View>
      )}

      {activeTab === 'wind' && (
        <View>
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Max Speed</Text>
              <Text style={[styles.statValue, { color: '#0dcaf0' }]}>{convertSpeed(latest.windSpeedMax, speedUnit)} {speedUnit}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Max Gusts</Text>
              <Text style={[styles.statValue, { color: '#dc3545' }]}>{convertSpeed(latest.windGustsMax, speedUnit)} {speedUnit}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Direction</Text>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>
                {getCardinalDirection(latest.windDirDominant)} ({latest.windDirDominant}°)
              </Text>
            </View>
          </View>

          <View style={[styles.chartCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
            <Text style={[styles.chartTitle, { color: theme.textPrimary }]}>Wind Speed Profile ({speedUnit})</Text>
            {isTrendLoading ? (
              <ActivityIndicator size="large" color="#0d6efd" style={{ marginVertical: 80 }} />
            ) : (
              <LineChart
                data={{
                  labels: dateLabels,
                  datasets: [
                    { data: recentData.map((d) => parseFloat(convertSpeed(d.windSpeedMax, speedUnit)) || 0), color: () => '#0dcaf0', strokeWidth: 2 },
                    { data: recentData.map((d) => parseFloat(convertSpeed(d.windGustsMax, speedUnit)) || 0), color: () => '#dc3545', strokeWidth: 1.5 },
                  ],
                  legend: [`Speed (${speedUnit})`, `Gusts (${speedUnit})`],
                }}
                width={screenWidth - 50}
                height={220}
                chartConfig={chartConfig}
                style={styles.chartStyle}
              />
            )}
          </View>
        </View>
      )}

      {activeTab === 'solar' && (
        <View>
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Solar Radiation</Text>
              <Text style={[styles.statValue, { color: '#ffc107' }]}>{latest.solarRadiation} MJ/m²</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Max UV Index</Text>
              <Text style={[styles.statValue, { color: '#fd7e14' }]}>{latest.uvIndexMax}</Text>
            </View>
          </View>

          <View style={[styles.chartCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
            <Text style={[styles.chartTitle, { color: theme.textPrimary }]}>Shortwave Radiation (MJ/m²)</Text>
            {isTrendLoading ? (
              <ActivityIndicator size="large" color="#0d6efd" style={{ marginVertical: 70 }} />
            ) : (
              <BarChart
                data={{
                  labels: dateLabels,
                  datasets: [{ data: recentData.map((d) => d.solarRadiation || 0) }],
                }}
                width={screenWidth - 50}
                height={200}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`,
                }}
                style={styles.chartStyle}
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
};
       
