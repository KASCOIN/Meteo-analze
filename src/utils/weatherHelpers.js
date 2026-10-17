export const getWMOWeather = (code) => {
  if (code === undefined || code === null) return { desc: 'Unknown', icon: '❓' };
  switch (code) {
    case 0: return { desc: 'Clear Sky', icon: '☀️' };
    case 1: case 2: return { desc: 'Partly Cloudy', icon: '⛅' };
    case 3: return { desc: 'Overcast', icon: '☁️' };
    case 45: case 48: return { desc: 'Foggy', icon: '🌫️' };
    case 51: case 53: case 55: return { desc: 'Drizzle', icon: '🌧️' };
    case 61: case 63: case 65: return { desc: 'Rain', icon: '🌧️' };
    case 71: case 73: case 75: return { desc: 'Snow', icon: '❄️' };
    case 80: case 81: case 82: return { desc: 'Rain Showers', icon: '🌦️' };
    case 95: case 96: case 99: return { desc: 'Thunderstorm', icon: '🌩️' };
    default: return { desc: 'Cloudy', icon: '☁️' };
  }
};

export const getCardinalDirection = (deg) => {
  if (deg === null || deg === undefined) return 'N/A';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(deg / 22.5) % 16];
};

export const getDateRange = (rangeKey) => {
  const end = new Date();
  const start = new Date();
  if (rangeKey === '14d') start.setDate(end.getDate() - 14);
  else if (rangeKey === '1m') start.setMonth(end.getMonth() - 1);
  else if (rangeKey === '6m') start.setMonth(end.getMonth() - 6);
  else if (rangeKey === '1y') start.setFullYear(end.getFullYear() - 1);
  else if (rangeKey === '3y') start.setFullYear(end.getFullYear() - 3);

  const formatDate = (d) => d.toISOString().split('T')[0];
  return { startDate: formatDate(start), endDate: formatDate(end) };
};

export const downsampleData = (dataArray, maxPoints = 12) => {
  if (!dataArray || dataArray.length <= maxPoints) return dataArray;
  const step = Math.floor(dataArray.length / maxPoints);
  const sampled = [];
  for (let i = 0; i < dataArray.length; i += step) {
    sampled.push(dataArray[i]);
  }
  return sampled;
};
