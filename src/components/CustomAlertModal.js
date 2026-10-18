import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

export const CustomAlertModal = ({ visible, title, message, type = 'info', onClose, theme }) => {
  if (!visible) return null;

  const getTypeStyle = () => {
    switch (type) {
      case 'success':
        return { icon: '✅', accent: '#198754', badgeBg: 'rgba(25, 135, 84, 0.15)' };
      case 'warning':
        return { icon: '⚠️', accent: '#fd7e14', badgeBg: 'rgba(253, 126, 20, 0.15)' };
      case 'error':
        return { icon: '❌', accent: '#dc3545', badgeBg: 'rgba(220, 53, 69, 0.15)' };
      default:
        return { icon: '🔔', accent: '#0d6efd', badgeBg: 'rgba(13, 110, 253, 0.15)' };
    }
  };

  const styleConfig = getTypeStyle();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={alertStyles.backdrop}>
        <View
          style={[
            alertStyles.card,
            {
              backgroundColor: theme?.cardBg || '#1e293b',
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
        </View>
      </View>
    </Modal>
  );
};

const alertStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1.5,
    ...Platform.select({
      web: { boxShadow: '0 12px 32px rgba(0,0,0,0.5)' },
      default: { elevation: 12 },
    }),
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },
  confirmButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
});
            
