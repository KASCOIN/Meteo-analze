import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { Magnetometer } from 'expo-sensors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const getCardinalDirection = (heading) => {
  const normalized = ((heading % 360) + 360) % 360;

  if (normalized >= 337.5 || normalized < 22.5) return 'North';
  if (normalized >= 22.5 && normalized < 67.5) return 'North East';
  if (normalized >= 67.5 && normalized < 112.5) return 'East';
  if (normalized >= 112.5 && normalized < 157.5) return 'South East';
  if (normalized >= 157.5 && normalized < 202.5) return 'South';
  if (normalized >= 202.5 && normalized < 247.5) return 'South West';
  if (normalized >= 247.5 && normalized < 292.5) return 'West';
  return 'North West';
};

const decimalToDMS = (deg, isLat) => {
  const absolute = Math.abs(deg);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60);
  const direction = deg >= 0 ? (isLat ? 'N' : 'E') : (isLat ? 'S' : 'W');
  return `${degrees}°${minutes}'${seconds}\" ${direction}`;
};

const tickLayout = [
  { angle: 0, label: 'N' },
  { angle: 30, label: 'NE' },
  { angle: 60, label: null },
  { angle: 90, label: 'E' },
  { angle: 120, label: null },
  { angle: 150, label: null },
  { angle: 180, label: 'S' },
  { angle: 210, label: null },
  { angle: 240, label: null },
  { angle: 270, label: 'W' },
  { angle: 300, label: null },
  { angle: 330, label: null },
];

export const CompassModal = ({ visible, onClose, location }) => {
  const insets = useSafeAreaInsets();
  const rotation = useRef(new Animated.Value(0)).current;
  const [heading, setHeading] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState('checking');
  const subscriptionRef = useRef(null);

  const safeLocation = location || {
    latitude: 6.702,
    longitude: 3.396,
  };

  const directionLabel = useMemo(() => getCardinalDirection(heading), [heading]);

  useEffect(() => {
    if (!visible) return undefined;

    if (Platform.OS === 'web') {
      setPermissionStatus('unsupported');
      setHeading(0);
      Animated.timing(rotation, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
      return undefined;
    }

    const startHeadingTracking = async () => {
      try {
        const available = await Magnetometer.isAvailableAsync();
        if (!available) {
          setPermissionStatus('unsupported');
          return;
        }

        setPermissionStatus('granted');

        const subscription = Magnetometer.addListener(({ x, y }) => {
          if (typeof x !== 'number' || typeof y !== 'number') {
            return;
          }

          const nextHeading = (Math.atan2(y, x) * 180) / Math.PI + 90;
          const normalized = (nextHeading + 360) % 360;
          setHeading(normalized);

          Animated.timing(rotation, {
            toValue: -normalized,
            duration: 220,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }).start();
        });

        subscriptionRef.current = subscription;
      } catch (error) {
        console.warn('Compass heading error:', error);
        setPermissionStatus('error');
      }
    };

    startHeadingTracking();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [visible, rotation]);

  const dialStyle = {
    transform: [{ rotate: rotation.interpolate({ inputRange: [-360, 360], outputRange: ['-360deg', '360deg'] }) }],
  };

  const dmsLatitude = decimalToDMS(safeLocation.latitude, true);
  const dmsLongitude = decimalToDMS(safeLocation.longitude, false);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      transparent={false}
      visible={visible}
    >
      <View style={styles.fullScreen}>
        <View style={[styles.headerRow, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          <Text style={styles.directionText}>{directionLabel}</Text>

          <View style={styles.dialWrap}>
            <View style={styles.notchTop} />
            <View style={styles.notchBottom} />

            <Animated.View style={[styles.tickRing, dialStyle]}>
              {Array.from({ length: 360 }).map((_, index) => {
                const angle = index * 1;
                const isMajor = index % 10 === 0;
                const tickHeight = isMajor ? 26 : 12;
                const baseStyle = {
                  height: tickHeight,
                  width: isMajor ? 2.5 : 1.5,
                  borderRadius: 999,
                  backgroundColor: index % 90 === 0 ? '#38bdf8' : 'rgba(255,255,255,0.46)',
                  position: 'absolute',
                  top: 8,
                  left: '50%',
                  marginLeft: -1,
                  transform: [{ rotate: `${angle}deg` }, { translateY: isMajor ? -64 : -58 }],
                  opacity: isMajor ? 1 : 0.82,
                };

                return <View key={index} style={baseStyle} />;
              })}

              <View style={styles.centerGlow} />

              {tickLayout.map((item, idx) => {
                const isNorth = item.label === 'N';
                const labelColor = isNorth ? '#38bdf8' : 'rgba(255,255,255,0.75)';

                const labelStyle = {
                  position: 'absolute',
                  transform: [{ rotate: `${item.angle}deg` }, { translateY: -124 }],
                };

                return (
                  <View key={`${item.label ?? 'tick'}-${idx}`} style={[styles.tickLabelWrap, labelStyle]}>
                    <Text style={[styles.tickLabel, { color: labelColor }]}>{item.label}</Text>
                  </View>
                );
              })}

              <View style={styles.midCompassCircle}>
                <Text style={styles.degreeText}>{Math.round(heading)}°</Text>
              </View>
            </Animated.View>
          </View>
        </View>

        {permissionStatus === 'checking' ? (
          <View style={styles.permissionRow}>
            <ActivityIndicator size="small" color="#38bdf8" />
            <Text style={styles.permissionText}>Calibrating heading sensor…</Text>
          </View>
        ) : null}

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 24, 32) }]}>
          <Text style={styles.footerText}>{dmsLatitude}   {dmsLongitude}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  directionText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 0.4,
  },
  dialWrap: {
    width: Math.min(320, '90%'),
    height: Math.min(320, '90%'),
    maxWidth: 320,
    maxHeight: 320,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notchTop: {
    position: 'absolute',
    top: 10,
    width: 3,
    height: 28,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    zIndex: 30,
  },
  notchBottom: {
    position: 'absolute',
    bottom: 10,
    width: 3,
    height: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    zIndex: 10,
  },
  tickRing: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centerGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    shadowColor: '#38bdf8',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  tickLabelWrap: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -12,
    marginTop: -12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tickLabel: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  midCompassCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.28)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  degreeText: {
    color: '#ffffff',
    fontSize: 54,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -1,
  },
  footer: {
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 12,
  },
  permissionText: {
    color: '#dbeafe',
    fontSize: 13,
    fontWeight: '600',
  },
});
