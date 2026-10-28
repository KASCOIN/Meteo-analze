import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Switch,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { searchLocations } from '../services/geocodingEngine';
import { GlassView } from './GlassView';
import { getDeviceProfile, getResponsiveScale } from '../styles/responsive';

export const NotificationModal = ({
  isOpen,
  onClose,
  onBack,
  onSave,
  isEnabled,
  setIsEnabled,
  location,
  setLocation,
  intervalMin,
  setIntervalMin,
  badgeColor,
  setBadgeColor,
  vars,
  setVars,
  onTestTrigger,
  theme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const deviceProfile = getDeviceProfile(windowWidth, windowHeight);
  const responsiveScale = getResponsiveScale(windowWidth);

  if (!isOpen) return null;

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.trim().length >= 2) {
      setIsSearching(true);
      const res = await searchLocations(text);
      setSearchResults(res);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleSetGpsLocation = async () => {
    setIsLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied.');
        setIsLocating(false);
        return;
      }

      let pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({
        name: 'My Present Location',
        country: 'GPS Target',
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      alert('Could not obtain device location for alerts.');
    } finally {
      setIsLocating(false);
    }
  };

  const colors = ['#0d6efd', '#198754', '#dc3545', '#fd7e14', '#6f42c1'];

  const isDarkMode = theme?.textPrimary !== '#0f172a';

  const modalWidth = windowWidth < 360 ? windowWidth - 20 : windowWidth < 768 ? Math.min(windowWidth - 28, 460) : 460;
  const modalHeight = Math.min(windowHeight * 0.8, windowWidth < 768 ? 560 : 700);

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={modalStyles.backdrop}>
          <BlurView intensity={isDarkMode ? 18 : 24} tint={isDarkMode ? 'dark' : 'light'} style={StyleSheet.absoluteFillObject} />
          <GlassView
            variant="elevated"
            isDarkMode={isDarkMode}
            borderRadius={26}
            intensity={50}
            contentStyle={{ flex: 1, minHeight: 0 }}
            style={[
              modalStyles.card,
              {
                borderColor: theme.borderColor,
                width: modalWidth,
                maxWidth: modalWidth,
                height: modalHeight,
                maxHeight: modalHeight,
                padding: windowWidth < 360 ? 16 : 20,
                minHeight: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              },
            ]}
          >
            <View style={{ flex: 1, minHeight: 0 }}>
              <View style={[modalStyles.headerRow, { gap: 10 }]}> 
                <TouchableOpacity
                  onPress={onBack}
                  style={{
                    backgroundColor: '#1a73e8',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 10,
                    minWidth: 72,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#1a73e8',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.18,
                    shadowRadius: 6,
                    elevation: 3,
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#fff', fontWeight: '800' }}>← Back</Text>
                </TouchableOpacity>

                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[modalStyles.title, { color: theme.textPrimary, fontSize: 18 }]} numberOfLines={2}>🔔 Notifications</Text>
                  <Text style={[modalStyles.subtitle, { color: theme.textSecondary }]} numberOfLines={2}>6 AM briefings & telemetry alerts</Text>
                </View>
              </View>

              <ScrollView
                style={{ flex: 1, minHeight: 0, marginBottom: 12 }}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 28, 28), paddingHorizontal: 2 }}
                nestedScrollEnabled={Platform.OS === 'android'}
                bounces={false}
                showsVerticalScrollIndicator={false}
              >
                <View style={[modalStyles.toggleRow, { borderBottomColor: theme.borderColor }]}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: theme.textPrimary }}>Enable Daily & Live Weather Alerts</Text>
                  <Switch
                    value={isEnabled}
                    onValueChange={setIsEnabled}
                    trackColor={{ false: '#767577', true: '#0d6efd' }}
                  />
                </View>

                <Text style={[modalStyles.sectionTitle, { color: theme.textPrimary, marginTop: 12 }]}>1. Target Alert Location</Text>

                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <View style={{ flex: 1, position: 'relative' }}>
                    <TextInput
                      style={[
                        modalStyles.input,
                        { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.borderColor },
                      ]}
                      placeholder="Search alert target city..."
                      placeholderTextColor={theme.textSecondary}
                      value={searchQuery}
                      onChangeText={handleSearch}
                    />
                    {isSearching && <ActivityIndicator size="small" color="#0d6efd" style={modalStyles.searchLoader} />}
                  </View>

                  <TouchableOpacity
                    style={modalStyles.gpsIconButton}
                    onPress={handleSetGpsLocation}
                    disabled={isLocating}
                  >
                    {isLocating ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 13 }}>📍 Me</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {searchResults.length > 0 && (
                  <View style={[modalStyles.resultsContainer, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}>
                    {searchResults.map((item) => (
                      <TouchableOpacity
                        key={`${item.id}-${item.latitude}`}
                        style={[modalStyles.resultItem, { borderBottomColor: theme.borderColor }]}
                        onPress={() => {
                          setLocation({
                            name: item.name,
                            country: item.country || item.admin1 || '',
                            latitude: item.latitude,
                            longitude: item.longitude,
                          });
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                      >
                        <Text style={{ color: theme.textPrimary, fontSize: 13 }}>
                          <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
                          {item.country ? ` (${item.country})` : ''}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <View style={modalStyles.targetBadge}>
                  <Text style={{ color: '#0d6efd', fontWeight: '800', fontSize: 11, letterSpacing: 0.3 }}>ACTIVE ALERT TARGET</Text>
                  <Text style={{ color: '#0d6efd', fontWeight: '700', fontSize: 12, marginTop: 4 }}>
                    📍 {location.name}
                  </Text>
                  <Text style={{ color: '#0d6efd', fontWeight: '600', fontSize: 11, opacity: 0.9, marginTop: 2 }}>
                    {location.latitude}°N, {location.longitude}°E
                  </Text>
                </View>

                <Text style={[modalStyles.sectionTitle, { color: theme.textPrimary, marginTop: 12 }]}>2. Notification Schedule</Text>
                <View style={modalStyles.pillGroup}>
                  {[
                    { label: '30m', val: 30 },
                    { label: '1 Hr', val: 60 },
                    { label: '3 Hrs', val: 180 },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.val}
                      style={[modalStyles.pill, intervalMin === item.val && modalStyles.pillActive]}
                      onPress={() => setIntervalMin(item.val)}
                    >
                      <Text style={[modalStyles.pillText, intervalMin === item.val && modalStyles.pillActiveText]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[modalStyles.sectionTitle, { color: theme.textPrimary, marginTop: 12 }]}>3. Variables to Notify</Text>
                {[
                  { key: 'temp', label: 'Temperature & Apparent Temp' },
                  { key: 'precip', label: 'Rainfall & Precip Probability' },
                  { key: 'wind', label: 'Wind Speed & Max Gusts' },
                  { key: 'uv', label: 'UV Radiation Index' },
                ].map((v) => (
                  <View key={v.key} style={[modalStyles.toggleRow, { borderBottomColor: theme.borderColor }]}>
                    <Text style={{ fontSize: 13, color: theme.textPrimary, fontWeight: '500' }}>{v.label}</Text>
                    <Switch
                      value={vars[v.key]}
                      onValueChange={(val) => setVars((prev) => ({ ...prev, [v.key]: val }))}
                      trackColor={{ false: '#767577', true: '#0d6efd' }}
                    />
                  </View>
                ))}

                <Text style={[modalStyles.sectionTitle, { color: theme.textPrimary, marginTop: 12 }]}>4. Alert Badge Color</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                  {colors.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        modalStyles.colorCircle,
                        { backgroundColor: c },
                        badgeColor === c && modalStyles.colorActive,
                      ]}
                      onPress={() => setBadgeColor(c)}
                    />
                  ))}
                </View>
              </ScrollView>

              <View style={{ gap: 8, marginTop: 8 }}>
                <TouchableOpacity
                  style={modalStyles.testButton}
                  onPress={async () => {
                    try {
                      await onTestTrigger();
                    } catch (error) {
                      Alert.alert('⚡ Weather Alert', 'Weather alert is ready to send, but the browser blocked the banner.');
                    }
                  }}
                >
                  <Text style={modalStyles.testButtonText}>🔔 Dispatch Instant AI Alert</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    modalStyles.closeModalButton,
                    { backgroundColor: '#1a73e8', width: '100%' },
                  ]}
                  onPress={onSave}
                >
                  <Text style={{ color: '#fff', fontWeight: '800', letterSpacing: 0.2 }}>Save Settings</Text>
                </TouchableOpacity>
              </View>
            </View>
          </GlassView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    borderRadius: 20,
    padding: 20,
    maxHeight: '88%',
    borderWidth: 1,
    ...Platform.select({
      web: {
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
      },
      default: {
        elevation: 10,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  gpsIconButton: {
    backgroundColor: '#0d6efd',
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchLoader: {
    position: 'absolute',
    right: 12,
    top: 11,
  },
  resultsContainer: {
    borderWidth: 1,
    borderRadius: 10,
    maxHeight: 120,
    marginBottom: 8,
    overflow: 'hidden',
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
  },
  targetBadge: {
    backgroundColor: 'rgba(13, 110, 253, 0.12)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  pillGroup: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  pill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(120, 120, 120, 0.15)',
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: '#0d6efd',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6c757d',
  },
  pillActiveText: {
    color: '#ffffff',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorActive: {
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  instantTestButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  instantTestButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  testButton: {
    backgroundColor: '#0d6efd',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  closeModalButton: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
});
                 
