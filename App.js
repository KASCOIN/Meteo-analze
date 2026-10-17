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
  Platform,
  useWindowDimensions,
} from 'react-native';

import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

import { getTheme } from './src/constants/theme';
import { styles } from './src/styles/globalStyles';
import { convertTemp } from './src/utils/unitConverters';
import { getWMOWeather } from './src/utils/weatherHelpers';
import { searchLocations } from './src/services/geocodingEngine';
import { fetchAndProcessClimateData } from './src/services/weatherEngine';
import { fetchKiloAiWeatherSummary } from './src/services/aiEngine';

import { WeatherHeroCard } from './src/components/WeatherHeroCard';
import { ArchiveModal } from './src/components/ArchiveModal';
import { NotificationModal } from './src/components/NotificationModal';
import { SettingsModal } from './src/components/SettingsModal';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Notifications State
  const [isNotifyEnabled, setIsNotifyEnabled] = useState(false);
  const [notifyLocation, setNotifyLocation] = useState(selectedLocation);
  const [notifyIntervalMin, setNotifyIntervalMin] = useState(60);
  const [notifyBadgeColor, setNotifyBadgeColor] = useState('#0d6efd');
  const [notifyVars, setNotifyVars] = useState({ temp: true, precip: true, wind: true, uv: true });

  // Weather Payload & AI State
  const [weatherPayload, setWeatherPayload] = useState({ current: null, forecast1Hr: null, forecast3Hr: null });
  const [aiSummary, setAiSummary] = useState('');
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const theme = getTheme(isDarkMode);

  // 1. Live Ticking Clock (1 second)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Continuous 1-Minute Underground Telemetry Polling
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      const freshData = await fetchAndProcessClimateData(selectedLocation.latitude, selectedLocation.longitude, '14d');
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
  }, [selectedLocation, tempUnit]);

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
      const data = await fetchAndProcessClimateData(selectedLocation.latitude, selectedLocation.longitude, '14d');
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

  const handleManualRefresh = async () => {
    setRefreshing(true);
    const data = await fetchAndProcessClimateData(selectedLocation.latitude, selectedLocation.longitude, '14d');
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
        {/* Header Section with Full Un-Truncated App Title */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.header, { color: theme.textPrimary }]} numberOfLines={1}>
              Meteo Analaze ☁️
            </Text>
            <Text style={[styles.subHeader, { color: theme.textSecondary }]}>
              Atmospheric Research Portal
            </Text>
          </View>

          {/* Right Header Navigation Controls */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Text style={{ fontSize: 13 }}>{isDarkMode ? '🌙' : '☀️'}</Text>
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                trackColor={{ false: '#767577', true: '#0d6efd' }}
                thumbColor={isDarkMode ? '#ffffff' : '#f4f3f4'}
              />
            </View>

            {/* Hamburger Menu Trigger Button */}
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: '#0d6efd', paddingHorizontal: 12, height: 38 }]}
              onPress={() => setIsMenuOpen(true)}
            >
              <Text style={styles.navButtonText}>☰</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search & "Me" Button */}
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
          </Animated.View>
        )}

        {/* Hamburger Navigation Modal */}
        <Modal visible={isMenuOpen} transparent animationType="fade" onRequestClose={() => setIsMenuOpen(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
            <View style={{ width: '100%', maxWidth: 360, backgroundColor: theme.cardBg, borderRadius: 18, padding: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: theme.textPrimary }}>☰ Navigation Menu</Text>
                <TouchableOpacity onPress={() => setIsMenuOpen(false)}>
                  <Text style={{ fontSize: 22, color: theme.textSecondary, fontWeight: 'bold' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={{ gap: 10, marginBottom: 10 }}>
                <TouchableOpacity
                  style={{ backgroundColor: '#198754', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
                  onPress={() => {
                    setIsMenuOpen(false);
                    setIsArchiveOpen(true);
                  }}
                >
                  <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 15 }}>📊 Climate Data Archive</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ backgroundColor: '#0d6efd', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
                  onPress={() => {
                    setIsMenuOpen(false);
                    setIsSettingsOpen(true);
                  }}
                >
                  <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 15 }}>⚙️ System Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ backgroundColor: notifyBadgeColor, paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
                  onPress={() => {
                    setIsMenuOpen(false);
                    setIsNotificationOpen(true);
                  }}
                >
                  <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 15 }}>🔔 Configure Alerts</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={{ backgroundColor: theme.borderColor, paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginTop: 6 }}
                onPress={() => setIsMenuOpen(false)}
              >
                <Text style={{ color: theme.textPrimary, fontWeight: 'bold' }}>Close Menu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
          theme={theme}
        />

        {/* Web-Only Professional Footer */}
        <Footer theme={theme} />
      </ScrollView>
    </View>
  );
    }
        
