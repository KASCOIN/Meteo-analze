export const searchLocations = async (query) => {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query
    )}&count=5&language=en&format=json`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
};

export const reverseGeocodeLocation = async ({ latitude, longitude }) => {
  if (latitude == null || longitude == null || Number.isNaN(Number(latitude)) || Number.isNaN(Number(longitude))) {
    return {
      name: 'Current Location',
      country: '',
      formatted: 'Current Location',
    };
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2&addressdetails=1&zoom=18`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'MeteoAnalaze/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Reverse geocode failed with status ${response.status}`);
    }

    const data = await response.json();
    const address = data?.address || {};

    const city =
      address.city ||
      address.town ||
      address.village ||
      address.suburb ||
      address.municipality ||
      address.county ||
      'Current Location';

    const country = address.country || '';
    const formatted = [city, country].filter(Boolean).join(', ');

    return {
      name: city,
      country,
      formatted,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      name: 'Current Location',
      country: '',
      formatted: 'Current Location',
    };
  }
};
