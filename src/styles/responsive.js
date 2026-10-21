import { Dimensions } from 'react-native';

export const getDeviceProfile = (screenWidth = Dimensions.get('window').width, screenHeight = Dimensions.get('window').height) => {
  if (screenWidth >= 1024 || screenHeight >= 1366) {
    return 'tablet';
  }

  if (screenWidth >= 768) {
    return 'largeTablet';
  }

  if (screenWidth >= 430) {
    return 'largePhone';
  }

  if (screenWidth >= 390) {
    return 'standardPhone';
  }

  if (screenWidth >= 360) {
    return 'smallPhone';
  }

  return 'tinyPhone';
};

export const getResponsiveScale = (screenWidth = Dimensions.get('window').width) => {
  if (screenWidth >= 768) return 1.15;
  if (screenWidth >= 430) return 1.08;
  if (screenWidth >= 390) return 1;
  if (screenWidth >= 360) return 0.94;
  return 0.88;
};
