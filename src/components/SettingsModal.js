import React from 'react';
import { Modal, View, Text, TouchableOpacity, Switch } from 'react-native';
import { styles } from '../styles/globalStyles';

export const SettingsModal = ({
  isOpen,
  onClose,
  isDarkMode,
  setIsDarkMode,
  tempUnit,
  setTempUnit,
  speedUnit,
  setSpeedUnit,
  precipUnit,
  setPrecipUnit,
  theme,
}) => {
  return (
    <Modal visible={isOpen} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Application Settings</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 20, color: theme.textSecondary }}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Dark Mode</Text>
            <Switch value={isDarkMode} onValueChange={(val) => setIsDarkMode(val)} />
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Temperature Unit</Text>
            <View style={styles.unitToggleGroup}>
              <TouchableOpacity
                style={[styles.unitOption, tempUnit === 'C' && styles.unitActive]}
                onPress={() => setTempUnit('C')}
              >
                <Text style={[styles.unitText, tempUnit === 'C' && styles.unitActiveText]}>°C</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.unitOption, tempUnit === 'F' && styles.unitActive]}
                onPress={() => setTempUnit('F')}
              >
                <Text style={[styles.unitText, tempUnit === 'F' && styles.unitActiveText]}>°F</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Wind Speed Unit</Text>
            <View style={styles.unitToggleGroup}>
              {['kmh', 'ms', 'mph'].map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[styles.unitOption, speedUnit === u && styles.unitActive]}
                  onPress={() => setSpeedUnit(u)}
                >
                  <Text style={[styles.unitText, speedUnit === u && styles.unitActiveText]}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Precipitation Unit</Text>
            <View style={styles.unitToggleGroup}>
              {['mm', 'in'].map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[styles.unitOption, precipUnit === u && styles.unitActive]}
                  onPress={() => setPrecipUnit(u)}
                >
                  <Text style={[styles.unitText, precipUnit === u && styles.unitActiveText]}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
            Meteorological Engine v4.0{'\n'}Modular Architecture for Expo EAS Build
          </Text>
        </View>
      </View>
    </Modal>
  );
};
                           
