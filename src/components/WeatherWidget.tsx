import { useState } from 'react';
import { CITIES, getWeather, describeCode } from '../services/weather';
import { useAsync } from '../hooks/useAsync';

export default function WeatherWidget() {
  const [idx, setIdx] = useState(0);
  const city = CITIES[idx];
  const { data, loading, error } = useAsync(() => getWeather(city), [idx]);

  return (
    <div className="weather">
      <select value={idx} onChange={(e) => setIdx(Number(e.target.value))} aria-label="Chọn thành phố">
        {CITIES.map((c, i) => (
          <option key={c.name} value={i}>{c.name}</option>
        ))}
      </select>
      <span>{loading ? '...' : error || !data ? 'Lỗi' : `${data.temp}°C, ${describeCode(data.code)}`}</span>
    </div>
  );
}
