import * as Notifications from 'expo-notifications';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Application from 'expo-application';
import { Alert, Platform, Linking } from 'react-native';

export const WEATHER_ALERT_ACTIONS = [
  { identifier: 'VIEW_RADAR', buttonTitle: 'View Radar', options: { isDestructive: false, isAuthenticationRequired: false } },
  { identifier: 'SNOOZE_1H', buttonTitle: 'Snooze 1h', options: { isDestructive: false, isAuthenticationRequired: false } },
  { identifier: 'DISMISS', buttonTitle: 'Dismiss', options: { isDestructive: true, isAuthenticationRequired: false } },
];

export const registerWeatherAlertCategory = async () => {
  if (Platform.OS === 'web') return null;

  try {
    return Notifications.setNotificationCategoryAsync('WEATHER_ALERT_ACTIONS', WEATHER_ALERT_ACTIONS);
  } catch (error) {
    console.warn('Weather alert category registration failed:', error);
    return null;
  }
};

export const configureNotificationHandler = () => {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
};

export const ensureAndroidNotificationChannels = async () => {
  if (Platform.OS !== 'android') return;

  try {
    await Notifications.setNotificationChannelAsync('severe-alerts', {
      name: 'Severe Alerts',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });

    await Notifications.setNotificationChannelAsync('daily-briefings', {
      name: 'Daily Briefings',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250],
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  } catch (error) {
    console.warn('Notification channel setup failed:', error);
  }
};

export const showInAppAlertFallback = (body, title = '⚡ Weather Alert') => {
  try {
    if (typeof Alert !== 'undefined' && typeof Alert.alert === 'function') {
      Alert.alert(title, body);
      return true;
    }
  } catch (error) {
    console.warn('In-app notification fallback failed:', error);
  }
  return false;
};

export const requestWebNotificationPermission = async () => {
  if (Platform.OS !== 'web') return 'unsupported';

  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return 'unsupported';
  }

  if (Notification.permission === 'default') {
    return Notification.requestPermission();
  }

  return Notification.permission;
};

export const sendWebOrNativeNotification = async ({ title, body, data = {} }) => {
  const safeTitle = typeof title === 'string' && title.trim() ? title : 'Weather Alert';
  const safeBody = typeof body === 'string' ? body : String(body ?? '');

  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: safeTitle,
          body: safeBody,
          sound: true,
          data,
        },
        trigger: null,
      });
      return { delivered: true, source: 'native' };
    } catch (error) {
      console.warn('Native notification dispatch failed:', error);
      showInAppAlertFallback(safeBody, '⚡ Weather Alert');
      return { delivered: false, source: 'native-fallback' };
    }
  }

  if (Platform.OS === 'web') {
    try {
      if (typeof window === 'undefined' || typeof Notification === 'undefined') {
        return { delivered: false, source: 'web-unsupported' };
      }

      const permissionState = Notification.permission;
      if (permissionState === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          return { delivered: false, source: 'web-denied', permission };
        }
      }

      if (permissionState === 'denied') {
        return { delivered: false, source: 'web-denied', permission: permissionState };
      }

      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker?.ready) {
        const registration = await navigator.serviceWorker.ready;
        if (typeof registration?.showNotification === 'function') {
          await registration.showNotification(safeTitle, {
            body: safeBody,
            icon: '/favicon.png',
            badge: '/favicon.png',
            data,
          });
          return { delivered: true, source: 'service-worker' };
        }
      }

      console.log('Web Notification:', safeTitle, safeBody);
      return { delivered: false, source: 'web-console' };
    } catch (error) {
      console.warn('Web notification dispatch failed:', error);
      showInAppAlertFallback(safeBody, '⚡ Weather Alert');
      return { delivered: false, source: 'web-fallback' };
    }
  }

  return { delivered: false, source: 'unsupported-platform' };
};

export const requestNotificationPermissions = async () => {
  if (Platform.OS === 'web') return { granted: false, status: 'unsupported' };

  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') {
    return current;
  }

  return Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
    android: {
      allowAlert: true,
      allowSound: true,
      allowBadge: true,
    },
  });
};

