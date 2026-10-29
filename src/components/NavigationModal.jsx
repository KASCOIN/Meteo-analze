import React from 'react';
import { Modal, View, Text, TouchableOpacity, Platform } from 'react-native';

export const NavigationModal = ({
  isOpen,
  onClose,
  onOpenArchive,
  onOpenSettings,
  onOpenNotifications,
  onOpenCompass,
  isDarkMode,
  notifyBadgeColor,
  theme,
}) => {
  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(10, 16, 28, 0.38)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 18,
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: Math.min(Platform.OS === 'web' ? 420 : 420, 420),
            backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.94)',
            borderRadius: 24,
            borderWidth: 1,
            borderColor: theme.borderColor,
            padding: 18,
          }}
        >
          <Text style={{ color: theme.textPrimary, fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 18 }}>
            ☁️ Meteo Menu
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: '#1e8e3e',
              paddingVertical: 14,
              borderRadius: 16,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 14,
            }}
            onPress={onOpenArchive}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>📊 Climate Data Archive</Text>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18 }}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#0ea5e9',
              paddingVertical: 14,
              borderRadius: 16,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 14,
            }}
            onPress={onOpenCompass}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>🧭 Digital Compass HUD</Text>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18 }}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: notifyBadgeColor,
              paddingVertical: 14,
              borderRadius: 16,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 14,
            }}
            onPress={onOpenNotifications}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>🔔 Notifications</Text>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18 }}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#1a73e8',
              paddingVertical: 14,
              borderRadius: 16,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 14,
            }}
            onPress={onOpenSettings}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>⚙️ Settings</Text>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18 }}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              marginTop: 6,
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)',
              borderRadius: 12,
              paddingVertical: 12,
            }}
            onPress={onClose}
          >
            <Text style={{ color: theme.textPrimary, fontWeight: '700', textAlign: 'center' }}>Close Menu</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
