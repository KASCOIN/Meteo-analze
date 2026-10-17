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
} from 'react-native';
import { searchLocations } from '../services/geocodingEngine';

export const NotificationModal = ({
  isOpen,
  onClose,
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

  const colors = ['#0d6efd', '#198754', '#dc3545', '#fd7e14', '#6f42c1'];

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={modalStyles.backdrop}>
        <View style={[modalStyles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
          {/* Header */}
          <View style={modalStyles.headerRow}>
            <View>
              <Text style={[modalStyles.title, { color: theme.textPrimary }]}>🔔 Weather Alert Notifications</Text>
              <Text style={[modalStyles.subtitle, { color: theme.textSecondary }]}>Configure live push telemetry alerts</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <Text style={{ fontSize: 22, color: theme.textSecondary, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ marginBottom: 12 }} keyboardShouldPersistTaps="handled">
            {/* Enable Toggle */}
            <View style={[modalStyles.toggleRow, { borderBottomColor: theme.borderColor }]}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: theme.textPrimary }}>Enable Live Weather Alerts</Text>
              <Switch
                value={isEnabled}
                onValueChange={setIsEnabled}
                trackColor={{ false: '#767577', true: '#0d6efd' }}
              />
            </View>

            {/* 1. Target Location */}
            <Text style={[modalStyles.sectionTitle, { color: theme.textPrimary, marginTop: 12 }]}>1. Notification Location</Text>
            <View style={{ position: 'relative', marginBottom: 6 }}>
              <TextInput
                style={[
                  modalStyles.input,
                  { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.borderColor },
                ]}
                placeholder="Search alert city..."
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={handleSearch}
              />
              {isSearching && <ActivityIndicator size="small" color="#0d6efd" style={modalStyles.searchLoader} />}
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

            <Text style={[modalStyles.selectedText, { color: '#0d6efd' }]}>
              Active Target: 📍 {location.name} ({location.latitude}°N, {location.longitude}°E)
            </Text>

            {/* 2. Interval Selection */}
            <Text style={[modalStyles.sectionTitle, { color: theme.textPrimary, marginTop: 12 }]}>2. Notification Interval</Text>
            <View style={modalStyles.pillGroup}>
              {[
                { label: '30m', val: 30 },
                { label: '1 Hr', val: 60 },
                { label: '3 Hrs', val: 180 },
                { label: '6 Hrs', val: 360 },
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

            {/* 3. Variables Selection */}
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

            {/* 4. Badge Color Picker */}
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

          {/* Test & Close Buttons */}
          <View style={{ gap: 8 }}>
            <TouchableOpacity style={modalStyles.testButton} onPress={onTestTrigger}>
              <Text style={modalStyles.testButtonText}>🔔 Dispatch Test Alert Now</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[modalStyles.closeModalButton, { backgroundColor: theme.borderColor }]} onPress={onClose}>
              <Text style={{ color: theme.textPrimary, fontWeight: 'bold' }}>Close Alert Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    justify: 'space-between',
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
  selectedText: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
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
    fontSize: 12,
    fontWeight: '700',
    color: '#6c757d',
  },
  pillActiveText: {
    color: '#ffffff',
  },
  toggleRow: {
    flexDirection: 'row',
    justify: 'space-between',
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
    
