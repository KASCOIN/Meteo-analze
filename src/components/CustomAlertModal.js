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
        return {
          iconName: 'checkmark-circle',
          accent: '#22c55e',
          badgeBg: 'rgba(34, 197, 94, 0.16)',
          buttonBg: '#22c55e',
          cardBg: isDarkMode ? '#101827' : '#f8fafc',
          borderColor: isDarkMode ? 'rgba(148, 163, 184, 0.18)' : 'rgba(15, 23, 42, 0.08)',
          titleColor: isDarkMode ? '#f8fafc' : '#0f172a',
          messageColor: isDarkMode ? '#cbd5e1' : '#475569',
        };
      case 'warning':
        return {
          iconName: 'warning',
          accent: '#f59e0b',
          badgeBg: 'rgba(245, 158, 11, 0.14)',
          buttonBg: '#f59e0b',
          cardBg: isDarkMode ? '#111827' : '#fffaf0',
          borderColor: isDarkMode ? 'rgba(251, 191, 36, 0.2)' : 'rgba(245, 158, 11, 0.18)',
          titleColor: isDarkMode ? '#f8fafc' : '#111827',
          messageColor: isDarkMode ? '#dbeafe' : '#475569',
        };
      case 'error':
        return {
          iconName: 'alert-circle',
          accent: '#ef4444',
          badgeBg: 'rgba(239, 68, 68, 0.14)',
          buttonBg: '#ef4444',
          cardBg: isDarkMode ? '#111827' : '#fff5f5',
          borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.16)',
          titleColor: isDarkMode ? '#f8fafc' : '#111827',
          messageColor: isDarkMode ? '#fecaca' : '#475569',
        };
      default:
        return {
          iconName: 'information-circle',
          accent: '#3b82f6',
          badgeBg: 'rgba(59, 130, 246, 0.14)',
          buttonBg: '#3b82f6',
          cardBg: isDarkMode ? '#0f172a' : '#f8fbff',
          borderColor: isDarkMode ? 'rgba(96, 165, 250, 0.22)' : 'rgba(59, 130, 246, 0.14)',
          titleColor: isDarkMode ? '#f8fafc' : '#0f172a',
          messageColor: isDarkMode ? '#bfdbfe' : '#475569',
        };
    }
  };

  const styleConfig = getTypeStyle();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={alertStyles.backdrop}>
        <GlassView
          variant="elevated"
          isDarkMode={isDarkMode}
          borderRadius={28}
          intensity={50}
          style={[
            alertStyles.card,
            {
              backgroundColor: styleConfig.cardBg,
              borderColor: styleConfig.borderColor,
            },
          ]}
        >
          <View style={[alertStyles.iconBadge, { backgroundColor: styleConfig.badgeBg, borderColor: styleConfig.borderColor }]}>
            <Ionicons name={styleConfig.iconName} size={28} color={styleConfig.accent} />
          </View>

          <Text style={[alertStyles.title, { color: styleConfig.titleColor }]}>
            {title || 'Settings Saved'}
          </Text>

          <Text style={[alertStyles.message, { color: styleConfig.messageColor }]}>
            {message || 'Your weather alert preferences and telemetry locations have been updated successfully.'}
          </Text>

          <TouchableOpacity
            activeOpacity={0.9}
            style={[alertStyles.confirmButton, { backgroundColor: styleConfig.buttonBg }]}
            onPress={onClose}
          >
            <Text style={alertStyles.confirmButtonText}>Done</Text>
          </TouchableOpacity>
        </GlassView>
      </View>
    </Modal>
  );
};

const alertStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 28,
    ...Platform.select({
      web: { boxShadow: '0 18px 40px rgba(15, 23, 42, 0.2)' },
      default: { elevation: 12 },
    }),
  },
  iconBadge: {
    width: 58,
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  confirmButton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.2,
  },
});
