import { registerRootComponent } from 'expo';
import App from './App';

let widgetTaskHandler = null;

try {
  const widgetModule = require('react-native-android-widget');
  const widgetHandlerModule = require('./widgets/widgetHandler');
  widgetTaskHandler = widgetHandlerModule?.widgetTaskHandler;
  if (widgetModule?.registerWidgetTaskHandler && typeof widgetTaskHandler === 'function') {
    widgetModule.registerWidgetTaskHandler(widgetTaskHandler);
  }
} catch (error) {
  console.warn('Android widget registration skipped:', error?.message || error);
}

registerRootComponent(App);
