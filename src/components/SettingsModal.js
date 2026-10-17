import React from 'react';
import { Modal, View, Text, TouchableOpacity, Switch, ScrollView } from 'react-native';

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
  onOpenAlerts,
  onOpenAbout,
  theme,
}) => {
  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <View style={{ width: '100%', maxWidth: 450, backgroundColor: theme.cardBg, borderRadius: 16, padding: 20, maxHeight: '85%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.textPrimary }}>⚙️ System Settings</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 22, color: theme.textSecondary, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderColor }}>
              <Text style={{ fontSize: 16, color: theme.textPrimary, fontWeight: '500' }}>Dark Theme</Text>
              <Switch value={isDarkMode} onValueChange={setIsDarkMode} trackColor={{ false: '#767577', true: '#0d6efd' }} />
            </View>

            <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderColor }}>
              <Text style={{ fontSize: 16, color: theme.textPrimary, fontWeight: '500', marginBottom: 8 }}>Temperature Unit</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {['C', 'F', 'K'].map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: tempUnit === u ? '#0d6efd' : theme.inputBg,
                      alignItems: 'center',
                    }}
                    onPress={() => setTempUnit(u)}
                  >
                    <Text style={{ color: tempUnit === u ? '#fff' : theme.textPrimary, fontWeight: 'bold' }}>°{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderColor }}>
              <Text style={{ fontSize: 16, color: theme.textPrimary, fontWeight: '500', marginBottom: 8 }}>Wind Speed Unit</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {['kmh', 'ms', 'mph'].map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: speedUnit === u ? '#0d6efd' : theme.inputBg,
                      alignItems: 'center',
                    }}
                    onPress={() => setSpeedUnit(u)}
                  >
                    <Text style={{ color: speedUnit === u ? '#fff' : theme.textPrimary, fontWeight: 'bold' }}>{u.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderColor }}>
              <Text style={{ fontSize: 16, color: theme.textPrimary, fontWeight: '500', marginBottom: 8 }}>Precipitation Unit</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {['mm', 'inch'].map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: precipUnit === u ? '#0d6efd' : theme.inputBg,
                      alignItems: 'center',
                    }}
                    onPress={() => setPrecipUnit(u)}
                  >
                    <Text style={{ color: precipUnit === u ? '#fff' : theme.textPrimary, fontWeight: 'bold' }}>{u.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ paddingVertical: 10, gap: 10 }}>
              <TouchableOpacity
                style={{ backgroundColor: '#0d6efd', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
                onPress={() => {
                  onClose();
                  if (onOpenAlerts) onOpenAlerts();
                }}
              >
                <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 14 }}>🔔 Configure Atmospheric Alerts</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ backgroundColor: '#198754', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
                onPress={() => {
                  onClose();
                  if (onOpenAbout) onOpenAbout();
                }}
              >
                <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 14 }}>ℹ️ About Developer & Data Credits</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <TouchableOpacity style={{ backgroundColor: theme.borderColor, paddingVertical: 12, borderRadius: 10, alignItems: 'center' }} onPress={onClose}>
            <Text style={{ color: theme.textPrimary, fontWeight: 'bold' }}>Close Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
