import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const OfflineBanner = ({ isOffline }) => {
  if (!isOffline) return null;

  return (
    <View style={bannerStyles.container}>
      <Text style={bannerStyles.text}>
        📡 Offline Mode — Displaying Cached Telemetry (Auto-updates when reconnected)
      </Text>
    </View>
  );
};

const bannerStyles = StyleSheet.create({
  container: {
    backgroundColor: '#fd7e14',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '800',
    textAlign: 'center',
  },
});
