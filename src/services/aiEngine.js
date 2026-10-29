/**
 * Practical Lifestyle AI Advisory Engine.
 * Primary path: Google Gemini with live weather-grounded prompts.
 * Fallback path: concise rule-based advice when the API is unavailable.
 */
import Constants from 'expo-constants';

const getGeminiApiKey = () => {
  const expoExtra = Constants?.expoConfig?.extra || Constants?.manifest?.extra || {};

  const directValues = [
    process?.env?.EXPO_PUBLIC_GEMINI_API_KEY,
    process?.env?.GEMINI_API_KEY,
    globalThis?.EXPO_PUBLIC_GEMINI_API_KEY,
    globalThis?.GEMINI_API_KEY,
    expoExtra?.EXPO_PUBLIC_GEMINI_API_KEY,
    expoExtra?.GEMINI_API_KEY,
    expoExtra?.geminiApiKey,
  ];

  for (const value of directValues) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
};

const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest'];

const extractGeminiText = (payload) => {
  const candidates = payload?.candidates || [];
  for (const candidate of candidates) {
    const parts = candidate?.content?.parts || [];
    for (const part of parts) {
      if (typeof part?.text === 'string' && part.text.trim()) {
        return part.text.trim();
      }
    }
  }
  return null;
};

const normalizeGeminiAdvice = (text) => {
  if (!text) return '';
  let value = String(text).trim();
  value = value.replace(/^For\s+(?:Current\s+Position|[^,]+),?\s*/i, '');
  value = value.replace(/^For\s+[^:]+:\s*/i, '');
  value = value.replace(/^Expect\s+/i, '');
  value = value.replace(/\s{2,}/g, ' ');
  value = value.replace(/^[-•\s]+/, '');
  if (!/[.!?]$/.test(value)) value = `${value}.`;
  return value;
};

const buildWeatherSnapshotText = (locationName, current, wmoDesc, tempUnit, weatherSnapshot = null) => {
  const source = weatherSnapshot || { current };
  const currentData = source.current || current || {};
  const forecast1Hr = source.forecast1Hr || null;
  const forecast3Hr = source.forecast3Hr || null;
  const today = source.dailySeries && source.dailySeries[0] ? source.dailySeries[0] : null;

  const tempValue = typeof currentData.temp === 'number' ? currentData.temp : 0;
  const feelsLike = typeof currentData.apparentTemp === 'number' ? currentData.apparentTemp : null;
  const humidity = typeof currentData.humidity === 'number' ? currentData.humidity : 0;
  const windSpeed = typeof currentData.windSpeed === 'number' ? currentData.windSpeed : 0;
  const precipitation = typeof currentData.precipitation === 'number' ? currentData.precipitation : 0;
  const daylight = typeof currentData.isDay === 'boolean' ? (currentData.isDay ? 'daytime' : 'nighttime') : 'daytime';
  const uvIndex = typeof currentData.uvIndex === 'number' ? currentData.uvIndex : null;
  const pressure = typeof currentData.pressure === 'number' ? currentData.pressure : null;
  const visibility = typeof currentData.visibility === 'number' ? currentData.visibility : null;

  const metrics = [
    `Location: ${locationName}`,
    `Conditions: ${wmoDesc}`,
    `Current temp: ${tempValue}°${tempUnit}`,
    feelsLike !== null ? `Feels like: ${feelsLike}°${tempUnit}` : null,
    `Humidity: ${humidity}%`,
    `Wind: ${windSpeed} ${tempUnit === 'F' ? 'mph' : 'km/h'}`,
    `Precipitation: ${precipitation} mm`,
    `Daylight: ${daylight}`,
    uvIndex !== null ? `UV index: ${uvIndex}` : null,
    pressure !== null ? `Pressure: ${pressure} hPa` : null,
    visibility !== null ? `Visibility: ${visibility} km` : null,
    forecast1Hr ? `Next hour: ${forecast1Hr.time} ${forecast1Hr.temp}°${tempUnit}, ${forecast1Hr.precipProb ?? 0}% precip, wind ${forecast1Hr.windSpeed ?? 0} ${tempUnit === 'F' ? 'mph' : 'km/h'}` : null,
    forecast3Hr ? `In 3 hours: ${forecast3Hr.time} ${forecast3Hr.temp}°${tempUnit}, ${forecast3Hr.precipProb ?? 0}% precip, wind ${forecast3Hr.windSpeed ?? 0} ${tempUnit === 'F' ? 'mph' : 'km/h'}` : null,
    today ? `Today: high ${today.tempMax ?? '--'}°${tempUnit}, low ${today.tempMin ?? '--'}°${tempUnit}, total precip ${today.precipSum ?? 0} mm, max wind ${today.windSpeedMax ?? '--'} ${tempUnit === 'F' ? 'mph' : 'km/h'}, UV max ${today.uvIndexMax ?? '--'}` : null,
  ].filter(Boolean).join('; ');

  return metrics;
};

