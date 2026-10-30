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
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Maps heading (0-359°) to standard cardinal/intercardinal direction name.
 */
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

/**
 * Formats decimal degree coordinates to standard navigation DMS (Degrees, Minutes, Seconds).
 */
const decimalToDMS = (deg, isLat) => {
  if (deg === undefined || deg === null || isNaN(deg)) return '--°--\'--" -';
  const absolute = Math.abs(deg);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60);
  const direction = deg >= 0 ? (isLat ? 'N' : 'E') : (isLat ? 'S' : 'W');
  return `${degrees}°${minutes}'${seconds}" ${direction}`;
};

/**
 * Clean dial ticks: 36 ticks total (every 10°).
 * - 30° intervals: Major ticks (prominent white, 12px height).
 * - 0° (North): Highlighted major tick (neon cyan, 15px height).
 * - 10° intervals: Minor ticks (subtle translucent, 7px height).
 */
const DIAL_TICKS = Array.from({ length: 36 }, (_, index) => {
  const angle = index * 10;
  const isMajor = angle % 30 === 0;
  const isNorth = angle === 0;
  return { angle, isMajor, isNorth };
});

/**
 * Cardinal Labels positioned at radial offset r = 105px.
 * Zero tick overlap, clean typography.
 */
const CARDINAL_LABELS = [
  { angle: 0, label: 'N', isNorth: true },
  { angle: 90, label: 'E', isNorth: false },
  { angle: 180, label: 'S', isNorth: false },
  { angle: 270, label: 'W', isNorth: false },
];

