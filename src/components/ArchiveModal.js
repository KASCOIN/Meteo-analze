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
import { exportArchiveCSV } from '../services/csvExporter';
import { styles } from '../styles/globalStyles';

export const ArchiveModal = ({ isOpen, onClose, defaultLocation, theme }) => {
  const [archiveLocation, setArchiveLocation] = useState(defaultLocation);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [granularity, setGranularity] = useState('daily');
  const [range, setRange] = useState('6m');
  const [selectedVars, setSelectedVars] = useState({
    temperature: true,
    precipitation: true,
    wind: true,
    solar: false,
    evapotranspiration: false,
  });
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const count = await exportArchiveCSV({
        location: archiveLocation,
        range,
        granularity,
        variables: selectedVars,
      });
      alert(`CSV Export completed successfully with ${count} records!`);
      setIsExporting(false);
    } catch (err) {
      alert(err.message || 'Export failed.');
      setIsExporting(false);
    }
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Professional Climate Archive</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 20, color: theme.textSecondary }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 450 }} keyboardShouldPersistTaps="handled">
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>1. Target Archive Location</Text>
            <View style={styles.searchSection}>
              <TextInput
                style={[styles.searchInput, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.borderColor }]}
                placeholder="Search archive city..."
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
                    key={`arch-${item.id}-${item.latitude}-${item.longitude}`}
                    style={[styles.resultItem, { borderBottomColor: theme.borderColor }]}
                    onPress={() => {
                      setArchiveLocation({
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
              Selected: 📍 {archiveLocation.name} ({archiveLocation.latitude.toFixed(2)}°N, {archiveLocation.longitude.toFixed(2)}°E)
            </Text>

            <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 15 }]}>2. Time Granularity</Text>
            <View style={styles.pickerGroup}>
              {['daily', 'hourly'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.pickerOption, granularity === g && styles.pickerOptionActive]}
                  onPress={() => setGranularity(g)}
                >
                  <Text style={[styles.pickerText, granularity === g && styles.pickerTextActive]}>
                    {g.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 15 }]}>3. Time Horizon Range</Text>
            <View style={styles.pickerGroup}>
              {['1m', '6m', '1y', '3y'].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.pickerOption, range === r && styles.pickerOptionActive]}
                  onPress={() => setRange(r)}
                >
                  <Text style={[styles.pickerText, range === r && styles.pickerTextActive]}>
                    {r.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 15 }]}>4. Meteorological Variables</Text>
            {Object.keys(selectedVars).map((vKey) => (
              <View key={vKey} style={styles.checkboxRow}>
                <Text style={[styles.checkboxLabel, { color: theme.textPrimary }]}>
                  {vKey.charAt(0).toUpperCase() + vKey.slice(1)}
                </Text>
                <Switch
                  value={selectedVars[vKey]}
                  onValueChange={(val) => setSelectedVars({ ...selectedVars, [vKey]: val })}
                />
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.exportButton} onPress={handleExport} disabled={isExporting}>
            {isExporting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.exportButtonText}>📥 Generate & Download CSV Dataset</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
    
