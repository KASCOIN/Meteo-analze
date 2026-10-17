import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveUserPreferences = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem(key, jsonValue);
    } else {
      await AsyncStorage.setItem(key, jsonValue);
    }
  } catch (e) {
    console.error('Error saving storage key:', key, e);
  }
};

export const getUserPreferences = async (key, defaultValue = null) => {
  try {
    let jsonValue = null;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      jsonValue = window.localStorage.getItem(key);
    } else {
      jsonValue = await AsyncStorage.getItem(key);
    }
    return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
  } catch (e) {
    console.error('Error reading storage key:', key, e);
    return defaultValue;
  }
};
