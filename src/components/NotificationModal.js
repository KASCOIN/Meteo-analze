import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { searchLocations } from '../services/geocodingEngine';
import { styles } from '../styles/globalStyles';

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

  return (
    <Modal visible={isOpen} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Weather Alert Notifications</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 20, color: theme.textSecondary }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 460 }} keyboardShouldPersistTaps="handled">
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: theme.textPrimary, fontSize: 15, fontWeight: 'bold' }]}>
                Enable Live Weather Alerts
              </Text>
              <Switch
                value={isEnabled}
                onValueChange={(val) => setIsEnabled(val)}
                trackColor={{ false: '#767577', true: badgeColor }}
              />
            </View>

            {isEnabled && (
              <View style={styles.notifyDropdownContainer}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>1. Notification Location</Text>
                <View style={styles.searchSection}>
                  <TextInput
                    style={[styles.searchInput, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.borderColor }]}
                    placeholder="Search alert city..."
                    placeholderTextColor={theme.textSecondary}
                    value={searchQuery}
                    onChangeText={handleSearch}
                  />
                  {isSearching && <ActivityIndicator size="small" color="#0d6efd" style={styles.searchLoader} />}
                </View>

                {searchResults.length > 0 && (
                  <View style={[styles.resultsContainer, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                    {searchResults.map((item) => (
                      <TouchableOpacity
                        key={`notif-${item.id}-${item.latitude}-${item.longitude}`}
                        style={[styles.resultItem, { borderBottomColor: theme.borderColor }]}
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
                        <Text style={[styles.resultText, { color: theme.textPrimary }]}>
                          <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
                          {item.country ? ` (${item.country})` : ''}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <Text style={[styles.locationDetailText, { color: theme.textSecondary, marginTop: 4 }]}>
                  Active Target: 📍 {location.name} ({location.latitude.toFixed(2)}°N, {location.longitude.toFixed(2)}°E)
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 15 }]}>2. Notification Interval</Text>
                <View style={styles.pickerGroup}>
                  {[
                    { label: '30m', val: 30 },
                    { label: '1 Hr', val: 60 },
                    { label: '3 Hrs', val: 180 },
                    { label: '6 Hrs', val: 360 },
                  ].map((int) => (
                    <TouchableOpacity
                      key={int.val}
                      style={[styles.pickerOption, intervalMin === int.val && { backgroundColor: badgeColor }]}
                      onPress={() => setIntervalMin(int.val)}
                    >
                      <Text style={[styles.pickerText, intervalMin === int.val && styles.pickerTextActive]}>
                        {int.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 15 }]}>3. Variables to Notify</Text>
                {[
                  { key: 'temp', label: 'Temperature & Apparent Temp' },
                  { key: 'precip', label: 'Rainfall & Precip Probability' },
                  { key: 'wind', label: 'Wind Speed & Max Gusts' },
                  { key: 'uv', label: 'UV Radiation Index' },
                ].map((v) => (
                  <View key={v.key} style={styles.checkboxRow}>
                    <Text style={[styles.checkboxLabel, { color: theme.textPrimary }]}>{v.label}</Text>
                    <Switch
                      value={vars[v.key]}
                      onValueChange={(val) => setVars({ ...vars, [v.key]: val })}
                    />
                  </View>
                ))}

                <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 15 }]}>4. Alert Badge Color</Text>
                <View style={styles.colorSwatchRow}>
                  {['#0d6efd', '#dc3545', '#198754', '#fd7e14', '#6f42c1', '#212529'].map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: c },
                        badgeColor === c && styles.colorSwatchActive,
                      ]}
                      onPress={() => setBadgeColor(c)}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.exportButton, { backgroundColor: badgeColor }]}
                  onPress={onTestTrigger}
                >
                  <Text style={styles.exportButtonText}>🔔 Test Notification Alert Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
                          
