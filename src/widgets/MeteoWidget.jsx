import React from 'react';
import { Platform, View, Text } from 'react-native';

export const MeteoWidget = ({ locationName = 'My Location', temperature = '--', condition = 'Clear', updatedAt = 'Now' }) => {
  if (Platform.OS !== 'android') {
    return (
      <View style={{ height: 110, width: 180, backgroundColor: '#0d6efd', borderRadius: 18, padding: 12, justifyContent: 'space-between' }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>📍 {locationName}</Text>
        <Text style={{ color: '#fff', fontSize: 30, fontWeight: 'bold' }}>{temperature}°C</Text>
        <Text style={{ color: '#fff', fontSize: 11 }}>{condition}</Text>
      </View>
    );
  }

  try {
    const widgetModule = require('react-native-android-widget');
    const FlexWidget = widgetModule?.FlexWidget;
    const TextWidget = widgetModule?.TextWidget;

    if (!FlexWidget || !TextWidget) {
      throw new Error('Widget component unavailable');
    }

    return (
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
          <TextWidget text={`${temperature}°C`} style={{ color: '#ffffff', fontSize: 30, fontWeight: 'bold' }} />
          <TextWidget text={condition} style={{ color: '#ffffff', fontSize: 11, opacity: 0.9, marginLeft: 6 }} />
        </FlexWidget>

        <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextWidget text="Updated" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 10 }} />
          <TextWidget text={updatedAt} style={{ color: 'rgba(255,255,255,0.8)', fontSize: 9 }} />
        </FlexWidget>
      </FlexWidget>
    );
  } catch (error) {
    return (
      <View style={{ height: 110, width: 180, backgroundColor: '#0d6efd', borderRadius: 18, padding: 12, justifyContent: 'space-between' }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>📍 {locationName}</Text>
        <Text style={{ color: '#fff', fontSize: 30, fontWeight: 'bold' }}>{temperature}°C</Text>
        <Text style={{ color: '#fff', fontSize: 11 }}>{condition}</Text>
      </View>
    );
  }
};

export default MeteoWidget;
