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
  Linking,
} from 'react-native';
import Constants from 'expo-constants';
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
  hydrateAndScheduleSavedNotifications,
} from './src/services/notificationService';
import { getCityFromCoordinates } from './src/services/locationService';

import { WeatherHeroCard } from './src/components/WeatherHeroCard';
import { ArchiveModal } from './src/components/ArchiveModal';
import { NotificationModal } from './src/components/NotificationModal';
import { SettingsModal } from './src/components/SettingsModal';
import { NavigationModal } from './src/components/NavigationModal';
import { CompassModal } from './src/components/CompassModal';
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
      const savedNotifyLoc = await getUserPreferences('notifyLocation', {
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

const isExpoGo = Constants.appOwnership === 'expo';
export const isNativeApp = !isExpoGo && Platform.OS !== 'web';

console.log('[Meteo Debug] runtime:', {
  platform: Platform.OS,
  isExpoGo,
  isNativeApp,
  mode: Platform.OS === 'web' ? 'WEB' : isExpoGo ? 'EXPO_GO_TEST_MODE' : 'REAL_NATIVE_BUILD',
});

if (!isNativeApp) {
  console.warn('[Meteo Debug] Running outside a real native build. Native-only features may be limited or unavailable.');
}

export default function App() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [currentTime, setCurrentTime] = useState(new Date());
  const deviceProfile = getDeviceProfile(windowWidth, windowHeight);
  const responsiveScale = getResponsiveScale(windowWidth);

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
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = (title, message, type = 'info') => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const showToast = (title, message, type = 'info') => {
    setToastConfig({ visible: true, title, message, type });
  };

  useEffect(() => {
    if (!toastConfig.visible) return undefined;

    const timeout = setTimeout(() => {
      setToastConfig((prev) => ({ ...prev, visible: false }));
    }, 6000);

    return () => clearTimeout(timeout);
  }, [toastConfig.visible]);

  // Preferences
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [tempUnit, setTempUnit] = useState('C');
  const [speedUnit, setSpeedUnit] = useState('kmh');

  // Modals
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompassVisible, setIsCompassVisible] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const anyModalOpen = isMenuOpen || isSettingsOpen || isArchiveOpen || isNotificationOpen || isCompassVisible;

  const goBackToMenu = () => {
    setIsSettingsOpen(false);
    setIsArchiveOpen(false);
    setIsNotificationOpen(false);
    setIsCompassVisible(false);
    setIsMenuOpen(true);
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = anyModalOpen ? 'hidden' : '';
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [anyModalOpen]);

  // Notifications
  const [isNotifyEnabled, setIsNotifyEnabled] = useState(false);
  const [notifyLocation, setNotifyLocation] = useState(selectedLocation);
  const [notifyIntervalMin, setNotifyIntervalMin] = useState(60);
  const [notifyBadgeColor, setNotifyBadgeColor] = useState('#0d6efd');
  const [notifyVars, setNotifyVars] = useState({ temp: true, precip: true, wind: true, uv: true });
  const notificationTimerRef = useRef(null);

  // Weather Payload & AI
  const [weatherPayload, setWeatherPayload] = useState({ current: null, forecast1Hr: null, forecast3Hr: null });
  const [aiSummary, setAiSummary] = useState('');
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const theme = getTheme(isDarkMode);
  const isCompassEnabled = Platform.OS !== 'web';

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

      const normalizeBoolean = (value, fallback = false) => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') return value === 'true';
        if (typeof value === 'number') return value === 1;
        return fallback;
      };

      const normalizeNumber = (value, fallback = 60) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
      };

      const savedAppSettings = await getUserPreferences('appSettingsCache', null);
      const savedLegacy = await getUserPreferences('meteo-app-settings-v1', null);
      const savedNotificationSettings = await getUserPreferences('meteo-notification-settings', null);
      const savedDark = await getUserPreferences('isDarkMode', true);
      const savedTemp = await getUserPreferences('tempUnit', 'C');
      const savedSpeed = await getUserPreferences('speedUnit', 'kmh');
      const savedNotifyLoc = await getUserPreferences('notifyLocation', null);
      const savedNotifyEnabled = await getUserPreferences('isNotifyEnabled', false);
      const savedNotifyInterval = await getUserPreferences('notifyIntervalMin', 60);
      const savedNotifyBadgeColor = await getUserPreferences('notifyBadgeColor', '#0d6efd');
      const savedNotifyVars = await getUserPreferences('notifyVars', { temp: true, precip: true, wind: true, uv: true });
      const savedSelectedLocation = await getUserPreferences('selectedLocation', null);

      const hydratedSettings = {
        isDarkMode: true,
        tempUnit: savedLegacy?.tempUnit ?? savedAppSettings?.tempUnit ?? savedTemp,
        speedUnit: savedLegacy?.speedUnit ?? savedAppSettings?.speedUnit ?? savedSpeed,
        selectedLocation: savedLegacy?.selectedLocation ?? savedAppSettings?.selectedLocation ?? savedSelectedLocation ?? { name: 'Current Position', country: 'GPS', latitude: 6.52, longitude: 3.37 },
        notifyLocation: savedNotificationSettings?.notifyLocation ?? savedLegacy?.notifyLocation ?? savedAppSettings?.notifyLocation ?? savedNotifyLoc,
        isNotifyEnabled: normalizeBoolean(savedNotificationSettings?.isNotifyEnabled ?? savedLegacy?.isNotifyEnabled ?? savedAppSettings?.isNotifyEnabled ?? savedNotifyEnabled),
        notifyIntervalMin: normalizeNumber(savedNotificationSettings?.notifyIntervalMin ?? savedLegacy?.notifyIntervalMin ?? savedAppSettings?.notifyIntervalMin ?? savedNotifyInterval, 60),
        notifyBadgeColor: savedNotificationSettings?.notifyBadgeColor ?? savedLegacy?.notifyBadgeColor ?? savedAppSettings?.notifyBadgeColor ?? savedNotifyBadgeColor,
        notifyVars: savedNotificationSettings?.notifyVars ?? savedLegacy?.notifyVars ?? savedAppSettings?.notifyVars ?? savedNotifyVars,
      };

      setIsDarkMode(true);
      setTempUnit(hydratedSettings.tempUnit);
      setSpeedUnit(hydratedSettings.speedUnit);
      setSelectedLocation(hydratedSettings.selectedLocation);
      if (hydratedSettings.notifyLocation) setNotifyLocation(hydratedSettings.notifyLocation);
      setIsNotifyEnabled(Boolean(hydratedSettings.isNotifyEnabled));
      setNotifyIntervalMin(Number(hydratedSettings.notifyIntervalMin || 60));
      setNotifyBadgeColor(hydratedSettings.notifyBadgeColor || '#0d6efd');
      setNotifyVars({
        temp: hydratedSettings.notifyVars?.temp ?? true,
        precip: hydratedSettings.notifyVars?.precip ?? true,
        wind: hydratedSettings.notifyVars?.wind ?? true,
        uv: hydratedSettings.notifyVars?.uv ?? true,
      });

      if (isApp) {
        try {
          await initializeNotificationSystem();
          await hydrateAndScheduleSavedNotifications();
          await scheduleDailyMorningBriefing('Good morning — here is your weather briefing.');
          const pushToken = await getExpoPushToken();
          if (pushToken) {
            console.log('Expo push token:', pushToken);
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
    const appSettingsCache = {
      isDarkMode: true,
      tempUnit,
      speedUnit,
      selectedLocation,
      notifyLocation,
      isNotifyEnabled,
      notifyIntervalMin,
      notifyBadgeColor,
      notifyVars,
    };

    const notificationSettingsSnapshot = {
      notifyLocation,
      isNotifyEnabled,
      notifyIntervalMin,
      notifyBadgeColor,
      notifyVars,
    };

    saveUserPreferences('meteo-app-settings-v1', appSettingsCache);
    saveUserPreferences('appSettingsCache', appSettingsCache);
    saveUserPreferences('meteo-notification-settings', notificationSettingsSnapshot);
    saveUserPreferences('isDarkMode', true);
    saveUserPreferences('tempUnit', tempUnit);
    saveUserPreferences('speedUnit', speedUnit);
    saveUserPreferences('selectedLocation', selectedLocation);
    saveUserPreferences('notifyLocation', notifyLocation);
    saveUserPreferences('isNotifyEnabled', isNotifyEnabled);
    saveUserPreferences('notifyIntervalMin', notifyIntervalMin);
    saveUserPreferences('notifyBadgeColor', notifyBadgeColor);
    saveUserPreferences('notifyVars', notifyVars);
  }, [isDarkMode, tempUnit, speedUnit, selectedLocation, notifyLocation, isNotifyEnabled, notifyIntervalMin, notifyBadgeColor, notifyVars]);

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

  const triggerNotificationCheck = async () => {
    try {
      let data = weatherPayload;
      if (isOffline) {
        data = await getLatestCachedWeatherData(notifyLocation.latitude, notifyLocation.longitude);
      }

      const curr = data?.current;
      if (!curr) {
        if (Platform.OS === 'web') {
          showToast('⚡ Live Weather Advisory', 'No live or cached weather data is available for this alert yet.', 'warning');
        } else {
          showAlert('⚡ Weather Alert', 'No live or cached weather data is available for this alert yet.', 'info');
        }
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
        if (typeof Notification !== 'undefined') {
          if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
              showToast('⚡ Live Weather Advisory', alertBody, 'warning');
              return;
            }
          }

          if (Notification.permission === 'denied') {
            showToast('⚡ Live Weather Advisory', alertBody, 'warning');
            return;
          }
        } else {
          showToast('⚡ Live Weather Advisory', alertBody, 'warning');
          return;
        }

        const webResult = await sendWebOrNativeNotification({
          title: `📍 ${notifyLocation.name} Live Brief`,
          body: alertBody,
          data: { type: 'weather_alert', location: notifyLocation.name },
        });

        if (webResult?.delivered) {
          showAlert('Notification Sent', 'Web push notification dispatched successfully!', 'success');
        } else if (webResult?.source === 'web-denied') {
          showToast('⚡ Live Weather Advisory', alertBody, 'warning');
        } else {
          showToast('⚡ Live Weather Advisory', alertBody, 'warning');
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
      showToast('⚡ Live Weather Advisory', fallbackBody, 'warning');
      console.warn('Notification trigger failed:', error);
    }
  };

  useEffect(() => {
    if (notificationTimerRef.current) {
      clearInterval(notificationTimerRef.current);
      notificationTimerRef.current = null;
    }

    if (Platform.OS !== 'web' || !isNotifyEnabled) {
      return undefined;
    }

    const intervalMs = Math.max(Number(notifyIntervalMin || 60), 30) * 60 * 1000;
    const runPeriodicWebAlert = async () => {
      try {
        await triggerNotificationCheck();
      } catch (error) {
        console.warn('Web alert timer failed:', error);
      }
    };

    runPeriodicWebAlert();
    notificationTimerRef.current = setInterval(runPeriodicWebAlert, intervalMs);

    return () => {
      if (notificationTimerRef.current) {
        clearInterval(notificationTimerRef.current);
        notificationTimerRef.current = null;
      }
    };
  }, [isNotifyEnabled, notifyIntervalMin, notifyLocation, weatherPayload, isOffline, tempUnit]);

  useEffect(() => {
    if (!isApp) return undefined;

    const scheduleNativeAlerts = async () => {
      try {
        await initializeNotificationSystem();
        await scheduleDailyMorningBriefing('Good morning — here is your weather briefing.');

        if (!isNotifyEnabled) {
          await Notifications.cancelScheduledNotificationAsync('meteo-alert-interval');
          return;
        }

        await Notifications.cancelScheduledNotificationAsync('meteo-alert-interval');
        const intervalSeconds = Math.max(Number(notifyIntervalMin || 60), 30) * 60;
        await Notifications.scheduleNotificationAsync({
          identifier: 'meteo-alert-interval',
          content: {
            title: '📍 Meteo Live Brief',
            body: 'Your configured weather brief is ready to refresh.',
            sound: true,
          },
          trigger: {
            seconds: intervalSeconds,
            repeats: true,
          },
        });
      } catch (error) {
        console.warn('Native alert scheduling failed:', error);
      }
    };

    scheduleNativeAlerts();
  }, [isApp, isNotifyEnabled, notifyIntervalMin, notifyLocation]);

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
  const isCompactPhone = windowWidth < 390;
  const isTablet = windowWidth >= 768;
  const isDesktop = windowWidth >= 1200;
  const containerMaxWidth = isDesktop ? 980 : isTablet ? 760 : '100%';
  const shellPaddingX = isCompactPhone ? 8 : isTablet ? 16 : 14;
  const shellPaddingTop = Platform.OS === 'web' ? (isCompactPhone ? 10 : 14) : (StatusBar.currentHeight || 18);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center' }}>
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
                alignSelf: 'center',
                flex: 1,
                paddingHorizontal: shellPaddingX,
                paddingTop: shellPaddingTop,
              },
            ]}
            contentContainerStyle={[
              styles.pageStack,
              { paddingBottom: 32, paddingTop: 6, flexGrow: 1 },
            ]}
            scrollEnabled={!anyModalOpen}
            nestedScrollEnabled={Platform.OS === 'android'}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleManualRefresh} tintColor="#ffffff" colors={['#1a73e8']} />
            }
          >
          <View style={[styles.sectionStack, { gap: isCompactPhone ? 8 : 10 }] }>
            <GlassView
              variant="card"
              isDarkMode={isDarkMode}
              borderRadius={isTablet ? 24 : 20}
              intensity={isDarkMode ? 28 : 45}
              style={{
                paddingVertical: isCompactPhone ? 10 : 12,
                paddingHorizontal: isCompactPhone ? 10 : 14,
                marginTop: 2,
              }}
            >
              <View style={[styles.headerRow, { marginBottom: isCompactPhone ? 10 : 14 }] }>
                <View style={{ flex: 1, marginRight: 8, minWidth: 0 }}>
                  <Text
                    style={[
                      styles.header,
                      {
                        color: isDarkMode ? '#ffffff' : '#0f172a',
                        fontSize: isCompactPhone ? 23 : isTablet ? 29 : 25,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    Meteo Analaze ☁️
                  </Text>
                  <Text
                    style={[
                      styles.subHeader,
                      {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.75)' : '#475569',
                        fontSize: isCompactPhone ? 11.5 : 12.5,
                      },
                    ]}
                  >
                    Atmospheric Research Portal
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={{
                      width: isCompactPhone ? 46 : 50,
                      height: isCompactPhone ? 40 : 44,
                      borderRadius: 16,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.82)' : 'rgba(255, 255, 255, 0.82)',
                      borderWidth: 1,
                      borderColor: isDarkMode ? 'rgba(148, 163, 184, 0.24)' : 'rgba(148, 163, 184, 0.32)',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.18,
                      shadowRadius: 10,
                      elevation: 5,
                    }}
                    onPress={() => setIsMenuOpen(true)}
                  >
                    <View style={{ width: 18, height: 14, justifyContent: 'space-between' }}>
                      <View style={{ height: 2, borderRadius: 2, backgroundColor: isDarkMode ? '#f8fafc' : '#0f172a' }} />
                      <View style={{ height: 2, borderRadius: 2, backgroundColor: isDarkMode ? '#f8fafc' : '#0f172a' }} />
                      <View style={{ height: 2, borderRadius: 2, backgroundColor: isDarkMode ? '#f8fafc' : '#0f172a' }} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </GlassView>

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

        </ScrollView>

        <NavigationModal
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onOpenArchive={() => {
            setIsMenuOpen(false);
            setIsArchiveOpen(true);
          }}
          onOpenSettings={() => {
            setIsMenuOpen(false);
            setIsSettingsOpen(true);
          }}
          onOpenNotifications={() => {
            setIsMenuOpen(false);
            setIsNotificationOpen(true);
          }}
          onOpenCompass={isCompassEnabled ? () => {
            setIsMenuOpen(false);
            setIsCompassVisible(true);
          } : undefined}
          isDarkMode={isDarkMode}
          notifyBadgeColor={notifyBadgeColor}
          theme={theme}
        />

        {isCompassEnabled && (
          <CompassModal
            visible={isCompassVisible}
            onClose={() => {
              setIsCompassVisible(false);
              setIsMenuOpen(true);
            }}
            location={selectedLocation}
          />
        )}

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
          onSave={() => {
            setIsSettingsOpen(false);
            showAlert('Settings Saved', 'System preferences saved to persistent storage.', 'success');
          }}
          theme={theme}
        />

        {toastConfig.visible && (
          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.toast,
              {
                backgroundColor: 'rgba(15, 23, 42, 0.88)',
                borderColor: toastConfig.type === 'warning' ? 'rgba(234, 179, 8, 0.4)' : 'rgba(59, 130, 246, 0.35)',
              },
            ]}
          >
            <View style={[styles.toastIconBadge, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
              <Text style={{ fontSize: 20 }}>⚡</Text>
            </View>
            <View style={styles.toastBody}>
              <Text style={styles.toastTitle}>{toastConfig.title}</Text>
              <Text style={styles.toastMessage}>{toastConfig.message}</Text>
              {Platform.OS === 'web' && (
                <TouchableOpacity
                  onPress={() => Linking.openURL('https://support.google.com/chrome/answer/3220216')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.toastLink}>How to allow notifications in Chrome settings</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        )}

        <CustomAlertModal
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
          theme={theme}
        />
      </WeatherGradientBackground>
    </View>
    </SafeAreaProvider>
  );
}
