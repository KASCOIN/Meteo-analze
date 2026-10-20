import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { GlassView } from './GlassView';

export const OfflineBanner = ({ isOffline }) => {
  if (!isOffline) return null;

  return (
    <GlassView
      variant="chip"
      borderRadius={16}
      style={bannerStyles.container}
    >
      <Text style={bannerStyles.text}>
        📡 Offline Mode — Displaying Cached Telemetry (Auto-updates when reconnected)
      </Text>
    </GlassView>
  );
};

const bannerStyles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(249, 171, 0, 0.28)',
    borderColor: 'rgba(249, 171, 0, 0.6)',
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
});
