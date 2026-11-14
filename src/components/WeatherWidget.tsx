import { useState, useEffect } from 'react';
import { CITIES, getWeather, describeCode, getSavedCity, saveSelectedCity } from '../services/weather';
import { useAsync } from '../hooks/useAsync';
import { MapPin, Sun, CloudSun, CloudRain, CloudLightning, CloudFog, Loader2 } from 'lucide-react';

export default function WeatherWidget() {
  const [idx, setIdx] = useState(() => {
    const saved = getSavedCity();
    const foundIndex = CITIES.findIndex((c) => c.name === saved.name);
    return foundIndex !== -1 ? foundIndex : 0;
  });

  const city = CITIES[idx];
  const { data, loading, error } = useAsync(() => getWeather(city), [idx]);

  useEffect(() => {
    saveSelectedCity(city.name);
  }, [idx, city]);

  const renderWeatherIcon = (code: number) => {
    if (code === 0) return <Sun size={16} style={{ color: '#f59e0b' }} />;
    if (code <= 3) return <CloudSun size={16} style={{ color: '#0ea5e9' }} />;
    if (code <= 48) return <CloudFog size={16} style={{ color: '#94a3b8' }} />;
    if (code <= 67) return <CloudRain size={16} style={{ color: '#3b82f6' }} />;
    if (code <= 82) return <CloudRain size={16} style={{ color: '#2563eb' }} />;
    return <CloudLightning size={16} style={{ color: '#8b5cf6' }} />;
  };
  
  return (
    <div className="weather-widget" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
      <MapPin size={15} style={{ color: 'var(--green, #16a34a)' }} />

      <select 
        value={idx} 
        onChange={(e) => setIdx(Number(e.target.value))} 
        aria-label="Chọn thành phố"
        style={{ border: 'none', background: 'transparent', fontWeight: 600, cursor: 'pointer', outline: 'none', color: '#0f172a' }}
      >
        {CITIES.map((c, i) => (
          <option key={c.name} value={i}>
            {c.name}
          </option>
        ))}
      </select>

      <span>|</span>

      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
          <Loader2 size={14} className="animate-spin" /> Đang tải...
        </span>
      ) : error || !data ? (
        <span style={{ color: '#dc2626' }}>⚠️ Lỗi thời tiết</span>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {renderWeatherIcon(data.code)}
          <span><strong>{data.temp}°C</strong>, {describeCode(data.code)}</span>
        </div>
      )}
    </div>
  );
}