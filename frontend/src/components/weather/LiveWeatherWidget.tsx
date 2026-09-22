import React, { useEffect, useState } from 'react';
import { CloudRain, Wind, Droplets, Thermometer, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { WeatherData } from '../../types';

interface LiveWeatherWidgetProps {
  latitude: number | null;
  longitude: number | null;
}

export const LiveWeatherWidget: React.FC<LiveWeatherWidgetProps> = ({ latitude, longitude }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (latitude === null || longitude === null) return;

    let isMounted = true;
    setLoading(true);

    api
      .get(`/weather/live?lat=${latitude}&lng=${longitude}`)
      .then((res) => {
        if (isMounted) {
          setWeather(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Weather fetch error:', err.message);
        if (isMounted) {
          setWeather({ available: false, message: 'Live rainfall data currently unavailable.' });
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [latitude, longitude]);

  if (latitude === null || longitude === null) {
    return (
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <span>Enable location to view real-time meteorological observations.</span>
        <CloudRain className="w-5 h-5 text-slate-500" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center space-x-3 animate-pulse text-xs text-slate-400">
        <CloudRain className="w-5 h-5 text-blue-400 animate-spin" />
        <span>Contacting Open-Meteo meteorological satellite feed...</span>
      </div>
    );
  }

  if (!weather || !weather.available) {
    return (
      <div className="glass-panel p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-300 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>{weather?.message || 'Live rainfall data currently unavailable.'}</span>
        </div>
        <span className="text-[10px] text-amber-400/70 border border-amber-500/30 px-2 py-0.5 rounded">
          Fallback Safe
        </span>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800 relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <CloudRain className="w-4 h-4 text-blue-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Atmospheric Conditions</h4>
        </div>
        <span className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          <span>Real-time GPS Feed</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center text-slate-400 text-[11px] mb-1">
            <Thermometer className="w-3.5 h-3.5 mr-1 text-red-400" />
            <span>Temp</span>
          </div>
          <span className="text-sm font-bold text-white">
            {weather.temperatureC}°C <span className="text-xs text-slate-400 font-normal">({weather.temperatureF}°F)</span>
          </span>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center text-slate-400 text-[11px] mb-1">
            <CloudRain className="w-3.5 h-3.5 mr-1 text-blue-400" />
            <span>Rainfall</span>
          </div>
          <span className="text-sm font-bold text-blue-400">
            {weather.rainfallMm} mm/h
          </span>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center text-slate-400 text-[11px] mb-1">
            <Wind className="w-3.5 h-3.5 mr-1 text-teal-400" />
            <span>Wind</span>
          </div>
          <span className="text-sm font-bold text-slate-200">
            {weather.windSpeedKmH} km/h
          </span>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center text-slate-400 text-[11px] mb-1">
            <Droplets className="w-3.5 h-3.5 mr-1 text-indigo-400" />
            <span>Humidity</span>
          </div>
          <span className="text-sm font-bold text-slate-200">
            {weather.humidity}%
          </span>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-2">
        <span>Condition: <strong className="text-slate-200">{weather.condition}</strong></span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
          weather.floodRiskIndicator === 'EXTREME_RAINFALL'
            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
            : weather.floodRiskIndicator === 'HEAVY_RAINFALL'
            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
        }`}>
          {weather.floodRiskIndicator?.replace('_', ' ')}
        </span>
      </div>
    </div>
  );
};
