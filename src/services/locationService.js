import * as Location from 'expo-location';
import { Platform } from 'react-native';

const GEOCODE_CACHE_PREFIX = 'GEOCODE_CACHE_';

const getStorage = async () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.localStorage) {
      return {
        getItem: async (key) => window.localStorage.getItem(key),
        setItem: async (key, value) => window.localStorage.setItem(key, value),
      };
    }
    return null;
  }

  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage;
  } catch (error) {
    console.warn('AsyncStorage unavailable for geocode cache:', error);
    return null;
  }
};

const readCachedCity = async (cacheKey) => {
  try {
    const storage = await getStorage();
    if (!storage) return null;
    const cachedValue = await storage.getItem(cacheKey);
    return cachedValue ? JSON.parse(cachedValue) : null;
  } catch (error) {
    return null;
  }
};

const writeCachedCity = async (cacheKey, cityName) => {
  try {
    const storage = await getStorage();
    if (!storage) return;
    await storage.setItem(cacheKey, JSON.stringify(cityName));
  } catch (error) {
    // Cache failure should not block user experience.
  }
};

export const getCityFromCoordinates = async (latitude, longitude) => {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return 'Unknown Location';
  }

  const roundedLat = Number(lat.toFixed(2));
  const roundedLon = Number(lon.toFixed(2));
  const cacheKey = `${GEOCODE_CACHE_PREFIX}${roundedLat}_${roundedLon}`;

  const cachedCity = await readCachedCity(cacheKey);
  if (cachedCity) {
    return cachedCity;
  }

  let resolvedCity = null;

  try {
    const permission = await Location.getForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
      const requested = await Location.requestForegroundPermissionsAsync();
      if (requested.status !== 'granted') {
        throw new Error('Location permission not granted');
      }
    }

    const geocodeResult = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
    const match = geocodeResult?.[0];

    if (match) {
      const city =
        match.city ||
        match.locality ||
        match.subregion ||
        match.district ||
        match.region ||
        match.name ||
        match.street ||
        'Location Unavailable';

      const country = match.country || '';
      resolvedCity = [city, country].filter(Boolean).join(', ') || 'Location Unavailable';
    }
  } catch (error) {
    resolvedCity = null;
  }

  if (!resolvedCity || resolvedCity === 'Location Unavailable') {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
        {
          headers: {
            'User-Agent': 'MeteoAnalazeApp/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Nominatim request failed with ${response.status}`);
      }

      const data = await response.json();
      const address = data?.address || {};
      const city =
        address.city ||
        address.town ||
        address.village ||
        address.county ||
        address.state ||
        'Location Unavailable';
      const country = address.country || '';
      resolvedCity = [city, country].filter(Boolean).join(', ') || 'Location Unavailable';
    } catch (fallbackError) {
      resolvedCity = 'Location Unavailable';
    }
  }

  const finalCity = resolvedCity || 'Location Unavailable';
  await writeCachedCity(cacheKey, finalCity);
  return finalCity;
};

export default getCityFromCoordinates;
