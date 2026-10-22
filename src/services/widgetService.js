import { Platform } from 'react-native';
import { getWMOWeather } from '../utils/weatherHelpers';

export const registerHomeWidgetTaskHandler = () => {
  if (Platform.OS !== 'android') return null;

  try {
    const { registerWidgetTaskHandler } = require('react-native-android-widget');
    if (typeof registerWidgetTaskHandler === 'function') {
      return registerWidgetTaskHandler(async (args) => {
        return args;
      });
    }
  } catch (error) {
    console.warn('Widget task handler registration failed:', error);
  }

  return null;
};

export const updateHomeWidget = async (weatherData = {}) => {
  if (Platform.OS !== 'android') return null;

  try {
    const { requestWidgetUpdate } = require('react-native-android-widget');
    const React = require('react');
    const { FlexWidget, TextWidget } = require('react-native-android-widget');

    const locationName = weatherData.location?.name || weatherData.locationName || 'My Location';
    const current = weatherData.current || {};
    const temp = Number.isFinite(current.temp) ? Math.round(current.temp) : '--';
    const humidity = Number.isFinite(current.humidity) ? current.humidity : '--';
    const windSpeed = Number.isFinite(current.windSpeed) ? current.windSpeed : '--';
    const wmoDesc = weatherData.wmoDesc || (current.weatherCode != null ? getWMOWeather(current.weatherCode)?.desc : 'Clear');
    const updatedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const WidgetLayout = () => (
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          backgroundColor: '#0d6efd',
          borderRadius: 18,
          padding: 12,
          justifyContent: 'space-between',
        }}
        clickAction="OPEN_APP"
      >
        <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextWidget text={`📍 ${locationName}`} style={{ color: '#ffffff', fontSize: 13, fontWeight: 'bold' }} />
          <TextWidget text="LIVE 🟢" style={{ color: '#7ef9be', fontSize: 10, fontWeight: 'bold' }} />
        </FlexWidget>

        <FlexWidget style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          <TextWidget text={`${temp}°C`} style={{ color: '#ffffff', fontSize: 30, fontWeight: 'bold' }} />
          <TextWidget text={wmoDesc} style={{ color: '#ffffff', fontSize: 11, opacity: 0.9, marginLeft: 6 }} />
        </FlexWidget>

        <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextWidget text={`${humidity}% RH`} style={{ color: 'rgba(255,255,255,0.86)', fontSize: 10 }} />
          <TextWidget text={`${windSpeed} km/h`} style={{ color: 'rgba(255,255,255,0.86)', fontSize: 10 }} />
          <TextWidget text={`Updated ${updatedAt}`} style={{ color: 'rgba(255,255,255,0.8)', fontSize: 9 }} />
        </FlexWidget>
      </FlexWidget>
    );

    return requestWidgetUpdate({
      widgetName: 'MeteoWidget',
      renderWidget: () => <WidgetLayout />,
    });
  } catch (error) {
    console.warn('Widget update failed:', error);
    return null;
  }
};

export default {
  registerHomeWidgetTaskHandler,
  updateHomeWidget,
};
