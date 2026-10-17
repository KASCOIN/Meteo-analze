import { getDateRange } from '../utils/weatherHelpers';

export const fetchAndProcessClimateData = async (lat, lon, timeRangeKey = '14d') => {
  try {
    const { startDate, endDate } = getDateRange(timeRangeKey);
    const isHistorical = timeRangeKey === '6m' || timeRangeKey === '1y' || timeRangeKey === '3y';

    const dailyParams = [
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'precipitation_sum',
      'precipitation_hours',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
      'wind_direction_10m_dominant',
      'shortwave_radiation_sum',
      'et0_fao_evapotranspiration',
      'uv_index_max',
    ].join(',');

    let apiUrl = '';
    if (isHistorical) {
      apiUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=${dailyParams}&timezone=auto`;
    } else {
      apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&past_days=30&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,precipitation_probability,wind_speed_10m,uv_index&daily=${dailyParams}&timezone=auto`;
    }

    const response = await fetch(apiUrl);
    const raw = await response.json();
    const now = new Date();

    const current = raw.current ? {
      temp: raw.current?.temperature_2m,
      apparentTemp: raw.current?.apparent_temperature,
      humidity: raw.current?.relative_humidity_2m,
      windSpeed: raw.current?.wind_speed_10m,
      weatherCode: raw.current?.weather_code,
      time: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
      date: now.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
    } : null;

    let forecast3Hr = null;
    let forecast1Hr = null;

    if (raw.hourly && raw.hourly.time) {
      const currentHourISO = now.toISOString().slice(0, 13);
      let currentIdx = raw.hourly.time.findIndex((t) => t.startsWith(currentHourISO));
      if (currentIdx === -1) currentIdx = 0;

      const idx1Hr = currentIdx + 1;
      if (raw.hourly.time[idx1Hr]) {
        forecast1Hr = {
          time: new Date(raw.hourly.time[idx1Hr]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
          temp: raw.hourly.temperature_2m[idx1Hr],
          weatherCode: raw.hourly.weather_code[idx1Hr],
          precipProb: raw.hourly.precipitation_probability ? raw.hourly.precipitation_probability[idx1Hr] : 0,
          windSpeed: raw.hourly.wind_speed_10m[idx1Hr],
          uvIndex: raw.hourly.uv_index ? raw.hourly.uv_index[idx1Hr] : 0,
        };
      }

      const idx3Hr = currentIdx + 3;
      if (raw.hourly.time[idx3Hr]) {
        forecast3Hr = {
          time: new Date(raw.hourly.time[idx3Hr]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
          temp: raw.hourly.temperature_2m[idx3Hr],
          weatherCode: raw.hourly.weather_code[idx3Hr],
          precipProb: raw.hourly.precipitation_probability ? raw.hourly.precipitation_probability[idx3Hr] : 0,
          windSpeed: raw.hourly.wind_speed_10m[idx3Hr],
        };
      }
    }

    const d = raw.daily || {};
    const dailySeries = (d.time || []).map((date, i) => ({
      date,
      tempMax: d.temperature_2m_max ? d.temperature_2m_max[i] : null,
      tempMin: d.temperature_2m_min ? d.temperature_2m_min[i] : null,
      apparentTempMax: d.apparent_temperature_max ? d.apparent_temperature_max[i] : null,
      precipSum: d.precipitation_sum ? d.precipitation_sum[i] : 0,
      precipHours: d.precipitation_hours ? d.precipitation_hours[i] : 0,
      windSpeedMax: d.wind_speed_10m_max ? d.wind_speed_10m_max[i] : null,
      windGustsMax: d.wind_gusts_10m_max ? d.wind_gusts_10m_max[i] : null,
      windDirDominant: d.wind_direction_10m_dominant ? d.wind_direction_10m_dominant[i] : null,
      solarRadiation: d.shortwave_radiation_sum ? d.shortwave_radiation_sum[i] : null,
      et0Evapotranspiration: d.et0_fao_evapotranspiration ? d.et0_fao_evapotranspiration[i] : null,
      uvIndexMax: d.uv_index_max ? d.uv_index_max[i] : null,
    }));

    return { current, forecast1Hr, forecast3Hr, dailySeries };
  } catch (error) {
    console.error('Error fetching climate data:', error);
    return { current: null, forecast1Hr: null, forecast3Hr: null, dailySeries: [] };
  }
};
