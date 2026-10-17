import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Switch,
  Animated,
  Easing,
  RefreshControl,
  Platform,
  useWindowDimensions,
} from 'react-native';

import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

import { getTheme, CHART_CONFIG } from './src/constants/theme';
import { styles } from './src/styles/globalStyles';
import { convertTemp } from './src/utils/unitConverters';
import { getWMOWeather } from './src/utils/weatherHelpers';
import { searchLocations } from './src/services/geocodingEngine';
import { fetchAndProcessClimateData } from './src/services/weatherEngine';
import { fetchKiloAiWeatherSummary } from './src/services/aiEngine';

import { WeatherHeroCard } from './src/components/WeatherHeroCard';
import { TrendAnalysis } from './src/components/TrendAnalysis';
import { ArchiveModal } from './src/components/ArchiveModal';
import { NotificationModal } from './src/components/NotificationModal';
import { SettingsModal } from './src/components/SettingsModal';
import { AboutModal } from './src/components/AboutModal';
import { Footer } from './src/components/Footer';

const BACKGROUND_WEATHER_TASK = 'BACKGROUND_WEATHER_TASK';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  TaskManager.defineTask(BACKGROUND_WEATHER_TASK, async () => {
    try {
      const data = await fetchAndProcessClimateData(6.52, 3.37, '14d');
      if (data.current) {
        const currWmo = getWMOWeather(data.current.weatherCode);
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '📍 Meteo Analaze Alert',
            body: `Background Check: ${currWmo.icon} ${currWmo.desc} | Temp: ${data.current.temp}°C`,
            sound: true,
          },
          trigger: null,
        });
      }
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

