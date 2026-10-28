import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Switch,
  Modal,
  Animated,
  Easing,
  RefreshControl,
  StatusBar,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';

import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getTheme } from './src/constants/theme';
import { styles } from './src/styles/globalStyles';
import { getDeviceProfile, getResponsiveScale } from './src/styles/responsive';
import { convertTemp } from './src/utils/unitConverters';
import { getWMOWeather } from './src/utils/weatherHelpers';
import { isApp } from './src/utils/platform';
import { searchLocations, reverseGeocodeLocation } from './src/services/geocodingEngine';
import { fetchAndProcessClimateData } from './src/services/weatherEngine';
import { fetchKiloAiWeatherSummary } from './src/services/aiEngine';
import { saveUserPreferences, getUserPreferences } from './src/utils/storage';
import {
  cache12HrWeatherData,
  getLatestCachedWeatherData,
  cleanExpiredCacheData,
} from './src/utils/offlineStorage';
import {
  initializeNotificationSystem,
  scheduleDailyMorningBriefing,
  getExpoPushToken,
  openBatteryOptimizationSettings,
} from './src/services/notificationService';
import { getCityFromCoordinates } from './src/services/locationService';
import { updateHomeWidget, registerHomeWidgetTaskHandler } from './src/services/widgetService';

import { WeatherHeroCard } from './src/components/WeatherHeroCard';
import { ArchiveModal } from './src/components/ArchiveModal';
import { NotificationModal } from './src/components/NotificationModal';
import { SettingsModal } from './src/components/SettingsModal';
import { OfflineBanner } from './src/components/OfflineBanner';
import { CustomAlertModal } from './src/components/CustomAlertModal';
import { GlassView } from './src/components/GlassView';
import { WeatherGradientBackground } from './src/components/WeatherGradientBackground';

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
      const savedNotifyLoc = await getUserPreferences('notify_location', {
        latitude: 6.52,
        longitude: 3.37,
        name: 'Present Location',
      });

      // Try fetching live data or fallback to offline cache
      let data = await fetchAndProcessClimateData(savedNotifyLoc.latitude, savedNotifyLoc.longitude, '14d');
      if (!data || !data.current) {
        data = await getLatestCachedWeatherData(savedNotifyLoc.latitude, savedNotifyLoc.longitude);
      }

      if (data && data.current) {
        const currWmo = getWMOWeather(data.current.weatherCode);
        const shortAiAdvisory = await fetchKiloAiWeatherSummary({
          locationName: savedNotifyLoc.name,
          current: data.current,
          wmoDesc: currWmo.desc,
          tempUnit: 'C',
          isForNotification: true,
        });

        await Notifications.scheduleNotificationAsync({
          content: {
            title: `📍 ${savedNotifyLoc.name} Weather Brief`,
            body: `${currWmo.icon} ${currWmo.desc} | Temp: ${data.current.temp}°C. ${shortAiAdvisory}`,
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
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [currentTime, setCurrentTime] = useState(new Date());
  const deviceProfile = getDeviceProfile(windowWidth, windowHeight);
  const responsiveScale = getResponsiveScale(windowWidth);
  const touchStartY = useRef(0);

  const [selectedLocation, setSelectedLocation] = useState({
    name: 'Current Position',
    country: 'GPS',
    latitude: 6.52,
    longitude: 3.37,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Custom Styled Alert Modal State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = (title, message, type = 'info') => {
    setAlertConfig({ visible: true, title, message, type });
  };

  // Preferences
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [tempUnit, setTempUnit] = useState('C');
  const [speedUnit, setSpeedUnit] = useState('kmh');

  // Modals
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const anyModalOpen = isMenuOpen || isSettingsOpen || isArchiveOpen || isNotificationOpen;

  const goBackToMenu = () => {
    setIsSettingsOpen(false);
    setIsArchiveOpen(false);
    setIsNotificationOpen(false);
    setIsMenuOpen(true);
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = anyModalOpen ? 'hidden' : '';
      document.body.style.touchAction = anyModalOpen ? 'none' : '';
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
      }
    };
  }, [anyModalOpen]);

  // Notifications
  const [isNotifyEnabled, setIsNotifyEnabled] = useState(false);
  const [notifyLocation, setNotifyLocation] = useState(selectedLocation);
  const [notifyIntervalMin, setNotifyIntervalMin] = useState(60);
  const [notifyBadgeColor, setNotifyBadgeColor] = useState('#0d6efd');
  const [notifyVars, setNotifyVars] = useState({ temp: true, precip: true, wind: true, uv: true });

  // Weather Payload & AI
  const [weatherPayload, setWeatherPayload] = useState({ current: null, forecast1Hr: null, forecast3Hr: null });
  const [aiSummary, setAiSummary] = useState('');
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const theme = getTheme(isDarkMode);

  // 1. Ticking Live Clock & 12-Hour Scheduled Cache Triggers (00:00 & 12:00)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Trigger cache save at exactly 00:00 AM or 12:00 PM
      if (
        (now.getHours() === 0 || now.getHours() === 12) &&
        now.getMinutes() === 0 &&
        now.getSeconds() === 0
      ) {
        if (weatherPayload.current) {
          cache12HrWeatherData(selectedLocation, weatherPayload);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedLocation, weatherPayload]);

  // 2. Initial Setup: Clean old cache (>3 days) & Fetch GPS + Storage
  useEffect(() => {
    const initApp = async () => {
      await cleanExpiredCacheData();

      const savedDark = await getUserPreferences('isDarkMode', false);
      const savedTemp = await getUserPreferences('tempUnit', 'C');
      const savedSpeed = await getUserPreferences('speedUnit', 'kmh');
      const savedNotifyLoc = await getUserPreferences('notifyLocation', null);

      setIsDarkMode(savedDark);
      setTempUnit(savedTemp);
      setSpeedUnit(savedSpeed);
      if (savedNotifyLoc) setNotifyLocation(savedNotifyLoc);

      if (isApp) {
        try {
          await initializeNotificationSystem();
          await scheduleDailyMorningBriefing('Good morning — here is your weather briefing.');
          const pushToken = await getExpoPushToken();
          if (pushToken) {
            console.log('Expo push token:', pushToken);
          }
          if (Platform.OS === 'android') {
            await openBatteryOptimizationSettings();
          }
        } catch (error) {
          console.warn('Native app initialization failed:', error);
        }
      }

      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          const userGpsLoc = {
            name: 'Current Location',
            country: 'GPS Position',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };

          const locationName = await getCityFromCoordinates(pos.coords.latitude, pos.coords.longitude);
          const resolvedLocation = {
            ...userGpsLoc,
            name: locationName || userGpsLoc.name,
            country: userGpsLoc.country,
          };

          setSelectedLocation(resolvedLocation);
          setNotifyLocation(resolvedLocation);
        }
      } catch (e) {
        // Fallback default coordinates
      }
    };

    initApp();
  }, []);

  // Save Preferences
  useEffect(() => {
    saveUserPreferences('isDarkMode', isDarkMode);
    saveUserPreferences('tempUnit', tempUnit);
    saveUserPreferences('speedUnit', speedUnit);
    saveUserPreferences('selectedLocation', selectedLocation);
    saveUserPreferences('notifyLocation', notifyLocation);
  }, [isDarkMode, tempUnit, speedUnit, selectedLocation, notifyLocation]);

  // 3. Load Weather Data (Supports Live API & Offline Local Cache Fallback)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      fadeAnim.setValue(0);

      try {
        const data = await fetchAndProcessClimateData(selectedLocation.latitude, selectedLocation.longitude, '14d');
        if (data && data.current) {
          setIsOffline(false);
          setWeatherPayload(data);
          cache12HrWeatherData(selectedLocation, data);

          const wmo = getWMOWeather(data.current.weatherCode);
          const aiText = await fetchKiloAiWeatherSummary({
            locationName: selectedLocation.name,
            current: data.current,
            wmoDesc: wmo.desc,
            tempUnit,
            weatherSnapshot: data,
            isForNotification: false,
          });
          if (aiText) setAiSummary(aiText);

          if (isApp) {
            await updateHomeWidget({
              location: selectedLocation,
              current: data.current,
              wmoDesc: wmo.desc,
              locationName: selectedLocation.name,
              aiSummary: aiText,
            });
          }
        } else {
          throw new Error('API unreachable');
        }
      } catch (err) {
        setIsOffline(true);
        const cached = await getLatestCachedWeatherData(selectedLocation.latitude, selectedLocation.longitude);
        if (cached) {
          setWeatherPayload(cached);
          showAlert('Offline Mode', 'Showing local cached telemetry data. Features will auto-refresh when reconnected.', 'warning');
        } else {
          showAlert('No Connection', 'Unable to fetch weather data and no offline cache available.', 'error');
        }
      } finally {
        setLoading(false);
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      }
    };

    loadData();
  }, [selectedLocation]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.reload();
    } else {
      try {
        const data = await fetchAndProcessClimateData(selectedLocation.latitude, selectedLocation.longitude, '14d');
        if (data && data.current) {
          setIsOffline(false);
          setWeatherPayload(data);
          cache12HrWeatherData(selectedLocation, data);
        }
      } catch (e) {
        setIsOffline(true);
      } finally {
        setRefreshing(false);
      }
    }
  };

  const handleTouchStartWeb = (e) => {
    if (Platform.OS === 'web' && e.touches?.[0]) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMoveWeb = (e) => {
    if (Platform.OS === 'web' && e.touches?.[0] && typeof window !== 'undefined') {
      const currentY = e.touches[0].clientY;
      const diffY = currentY - touchStartY.current;
      if (window.scrollY <= 0 && diffY > 80) {
        window.location.reload();
      }
    }
  };

  const triggerNotificationCheck = async () => {
    try {
      let data = weatherPayload;
      if (isOffline) {
        data = await getLatestCachedWeatherData(notifyLocation.latitude, notifyLocation.longitude);
      }

      const curr = data?.current;
      if (!curr) {
        showAlert('⚡ Weather Alert', 'No live or cached weather data is available for this alert yet.', 'info');
        return;
      }

      const currWmo = getWMOWeather(curr.weatherCode);
      const shortAiAdvisory = await fetchKiloAiWeatherSummary({
        locationName: notifyLocation.name,
        current: curr,
        wmoDesc: currWmo.desc,
        tempUnit,
        weatherSnapshot: data,
        isForNotification: true,
      });

      const alertBody = `${currWmo.icon} ${currWmo.desc} | ${convertTemp(curr.temp, tempUnit)}°${tempUnit}. ${shortAiAdvisory}`;

      if (Platform.OS === 'web') {
        if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            showAlert('⚡ Weather Alert', alertBody, 'info');
            return;
          }
        }

        const webResult = await sendWebOrNativeNotification({
          title: `📍 ${notifyLocation.name} Live Brief`,
          body: alertBody,
          data: { type: 'weather_alert', location: notifyLocation.name },
        });

        if (webResult?.delivered) {
          showAlert('Notification Sent', 'Web push notification dispatched successfully!', 'success');
        } else {
          showAlert('⚡ Weather Alert', alertBody, 'info');
        }
        return;
      }

      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        showAlert('⚡ Weather Alert', alertBody, 'info');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `📍 ${notifyLocation.name} Weather Brief`,
          body: alertBody,
          sound: true,
        },
        trigger: null,
      });

      showAlert('Notification Dispatched', 'Instant AI weather alert queued on your device!', 'success');
    } catch (error) {
      const fallbackBody = 'Weather alert is ready, but the browser blocked the notification banner.';
      showAlert('⚡ Weather Alert', fallbackBody, 'info');
      console.warn('Notification trigger failed:', error);
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
        showAlert('Location Denied', 'Permission to access location was denied.', 'warning');
        setIsLocating(false);
        return;
      }

      let pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const myLoc = {
        name: 'Current Location',
        country: 'GPS Position',
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };

      const reverseLookup = await reverseGeocodeLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });

      const resolvedLocation = {
        ...myLoc,
        name: reverseLookup.name || myLoc.name,
        country: reverseLookup.country || myLoc.country,
      };

      setSelectedLocation(resolvedLocation);
      setNotifyLocation(resolvedLocation);
      showAlert('Location Updated', 'GPS position synchronized successfully!', 'success');
    } catch (err) {
      showAlert('Location Error', 'Could not access device GPS location.', 'error');
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    if (isApp) {
      registerHomeWidgetTaskHandler();
    }
  }, []);

  useEffect(() => {
    if (isApp && Notifications.addNotificationResponseReceivedListener) {
      const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
        const actionId = response.actionIdentifier;
        if (actionId === 'VIEW_RADAR') {
          console.log('View radar action pressed');
        } else if (actionId === 'SNOOZE_1H') {
          console.log('Snooze action pressed');
        }
      });

      return () => subscription.remove();
    }
  }, []);

  const formattedLiveTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedLiveDate = currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const containerMaxWidth = windowWidth > 1024 ? 900 : windowWidth > 768 ? 720 : '100%';

  return (
    <SafeAreaProvider>
      <View
        style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center' }}
        onTouchStart={handleTouchStartWeb}
        onTouchMove={handleTouchMoveWeb}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <WeatherGradientBackground
          weatherCode={weatherPayload?.current?.weatherCode}
          isDarkMode={isDarkMode}
          style={{ flex: 1, width: '100%', alignItems: 'center' }}
        >
          <ScrollView
            style={[
              styles.container,
              {
                backgroundColor: 'transparent',
                width: '100%',
                maxWidth: containerMaxWidth,
                paddingHorizontal: 12,
                paddingTop: Platform.OS === 'web' ? 8 : (StatusBar.currentHeight || 20),
              },
            ]}
            contentContainerStyle={[
              styles.pageStack,
              { paddingBottom: 28 },
            ]}
            scrollEnabled={!anyModalOpen}
            nestedScrollEnabled={Platform.OS === 'android'}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleManualRefresh} tintColor="#ffffff" colors={['#1a73e8']} />
            }
          >
          <View style={styles.sectionStack}>
            {/* Header Section */}
            <View style={styles.headerRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text
                  style={[
                    styles.header,
                    { color: isDarkMode ? '#ffffff' : '#0f172a' },
                  ]}
                  numberOfLines={1}
                >
                  Meteo Analaze ☁️
                </Text>
                <Text
                  style={[
                    styles.subHeader,
                    { color: isDarkMode ? 'rgba(255, 255, 255, 0.75)' : '#475569' },
                  ]}
                >
                  Atmospheric Research Portal
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <GlassView
                  variant="chip"
                  isDarkMode={isDarkMode}
                  borderRadius={20}
                  intensity={25}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, gap: 4 }}
                >
                  <Text style={{ fontSize: 13 }}>{isDarkMode ? '🌙' : '☀️'}</Text>
                  <Switch
                    value={isDarkMode}
                    onValueChange={setIsDarkMode}
                    trackColor={{ false: 'rgba(255,255,255,0.4)', true: '#1a73e8' }}
                    thumbColor={isDarkMode ? '#ffffff' : '#f4f3f4'}
                  />
                </GlassView>

                <TouchableOpacity
                  style={[
                    styles.navButton,
                    {
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.65)',
                      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.20)' : 'rgba(255, 255, 255, 0.90)',
                      paddingHorizontal: 14,
                      height: 38,
                    },
                  ]}
                  onPress={() => setIsMenuOpen(true)}
                >
                  <Text style={[styles.navButtonText, { color: isDarkMode ? '#ffffff' : '#0f172a' }]}>☰</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Offline Status Indicator */}
            <OfflineBanner isOffline={isOffline} />

            {/* Search & "Me" Button */}
            <View style={styles.searchRow}>
              <View style={styles.searchSection}>
                <TextInput
                  style={[
                    styles.searchInput,
                    {
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.10)' : 'rgba(255, 255, 255, 0.88)',
                      color: isDarkMode ? '#ffffff' : '#0f172a',
                      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.95)',
                    },
                  ]}
                  placeholder="Search city globally..."
                  placeholderTextColor={isDarkMode ? 'rgba(255, 255, 255, 0.65)' : '#64748b'}
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
                {isSearching && (
                  <ActivityIndicator
                    size="small"
                    color={isDarkMode ? '#38bdf8' : '#1a73e8'}
                    style={styles.searchLoader}
                  />
                )}
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
              <GlassView
                variant="elevated"
                isDarkMode={isDarkMode}
                borderRadius={20}
                style={[styles.resultsContainer, { borderColor: theme.borderColor, marginBottom: 0 }]}
              >
                {searchResults.map((item) => (
                  <TouchableOpacity
                    key={`${item.id}-${item.latitude}-${item.longitude}`}
                    style={[styles.resultItem, { borderBottomColor: theme.borderLight }]}
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
                    <Text style={[styles.resultText, { color: isDarkMode ? '#f8fafc' : '#0f172a' }]}>
                      <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
                      {item.country ? ` (${item.country})` : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </GlassView>
            )}

            {loading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={styles.loadingText}>Retrieving atmospheric time-series...</Text>
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
              </Animated.View>
            )}
          </View>

        {/* Remodeled Navigation Menu */}
        <Modal visible={isMenuOpen} transparent animationType="fade" onRequestClose={() => setIsMenuOpen(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(10, 16, 28, 0.35)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
            <BlurView
              intensity={isDarkMode ? 18 : 26}
              tint={isDarkMode ? 'dark' : 'light'}
              style={StyleSheet.absoluteFillObject}
            />
            <GlassView
              variant="elevated"
              isDarkMode={isDarkMode}
              borderRadius={26}
              intensity={50}
              style={{
                width: '100%',
                maxWidth: Math.min(windowWidth - 24, deviceProfile === 'tablet' || deviceProfile === 'largeTablet' ? 480 : 390),
                maxHeight: '82%',
                padding: windowWidth < 360 ? 14 : 22,
                minHeight: 0,
              }}
            >
              <ScrollView
                style={{ flexGrow: 1, minHeight: 0, maxHeight: '100%' }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 18, flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={Platform.OS === 'android'}
                bounces={false}
              >
                <View style={{ marginBottom: 18 }}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: theme.textPrimary, textAlign: 'center' }}>☁️ Meteo Navigation</Text>
                </View>

                <View style={{ gap: 12, marginBottom: 10 }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#1e8e3e',
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      borderRadius: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.25)',
                    }}
                    onPress={() => {
                      setIsMenuOpen(false);
                      setIsArchiveOpen(true);
                    }}
                  >
                    <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 15 }}>📊 Climate Data Archive</Text>
                    <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>→</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      backgroundColor: '#1a73e8',
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      borderRadius: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.25)',
                    }}
                    onPress={() => {
                      setIsMenuOpen(false);
                      setIsSettingsOpen(true);
                    }}
                  >
                    <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 15 }}>⚙️ Settings</Text>
                    <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>→</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      backgroundColor: notifyBadgeColor,
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      borderRadius: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.25)',
                    }}
                    onPress={() => {
                      setIsMenuOpen(false);
                      setIsNotificationOpen(true);
                    }}
                  >
                    <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 15 }}>🔔 Notifications</Text>
                    <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>→</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <TouchableOpacity
                style={{
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
                  paddingVertical: 12,
                  borderRadius: 14,
                  alignItems: 'center',
                  marginTop: 8,
                }}
                onPress={() => setIsMenuOpen(false)}
              >
                <Text style={{ color: theme.textPrimary, fontWeight: 'bold' }}>Close Menu</Text>
              </TouchableOpacity>
            </GlassView>
          </View>
        </Modal>

        <ArchiveModal
          isOpen={isArchiveOpen}
          onClose={() => setIsArchiveOpen(false)}
          onBack={goBackToMenu}
          defaultLocation={selectedLocation}
          theme={theme}
        />

        <NotificationModal
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          onBack={goBackToMenu}
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
          onSave={() => {
            setIsNotificationOpen(false);
            showAlert('Alert Preferences Saved', 'Your notification settings have been updated.', 'success');
          }}
          theme={theme}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => {
            setIsSettingsOpen(false);
          }}
          onBack={goBackToMenu}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          tempUnit={tempUnit}
          setTempUnit={setTempUnit}
          speedUnit={speedUnit}
          setSpeedUnit={setSpeedUnit}
          onOpenAlerts={() => setIsNotificationOpen(true)}
          onSave={() => {
            setIsSettingsOpen(false);
            showAlert('Settings Saved', 'System preferences saved to persistent storage.', 'success');
          }}
          theme={theme}
        />

        {/* Custom Styled System Alert Dialog */}
        <CustomAlertModal
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
          theme={theme}
        />

        </ScrollView>
      </WeatherGradientBackground>
    </View>
    </SafeAreaProvider>
  );
}
