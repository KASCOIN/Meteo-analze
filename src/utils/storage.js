import { Platform } from 'react-native';

const getAsyncStorage = () => {
  if (Platform.OS !== 'web') {
    try {
      return require('@react-native-async-storage/async-storage').default;
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const saveUserPreferences = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, jsonValue);
      }
    } else {
      const storage = getAsyncStorage();
      if (storage) await storage.setItem(key, jsonValue);
    }
  } catch (e) {
    console.error('Error saving storage key:', key, e);
  }
};

export const getUserPreferences = async (key, defaultValue = null) => {
  try {
    let jsonValue = null;
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        jsonValue = window.localStorage.getItem(key);
      }
    } else {
      const storage = getAsyncStorage();
      if (storage) jsonValue = await storage.getItem(key);
    }
    return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
  } catch (e) {
    console.error('Error reading storage key:', key, e);
    return defaultValue;
  }
};
