import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';

export const Footer = ({ theme, onOpenAbout }) => {
  // Return null on native mobile builds (APK) so it renders strictly on web
  if (Platform.OS !== 'web') return null;

  const EMAIL_ADDRESS = 'nwosu.kasie@gmail.com';
  const GITHUB_URL = 'https://github.com/KASCOIN';
  const PORTFOLIO_URL = 'https://yourportfolio.com';

  const handleOpenLink = (url) => {
    window.open(url, '_blank');
  };

  const handleSendEmail = () => {
    window.location.href = `mailto:${EMAIL_ADDRESS}?subject=Meteo%20Analaze%20Inquiry`;
  };

  return (
    <View style={[footerStyles.container, { borderTopColor: theme.borderColor }]}>
      <Text style={[footerStyles.brandTitle, { color: theme.textPrimary }]}>Meteo Analaze ☁️</Text>
      <Text style={[footerStyles.subText, { color: theme.textSecondary }]}>
        Real-Time Atmospheric & Climatological Research Suite
      </Text>

      {/* Quick Contact & Developer Links */}
      <View style={footerStyles.linkRow}>
        <TouchableOpacity onPress={handleSendEmail} style={footerStyles.linkButton}>
          <Text style={{ fontSize: 13, color: '#0d6efd', fontWeight: 'bold' }}>✉️ {EMAIL_ADDRESS}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleOpenLink(GITHUB_URL)} style={footerStyles.linkButton}>
          <Text style={{ fontSize: 13, color: '#0d6efd', fontWeight: 'bold' }}>💻 GitHub</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleOpenLink(PORTFOLIO_URL)} style={footerStyles.linkButton}>
          <Text style={{ fontSize: 13, color: '#0d6efd', fontWeight: 'bold' }}>🌐 Portfolio</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onOpenAbout} style={footerStyles.linkButton}>
          <Text style={{ fontSize: 13, color: '#198754', fontWeight: 'bold' }}>ℹ️ Data Credits</Text>
        </TouchableOpacity>
      </View>

      <Text style={[footerStyles.copyright, { color: theme.textSecondary }]}>
        Data provided by Open-Meteo CC BY 4.0 | © {new Date().getFullYear()} Meteo Analaze.
      </Text>
    </View>
  );
};

const footerStyles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingTop: 20,
    paddingBottom: 30,
    marginTop: 30,
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subText: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  linkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 14,
  },
  linkButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  copyright: {
    fontSize: 11,
    textAlign: 'center',
  },
});
                        
