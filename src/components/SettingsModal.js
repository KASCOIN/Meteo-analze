import React from 'react';
import { Modal, View, Text, TouchableOpacity, Switch, ScrollView, Linking, Platform } from 'react-native';

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
  theme,
}) => {
  if (!isOpen) return null;

  const EMAIL_ADDRESS = 'nwosukasie@gmail.com';
  const GITHUB_URL = 'https://github.com/KASCOIN';
  const PORTFOLIO_URL = 'https://mazimum.onrender.com/';

  const handleOpenLink = (url) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url).catch((err) => alert('Could not open link: ' + err.message));
    }
  };

  const handleSendEmail = () => {
    const mailtoUrl = `mailto:${EMAIL_ADDRESS}?subject=Meteo%20Analaze%20Inquiry`;
    if (Platform.OS === 'web') {
      window.location.href = mailtoUrl;
    } else {
      Linking.openURL(mailtoUrl);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <View style={{ width: '100%', maxWidth: 450, backgroundColor: theme.cardBg, borderRadius: 18, padding: 20, maxHeight: '88%' }}>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: theme.textPrimary }}>⚙️ System Settings</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Text style={{ fontSize: 22, color: theme.textSecondary, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ marginBottom: 14 }}>
            {/* Theme Toggle */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.borderColor }}>
              <Text style={{ fontSize: 15, color: theme.textPrimary, fontWeight: '600' }}>Dark Theme Mode</Text>
              <Switch value={isDarkMode} onValueChange={setIsDarkMode} trackColor={{ false: '#767577', true: '#0d6efd' }} />
            </View>

            {/* Units Selection */}
            <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.borderColor }}>
              <Text style={{ fontSize: 14, color: theme.textPrimary, fontWeight: '600', marginBottom: 8 }}>Temperature Unit</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['C', 'F', 'K'].map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={{ flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: tempUnit === u ? '#0d6efd' : theme.inputBg, alignItems: 'center' }}
                    onPress={() => setTempUnit(u)}
                  >
                    <Text style={{ color: tempUnit === u ? '#fff' : theme.textPrimary, fontWeight: 'bold' }}>°{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.borderColor }}>
              <Text style={{ fontSize: 14, color: theme.textPrimary, fontWeight: '600', marginBottom: 8 }}>Wind Speed Unit</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['kmh', 'ms', 'mph'].map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={{ flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: speedUnit === u ? '#0d6efd' : theme.inputBg, alignItems: 'center' }}
                    onPress={() => setSpeedUnit(u)}
                  >
                    <Text style={{ color: speedUnit === u ? '#fff' : theme.textPrimary, fontWeight: 'bold' }}>{u.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Actions */}
            <View style={{ paddingVertical: 12 }}>
              <TouchableOpacity
                style={{ backgroundColor: '#0d6efd', paddingVertical: 11, borderRadius: 10, alignItems: 'center', marginBottom: 8 }}
                onPress={() => {
                  onClose();
                  if (onOpenAlerts) onOpenAlerts();
                }}
              >
                <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 14 }}>🔔 Configure System Alerts</Text>
              </TouchableOpacity>
            </View>

            {/* In-App Data Credits & Developer Info */}
            <View style={{ borderTopWidth: 1, borderTopColor: theme.borderColor, paddingTop: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#198754', letterSpacing: 0.5, marginBottom: 8 }}>
                DATA CREDITS & DEVELOPER CONTACT
              </Text>

              <TouchableOpacity style={{ backgroundColor: theme.inputBg, padding: 10, borderRadius: 10, marginBottom: 6 }} onPress={handleSendEmail}>
                <Text style={{ fontSize: 11, color: theme.textSecondary }}>Email Support</Text>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: theme.textPrimary }}>✉️ {EMAIL_ADDRESS}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{ backgroundColor: theme.inputBg, padding: 10, borderRadius: 10, marginBottom: 6 }} onPress={() => handleOpenLink(PORTFOLIO_URL)}>
                <Text style={{ fontSize: 11, color: theme.textSecondary }}>Developer Portfolio</Text>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#0d6efd' }}>🌐 View Portfolio ↗</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{ backgroundColor: theme.inputBg, padding: 10, borderRadius: 10, marginBottom: 8 }} onPress={() => handleOpenLink(GITHUB_URL)}>
                <Text style={{ fontSize: 11, color: theme.textSecondary }}>Source Code</Text>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#0d6efd' }}>💻 GitHub Repository ↗</Text>
              </TouchableOpacity>

              <View style={{ backgroundColor: theme.inputBg, padding: 10, borderRadius: 10 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.textPrimary }}>🌤️ Open-Meteo API</Text>
                <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>
                  Global model outputs & reanalysis weather datasets licensed under CC BY 4.0.
                </Text>
              </View>
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
              
