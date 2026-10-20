import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { GlassView } from './GlassView';

export const CustomAlertModal = ({ visible, title, message, type = 'info', onClose, theme }) => {
  if (!visible) return null;

  const isDarkMode = theme?.textPrimary !== '#0f172a';

  const getTypeStyle = () => {
    switch (type) {
      case 'success':
        return { icon: '✅', accent: '#1e8e3e', badgeBg: 'rgba(30, 142, 62, 0.2)' };
      case 'warning':
        return { icon: '⚠️', accent: '#f9ab00', badgeBg: 'rgba(249, 171, 0, 0.2)' };
      case 'error':
        return { icon: '❌', accent: '#d93025', badgeBg: 'rgba(217, 48, 37, 0.2)' };
      default:
        return { icon: '🔔', accent: '#1a73e8', badgeBg: 'rgba(26, 115, 232, 0.2)' };
    }
  };

  const styleConfig = getTypeStyle();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={alertStyles.backdrop}>
        <GlassView
          variant="elevated"
          isDarkMode={isDarkMode}
          borderRadius={24}
          intensity={50}
          style={[
            alertStyles.card,
            {
              borderColor: styleConfig.accent,
            },
          ]}
        >
          <View style={[alertStyles.iconBadge, { backgroundColor: styleConfig.badgeBg }]}>
            <Text style={{ fontSize: 28 }}>{styleConfig.icon}</Text>
          </View>

          <Text style={[alertStyles.title, { color: theme?.textPrimary || '#ffffff' }]}>
            {title}
          </Text>

          <Text style={[alertStyles.message, { color: theme?.textSecondary || '#cbd5e1' }]}>
            {message}
          </Text>

          <TouchableOpacity
            style={[alertStyles.confirmButton, { backgroundColor: styleConfig.accent }]}
            onPress={onClose}
          >
            <Text style={alertStyles.confirmButtonText}>OK, Got it</Text>
          </TouchableOpacity>
        </GlassView>
      </View>
    </Modal>
  );
};

const alertStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    ...Platform.select({
      web: { boxShadow: '0 16px 40px rgba(0,0,0,0.4)' },
      default: { elevation: 12 },
    }),
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  confirmButton: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14.5,
  },
});
