import { Platform } from 'react-native';

const CACHE_KEY = 'meteo_offline_cache_v1';
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

// Lazy require native storage on mobile to prevent static web export build errors
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

const getRawCache = async () => {
  try {
    let jsonValue = null;
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        jsonValue = window.localStorage.getItem(CACHE_KEY);
      }
    } else {
      const storage = getAsyncStorage();
      if (storage) jsonValue = await storage.getItem(CACHE_KEY);
    }
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (e) {
    return [];
  }
};

/**
 * Cache 12-hour weather payload with timestamp
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

    // Keep records under 3 days old
    const updatedRecords = existingCacheRaw.filter(
      (item) => now - item.timestamp < THREE_DAYS_MS
    );
    updatedRecords.unshift(newRecord);

    const jsonValue = JSON.stringify(updatedRecords);
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(CACHE_KEY, jsonValue);
      }
    } else {
      const storage = getAsyncStorage();
      if (storage) await storage.setItem(CACHE_KEY, jsonValue);
    }
  } catch (e) {
    console.error('Error caching offline weather data:', e);
  }
};

/**
 * Get latest valid cached weather payload
 */
export const getLatestCachedWeatherData = async (latitude, longitude) => {
  try {
    const records = await getRawCache();
    const now = Date.now();

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
 * Delete cache entries older than 3 days
 */
export const cleanExpiredCacheData = async () => {
  try {
    const records = await getRawCache();
    const now = Date.now();
    const freshRecords = records.filter((item) => now - item.timestamp < THREE_DAYS_MS);

    const jsonValue = JSON.stringify(freshRecords);
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(CACHE_KEY, jsonValue);
      }
    } else {
      const storage = getAsyncStorage();
      if (storage) await storage.setItem(CACHE_KEY, jsonValue);
    }
  } catch (e) {
    console.error('Error cleaning expired cache:', e);
  }
};
