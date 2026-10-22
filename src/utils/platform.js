import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isApp = Platform.OS === 'android' || Platform.OS === 'ios';

export default {
  isWeb,
  isApp,
};
