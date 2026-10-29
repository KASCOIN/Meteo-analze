import React from 'react';
import { Modal, View, Text, TouchableOpacity, Switch, ScrollView, Linking, Platform, KeyboardAvoidingView, useWindowDimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassView } from './GlassView';
import { getDeviceProfile, getResponsiveScale } from '../styles/responsive';

export const SettingsModal = ({
  isOpen,
  onClose,
  onBack,
  onSave,
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

  const modalWidth = windowWidth < 360 ? windowWidth - 20 : windowWidth < 768 ? Math.min(windowWidth - 28, 450) : 450;
  const modalHeight = Math.min(windowHeight * 0.8, windowWidth < 768 ? 560 : 680);

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(10, 16, 28, 0.38)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <BlurView intensity={isDarkMode ? 18 : 24} tint={isDarkMode ? 'dark' : 'light'} style={{ position: 'absolute', inset: 0 }} />
          <GlassView
            variant="elevated"
            isDarkMode={isDarkMode}
            borderRadius={26}
            intensity={50}
            contentStyle={{ flex: 1, minHeight: 0 }}
            style={{
              width: modalWidth,
              maxWidth: modalWidth,
              height: modalHeight,
              maxHeight: modalHeight,
              padding: windowWidth < 360 ? 16 : 22,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <View style={{ flex: 1, minHeight: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 }}>
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

                <Text style={{ fontSize: 20, fontWeight: '800', color: theme.textPrimary, flex: 1, textAlign: 'center' }}>⚙️ Settings</Text>
              </View>

              <ScrollView
                style={{ flex: 1, minHeight: 0, marginBottom: 14 }}
                contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 28, 28), paddingHorizontal: 2 }}
                nestedScrollEnabled={Platform.OS === 'android'}
                bounces={false}
                showsVerticalScrollIndicator={false}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderColor }}>
                  <Text style={{ fontSize: 15, color: theme.textPrimary, fontWeight: '600' }}>Dark Theme Mode</Text>
                  <Switch value={isDarkMode} onValueChange={setIsDarkMode} trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#1a73e8' }} />
                </View>

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
                  backgroundColor: '#1a73e8',
                  paddingVertical: 12,
                  borderRadius: 14,
                  alignItems: 'center',
                  width: '100%',
                }}
                onPress={onOpenAlerts}
              >
                <Text style={{ color: '#fff', fontWeight: '800', letterSpacing: 0.2 }}>Configure System Alerts</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#1a73e8',
                  paddingVertical: 12,
                  borderRadius: 14,
                  alignItems: 'center',
                  width: '100%',
                  marginTop: 10,
                }}
                onPress={onSave}
              >
                <Text style={{ color: '#fff', fontWeight: '800', letterSpacing: 0.2 }}>Save Settings</Text>
              </TouchableOpacity>
            </View>
          </GlassView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