export const CompassModal = ({ visible, onClose, location }) => {
  const insets = useSafeAreaInsets();
  const rotation = useRef(new Animated.Value(0)).current;
  const [heading, setHeading] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState('checking');

  // Real-time hardware satellite GPS coordinates
  const [coords, setCoords] = useState(() => ({
    latitude: location?.latitude ?? 0,
    longitude: location?.longitude ?? 0,
  }));

  // Angle unrolling references to prevent 0°/360° jump
  const lastHeadingRef = useRef(0);
  const unrolledHeadingRef = useRef(0);
  const isFirstReadingRef = useRef(true);

  // Sync coords if initial location changes before GPS fix
  useEffect(() => {
    if (location?.latitude !== undefined && location?.longitude !== undefined) {
      setCoords((prev) => {
        if (prev.latitude === 0 && prev.longitude === 0) {
          return { latitude: location.latitude, longitude: location.longitude };
        }
        return prev;
      });
    }
  }, [location]);

  /**
   * Continuous angle unrolling:
   * Calculates the shortest rotation delta in the [-180, 180] range
   * to eliminate violent 360° spin reversals when crossing North (0°/360°).
   */
  const getShortestAngleHeading = (newHeading) => {
    if (isFirstReadingRef.current) {
      unrolledHeadingRef.current = newHeading;
      lastHeadingRef.current = newHeading;
      return unrolledHeadingRef.current;
    }

    let diff = newHeading - lastHeadingRef.current;

    // Normalize delta to [-180, 180] range
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    unrolledHeadingRef.current += diff;
    lastHeadingRef.current = newHeading;

    return unrolledHeadingRef.current;
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

    let headingSub = null;
    let positionSub = null;
    let isMounted = true;

    const startHardwareTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!isMounted) return;

        if (status !== 'granted') {
          setPermissionStatus('denied');
          return;
        }

        setPermissionStatus('granted');

        // 1. Hardware Compass Sensor Subscription with Angle Unrolling
        try {
          headingSub = await Location.watchHeadingAsync((headingData) => {
            if (!isMounted) return;

            const rawHeading =
              headingData.trueHeading >= 0
                ? headingData.trueHeading
                : headingData.magHeading >= 0
                  ? headingData.magHeading
                  : 0;

            const normalizedHeading = ((rawHeading % 360) + 360) % 360;
            const nextHeading = Math.round(normalizedHeading);

            setHeading(nextHeading);

            const unrolled = getShortestAngleHeading(nextHeading);

            if (isFirstReadingRef.current) {
              isFirstReadingRef.current = false;
              rotation.setValue(-unrolled);
            } else {
              Animated.timing(rotation, {
                toValue: -unrolled,
                duration: 180,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }).start();
            }
          });
        } catch (headingErr) {
          console.warn('Compass heading sensor subscription error:', headingErr);
        }

        // 2. Phone-Native Hardware GPS Tracking (Offline GNSS, no internet or web APIs needed)
        try {
          positionSub = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              distanceInterval: 1, // Update every 1 meter moved
              timeInterval: 1000,  // Or every 1 second
            },
            (pos) => {
              if (!isMounted || !pos?.coords) return;
              const { latitude, longitude } = pos.coords;
              setCoords({ latitude, longitude });
            }
          );
        } catch (posErr) {
          console.warn('Hardware GPS tracking subscription error:', posErr);
        }
      } catch (err) {
        console.warn('Compass initialization error:', err);
        if (isMounted) setPermissionStatus('error');
      }
    };

    startHardwareTracking();

    return () => {
      isMounted = false;
      if (headingSub) {
        try {
          headingSub.remove();
        } catch (e) {}
        headingSub = null;
      }
      if (positionSub) {
        try {
          positionSub.remove();
        } catch (e) {}
        positionSub = null;
      }
      isFirstReadingRef.current = true;
      lastHeadingRef.current = 0;
      unrolledHeadingRef.current = 0;
    };
  }, [visible, rotation]);

  // Seamless linear rotation across continuous unrolled heading values
  const dialStyle = {
    transform: [
      {
        rotate: rotation.interpolate({
          inputRange: [-36000, 36000],
          outputRange: ['-36000deg', '36000deg'],
        }),
      },
    ],
  };

  const dmsLatitude = decimalToDMS(coords.latitude, true);
  const dmsLongitude = decimalToDMS(coords.longitude, false);

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
        {/* Top Header */}
        <View style={[styles.headerRow, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <Text style={styles.directionText}>{directionLabel}</Text>

          {/* Dial Outer Container */}
          <View style={styles.dialOuterWrapper}>
            {/* Fixed Heading Indicator Notch at 12 o'clock */}
            <View style={styles.topNotch} />

            {/* Rotating Compass Dial Ring */}
            <Animated.View style={[styles.tickRing, dialStyle]}>
              {/* Radial Ticks Layer (30° Major, 10° Minor) */}
              {DIAL_TICKS.map((tick) => {
                const tickHeight = tick.isNorth ? 15 : tick.isMajor ? 12 : 7;
                const tickWidth = tick.isNorth ? 2.5 : tick.isMajor ? 2 : 1.5;
                const tickColor = tick.isNorth
                  ? '#38bdf8'
                  : tick.isMajor
                    ? 'rgba(255, 255, 255, 0.85)'
                    : 'rgba(255, 255, 255, 0.3)';

                // Placed right along the outer perimeter (r ~ 130px)
                const translateY = -140 + tickHeight / 2 + 4;

                return (
                  <View
                    key={`tick-${tick.angle}`}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: tickWidth,
                      height: tickHeight,
                      marginLeft: -tickWidth / 2,
                      marginTop: -tickHeight / 2,
                      borderRadius: 1,
                      backgroundColor: tickColor,
                      transform: [{ rotate: `${tick.angle}deg` }, { translateY }],
                    }}
                  />
                );
              })}

              {/* Cardinal Labels Layer (r = 105px inward, zero overlap with ticks) */}
              {CARDINAL_LABELS.map((item) => (
                <View
                  key={item.label}
                  style={[
                    styles.cardinalWrap,
                    {
                      transform: [{ rotate: `${item.angle}deg` }, { translateY: -105 }],
                    },
                  ]}
                >
                  {item.isNorth ? (
                    <View style={styles.northGroup}>
                      <Text style={styles.northPointer}>▲</Text>
                      <Text style={[styles.cardinalLabel, styles.northLabel]}>N</Text>
                    </View>
                  ) : (
                    <Text style={[styles.cardinalLabel, styles.cardinalWhite]}>
                      {item.label}
                    </Text>
                  )}
                </View>
              ))}

              {/* Center Ambient Glow */}
              <View style={styles.centerGlow} />
            </Animated.View>

            {/* Centered Heading Readout */}
            <View style={styles.centerReadout} pointerEvents="none">
              <Text style={styles.degreeText}>{Math.round(heading)}°</Text>
            </View>
          </View>
        </View>

        {/* Calibrating / Sensor Status */}
        {permissionStatus === 'checking' ? (
          <View style={styles.permissionRow}>
            <ActivityIndicator size="small" color="#38bdf8" />
            <Text style={styles.permissionText}>Calibrating heading sensor…</Text>
          </View>
        ) : null}

        {/* Footer with Real-Time Offline Hardware GPS DMS Coordinates */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 24, 32) }]}>
          <Text style={styles.footerText}>
            {dmsLatitude}   {dmsLongitude}
          </Text>
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
    paddingHorizontal: 20,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
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
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  dialOuterWrapper: {
    width: 280,
    height: 280,
    borderRadius: 140,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  topNotch: {
    position: 'absolute',
    top: -2,
    width: 3,
    height: 18,
    borderRadius: 1.5,
    backgroundColor: '#38bdf8',
    zIndex: 30,
  },
  tickRing: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centerGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  centerReadout: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  degreeText: {
    color: '#ffffff',
    fontSize: 54,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -1,
  },
  cardinalWrap: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 32,
    height: 32,
    marginLeft: -16,
    marginTop: -16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  northGroup: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  northPointer: {
    color: '#38bdf8',
    fontSize: 9,
    lineHeight: 10,
    marginBottom: 1,
  },
  cardinalLabel: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  northLabel: {
    color: '#38bdf8',
  },
  cardinalWhite: {
    color: '#ffffff',
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
    letterSpacing: 0.3,
  },
});
