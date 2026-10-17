import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';

export const Footer = ({ theme }) => {
  if (Platform.OS !== 'web') return null;

  const EMAIL_ADDRESS = 'nwosukasie@gmail.com';
  const GITHUB_URL = 'https://github.com/KASCOIN';
  const PORTFOLIO_URL = 'https://mazimum.onrender.com/';

  const handleOpenLink = (url) => {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  const handleSendEmail = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `mailto:${EMAIL_ADDRESS}?subject=Meteo%20Analaze%20Inquiry`;
    }
  };

  return (
    <View style={[footerStyles.container, { borderTopColor: theme.borderColor, backgroundColor: theme.cardBg }]}>
      <View style={footerStyles.innerContent}>
        {/* Brand Section */}
        <View style={footerStyles.brandSection}>
          <Text style={[footerStyles.brandTitle, { color: theme.textPrimary }]}>Meteo Analaze ☁️</Text>
          <Text style={[footerStyles.brandSub, { color: theme.textSecondary }]}>
            High-Precision Atmospheric Research & Real-Time Meteorological Telemetry Platform.
          </Text>
        </View>

        {/* Developer Contact Links */}
        <View style={footerStyles.linksSection}>
          <Text style={[footerStyles.sectionHeader, { color: theme.textPrimary }]}>Developer Contact</Text>
          <TouchableOpacity onPress={handleSendEmail} style={footerStyles.linkItem}>
            <Text style={{ fontSize: 13, color: '#0d6efd', fontWeight: '600' }}>✉️ {EMAIL_ADDRESS}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleOpenLink(PORTFOLIO_URL)} style={footerStyles.linkItem}>
            <Text style={{ fontSize: 13, color: '#0d6efd', fontWeight: '600' }}>🌐 Developer Portfolio ↗</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleOpenLink(GITHUB_URL)} style={footerStyles.linkItem}>
            <Text style={{ fontSize: 13, color: '#0d6efd', fontWeight: '600' }}>💻 GitHub Repository ↗</Text>
          </TouchableOpacity>
        </View>

        {/* Data Credits */}
        <View style={footerStyles.creditsSection}>
          <Text style={[footerStyles.sectionHeader, { color: theme.textPrimary }]}>Data Credits & Attribution</Text>
          <TouchableOpacity onPress={() => handleOpenLink('https://open-meteo.com/')} style={footerStyles.creditItem}>
            <Text style={[footerStyles.creditTitle, { color: theme.textPrimary }]}>🌤️ Open-Meteo Weather API</Text>
            <Text style={[footerStyles.creditBody, { color: theme.textSecondary }]}>
              Global model outputs & reanalysis weather datasets licensed under CC BY 4.0.
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleOpenLink('https://open-meteo.com/en/docs/geocoding-api')} style={footerStyles.creditItem}>
            <Text style={[footerStyles.creditTitle, { color: theme.textPrimary }]}>🗺️ OpenStreetMap & GeoNames</Text>
            <Text style={[footerStyles.creditBody, { color: theme.textSecondary }]}>
              Spatial geocoding database powering global location search.
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[footerStyles.bottomBar, { borderTopColor: theme.borderColor }]}>
        <Text style={[footerStyles.copyrightText, { color: theme.textSecondary }]}>
          © {new Date().getFullYear()} Meteo Analaze. Engineered for meteorological research and field observations.
        </Text>
      </View>
    </View>
  );
};

const footerStyles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 18,
    marginTop: 30,
    width: '100%',
    borderRadius: 16,
  },
  innerContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
    marginBottom: 18,
  },
  brandSection: {
    flex: 1,
    minWidth: 220,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  brandSub: {
    fontSize: 12,
    lineHeight: 18,
  },
  linksSection: {
    flex: 1,
    minWidth: 180,
  },
  creditsSection: {
    flex: 1,
    minWidth: 220,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  linkItem: {
    paddingVertical: 3,
  },
  creditItem: {
    marginBottom: 6,
  },
  creditTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  creditBody: {
    fontSize: 11,
    lineHeight: 15,
  },
  bottomBar: {
    borderTopWidth: 1,
    paddingTop: 12,
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 11,
    textAlign: 'center',
  },
});
          
