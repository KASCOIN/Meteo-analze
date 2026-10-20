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
 * GlassView provides a Google Material You + Glassmorphism container.
 * Features:
 * - Frosted blur background on iOS / Android (via expo-blur) and Web (via CSS backdrop-filter)
 * - Translucent specular highlight border
 * - Google-style rounded corners and soft atmospheric shadows
 * - Automatic dark/light mode surface tinting
 */
export const GlassView = ({
  children,
  style,
  contentStyle,
  isDarkMode = false,
  intensity = 45,
  tint,
  variant = 'surface', // 'surface' | 'card' | 'elevated' | 'chip' | 'input'
  borderRadius = 22,
  overflow = 'hidden',
  ...props
}) => {
  const chosenTint = tint || (isDarkMode ? 'dark' : 'light');

  // Base background opacity depending on variant and mode
  const getGlassBg = () => {
    if (isDarkMode) {
      switch (variant) {
        case 'elevated':
          return 'rgba(28, 38, 58, 0.78)';
        case 'chip':
          return 'rgba(255, 255, 255, 0.09)';
        case 'input':
          return 'rgba(255, 255, 255, 0.08)';
        case 'card':
        case 'surface':
        default:
          return 'rgba(18, 25, 42, 0.65)';
      }
    } else {
      switch (variant) {
        case 'elevated':
          return 'rgba(255, 255, 255, 0.85)';
        case 'chip':
          return 'rgba(255, 255, 255, 0.45)';
        case 'input':
          return 'rgba(255, 255, 255, 0.55)';
        case 'card':
        case 'surface':
        default:
          return 'rgba(255, 255, 255, 0.65)';
      }
    }
  };

  const getBorderColor = () => {
    if (isDarkMode) {
      switch (variant) {
        case 'elevated':
          return 'rgba(255, 255, 255, 0.18)';
        case 'chip':
          return 'rgba(255, 255, 255, 0.12)';
        default:
          return 'rgba(255, 255, 255, 0.14)';
      }
    } else {
      switch (variant) {
        case 'elevated':
          return 'rgba(255, 255, 255, 0.9)';
        case 'chip':
          return 'rgba(255, 255, 255, 0.5)';
        default:
          return 'rgba(255, 255, 255, 0.75)';
      }
    }
  };

  const dynamicBg = getGlassBg();
  const dynamicBorder = getBorderColor();

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
            // CSS backdrop filter for browsers
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: isDarkMode
              ? '0 10px 32px 0 rgba(0, 0, 0, 0.35), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)'
              : '0 10px 32px 0 rgba(31, 38, 135, 0.08), inset 0 1px 2px 0 rgba(255, 255, 255, 0.8)',
          },
          style,
        ]}
      >
        <View style={contentStyle}>{children}</View>
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
        },
        style,
      ]}
    >
      {BlurView ? (
        <BlurView
          intensity={intensity}
          tint={chosenTint}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={contentStyle}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    position: 'relative',
  },
  nativeShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
  },
});

