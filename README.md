# Meteo Analaze ☁️

> **High-Precision Atmospheric Telemetry, Offline-First Climate Analytics & AI Lifestyle Advisory Platform**

[![React Native](https://img.shields.io/badge/React_Native-0.74.5-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo SDK](https://img.shields.io/badge/Expo_SDK-51.0.0-000000?logo=expo&logoColor=white)](https://expo.dev/)
[![Platform](https://img.shields.io/badge/Platform-Web_%7C_Android-blue)](https://github.com/KASCOIN/Meteo-analze)
[![Data Provider](https://img.shields.io/badge/Data-Open--Meteo-007ACC)](https://open-meteo.com/)
[![License](https://img.shields.io/badge/License-CC_BY_4.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)

---

## 📌 Executive Overview

**Meteo Analaze** is a full-stack, cross-platform meteorological engineering platform (Web & Native Android) designed for atmospheric research, real-time observational telemetry, and personalized weather advisory. 

By integrating Open-Meteo reanalysis datasets with Kilo AI predictive modeling, the platform translates complex physical atmospheric parameters (barOClinic dynamics, dew point, UV indexing, wind shear vectors) into actionable, real-time lifestyle guidance (clothing selection, hydration planning, gear readiness). It is built from the ground up with an offline-first architecture, background sync workers, and Android home screen widget integration.

---

## 🚀 Key Features & Architectural Capabilities

### 🛰️ Real-Time Telemetry & Spatial Geocoding
* **Full Variable Suite**: Monitors real-time temperature, apparent ("feels like") temperature, relative humidity, wind velocity/gust kinematics, surface barometric pressure, cloud cover percentage, UV index, dew point, and horizontal visibility.
* **Global Spatial Resolution**: Global location search powered by OpenStreetMap & GeoNames, with precise single-tap GPS target locking via the **`📍 Me`** module.
* **Underground Telemetry Sync**: Background 1-minute automated polling loop ensuring live operational telemetry without manual user intervention.

### 🤖 Kilo AI Lifestyle & Advisory Engine
* **Context-Aware Practical Guidance**: Translates multi-variable atmospheric states into immediate lifestyle recommendations (e.g., thermal layering, hydration volume, UV protection, rain gear requirements).
* **Dual-Tier Summary Architecture**: Generates comprehensive multi-sentence analytical summaries for in-app views alongside ultra-concise (<12 word) push notifications.
* **6 AM Automated Daily Briefings**: Scheduled daily morning push briefings detailing daytime meteorological trends and preparation advisories.

### 📶 Offline-First Architecture & Automated Cache Purging
* **Twice-Daily Pre-Fetching**: Automatically caches 12-hour predictive forecast payloads at midnight (`00:00`) and noon (`12:00`).
* **Seamless Offline Fallback**: Automatically switches to local cached telemetry when network disconnects occur, displaying an active **`📡 Offline Mode`** banner indicator.
* **3-Day Storage Auto-Purge**: Background sanitation engine purges cached weather records older than 3 days ($259,200,000\text{ ms}$) to ensure zero storage bloat.
* **Universal Storage Abstraction**: Unifies state persistence across native mobile (`@react-native-async-storage/async-storage`) and web browsers (`localStorage`).

### 🔔 Custom Notifications & Native Android Widget
* **Flexible Dispatch Interval**: Supports custom alert intervals ranging from a rapid 5-minute testing mode (`⚡ 5m`) up to 6 hours.
* **Native Android Home Screen Widget**: `MeteoLiveWidget` provides real-time surface temperature, condition badges, and humidity directly on the native launcher layout.
* **Glassmorphism Alert UI**: Custom, responsive system modals (`CustomAlertModal`) replace standard platform dialog boxes.

---

## 🛠️ Technology Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Core Framework** | React Native `v0.74.5` | Cross-platform UI development engine |
| **SDK & Runtime** | Expo `v51.0.0` | Build toolchain, background tasks & native module management |
| **Web Engine** | React Native Web `v0.19.10` | Web bundle compilation & DOM rendering |
| **Primary Telemetry** | Open-Meteo API | Non-commercial weather & reanalysis data (CC BY 4.0) |
| **AI Gateway** | Kilo AI API (`kilo-default`) | LLM inference gateway for daily lifestyle synthesis |
| **Storage Engine** | Async Storage / Web Storage | Cross-platform state & telemetry persistence |
| **Native Widgets** | `react-native-android-widget` | Android home screen widget layout generator |

---

## 📂 Repository Structure

```text
meteo-analaze/
├── App.js                         # Central lifecycle controller, background sync & polling loops
├── app.json                       # Expo configuration, permissions, and build plugins
├── package.json                   # Project dependencies and deployment scripts
├── public/                        # Static web assets and template entry points
│   ├── favicon.ico
│   └── index.html
├── assets/                        # App branding, adaptive icons, and splash assets
└── src/
    ├── components/
    │   ├── ArchiveModal.js        # Historical climate data archive search & analysis
    │   ├── CustomAlertModal.js    # Glassmorphism alert dialog component
    │   ├── Footer.js              # Web footer containing data credits & contact info
    │   ├── NotificationModal.js  # Weather notification target & schedule setup
    │   ├── OfflineBanner.js       # Dynamic offline state indicator banner
    │   ├── SettingsModal.js       # App preferences, dark mode, and unit toggles
    │   └── WeatherHeroCard.js     # Glassmorphism card displaying telemetry & AI tips
    ├── constants/
    │   └── theme.js               # Design token definitions for light & dark themes
    ├── services/
    │   ├── aiEngine.js            # Kilo AI Gateway integration & rule-based fallbacks
    │   ├── geocodingEngine.js     # Spatial geocoding API wrappers
    │   ├── weatherEngine.js       # Open-Meteo API processing engine
    │   └── widgetEngine.js        # Android home screen widget background updater
    ├── styles/
    │   └── globalStyles.js        # Universal application stylesheet
    └── utils/
        ├── offlineStorage.js      # 12-hour pre-fetching & 3-day storage auto-purge engine
        ├── storage.js             # Universal persistent preference wrapper
        ├── unitConverters.js      # Unit conversion utilities (temperature, speed)
        └── weatherHelpers.js      # WMO condition code mappings & icon assignments

```



📄 License & Attribution
Software License: Distributed under the MIT License.
Weather Data License: Meteorological datasets provided by Open-Meteo.com under the Creative Commons Attribution 4.0 International (CC BY 4.0) license.
Geocoding Credits: Powered by OpenStreetMap and GeoNames databases.



👨‍🔬 Author & Academic Contact
Kasiemobechukwu Faith Nwosu

👉Department of Geography (Meteorology & Climate Science Program)
University of Lagos, Nigeria

👉Developer Portfolio: https://mazimum.onrender.com/

👉Email: nwosukasie@gmail.com