export const getExactAlarmPermissionsAsync = async () => {
  if (Platform.OS !== 'android') {
    return { status: 'granted' };
  }

  if (typeof Notifications.getExactAlarmPermissionsAsync === 'function') {
    return Notifications.getExactAlarmPermissionsAsync();
  }

  return { status: 'granted' };
};

export const requestExactAlarmPermissionsAsync = async () => {
  if (Platform.OS !== 'android') {
    return { status: 'granted' };
  }

  if (typeof Notifications.requestExactAlarmPermissionsAsync === 'function') {
    return Notifications.requestExactAlarmPermissionsAsync();
  }

  return { status: 'granted' };
};

export const triggerInstantTestNotification = async () => {
  try {
    if (Platform.OS === 'web') {
      await sendWebOrNativeNotification({
        title: '⚡ Meteo Live Alert Test',
        body: 'Notification pipeline is fully operational! Weather telemetry updates are active.',
        data: { type: 'test_alert' },
      });
      return { delivered: true };
    }

    const permission = await requestNotificationPermissions();
    if (permission?.status !== 'granted' && permission?.granted !== true) {
      showInAppAlertFallback('Notifications are disabled right now. Please enable them in your device settings.', '⚡ Weather Alert');
      return null;
    }

    const immediate = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚡ Meteo Live Alert Test',
        body: 'Notification pipeline is fully operational! Weather telemetry updates are active.',
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: null,
    });

    const delayed = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚡ Meteo Live Alert Test',
        body: 'Heads-up banner is visible now. Weather telemetry updates are active.',
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: { seconds: 3 },
    });

    return { immediate, delayed };
  } catch (error) {
    console.warn('Instant test notification failed:', error);
    showInAppAlertFallback('Weather alert is active, but the browser blocked the push banner.', '⚡ Weather Alert');
    return null;
  }
};

export const scheduleDailyMorningBriefing = async (briefingText = 'Good morning — here is your weather briefing.') => {
  if (Platform.OS === 'web') return null;

  try {
    const permission = await requestExactAlarmPermissionsAsync();
    if (permission?.status === 'denied') {
      console.warn('Exact alarm permission denied for daily briefing scheduler.');
      return null;
    }

    const trigger = {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 7,
      minute: 0,
      repeats: true,
    };

    return Notifications.scheduleNotificationAsync({
      content: {
        title: '☀️ Morning Weather Brief',
        body: briefingText,
        sound: true,
      },
      trigger,
    });
  } catch (error) {
    console.warn('Failed to schedule daily briefing:', error);
    return null;
  }
};

export const getExpoPushToken = async (projectId = 'ef914cb7-3434-4494-99cd-e2d4ee780624') => {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token?.data || null;
  } catch (error) {
    console.warn('Unable to acquire Expo push token:', error);
    return null;
  }
};

export const openBatteryOptimizationSettings = async () => {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    Alert.alert(
      'Battery Optimization',
      'Please set Meteo Analaze to Unrestricted battery usage so you do not miss severe weather alerts or your daily morning briefing.',
      [
        {
          text: 'Open Settings',
          onPress: async () => {
            try {
              await IntentLauncher.startActivityAsync(
                'android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
                { data: `package:${Application.applicationId}` }
              );
            } catch (e1) {
              try {
                await IntentLauncher.startActivityAsync(
                  IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS
                );
              } catch (e2) {
                Linking.openSettings();
              }
            }
          },
        },
        { text: 'Later', style: 'cancel' },
      ]
    );
    return true;
  } catch (error) {
    console.warn('Battery settings alert failed:', error);
    return false;
  }
};

export const initializeNotificationSystem = async () => {
  configureNotificationHandler();
  await ensureAndroidNotificationChannels();
  await registerWeatherAlertCategory();
  await requestNotificationPermissions();

  if (Platform.OS === 'android') {
    await getExactAlarmPermissionsAsync();
    await requestExactAlarmPermissionsAsync();
  }
};

export default {
  WEATHER_ALERT_ACTIONS,
  configureNotificationHandler,
  ensureAndroidNotificationChannels,
  requestNotificationPermissions,
  getExactAlarmPermissionsAsync,
  requestExactAlarmPermissionsAsync,
  scheduleDailyMorningBriefing,
  triggerInstantTestNotification,
  getExpoPushToken,
  openBatteryOptimizationSettings,
  initializeNotificationSystem,
};
