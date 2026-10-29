import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

// Safe lazy import for expo-blur to avoid any runtime crashing if missing or on unsupported platform
let BlurView = null;
try {
  const ExpoBlur = require('expo-blur');
  BlurView = ExpoBlur.BlurView;
} catch (e) {
  BlurView = null;
}

/**
 * GlassView provides an ultra-polished Google Material You + Glassmorphism container.
 * Features:
 * - Frosted backdrop blur on iOS / Android (via expo-blur) and Web (via CSS backdrop-filter)
 * - Translucent specular highlight border with depth
 * - Google-style rounded curvature and soft atmospheric shadows
 * - Distinct tonal surfaces for high-contrast legibility in both Light & Dark modes
 */
export const GlassView = ({
  children,
  style,
  contentStyle,
  isDarkMode = false,
  intensity = 45,
  tint,
  variant = 'surface', // 'surface' | 'card' | 'elevated' | 'chip' | 'input'
  borderRadius = 24,
  overflow = 'hidden',
  ...props
}) => {
  const chosenTint = tint || (isDarkMode ? 'dark' : 'light');

  // Surface fill tuned for rich glass look & contrast against atmospheric sky
  const getGlassBg = () => {
    if (isDarkMode) {
      switch (variant) {
        case 'elevated':
          return 'rgba(24, 34, 54, 0.82)';
        case 'chip':
          return 'rgba(255, 255, 255, 0.08)';
        case 'input':
          return 'rgba(255, 255, 255, 0.10)';
        case 'card':
        case 'surface':
        default:
          return 'rgba(15, 23, 42, 0.68)';
      }
    } else {
      switch (variant) {
        case 'elevated':
          return 'rgba(255, 255, 255, 0.90)';
        case 'chip':
          return 'rgba(255, 255, 255, 0.72)';
        case 'input':
          return 'rgba(255, 255, 255, 0.88)';
        case 'card':
        case 'surface':
        default:
          return 'rgba(255, 255, 255, 0.75)';
      }
    }
  };

  const getBorderColor = () => {
    if (isDarkMode) {
      switch (variant) {
        case 'elevated':
          return 'rgba(255, 255, 255, 0.20)';
        case 'chip':
          return 'rgba(255, 255, 255, 0.12)';
        default:
          return 'rgba(255, 255, 255, 0.15)';
      }
    } else {
      switch (variant) {
        case 'elevated':
          return 'rgba(255, 255, 255, 0.95)';
        case 'chip':
          return 'rgba(255, 255, 255, 0.85)';
        default:
          return 'rgba(255, 255, 255, 0.90)';
      }
    }
  };

  const getWebShadow = () => {
    if (isDarkMode) {
      switch (variant) {
        case 'chip':
          return '0 2px 8px 0 rgba(0, 0, 0, 0.25), inset 0 1px 1px 0 rgba(255, 255, 255, 0.10)';
        case 'elevated':
          return '0 16px 40px 0 rgba(0, 0, 0, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.16)';
        default:
          return '0 12px 32px 0 rgba(0, 0, 0, 0.35), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)';
      }
    } else {
      switch (variant) {
        case 'chip':
          return '0 2px 8px 0 rgba(15, 23, 42, 0.06), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)';
        case 'elevated':
          return '0 16px 40px 0 rgba(15, 23, 42, 0.12), inset 0 1px 2px 0 rgba(255, 255, 255, 0.95)';
        default:
          return '0 12px 36px 0 rgba(15, 23, 42, 0.08), inset 0 1px 2px 0 rgba(255, 255, 255, 0.95)';
      }
    }
  };

  const dynamicBg = getGlassBg();
  const dynamicBorder = getBorderColor();
  const dynamicWebShadow = getWebShadow();

  const mergedContentStyle = contentStyle ? [contentStyle] : undefined;

  if (Platform.OS === 'web') {
    return (
      <View
        {...props}
        style={[
          styles.base,
          {
            borderRadius,
            backgroundColor: dynamicBg,
            borderColor: dynamicBorder,
            borderWidth: 1,
            overflow,
            display: 'flex',
            flexDirection: 'column',
            backdropFilter: 'blur(24px) saturate(190%)',
            WebkitBackdropFilter: 'blur(24px) saturate(190%)',
            boxShadow: dynamicWebShadow,
          },
          style,
        ]}
      >
        <View style={mergedContentStyle}>{children}</View>
      </View>
    );
  }

  // Native (iOS & Android)
  return (
    <View
      {...props}
      style={[
        styles.base,
        styles.nativeShadow,
        {
          borderRadius,
          borderColor: dynamicBorder,
          borderWidth: 1,
          overflow,
          backgroundColor: dynamicBg,
          display: 'flex',
          flexDirection: 'column',
        },
        style,
      ]}
    >
      <View style={[styles.contentLayer, mergedContentStyle]} pointerEvents="auto">{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  blurLayer: {
    zIndex: 0,
    pointerEvents: 'none',
  },
  contentLayer: {
    position: 'relative',
    zIndex: 1,
    pointerEvents: 'auto',
  },
  nativeShadow: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
});
