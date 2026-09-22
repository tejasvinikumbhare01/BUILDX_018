import { Router, Request, Response } from 'express';
import axios from 'axios';
import { config } from '../config/env';

const router = Router();

// Map WMO weather codes to human-readable conditions
function interpretWeatherCode(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code >= 1 && code <= 3) return 'Mainly clear to overcast';
  if (code >= 45 && code <= 48) return 'Fog and depositing rime fog';
  if (code >= 51 && code <= 55) return 'Drizzle: Light to dense intensity';
  if (code >= 61 && code <= 65) return 'Rain: Slight, moderate and heavy intensity';
  if (code >= 71 && code <= 77) return 'Snow fall & snow grains';
  if (code >= 80 && code <= 82) return 'Rain showers: Violent / torrential';
  if (code >= 95 && code <= 99) return 'Thunderstorm with heavy precipitation & hail';
  return 'Overcast';
}

const weatherCache = new Map<string, { data: any; timestamp: number }>();
const WEATHER_CACHE_TTL_MS = 5 * 60 * 1000;

router.get('/live', async (req: Request, res: Response): Promise<void> => {
  const { lat, lng } = req.query;

  if (lat === undefined || lng === undefined) {
    res.status(400).json({ error: 'Latitude and longitude coordinates are required for weather.' });
    return;
  }

  const latitude = parseFloat(lat as string);
  const longitude = parseFloat(lng as string);

  if (isNaN(latitude) || isNaN(longitude)) {
    res.status(400).json({ error: 'Invalid latitude or longitude.' });
    return;
  }

  const cacheKey = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < WEATHER_CACHE_TTL_MS) {
    res.json(cached.data);
    return;
  }

  try {
    // Real call to Open-Meteo Global Forecasting & Weather Observation API
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m',
        hourly: 'precipitation_probability,rain',
        timezone: 'auto',
      },
      timeout: 4000,
    });

    const current = response.data?.current;


    if (!current) {
      res.json({
        available: false,
        message: 'Live rainfall data currently unavailable.',
      });
      return;
    }

    const weatherData = {
      available: true,
      provider: 'Open-Meteo Global Observation Network',
      latitude,
      longitude,
      temperatureC: current.temperature_2m,
      temperatureF: Math.round((current.temperature_2m * 9) / 5 + 32),
      humidity: current.relative_humidity_2m,
      precipitationMm: current.precipitation,
      rainfallMm: current.rain,
      windSpeedKmH: current.wind_speed_10m,
      condition: interpretWeatherCode(current.weather_code),
      weatherCode: current.weather_code,
      floodRiskIndicator:
        current.rain > 25
          ? 'EXTREME_RAINFALL'
          : current.rain > 10
          ? 'HEAVY_RAINFALL'
          : current.rain > 2
          ? 'MODERATE_RAIN'
          : 'NORMAL',
      lastUpdated: current.time,
    };

    weatherCache.set(cacheKey, { data: weatherData, timestamp: Date.now() });

    res.json(weatherData);
  } catch (error: any) {
    console.warn('Live weather provider network error:', error.message);
    // Explicitly enforce Requirement 10: "Do NOT invent data. Show: 'Live rainfall data currently unavailable.'"
    res.json({
      available: false,
      message: 'Live rainfall data currently unavailable.',
    });
  }
});

export default router;
