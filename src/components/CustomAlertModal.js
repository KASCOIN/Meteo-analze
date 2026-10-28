import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassView } from './GlassView';

export const CustomAlertModal = ({ visible, title, message, type = 'info', onClose, theme }) => {
  if (!visible) return null;

  const isDarkMode = theme?.textPrimary !== '#0f172a';

  const getTypeStyle = () => {
    switch (type) {
      case 'success':
        return { iconName: 'checkmark-circle', accent: '#22c55e', badgeBg: 'rgba(34, 197, 94, 0.15)', cardBg: '#1e293b' };
      case 'warning':
        return { iconName: 'warning', accent: '#eab308', badgeBg: 'rgba(234, 179, 8, 0.15)', cardBg: '#1e293b' };
      case 'error':
        return { iconName: 'alert-circle', accent: '#ef4444', badgeBg: 'rgba(239, 68, 68, 0.15)', cardBg: '#1e293b' };
      default:
        return { iconName: 'warning', accent: '#eab308', badgeBg: 'rgba(234, 179, 8, 0.15)', cardBg: '#1e293b' };
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
              backgroundColor: styleConfig.cardBg,
              borderColor: '#334155',
            },
          ]}
        >
          <View style={[alertStyles.iconBadge, { backgroundColor: styleConfig.badgeBg, borderColor: '#334155' }]}>
            <Ionicons name={styleConfig.iconName} size={28} color={styleConfig.accent} />
          </View>

          <Text style={[alertStyles.title, { color: '#ffffff' }]}>
            {title || 'Settings Saved'}
          </Text>

          <Text style={[alertStyles.message, { color: '#94a3b8' }]}>
            {message || 'Your weather alert preferences and telemetry locations have been updated successfully.'}
          </Text>

          <TouchableOpacity
            style={[alertStyles.confirmButton, { backgroundColor: '#22c55e' }]}
            onPress={onClose}
          >
            <Text style={alertStyles.confirmButtonText}>OK, Got It</Text>
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
    borderWidth: 1,
    borderRadius: 20,
    ...Platform.select({
      web: { boxShadow: '0 16px 40px rgba(0,0,0,0.4)' },
      default: { elevation: 10 },
    }),
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    color: '#ffffff',
    marginTop: 12,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    color: '#94a3b8',
    marginTop: 8,
    marginBottom: 18,
  },
  confirmButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
  },
});
