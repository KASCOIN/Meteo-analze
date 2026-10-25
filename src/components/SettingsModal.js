import React from 'react';
import { Modal, View, Text, TouchableOpacity, Switch, ScrollView, Linking, Platform, KeyboardAvoidingView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassView } from './GlassView';
import { getDeviceProfile, getResponsiveScale } from '../styles/responsive';

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

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const deviceProfile = getDeviceProfile(windowWidth, windowHeight);
  const responsiveScale = getResponsiveScale(windowWidth);

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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <GlassView
            variant="elevated"
            isDarkMode={isDarkMode}
            borderRadius={26}
            intensity={50}
            style={{
              width: '100%',
              maxWidth: deviceProfile === 'tablet' || deviceProfile === 'largeTablet' ? 540 : 450,
              padding: windowWidth < 360 ? 16 : 22,
              maxHeight: '85%',
              height: '85%',
              minHeight: 0,
              flex: 1,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 21, fontWeight: '800', color: theme.textPrimary }}>⚙️ System Settings</Text>
              <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                <Text style={{ fontSize: 22, color: theme.textSecondary, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ marginBottom: 14, flexGrow: 1, minHeight: 0, maxHeight: '100%' }}
              contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 16, 24), flexGrow: 1 }}
              nestedScrollEnabled={Platform.OS === 'android'}
              bounces={false}
              showsVerticalScrollIndicator={false}
            >
            {/* Theme Toggle */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderColor }}>
              <Text style={{ fontSize: 15, color: theme.textPrimary, fontWeight: '600' }}>Dark Theme Mode</Text>
              <Switch value={isDarkMode} onValueChange={setIsDarkMode} trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#1a73e8' }} />
            </View>

            {/* Units Selection */}
            <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderColor }}>
              <Text style={{ fontSize: 14, color: theme.textPrimary, fontWeight: '600', marginBottom: 10 }}>Temperature Unit</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['C', 'F', 'K'].map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 14,
                      backgroundColor: tempUnit === u ? '#1a73e8' : theme.inputBg,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: tempUnit === u ? '#1a73e8' : theme.borderColor,
                    }}
                    onPress={() => setTempUnit(u)}
                  >
                    <Text style={{ color: tempUnit === u ? '#fff' : theme.textPrimary, fontWeight: 'bold' }}>°{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderColor }}>
              <Text style={{ fontSize: 14, color: theme.textPrimary, fontWeight: '600', marginBottom: 10 }}>Wind Speed Unit</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['kmh', 'ms', 'mph'].map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 14,
                      backgroundColor: speedUnit === u ? '#1a73e8' : theme.inputBg,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: speedUnit === u ? '#1a73e8' : theme.borderColor,
                    }}
                    onPress={() => setSpeedUnit(u)}
                  >
                    <Text style={{ color: speedUnit === u ? '#fff' : theme.textPrimary, fontWeight: 'bold' }}>{u.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* In-App Data Credits & Developer Info */}
            <View style={{ borderTopWidth: 1, borderTopColor: theme.borderColor, paddingTop: 14 }}>
              <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#34a853', letterSpacing: 0.5, marginBottom: 10 }}>
                DATA CREDITS & DEVELOPER CONTACT
              </Text>

              <TouchableOpacity style={{ backgroundColor: theme.inputBg, padding: 12, borderRadius: 14, marginBottom: 8, borderWidth: 1, borderColor: theme.borderLight }} onPress={handleSendEmail}>
                <Text style={{ fontSize: 11, color: theme.textSecondary }}>Email Support</Text>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: theme.textPrimary, marginTop: 2 }}>✉️ {EMAIL_ADDRESS}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{ backgroundColor: theme.inputBg, padding: 12, borderRadius: 14, marginBottom: 8, borderWidth: 1, borderColor: theme.borderLight }} onPress={() => handleOpenLink(PORTFOLIO_URL)}>
                <Text style={{ fontSize: 11, color: theme.textSecondary }}>Developer Portfolio</Text>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#1a73e8', marginTop: 2 }}>🌐 View Portfolio ↗</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{ backgroundColor: theme.inputBg, padding: 12, borderRadius: 14, marginBottom: 8, borderWidth: 1, borderColor: theme.borderLight }} onPress={() => handleOpenLink(GITHUB_URL)}>
                <Text style={{ fontSize: 11, color: theme.textSecondary }}>Source Code</Text>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#1a73e8', marginTop: 2 }}>💻 GitHub Repository ↗</Text>
              </TouchableOpacity>

              <View style={{ backgroundColor: theme.inputBg, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: theme.borderLight }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.textPrimary }}>🌤️ Open-Meteo API</Text>
                <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 3, lineHeight: 16 }}>
                  Global model outputs & reanalysis weather datasets licensed under CC BY 4.0.
                </Text>
              </View>
            </View>
            </ScrollView>

            <TouchableOpacity
              style={{
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
                paddingVertical: 12,
                borderRadius: 14,
                alignItems: 'center',
              }}
              onPress={onClose}
            >
              <Text style={{ color: theme.textPrimary, fontWeight: 'bold' }}>Close Settings</Text>
            </TouchableOpacity>
          </GlassView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
