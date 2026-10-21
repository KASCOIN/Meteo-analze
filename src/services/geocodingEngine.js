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
    const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&format=json`;
    const response = await fetch(url);
    const data = await response.json();

    const result = data?.results?.[0];
    if (!result) {
      return {
        name: 'Current Location',
        country: '',
        formatted: 'Current Location',
      };
    }

    const city = result.name || result.locality || result.admin1 || 'Current Location';
    const country = result.country || result.admin1 || '';
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
