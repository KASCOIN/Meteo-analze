import * as Notifications from 'expo-notifications';
import * as IntentLauncher from 'expo-intent-launcher';
import { Alert, Platform } from 'react-native';

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
        { text: 'Open Settings', onPress: async () => {
          try {
            await IntentLauncher.startActivityAsync(
              IntentLauncher.ActivityAction.REQUEST_IGNORE_BATTERY_OPTIMIZATION_SETTINGS
            );
          } catch (error) {
            console.warn('Battery optimization settings could not be opened:', error);
          }
        } },
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
  getExpoPushToken,
  openBatteryOptimizationSettings,
  initializeNotificationSystem,
};
