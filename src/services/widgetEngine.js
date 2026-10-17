import { Platform } from 'react-native';

export const updateAndroidHomeScreenWidget = async (location, current, wmoDesc) => {
  if (Platform.OS !== 'android') return;

  try {
    const { requestWidgetUpdate } = require('react-native-android-widget');
    const React = require('react');
    const { FlexWidget, TextWidget } = require('react-native-android-widget');

    const WidgetLayout = () => (
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          backgroundColor: '#0d6efd',
          borderRadius: 16,
          padding: 12,
          justifyContent: 'space-between',
        }}
        clickAction="OPEN_APP"
      >
        <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TextWidget
            text={`📍 ${location.name || 'Live Location'}`}
            style={{ color: '#ffffff', fontSize: 14, fontWeight: 'bold' }}
          />
          <TextWidget text="LIVE 🟢" style={{ color: '#00ff88', fontSize: 10, fontWeight: 'bold' }} />
        </FlexWidget>

        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextWidget
            text={`${current?.temp ? Math.round(current.temp) : '--'}°C`}
            style={{ color: '#ffffff', fontSize: 32, fontWeight: 'bold' }}
          />
          <TextWidget
            text={` | ${wmoDesc || 'Overcast'}`}
            style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}
          />
        </FlexWidget>

        <TextWidget
          text={`💧 ${current?.humidity || '--'}% | 💨 ${current?.windSpeed || '--'} km/h`}
          style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11 }}
        />
      </FlexWidget>
    );

    await requestWidgetUpdate({
      widgetName: 'MeteoLiveWidget',
      renderWidget: () => <WidgetLayout />,
    });
  } catch (err) {
    // Graceful fallback if widget package is not native-linked during dev
    console.log('Android Widget update skipped:', err.message);
  }
};
            
