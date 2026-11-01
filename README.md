# Meteo Analaze ☁️

A cross-platform weather app built with Expo and React Native for web, Android, and iOS. It combines live weather telemetry, local persistence, location search, AI weather guidance, and user-configurable notification settings.

---

## Overview

Meteo Analaze lets users:

- search and select locations worldwide
- get live weather conditions from Open-Meteo
- view temperature, humidity, wind, gusts, UV, pressure, and visibility
- switch between dark and light mode
- save personal settings and app preferences locally
- receive browser/native weather alerts when permissions allow
- use a weather-aware AI advisory with a fallback rule-based explanation

---

## Current features

### Weather and location
- live weather data from Open-Meteo
- GPS location lookup for the current device position
- city search and location selection
- forecast and current-condition display
- offline banner and cached fallback data when the network is unavailable

### Preferences and persistence
- dark mode toggle
- temperature unit switching: C, F, K
- wind speed unit switching: km/h, m/s, mph
- saved app state across app restart and browser refresh using local storage / AsyncStorage
- notification preferences saved for later restoration

### Notifications
- browser notification support when permission is granted
- native app notification support for Android/iOS
- daily briefing scheduling for the app
- manual instant alert trigger for testing and live weather brief checks

### AI advisory
- Gemini-based weather guidance when an API key is available
- fallback practical weather advice when the AI service is unavailable or returns weak data

---

## Tech stack

- React Native
- Expo SDK 51
- Open-Meteo API
- Google Generative AI / Gemini endpoint via API key
- AsyncStorage for native apps
- localStorage for web persistence
- Expo Location and Expo Notifications

---

## Project structure

```text
Meteo-analze/
├── App.js
├── app.json
├── index.js
├── package.json
├── README.md
├── android/
├── assets/
├── public/
├── src/
│   ├── components/
│   │   ├── ArchiveModal.js
│   │   ├── CompassModal.jsx
│   │   ├── CustomAlertModal.js
│   │   ├── GlassView.js
│   │   ├── NavigationModal.jsx
│   │   ├── NotificationModal.js
│   │   ├── OfflineBanner.js
│   │   ├── SettingsModal.js
│   │   ├── TrendAnalysis.js
│   │   └── WeatherHeroCard.js
│   ├── constants/
│   │   └── theme.js
│   ├── services/
│   │   ├── aiEngine.js
│   │   ├── geocodingEngine.js
│   │   ├── locationService.js
│   │   ├── notificationService.js
│   │   └── weatherEngine.js
│   ├── styles/
│   │   ├── globalStyles.js
│   │   └── responsive.js
│   └── utils/
│       ├── offlineStorage.js
│       ├── platform.js
│       ├── storage.js
│       ├── unitConverters.js
│       └── weatherHelpers.js
└── components/
    └── CompassModal.jsx
```

---

## Setup

1. Install dependencies:

   npm install

2. Start the app:

   npm start

3. Run on a platform:

   npm run android
   npm run ios
   npm run web

4. Optional web export:

   npm run build:web

---

## Notes

- Browser notifications are subject to browser permission rules and may be blocked by browser policies.
- Native app notifications depend on device permission grants and OS scheduling support.
- The AI guidance works best when a valid Gemini API key is provided in the Expo config or environment.
- The app is designed for practical weather understanding, not high-precision scientific instrumentation.

---

## Attribution

- Weather data: Open-Meteo
- App platform: Expo + React Native
- Location services: Expo Location
- Geocoding: Open-Meteo / location APIs used in the app

## Contact

- Portfolio: https://mazimum.onrender.com/
- Email: nwosukasie@gmail.com
