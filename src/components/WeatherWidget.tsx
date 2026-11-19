import { useState, useEffect, useRef } from 'react';

import {
    searchCities,
    getWeather,
    describeCode,
    getSavedCity,
    saveSelectedCity
} from '../services/weather';

import { useAsync } from '../hooks/useAsync';

import {
    MapPin,
    Sun,
    CloudSun,
    CloudRain,
    CloudLightning,
    CloudFog,
    Loader2,
    Search,
    ChevronDown
} from 'lucide-react';

export default function WeatherWidget() {
    const [selectedCity, setSelectedCity] = useState(() => getSavedCity());
    const [isOpen, setIsOpen] = useState(false);
    const [keyword, setKeyword] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Lấy dữ liệu thời tiết
    const {
        data,
        loading,
        error
    } = useAsync(
        () => getWeather(selectedCity),
        [selectedCity]
    );

    const filteredCities = searchCities(keyword);

    useEffect(() => {
        saveSelectedCity(selectedCity.name);
    }, [selectedCity]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const renderWeatherIcon = (code: number) => {
        if (code === 0) {
            return <Sun size={15} style={{ color: '#f59e0b' }} />;
        }

        if (code <= 3) {
            return <CloudSun size={15} style={{ color: '#0ea5e9' }} />;
        }

        if (code <= 48) {
            return <CloudFog size={15} style={{ color: '#94a3b8' }} />;
        }

        if (code <= 67) {
            return <CloudRain size={15} style={{ color: '#3b82f6' }} />;
        }

        if (code <= 82) {
            return <CloudRain size={15} style={{ color: '#2563eb' }} />;
        }

        return <CloudLightning size={15} style={{ color: '#8b5cf6' }} />;
    };

    return (
        <div
            ref={dropdownRef}
            className="weather-widget"
        >

            {/* KHUNG THỜI TIẾT CHÍNH */}

            <button
                type="button"
                className="weather-main"
                onClick={() => setIsOpen(prev => !prev)}
                aria-expanded={isOpen}
                aria-label="Chọn tỉnh thành và xem thời tiết"
            >
                <MapPin size={14} className="weather-map-pin" />

                <span className="weather-city">
                    {selectedCity.name}
                </span>

                <ChevronDown
                    size={13}
                    className={`weather-chevron ${isOpen ? 'is-open' : ''}`}
                />

                <span className="weather-divider">|</span>

                {/* ĐANG TẢI THỜI TIẾT */}

                {loading ? (
                    <span className="weather-loading">
                        <Loader2 size={13} className="animate-spin" />
                        Đang tải...
                    </span>
                ) : error || !data ? (

                    /* LỖI THỜI TIẾT */

                    <span className="weather-error">
                        ⚠️ Lỗi thời tiết
                    </span>

                ) : (

                    /* THỜI TIẾT HIỆN TẠI */

                    <span className="weather-result">
                        {renderWeatherIcon(data.code)}

                        <span className="weather-description">
                            <strong>{data.temp}°C</strong>
                            , {describeCode(data.code)}
                        </span>
                    </span>
                )}
            </button>

            {/* DROPDOWN CHỌN TỈNH THÀNH */}

            {isOpen && (
                <div className="weather-dropdown">

                    {/* Ô TÌM KIẾM */}

                    <div className="weather-search-wrapper">

                        <Search
                            size={14}
                            className="weather-search-icon"
                        />

                        <input
                            type="text"
                            className="weather-search"
                            placeholder="Tìm kiếm tỉnh thành..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* DANH SÁCH TỈNH THÀNH */}

                    <div className="weather-city-list">

                        {filteredCities.length === 0 ? (

                            <div className="weather-empty">
                                Không tìm thấy tỉnh thành
                            </div>
                        ) : (

                            filteredCities.map((city) => (

                                <button
                                    type="button"
                                    key={city.name}
                                    className={`weather-city-item ${
                                        selectedCity.name === city.name
                                            ? 'selected'
                                            : ''
                                    }`}
                                    onClick={() => {
                                        setSelectedCity(city);
                                        setIsOpen(false);
                                        setKeyword('');
                                    }}
                                >
                                    {city.name}

                                    {selectedCity.name === city.name && (
                                        <span className="weather-check">
                                            ✓
                                        </span>
                                    )}

                                </button>

                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}