const buildProfessionalFallbackAdvice = ({ locationName, current, wmoDesc, tempUnit }) => {
  const tempValue = typeof current?.temp === 'number' ? current.temp : 0;
  const humidity = typeof current?.humidity === 'number' ? current.humidity : 0;
  const windSpeed = typeof current?.windSpeed === 'number' ? current.windSpeed : 0;
  const feelsLike = typeof current?.apparentTemp === 'number' ? current.apparentTemp : tempValue;
  const weatherText = wmoDesc ? wmoDesc.toLowerCase() : 'current conditions';
  const clothing = tempValue >= 30 ? 'lightweight breathable clothing and sun protection' : tempValue >= 22 ? 'light layers with a breathable top' : 'a light outer layer if the evening cools';
  const warning = windSpeed > 25 || humidity > 75 ? 'keep an umbrella or rain shell close by and avoid exposed routes' : 'stay hydrated and ease back on strenuous outdoor work during the warmest hours';

  return `Conditions in ${locationName} are ${weatherText}, with ${tempValue}°${tempUnit} air and a feels-like of ${feelsLike}°${tempUnit}. Wear ${clothing}, stay hydrated, and ${warning}.`;
};

export const fetchGeminiWeatherAdvice = async ({
  locationName,
  current,
  wmoDesc,
  tempUnit,
  weatherSnapshot = null,
  isForNotification = false,
}) => {
  const apiKey = getGeminiApiKey();
  if (!current) return null;
  if (!apiKey) {
    return buildProfessionalFallbackAdvice({ locationName, current, wmoDesc, tempUnit });
  }

  const snapshotText = buildWeatherSnapshotText(locationName, current, wmoDesc, tempUnit, weatherSnapshot);
  const prompt = isForNotification
    ? `Use the exact weather data below for ${locationName} and produce a concise, professional 1-sentence alert with action. Weather snapshot: ${snapshotText}. Search for recent local climate context only if needed. Start directly with the condition itself, not with 'For ${locationName}', 'For Current Position', or 'Expect'. Keep it highly polished, complete, and under 12 words.`
    : `Use the exact weather data below for ${locationName} and write a polished, professional lifestyle advisory. Weather snapshot: ${snapshotText}. Search for recent local climate context only if it clarifies the conditions. Output exactly 2 complete sentences. Do not start with 'For ${locationName}', 'For Current Position', or 'Expect'. Start with the actual weather condition and then explain the clothing, hydration, and any rain or heat/wind advice in a natural expert tone.`;

  let lastError = null;
  for (const modelName of GEMINI_MODELS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey,
          },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.5,
              topP: 0.9,
              maxOutputTokens: isForNotification ? 60 : 180,
            },
          }),
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        lastError = new Error(`Gemini ${modelName} failed: ${response.status} ${errorBody}`);
        console.warn(lastError.message);
        continue;
      }

      const text = extractGeminiText(await response.json());
      const cleaned = normalizeGeminiAdvice(text);
      const weakOpen = /^For\s+/i.test(cleaned) || cleaned.length < 35 || cleaned.split(' ').length < 8;
      if (cleaned && !weakOpen) return cleaned;
      if (cleaned && weakOpen) return buildProfessionalFallbackAdvice({ locationName, current, wmoDesc, tempUnit });
    } catch (err) {
      lastError = err;
      console.warn(`Gemini ${modelName} request failed:`, err);
    }
  }

  if (lastError) console.warn('All Gemini advisory attempts failed:', lastError);
  return null;
};

export const fetchKiloAiWeatherSummary = async ({
  locationName,
  current,
  wmoDesc,
  tempUnit,
  weatherSnapshot = null,
  isForNotification = false,
}) => {
  if (!current) return null;

  const geminiAdvice = await fetchGeminiWeatherAdvice({
    locationName,
    current,
    wmoDesc,
    tempUnit,
    weatherSnapshot,
    isForNotification,
  });

  if (geminiAdvice) return geminiAdvice;
  return buildProfessionalFallbackAdvice({ locationName, current, wmoDesc, tempUnit });
};
