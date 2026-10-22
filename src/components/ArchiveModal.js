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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { searchLocations } from '../services/geocodingEngine';
import { exportArchiveCSV } from '../services/csvExporter';
import { GlassView } from './GlassView';
import { getDeviceProfile, getResponsiveScale } from '../styles/responsive';

export const ArchiveModal = ({ isOpen, onClose, defaultLocation, theme }) => {
  const [targetLocation, setTargetLocation] = useState(defaultLocation);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [granularity, setGranularity] = useState('daily'); // 'daily' | 'hourly'
  const [range, setRange] = useState('1m'); // '1m' | '6m' | '1y' | '3y'

  const [variables, setVariables] = useState({
    temperature: true,
    precipitation: true,
    wind: true,
    solar: false,
    evapotranspiration: false,
  });

  const [isExporting, setIsExporting] = useState(false);

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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const count = await exportArchiveCSV({
        location: targetLocation,
        range,
        granularity,
        variables,
      });
      alert(`Export Successful! Downloaded ${count} historical meteorological records.`);
      onClose();
    } catch (err) {
      alert('Export Error: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const isDarkMode = theme?.textPrimary !== '#0f172a';

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={modalStyles.backdrop}>
          <GlassView
            variant="elevated"
            isDarkMode={isDarkMode}
            borderRadius={26}
            intensity={50}
            style={[
              modalStyles.card,
              {
                borderColor: theme.borderColor,
                maxWidth: deviceProfile === 'tablet' || deviceProfile === 'largeTablet' ? 560 : 480,
                padding: windowWidth < 360 ? 16 : 20,
                minHeight: 0,
                maxHeight: '85%',
                height: '85%',
                flex: 1,
              },
            ]}
          >
            {/* Header */}
            <View style={modalStyles.headerRow}>
              <View>
                <Text style={[modalStyles.title, { color: theme.textPrimary }]}>📊 Professional Climate Archive</Text>
                <Text style={[modalStyles.subtitle, { color: theme.textSecondary }]}>Export historical datasets to CSV</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                <Text style={{ fontSize: 20, color: theme.textSecondary, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ marginBottom: 12, flexGrow: 1, minHeight: 0, maxHeight: '100%' }}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 16, 24), flexGrow: 1 }}
              nestedScrollEnabled={Platform.OS === 'android'}
              bounces={false}
              showsVerticalScrollIndicator={false}
            >
            
            {/* 1. Target Location */}
            <Text style={[modalStyles.sectionTitle, { color: theme.textPrimary }]}>1. Target Location</Text>
            <View style={{ position: 'relative', marginBottom: 6 }}>
              <TextInput
                style={[
                  modalStyles.input,
                  { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.borderColor },
                ]}
                placeholder="Search archive city globally..."
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
                      setTargetLocation({
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
              Selected: 📍 {targetLocation.name} ({targetLocation.latitude}°N, {targetLocation.longitude}°E)
            </Text>

            {/* 2. Granularity */}
            <Text style={[modalStyles.sectionTitle, { color: theme.textPrimary, marginTop: 14 }]}>2. Time Granularity</Text>
            <View style={modalStyles.pillGroup}>
              {['daily', 'hourly'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[modalStyles.pill, granularity === g && modalStyles.pillActive]}
                  onPress={() => setGranularity(g)}
                >
                  <Text style={[modalStyles.pillText, granularity === g && modalStyles.pillActiveText]}>
                    {g.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 3. Time Horizon */}
            <Text style={[modalStyles.sectionTitle, { color: theme.textPrimary, marginTop: 14 }]}>3. Time Horizon Range</Text>
            <View style={modalStyles.pillGroup}>
              {['1m', '6m', '1y', '3y'].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[modalStyles.pill, range === r && modalStyles.pillActive]}
                  onPress={() => setRange(r)}
                >
                  <Text style={[modalStyles.pillText, range === r && modalStyles.pillActiveText]}>
                    {r.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 4. Meteorological Variables */}
            <Text style={[modalStyles.sectionTitle, { color: theme.textPrimary, marginTop: 14 }]}>4. Meteorological Variables</Text>
            
            {[
              { key: 'temperature', label: 'Temperature (°C)' },
              { key: 'precipitation', label: 'Precipitation (mm)' },
              { key: 'wind', label: 'Wind Speed (km/h)' },
              { key: 'solar', label: 'Solar Radiation (MJ/m²)' },
              { key: 'evapotranspiration', label: 'Evapotranspiration (mm)' },
            ].map((v) => (
              <View key={v.key} style={[modalStyles.toggleRow, { borderBottomColor: theme.borderColor }]}>
                <Text style={{ fontSize: 14, color: theme.textPrimary, fontWeight: '500' }}>{v.label}</Text>
                <Switch
                  value={variables[v.key]}
                  onValueChange={(val) => setVariables((prev) => ({ ...prev, [v.key]: val }))}
                  trackColor={{ false: '#767577', true: '#0d6efd' }}
                />
              </View>
            ))}

            </ScrollView>

            {/* Actions */}
            <View style={{ gap: 8 }}>
              <TouchableOpacity
                style={[modalStyles.exportButton, isExporting && { opacity: 0.7 }]}
                onPress={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={modalStyles.exportButtonText}>📥 Generate & Download CSV Dataset</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  modalStyles.cancelButton,
                  { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)' },
                ]}
                onPress={onClose}
              >
                <Text style={{ color: theme.textPrimary, fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
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
    maxWidth: 480,
    borderRadius: 20,
    padding: 20,
    maxHeight: '85%',
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
    marginBottom: 14,
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
    gap: 8,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  exportButton: {
    backgroundColor: '#198754',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cancelButton: {
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
  },
});
  
