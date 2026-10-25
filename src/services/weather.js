// Open-Meteo: API miễn phí, không cần key, hỗ trợ CORS.
export const CITIES = [
  { name: 'Hà Nội', lat: 21.03, lon: 105.85 },
  { name: 'TP.HCM', lat: 10.82, lon: 106.63 },
  { name: 'Đà Nẵng', lat: 16.05, lon: 108.22 },
];

export async function getWeather(city) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}` +
    '&current=temperature_2m,weather_code&timezone=Asia%2FBangkok';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Không lấy được thời tiết');
  const { current } = await res.json();
  return { temp: Math.round(current.temperature_2m), code: current.weather_code };
}

export function describeCode(code) {
  if (code === 0) return 'Trời quang';
  if (code <= 3) return 'Có mây';
  if (code <= 48) return 'Sương mù';
  if (code <= 67) return 'Mưa';
  if (code <= 77) return 'Tuyết';
  if (code <= 82) return 'Mưa rào';
  return 'Dông';
}
