import { useState, useEffect, useRef } from 'react';
import { searchCities, getWeather, describeCode, getSavedCity, saveSelectedCity } from '../services/weather';
import { useAsync } from '../hooks/useAsync';
import { MapPin, Sun, CloudSun, CloudRain, CloudLightning, CloudFog, Loader2, Search, ChevronDown } from 'lucide-react';

export default function WeatherWidget() {
  const [selectedCity, setSelectedCity] = useState(() => getSavedCity());
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, loading, error } = useAsync(() => getWeather(selectedCity), [selectedCity]);

  const filteredCities = searchCities(keyword);

  useEffect(() => {
    saveSelectedCity(selectedCity.name);
  }, [selectedCity]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderWeatherIcon = (code: number) => {
    if (code === 0) return <Sun size={15} style={{ color: '#f59e0b' }} />;
    if (code <= 3) return <CloudSun size={15} style={{ color: '#0ea5e9' }} />;
    if (code <= 48) return <CloudFog size={15} style={{ color: '#94a3b8' }} />;
    if (code <= 67) return <CloudRain size={15} style={{ color: '#3b82f6' }} />;
    if (code <= 82) return <CloudRain size={15} style={{ color: '#2563eb' }} />;
    return <CloudLightning size={15} style={{ color: '#8b5cf6' }} />;
  };

  return (
    <div ref={dropdownRef} className="weather-widget" style={{ position: 'relative', display: 'inline-block', fontSize: '0.85rem' }}>
      {/* Khung hiển thị chính */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          background: '#f8fafc', 
          padding: '6px 10px', 
          borderRadius: '6px', 
          border: '1px solid #e2e8f0',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <MapPin size={14} style={{ color: 'var(--green, #16a34a)' }} />
        <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedCity.name}</span>
        <ChevronDown size={13} style={{ color: '#64748b' }} />
        <span>|</span>

        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
            <Loader2 size={13} className="animate-spin" /> Đang tải...
          </span>
        ) : error || !data ? (
          <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>⚠️ Lỗi thời tiết</span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {renderWeatherIcon(data.code)}
            <span><strong>{data.temp}°C</strong>, {describeCode(data.code)}</span>
          </div>
        )}
      </div>

      {/* Bảng Dropdown tìm kiếm 34 tỉnh thành */}
      {isOpen && (
        <div style={{ 
          position: 'absolute', 
          top: '100%', 
          left: 0, 
          marginTop: '6px', 
          width: '240px', 
          background: '#fff', 
          border: '1px solid #cbd5e1', 
          borderRadius: '6px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
          zIndex: 1000, 
          padding: '8px' 
        }}>
          <div style={{ position: 'relative', marginBottom: '6px' }}>
            <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm kiếm tỉnh thành..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '6px 8px 6px 28px', 
                border: '1px solid #cbd5e1', 
                borderRadius: '4px', 
                outline: 'none', 
                fontSize: '0.85rem' 
              }}
              autoFocus
            />
          </div>

          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filteredCities.length === 0 ? (
              <div style={{ padding: '8px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                Không tìm thấy tỉnh thành
              </div>
            ) : (
              filteredCities.map((c) => (
                <div
                  key={c.name}
                  onClick={() => {
                    setSelectedCity(c);
                    setIsOpen(false);
                    setKeyword('');
                  }}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: selectedCity.name === c.name ? '#f1f5f9' : 'transparent',
                    fontWeight: selectedCity.name === c.name ? 600 : 400,
                    color: selectedCity.name === c.name ? 'var(--green, #16a34a)' : '#334155',
                    fontSize: '0.85rem'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = selectedCity.name === c.name ? '#f1f5f9' : 'transparent')}
                >
                  {c.name}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}