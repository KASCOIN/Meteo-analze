import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, Linking, Platform, useWindowDimensions } from 'react-native';
import { getDeviceProfile, getResponsiveScale } from '../styles/responsive';

export const AboutModal = ({ isOpen, onClose, theme }) => {
  if (!isOpen) return null;

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const deviceProfile = getDeviceProfile(windowWidth, windowHeight);
  const responsiveScale = getResponsiveScale(windowWidth);

  // =========================================================================
  // REPLACE THESE PLACEHOLDER LINKS WITH YOUR ACTUAL URLS BEFORE COMMIT:
  // =========================================================================
  const PORTFOLIO_URL = 'https://mazimum.onrender.com/'; // <--- ADD YOUR PORTFOLIO URL HERE
  const GITHUB_URL = 'https://github.com/KASCOIN';  // <--- ADD YOUR GITHUB PROFILE URL HERE
  const EMAIL_ADDRESS = 'nwosukasie@gmail.com';

  const handleOpenLink = (url) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url).catch((err) => alert('Could not open link: ' + err.message));
    }
  };

  const handleSendEmail = () => {
    const mailtoUrl = `mailto:${EMAIL_ADDRESS}?subject=MaziCli%20Suite%20Inquiry`;
    if (Platform.OS === 'web') {
      window.location.href = mailtoUrl;
    } else {
      Linking.openURL(mailtoUrl);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <View style={{
          width: '100%',
          maxWidth: deviceProfile === 'tablet' || deviceProfile === 'largeTablet' ? 560 : 480,
          backgroundColor: theme.cardBg,
          borderRadius: 20,
          padding: windowWidth < 360 ? 16 : 22,
          maxHeight: '85%',
        }}>
          
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: theme.textPrimary }}>ℹ️ About & Data Credits</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 22, color: theme.textSecondary, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ marginBottom: 16 }}
            contentContainerStyle={{ paddingBottom: 8 }}
            nestedScrollEnabled={Platform.OS === 'android'}
            bounces={false}
            showsVerticalScrollIndicator={false}
          >
            
            {/* Developer Contact Section */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#0d6efd', letterSpacing: 0.5, marginBottom: 8 }}>
                DEVELOPER CONTACT
              </Text>
              
              {/* Email */}
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.inputBg,
                  padding: 12,
                  borderRadius: 12,
                  marginBottom: 8,
                }}
                onPress={handleSendEmail}
              >
                <Text style={{ fontSize: 18, marginRight: 10 }}>✉️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: theme.textSecondary, fontWeight: '600' }}>Email Contact</Text>
                  <Text style={{ fontSize: 14, color: theme.textPrimary, fontWeight: 'bold' }}>{EMAIL_ADDRESS}</Text>
                </View>
              </TouchableOpacity>

              {/* Portfolio Link */}
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.inputBg,
                  padding: 12,
                  borderRadius: 12,
                  marginBottom: 8,
                }}
                onPress={() => handleOpenLink(PORTFOLIO_URL)}
              >
                <Text style={{ fontSize: 18, marginRight: 10 }}>🌐</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: theme.textSecondary, fontWeight: '600' }}>Personal Portfolio</Text>
                  <Text style={{ fontSize: 14, color: '#0d6efd', fontWeight: 'bold' }}>View Developer Portfolio ↗</Text>
                </View>
              </TouchableOpacity>

              {/* GitHub Link */}
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.inputBg,
                  padding: 12,
                  borderRadius: 12,
                }}
                onPress={() => handleOpenLink(GITHUB_URL)}
              >
                <Text style={{ fontSize: 18, marginRight: 10 }}>💻</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: theme.textSecondary, fontWeight: '600' }}>GitHub Repository</Text>
                  <Text style={{ fontSize: 14, color: '#0d6efd', fontWeight: 'bold' }}>View Source Code on GitHub ↗</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Data Provider Credits Section */}
            <View style={{ borderTopWidth: 1, borderTopColor: theme.borderColor, paddingTop: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#198754', letterSpacing: 0.5, marginBottom: 8 }}>
                METEOROLOGICAL DATA ACKNOWLEDGMENTS
              </Text>
              
              <Text style={{ fontSize: 13, color: theme.textPrimary, lineHeight: 19, marginBottom: 12 }}>
                MaziCli Suite utilizes open-access meteorological model outputs and reanalysis datasets provided by the following scientific services:
              </Text>

              {/* Open-Meteo Credit */}
              <TouchableOpacity
                style={{
                  backgroundColor: theme.inputBg,
                  padding: 12,
                  borderRadius: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: '#0d6efd',
                  marginBottom: 8,
                }}
                onPress={() => handleOpenLink('https://open-meteo.com/')}
              >
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.textPrimary }}>🌤️ Open-Meteo Weather API</Text>
                <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
                  Provides real-time forecasts, 15-minute high-resolution surface data, and historical reanalysis time-series under CC BY 4.0 license.
                </Text>
              </TouchableOpacity>

              {/* Geocoding Service Credit */}
              <TouchableOpacity
                style={{
                  backgroundColor: theme.inputBg,
                  padding: 12,
                  borderRadius: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: '#198754',
                }}
                onPress={() => handleOpenLink('https://open-meteo.com/en/docs/geocoding-api')}
              >
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.textPrimary }}>🗺️ Open-Meteo Geocoding Engine</Text>
                <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
                  Global spatial location search powered by OpenStreetMap & GeoNames administrative databases.
                </Text>
              </TouchableOpacity>
            </View>

          </ScrollView>

          <TouchableOpacity
            style={{ backgroundColor: theme.borderColor, paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
            onPress={onClose}
          >
            <Text style={{ color: theme.textPrimary, fontWeight: 'bold' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
    
