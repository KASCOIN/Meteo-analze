import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getDateRange } from '../utils/weatherHelpers';

export const exportArchiveCSV = async ({ location, range, granularity, variables }) => {
  const { startDate, endDate } = getDateRange(range);
  const lat = location.latitude;
  const lon = location.longitude;

  let params = [];
  if (variables.temperature) params.push('temperature_2m_max', 'temperature_2m_min');
  if (variables.precipitation) params.push('precipitation_sum');
  if (variables.wind) params.push('wind_speed_10m_max');
  if (variables.solar) params.push('shortwave_radiation_sum');
  if (variables.evapotranspiration) params.push('et0_fao_evapotranspiration');

  if (params.length === 0) throw new Error('Select at least one variable.');

  let fetchUrl = '';
  if (granularity === 'hourly') {
    const hourlyParams = params.map((p) => p.replace('_max', '').replace('_sum', '')).join(',');
    fetchUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&hourly=${hourlyParams}&timezone=auto`;
  } else {
    fetchUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=${params.join(',')}&timezone=auto`;
  }

  const res = await fetch(fetchUrl);
  const csvData = await res.json();

  let timeArray = [];
  let dataObject = {};

  if (granularity === 'hourly' && csvData.hourly) {
    timeArray = csvData.hourly.time;
    dataObject = csvData.hourly;
  } else if (csvData.daily) {
    timeArray = csvData.daily.time;
    dataObject = csvData.daily;
  }

  if (!timeArray || timeArray.length === 0) throw new Error('No records returned.');

  const keys = Object.keys(dataObject);
  let csvContent = `Location,${location.name} (${lat}°N ${lon}°E)\n`;
  csvContent += `Granularity,${granularity}\n`;
  csvContent += `Export Date,${new Date().toISOString()}\n\n`;
  csvContent += keys.join(',') + '\n';

  for (let i = 0; i < timeArray.length; i++) {
    const row = keys.map((k) => dataObject[k][i] ?? '');
    csvContent += row.join(',') + '\n';
  }

  const fileName = `Climate_${location.name.replace(/\s+/g, '_')}_${startDate}_to_${endDate}.csv`;
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'Save Meteorological Dataset',
      UTI: 'public.comma-separated-values-text',
    });
  }

  return timeArray.length;
};
