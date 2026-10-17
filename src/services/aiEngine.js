/**
 * Service to request real-time weather AI summaries via Kilo AI Gateway
 * Gateway Endpoint: https://api.kilo.ai/api/gateway
 */
export const fetchKiloAiWeatherSummary = async ({ locationName, current, wmoDesc, tempUnit }) => {
  if (!current) return null;

  const promptText = `Provide a concise 2-sentence meteorological advisory for ${locationName}. Current Weather: ${wmoDesc}, Temperature: ${current.temp}°${tempUnit}, Humidity: ${current.humidity}%, Wind: ${current.windSpeed} km/h. Keep it actionable for research or daily planning.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout

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
            content: 'You are an atmospheric AI research assistant providing quick climate advisories.',
          },
          {
            role: 'user',
            content: promptText,
          },
        ],
        max_tokens: 80,
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
    // Graceful fallback on network delay or offline
  }

  // Local Rule-Based Fallback Engine
  if (current.humidity > 80 && current.weatherCode >= 50) {
    return 'High relative humidity with active precipitation. Secure field instrumentation and prepare for rainfall.';
  } else if (current.temp > 32) {
    return 'Elevated surface thermal index detected. Extreme heat stress potential—hydration recommended for field operations.';
  } else if (current.windSpeed > 25) {
    return 'High surface wind velocities recorded. Exercise caution with atmospheric sensor deployments.';
  }
  return 'Atmospheric parameters are optimal for field operations, outdoor research, and sensor calibration.';
};