export default function App() {
  const { width: windowWidth } = useWindowDimensions();
  const [currentTime, setCurrentTime] = useState(new Date());

  const [selectedLocation, setSelectedLocation] = useState({
    name: 'Lagos',
    country: 'Nigeria',
    latitude: 6.52,
    longitude: 3.37,
  });

  const [activeTab, setActiveTab] = useState('thermal');
  const [timeRange, setTimeRange] = useState('14d');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // User Preferences
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [tempUnit, setTempUnit] = useState('C');
  const [speedUnit, setSpeedUnit] = useState('kmh');
  const [precipUnit, setPrecipUnit] = useState('mm');

  // Modals Visibility
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Notifications State
  const [isNotifyEnabled, setIsNotifyEnabled] = useState(false);
  const [notifyLocation, setNotifyLocation] = useState(selectedLocation);
  const [notifyIntervalMin, setNotifyIntervalMin] = useState(60);
  const [notifyBadgeColor, setNotifyBadgeColor] = useState('#0d6efd');
  const [notifyVars, setNotifyVars] = useState({ temp: true, precip: true, wind: true, uv: true });

  // Weather Payload & AI State
  const [weatherPayload, setWeatherPayload] = useState({ current: null, forecast1Hr: null, forecast3Hr: null, dailySeries: [] });
  const [aiSummary, setAiSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTrendLoading, setIsTrendLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const theme = getTheme(isDarkMode);
  const chartConfig = CHART_CONFIG(isDarkMode, theme.cardBg);

  // Ticking Live Clock Timer (Updates every second)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Continuous 1-Minute Underground Telemetry Polling + Kilo AI Call
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      const freshData = await fetchAndProcessClimateData(selectedLocation.latitude, selectedLocation.longitude, timeRange);
      setWeatherPayload((prev) => ({
        ...prev,
        current: freshData.current,
        forecast1Hr: freshData.forecast1Hr,
        forecast3Hr: freshData.forecast3Hr,
      }));

      if (freshData.current) {
        const wmo = getWMOWeather(freshData.current.weatherCode);
        const aiText = await fetchKiloAiWeatherSummary({
          locationName: selectedLocation.name,
          current: freshData.current,
          wmoDesc: wmo.desc,
          tempUnit,
        });
        if (aiText) setAiSummary(aiText);
      }
    }, 60000);

    return () => clearInterval(pollInterval);
  }, [selectedLocation, timeRange, tempUnit]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.25, duration: 800, useNativeDriver: true, easing: Easing.ease }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 800, useNativeDriver: true, easing: Easing.ease }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      registerBackgroundSync();
    }
  }, []);

  const registerBackgroundSync = async () => {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_WEATHER_TASK);
      if (!isRegistered) {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_WEATHER_TASK, {
          minimumInterval: 15 * 60,
          stopOnTerminate: false,
          startOnBoot: true,
        });
      }
    } catch (err) {
      console.log('Background task error:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      fadeAnim.setValue(0);
      const data = await fetchAndProcessClimateData(selectedLocation.latitude, selectedLocation.longitude, timeRange);
      setWeatherPayload(data);

      if (data.current) {
        const wmo = getWMOWeather(data.current.weatherCode);
        const aiText = await fetchKiloAiWeatherSummary({
          locationName: selectedLocation.name,
          current: data.current,
          wmoDesc: wmo.desc,
          tempUnit,
        });
        if (aiText) setAiSummary(aiText);
      }

      setLoading(false);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    };
    loadData();
  }, [selectedLocation]);

  const handleRangeChange = async (newRange) => {
    if (newRange === timeRange) return;
    setTimeRange(newRange);
    setIsTrendLoading(true);
    const data = await fetchAndProcessClimateData(selectedLocation.latitude, selectedLocation.longitude, newRange);
    setWeatherPayload((prev) => ({ ...prev, dailySeries: data.dailySeries }));
    setIsTrendLoading(false);
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    const data = await fetchAndProcessClimateData(selectedLocation.latitude, selectedLocation.longitude, timeRange);
    setWeatherPayload(data);
    setRefreshing(false);
  };

  const triggerNotificationCheck = async () => {
    try {
      if (Platform.OS === 'web') {
        if (!('Notification' in window)) {
          alert('This web browser does not support push notifications.');
          return;
        }
        let perm = Notification.permission;
        if (perm !== 'granted') {
          perm = await Notification.requestPermission();
        }
        if (perm === 'granted') {
          const data = await fetchAndProcessClimateData(notifyLocation.latitude, notifyLocation.longitude, '14d');
          const curr = data.current;
          if (curr) {
            const currWmo = getWMOWeather(curr.weatherCode);
            new Notification(`📍 ${notifyLocation.name} Live Alert`, {
              body: `Now: ${currWmo.icon} ${convertTemp(curr.temp, tempUnit)}°${tempUnit} | ${currWmo.desc}`,
            });
            alert('Web browser push notification dispatched!');
          }
        } else {
          alert('Notification permission was denied in browser settings.');
        }
      } else {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          alert('Notification permission denied in device settings.');
          return;
        }

        const data = await fetchAndProcessClimateData(notifyLocation.latitude, notifyLocation.longitude, '14d');
        const curr = data.current;
        const fc1 = data.forecast1Hr;

        if (!curr || !fc1) return;

        const currWmo = getWMOWeather(curr.weatherCode);
        const fc1Wmo = getWMOWeather(fc1.weatherCode);

        await Notifications.scheduleNotificationAsync({
          content: {
            title: `📍 ${notifyLocation.name} Live Alert`,
            body: `Now: ${currWmo.icon} ${convertTemp(curr.temp, tempUnit)}°${tempUnit} | Next Hour (${fc1.time}): ${fc1Wmo.icon} ${fc1Wmo.desc}`,
            sound: true,
          },
          trigger: null,
        });

        alert('System push notification queued!');
      }
    } catch (err) {
      alert('Notification Error: ' + err.message);
    }
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.trim().length >= 2) {
      setIsSearching(true);
      const results = await searchLocations(text);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleGetGPSLocation = async () => {
    setIsLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied.');
        setIsLocating(false);
        return;
      }

      let pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setSelectedLocation({
        name: 'Current Location',
        country: 'GPS Position',
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } catch (err) {
      alert('Could not access device GPS location.');
    } finally {
      setIsLocating(false);
    }
  };

  const formattedLiveTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedLiveDate = currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const containerMaxWidth = windowWidth > 1024 ? 900 : windowWidth > 768 ? 720 : '100%';

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center' }}>
      <ScrollView
        style={[
          styles.container,
          {
            backgroundColor: theme.bg,
            width: '100%',
            maxWidth: containerMaxWidth,
            paddingHorizontal: 12,
            paddingTop: Platform.OS === 'web' ? 4 : undefined,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleManualRefresh} tintColor="#0d6efd" colors={['#0d6efd']} />
        }
      >
        {/* Header Section */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.header, { color: theme.textPrimary }]} numberOfLines={1}>
              Meteo Analaze ☁️
            </Text>
            <Text style={[styles.subHeader, { color: theme.textSecondary }]}>
              Atmospheric Research Portal
            </Text>
          </View>

          {/* Top Action Nav Group with Direct Theme Switcher */}
          <View style={styles.actionNavGroup}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 2 }}>
              <Text style={{ fontSize: 13 }}>{isDarkMode ? '🌙' : '☀️'}</Text>
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                trackColor={{ false: '#767577', true: '#0d6efd' }}
                thumbColor={isDarkMode ? '#ffffff' : '#f4f3f4'}
              />
            </View>

            <TouchableOpacity style={[styles.navButton, { backgroundColor: '#198754' }]} onPress={() => setIsArchiveOpen(true)}>
              <Text style={styles.navButtonText}>📊 Archive</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.navButton, { backgroundColor: '#0d6efd' }]} onPress={() => setIsSettingsOpen(true)}>
              <Text style={styles.navButtonText}>⚙️ Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search & "Me" Location Button */}
        <View style={styles.searchRow}>
          <View style={styles.searchSection}>
            <TextInput
              style={[styles.searchInput, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.borderColor }]}
              placeholder="Search city globally..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {isSearching && <ActivityIndicator size="small" color="#0d6efd" style={styles.searchLoader} />}
          </View>

          <TouchableOpacity style={styles.gpsButton} onPress={handleGetGPSLocation} disabled={isLocating}>
            {isLocating ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Animated.Text style={[styles.gpsButtonText, { transform: [{ scale: pulseAnim }] }]}>
                📍 Me
              </Animated.Text>
            )}
          </TouchableOpacity>
        </View>

        {searchResults.length > 0 && (
          <View style={[styles.resultsContainer, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
            {searchResults.map((item) => (
              <TouchableOpacity
                key={`${item.id}-${item.latitude}-${item.longitude}`}
                style={[styles.resultItem, { borderBottomColor: theme.borderColor }]}
                onPress={() => {
                  setSelectedLocation({
                    name: item.name,
                    country: item.country || item.admin1 || '',
                    latitude: item.latitude,
                    longitude: item.longitude,
                  });
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                <Text style={[styles.resultText, { color: theme.textPrimary }]}>
                  <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
                  {item.country ? ` (${item.country})` : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#0d6efd" />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Retrieving atmospheric time-series...</Text>
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            <WeatherHeroCard
              location={selectedLocation}
              current={weatherPayload.current}
              forecast3Hr={weatherPayload.forecast3Hr}
              pulseAnim={pulseAnim}
              tempUnit={tempUnit}
              speedUnit={speedUnit}
              liveDate={formattedLiveDate}
              liveTime={formattedLiveTime}
              aiSummary={aiSummary}
              isDarkMode={isDarkMode}
            />

            <View style={styles.trendHeaderCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={[styles.trendHeading, { color: theme.textPrimary }]}>Climatological Trend Analysis</Text>
                  <Text style={[styles.trendSubheading, { color: theme.textSecondary }]}>
                    Data Horizon: {timeRange.toUpperCase()} ({weatherPayload.dailySeries.length} Records)
                  </Text>
                </View>
                {isTrendLoading && <ActivityIndicator size="small" color="#0d6efd" />}
              </View>

              <View style={[styles.rangePillGroup, { backgroundColor: isDarkMode ? '#222' : '#e9ecef' }]}>
                {['14d', '1m', '6m', '1y', '3y'].map((rk) => (
                  <TouchableOpacity
                    key={rk}
                    style={[styles.rangePill, timeRange === rk && styles.rangePillActive]}
                    onPress={() => handleRangeChange(rk)}
                  >
                    <Text style={[styles.rangePillText, timeRange === rk && styles.rangePillActiveText]}>
                      {rk.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.tabBar, { backgroundColor: isDarkMode ? '#222' : '#e9ecef' }]}>
              {['thermal', 'hydro', 'wind', 'solar'].map((tabKey) => (
                <TouchableOpacity
                  key={tabKey}
                  style={[styles.tab, activeTab === tabKey && { backgroundColor: theme.cardBg }]}
                  onPress={() => setActiveTab(tabKey)}
                >
                  <Text style={[styles.tabText, { color: activeTab === tabKey ? '#0d6efd' : theme.textSecondary }]}>
                    {tabKey === 'thermal' ? 'Thermal' : tabKey === 'hydro' ? 'Hydrology' : tabKey === 'wind' ? 'Wind' : 'Solar/UV'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TrendAnalysis
              activeTab={activeTab}
              dailySeries={weatherPayload.dailySeries}
              isTrendLoading={isTrendLoading}
              tempUnit={tempUnit}
              speedUnit={speedUnit}
              precipUnit={precipUnit}
              theme={theme}
              chartConfig={chartConfig}
            />
          </Animated.View>
        )}

        <ArchiveModal
          isOpen={isArchiveOpen}
          onClose={() => setIsArchiveOpen(false)}
          defaultLocation={selectedLocation}
          theme={theme}
        />

        <NotificationModal
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          isEnabled={isNotifyEnabled}
          setIsEnabled={setIsNotifyEnabled}
          location={notifyLocation}
          setLocation={setNotifyLocation}
          intervalMin={notifyIntervalMin}
          setIntervalMin={setNotifyIntervalMin}
          badgeColor={notifyBadgeColor}
          setBadgeColor={setNotifyBadgeColor}
          vars={notifyVars}
          setVars={setNotifyVars}
          onTestTrigger={triggerNotificationCheck}
          theme={theme}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          tempUnit={tempUnit}
          setTempUnit={setTempUnit}
          speedUnit={speedUnit}
          setSpeedUnit={setSpeedUnit}
          precipUnit={precipUnit}
          setPrecipUnit={setPrecipUnit}
          onOpenAlerts={() => setIsNotificationOpen(true)}
          onOpenAbout={() => setIsAboutOpen(true)}
          theme={theme}
        />

        <AboutModal
          isOpen={isAboutOpen}
          onClose={() => setIsAboutOpen(false)}
          theme={theme}
        />

        {/* Footer with Contact Links & Attribution */}
        <Footer theme={theme} onOpenAbout={() => setIsAboutOpen(true)} />
      </ScrollView>
    </View>
  );
            }
