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

const buildGeminiSystemInstruction = () => `You are an expert meteorologist and personal wardrobe advisor for "Meteo Analaze".
Your task is to analyze the provided live weather telemetry JSON and output a concise, highly accurate 2-sentence advisory (under 45 words).

CRITICAL ADVISORY RULES:
1. THERMAL SAFETY (Strictly match clothing to temperatures):
   - Below -10°C: Require heavy insulated winter coats, thermal base layers, gloves, and face protection. NEVER suggest light outer layers or casual gear.
   - -10°C to 5°C: Require heavy jacket, parka, sweater, scarf, and warm gloves.
   - 5°C to 18°C: Suggest light jacket, hoodie, or sweater.
   - 18°C to 28°C: Suggest comfortable casual clothing, t-shirts, and light sleeves.
   - Above 28°C: Suggest breathable cotton, sunglasses, and hydration.
2. PRECIPITATION & WIND:
   - Only mention an umbrella or rain shell if precipitation probability is greater than 40% or rain is actively occurring.
   - If snowing or freezing rain, recommend waterproof winter boots and snow protection.
3. TONAL STANDARD: Professional, concise, actionable, and Google-grade.
4. OUTPUT FORMAT: Exactly 2 sentences, under 45 words total, no lists, no markdown, no intro text.`;

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
  const precipProb = typeof currentData.precipProb === 'number' ? currentData.precipProb : (typeof currentData.precipitationProbability === 'number' ? currentData.precipitationProbability : 0);

  const metrics = [
    `location: ${locationName}`,
    `conditions: ${wmoDesc}`,
    `current_temp_c: ${tempValue}°${tempUnit}`,
    feelsLike !== null ? `feels_like_c: ${feelsLike}°${tempUnit}` : null,
    `humidity_percent: ${humidity}%`,
    `wind_kmh: ${windSpeed}`,
    `precipitation_mm: ${precipitation}`,
    `precip_probability_percent: ${precipProb}%`,
    `daylight: ${daylight}`,
    uvIndex !== null ? `uv_index: ${uvIndex}` : null,
    pressure !== null ? `pressure_hpa: ${pressure}` : null,
    visibility !== null ? `visibility_km: ${visibility}` : null,
    forecast1Hr ? `next_hour: ${forecast1Hr.time} ${forecast1Hr.temp}°${tempUnit}, precip ${forecast1Hr.precipProb ?? 0}%` : null,
    forecast3Hr ? `in_three_hours: ${forecast3Hr.time} ${forecast3Hr.temp}°${tempUnit}, precip ${forecast3Hr.precipProb ?? 0}%` : null,
    today ? `today: high ${today.tempMax ?? '--'}°${tempUnit}, low ${today.tempMin ?? '--'}°${tempUnit}, precip ${today.precipSum ?? 0} mm` : null,
  ].filter(Boolean).join('; ');

  return `{${metrics}}`;
};

const getThermalGuidance = (tempValue) => {
  if (tempValue < -10) return 'heavy insulated winter coat, thermal base layers, gloves, and face protection';
  if (tempValue < 5) return 'a heavy parka, sweater, scarf, and warm gloves';
  if (tempValue < 18) return 'a light jacket, hoodie, or sweater';
  if (tempValue < 28) return 'comfortable casual layers and light sleeves';
  return 'breathable cotton, sunglasses, and hydration';
};

const getRainGuidance = ({ tempValue, precipProb, weatherText }) => {
  const isSnow = /snow|ice|freezing/i.test(weatherText) || tempValue <= 2;
  if (isSnow) return 'wear waterproof winter boots and snow protection';
  if (precipProb > 40) return 'carry an umbrella or rain shell';
  return 'avoid extra layers unless showers develop';
};

const normalizeGeminiAdvice = (text) => {
  if (!text) return '';

  let value = String(text).trim();
  value = value.replace(/^For\s+(?:Current\s+Position|[^,]+),?\s*/i, '');
  value = value.replace(/^For\s+[^:]+:\s*/i, '');
  value = value.replace(/^Expect\s+/i, '');
  value = value.replace(/^[-•\s]+/, '');
  value = value.replace(/\s{2,}/g, ' ');
  value = value.replace(/\s+([,.!?])/g, '$1');

  const sentences = value.split(/(?<=[.!?])\s+/).map((part) => part.trim()).filter(Boolean);
  const prioritized = (sentences.length > 2 ? sentences.slice(0, 2) : sentences).join(' ');
  let finalText = prioritized || value;

  if (!/[.!?]$/.test(finalText)) finalText = `${finalText}.`;
  const words = finalText.split(/\s+/).filter(Boolean);
  if (words.length > 45) {
    return `${words.slice(0, 45).join(' ')}.`;
  }

  return finalText;
};

const buildProfessionalFallbackAdvice = ({ locationName, current, wmoDesc, tempUnit }) => {
  const tempValue = typeof current?.temp === 'number' ? current.temp : 0;
  const feelsLike = typeof current?.apparentTemp === 'number' ? current.apparentTemp : tempValue;
  const precipProb = typeof current?.precipProb === 'number' ? current.precipProb : (typeof current?.precipitationProbability === 'number' ? current.precipitationProbability : 0);
  const weatherText = wmoDesc ? wmoDesc.toLowerCase() : 'conditions';
  const clothing = getThermalGuidance(tempValue);
  const rainAdvice = getRainGuidance({ tempValue, precipProb, weatherText });

  return `In ${locationName}, ${weatherText} are around ${tempValue}°${tempUnit}, feeling ${feelsLike}°${tempUnit}. Wear ${clothing}. ${rainAdvice}.`;
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

  const telemetryText = buildWeatherSnapshotText(locationName, current, wmoDesc, tempUnit, weatherSnapshot);

  const prompt = isForNotification
    ? `Weather telemetry: ${telemetryText}. Return a crisp, one-sentence action alert under 12 words.`
    : `Weather telemetry: ${telemetryText}. Produce exactly 2 sentences, under 45 words total, with weather-safe clothing and precipitation rules strictly followed.`;

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
            systemInstruction: {
              parts: [{ text: buildGeminiSystemInstruction() }],
            },
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
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
