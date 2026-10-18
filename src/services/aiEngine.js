/**
 * Practical Lifestyle AI Advisory Engine via Kilo AI Gateway
 * Endpoint: https://api.kilo.ai/api/gateway
 */
export const fetchKiloAiWeatherSummary = async ({
  locationName,
  current,
  wmoDesc,
  tempUnit,
  isForNotification = false,
}) => {
  if (!current) return null;

  const promptContent = isForNotification
    ? `Give a 1-sentence quick weather alert for ${locationName}. Weather: ${wmoDesc}, ${current.temp}°${tempUnit}, Humidity: ${current.humidity}%. Tell them what to wear or carry (e.g. umbrella, jacket, or water) in under 12 words.`
    : `Provide practical daily lifestyle advice for an average person in ${locationName} based on this weather:
Condition: ${wmoDesc}, Temp: ${current.temp}°${tempUnit}, Humidity: ${current.humidity}%, Wind: ${current.windSpeed} km/h.
Include: 
1. What to wear today (light clothing, rain jacket, layer up).
2. Hydration & outdoor advice (drink water, wear sunscreen, or stay indoors).
Keep it friendly, practical, and concise (2 to 3 sentences total).`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch('https://api.kilo.ai/api/gateway', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'kilo-default',
        messages: [
          {
            role: 'system',
            content:
              'You are a friendly weather assistant giving practical lifestyle advice (clothing, hydration, gear) to everyday people.',
          },
          {
            role: 'user',
            content: promptContent,
          },
        ],
        max_tokens: isForNotification ? 40 : 100,
      }),
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const aiText = data?.choices?.[0]?.message?.content || data?.summary || data?.result;
      if (aiText && typeof aiText === 'string') {
        return aiText.trim();
      }
    }
  } catch (err) {
    // Fallback on timeout or network error
  }

  // Practical Rule-Based Fallback Engine
  const tempC = tempUnit === 'F' ? ((current.temp - 32) * 5) / 9 : current.temp;

  if (isForNotification) {
    if (current.humidity > 80 && current.weatherCode >= 50) return '☔ Rain expected today! Carry an umbrella and wear waterproof shoes.';
    if (tempC > 30) return '☀️ Hot & humid day! Wear breathable cotton and drink plenty of water.';
    if (tempC < 18) return '🧥 Chilly weather! Grab a jacket or sweater before heading out.';
    return '🌤️ Pleasant weather ahead! Dress comfortably and enjoy your day.';
  }

  if (current.humidity > 80 && current.weatherCode >= 50) {
    return '☔ Rainfall expected today. Wear waterproof footwear, pack an umbrella, and keep light rain gear handy. Remember to stay hydrated throughout the day!';
  } else if (tempC > 30) {
    return '☀️ It is warm and sunny today! Wear lightweight, breathable cotton clothes, put on sunglasses or sunscreen, and carry a water bottle to stay hydrated.';
  } else if (tempC < 18) {
    return '🧥 Cool atmospheric conditions ahead. Layer up with a light jacket or sweater to stay warm during morning and evening commutes.';
  }
  return '🌤️ Weather conditions are comfortable today! Wear casual comfortable clothing, stay hydrated, and enjoy any planned outdoor activities.';
};
