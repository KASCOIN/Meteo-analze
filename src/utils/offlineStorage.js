import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const CACHE_KEY = 'meteo_offline_cache_v1';
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

/**
 * Save a 12-hour weather payload into cache with timestamp
 */
export const cache12HrWeatherData = async (location, weatherData) => {
  try {
    const existingCacheRaw = await getRawCache();
    const now = Date.now();

    const newRecord = {
      id: `${location.latitude}_${location.longitude}_${now}`,
      timestamp: now,
      location,
      weatherData,
    };

    // Filter out data older than 3 days while adding new record
    const updatedRecords = existingCacheRaw.filter(
      (item) => now - item.timestamp < THREE_DAYS_MS
    );
    updatedRecords.unshift(newRecord);

    const jsonValue = JSON.stringify(updatedRecords);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem(CACHE_KEY, jsonValue);
    } else {
      await AsyncStorage.setItem(CACHE_KEY, jsonValue);
    }
  } catch (e) {
    console.error('Error caching offline weather data:', e);
  }
};

/**
 * Retrieve the latest valid cached weather payload for offline mode
 */
export const getLatestCachedWeatherData = async (latitude, longitude) => {
  try {
    const records = await getRawCache();
    const now = Date.now();

    // Find non-expired record matching location (or return most recent non-expired)
    const validRecords = records.filter((item) => now - item.timestamp < THREE_DAYS_MS);

    if (validRecords.length === 0) return null;

    const matched = validRecords.find(
      (r) =>
        Math.abs(r.location.latitude - latitude) < 0.1 &&
        Math.abs(r.location.longitude - longitude) < 0.1
    );

    return matched ? matched.weatherData : validRecords[0].weatherData;
  } catch (e) {
    console.error('Error reading offline weather cache:', e);
    return null;
  }
};

/**
 * Auto-delete cache records older than 3 days
 */
export const cleanExpiredCacheData = async () => {
  try {
    const records = await getRawCache();
    const now = Date.now();
    const freshRecords = records.filter((item) => now - item.timestamp < THREE_DAYS_MS);

    const jsonValue = JSON.stringify(freshRecords);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem(CACHE_KEY, jsonValue);
    } else {
      await AsyncStorage.setItem(CACHE_KEY, jsonValue);
    }
  } catch (e) {
    console.error('Error cleaning expired cache:', e);
  }
};

const getRawCache = async () => {
  try {
    let jsonValue = null;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      jsonValue = window.localStorage.getItem(CACHE_KEY);
    } else {
      jsonValue = await AsyncStorage.getItem(CACHE_KEY);
    }
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (e) {
    return [];
  }
};
    
