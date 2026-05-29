// src/App.jsx

import React, { useState } from 'react';
import { useWeather } from './hooks/useWeather';
import { formatTemperature, getWeatherIcon, getWeatherBackground } from './utils/weatherUtils';

function App() {
    const [city, setCity] = useState('Mersin');
    const [searchInput, setSearchInput] = useState('');
    const [validationError, setValidationError] = useState('');
    const { weatherData, loading, error } = useWeather(city);

    const handleSearch = (e) => {
        e.preventDefault();
        setValidationError('');

        const cleanInput = searchInput.trim();

        // Course requirement check: Validate input form behavior
        if (!cleanInput) {
            setValidationError('Please enter a valid city name. The search field cannot be empty.');
            return;
        }

        if (cleanInput.length < 2) {
            setValidationError('City name must be at least 2 characters long.');
            return;
        }

        setCity(cleanInput);
        setSearchInput('');
    };

    // Get the realistic image background layout
    const dynamicBackgroundImage = weatherData && !loading
        ? getWeatherBackground(weatherData.condition)
        : getWeatherBackground('default');

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            backgroundColor: '#f5f7fb',
            fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            margin: 0,
            padding: 0,
            boxSizing: 'border-box'
        }}>

            {/* 1. HEADER SECTION */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px 40px',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '28px' }}>☀️</span>
                    <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1e293b' }}>
                        SkyLine <span style={{ color: '#0284c7' }}>Weather Hub</span>
                    </h1>
                </div>

                <nav style={{ display: 'flex', gap: '25px', fontWeight: '500', color: '#64748b' }}>
                    <span style={{ color: '#0284c7', cursor: 'pointer', borderBottom: '2px solid #0284c7' }}>Home</span>
                    <span style={{ cursor: 'pointer' }}>Forecast</span>
                    <span style={{ cursor: 'pointer' }}>Radar</span>
                    <span style={{ cursor: 'pointer' }}>Maps</span>
                    <span style={{ cursor: 'pointer' }}>Contact</span>
                </nav>

                {/* SEARCH & LOGIN */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="Search city..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            style={{
                                padding: '8px 15px',
                                borderRadius: '20px',
                                border: '1px solid #cbd5e1',
                                outline: 'none',
                                fontSize: '14px',
                                width: '180px',
                                transition: 'all 0.3s'
                            }}
                        />
                    </form>
                    <button style={{
                        padding: '8px 20px',
                        borderRadius: '20px',
                        border: 'none',
                        backgroundColor: '#0284c7',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}>Login</button>
                </div>
            </header>

            {/* 2. MAIN CONTENT AREA (NOW FULL-SCREEN IMAGE BACKGROUND!) */}
            {/* 2. MAIN CONTENT AREA (NOW FULL-SCREEN IMAGE BACKGROUND!) */}
            <main style={{
                flex: 1,
                // Mixing a gentle dark linear overlay with the dynamic background image for premium contrast balance
                // Cross-browser bulletproof background shorthand
                background: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.35)), ${dynamicBackgroundImage} center/cover no-repeat`,
                width: '100%', // <-- EKLENDİ: Genişliği %100 yap
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                gap: '25px',
                boxSizing: 'border-box', // <-- EKLENDİ: Taşmaları önle
                transition: 'background 0.6s ease-in-out' // Smooth transitions between weather photos
            }}>

                {/* Validation Error Banner */}
                {validationError && (
                    <div style={{
                        color: '#856404',
                        backgroundColor: '#fff3cd',
                        border: '1px solid #ffeeba',
                        padding: '12px 20px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}>
                        ⚠️ {validationError}
                    </div>
                )}

                {/* API-level Response Network Errors */}
                {error && !validationError && (
                    <div style={{
                        color: '#721c24',
                        backgroundColor: '#f8d7da',
                        border: '1px solid #f5c6cb',
                        padding: '12px 20px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}>
                        ❌ {error}
                    </div>
                )}

                {loading && (
                    <div style={{ color: 'white', fontSize: '20px', textAlign: 'center', marginTop: '50px', fontWeight: '500' }}>
                        Syncing live satellite coordinates...
                    </div>
                )}

                {weatherData && !loading && (
                    <>
                        {/* CITY & DATE INFO */}
                        <div style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
                            <h2 style={{ margin: '0 0 5px 0', fontSize: '36px', fontWeight: '600' }}>{weatherData.cityName}</h2>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '15px' }}>{weatherData.dateStr}</p>
                        </div>

                        {/* DASHBOARD GRID CONTAINER */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 2fr',
                            gap: '30px',
                            alignItems: 'start'
                        }}>

                            {/* LEFT COLUMN: CURRENT WEATHER CARD */}
                            <div style={{
                                background: 'rgba(0, 0, 0, 0.45)',
                                backdropFilter: 'blur(16px)',
                                borderRadius: '24px',
                                padding: '40px 30px',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.25)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                            }}>
                                <div style={{ fontSize: '110px', lineHeight: 1, margin: '10px 0', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}>
                                    {getWeatherIcon(weatherData.condition)}
                                </div>
                                <div style={{ fontSize: '72px', fontWeight: '700', margin: '10px 0', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                                    {formatTemperature(weatherData.temp)}
                                </div>
                                <div style={{ fontSize: '18px', opacity: 0.9, marginBottom: '30px', fontWeight: '500' }}>
                                    Feeling like {formatTemperature(weatherData.feelsLike)}
                                </div>

                                {/* WEATHER DETAILS LIST */}
                                <div style={{
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '15px',
                                    borderTop: '1px solid rgba(255,255,255,0.2)',
                                    paddingTop: '25px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                                        <span>💨 WIND</span>
                                        <span style={{ fontWeight: '600' }}>{weatherData.wind}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                                        <span>💧 HUMIDITY</span>
                                        <span style={{ fontWeight: '600' }}>{weatherData.humidity}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                                        <span>🌡️ DEW POINT</span>
                                        <span style={{ fontWeight: '600' }}>{weatherData.dewPoint}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                                        <span>⏲️ PRESSURE</span>
                                        <span style={{ fontWeight: '600' }}>{weatherData.pressure}</span>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: FORECAST & RADAR MAP */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                                {/* 7-DAY FORECAST ROW */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(7, 1fr)',
                                    gap: '12px'
                                }}>
                                    {weatherData.forecast.map((f, i) => (
                                        <div key={i} style={{
                                            background: 'rgba(0, 0, 0, 0.45)', // <-- Tüm kartlar için aynı koyu cam efekti
                                            backdropFilter: 'blur(16px)',
                                            color: 'white', // <-- Tüm metinler beyaz
                                            borderRadius: '16px',
                                            padding: '15px 10px',
                                            textAlign: 'center',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                                        }}>
                                            <div style={{ fontWeight: '700', fontSize: '14px' }}>{f.day}</div>
                                            <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '8px' }}>({f.date})</div>
                                            <div style={{ fontSize: '32px', margin: '8px 0' }}>{getWeatherIcon(f.condition)}</div>
                                            <div style={{ fontWeight: '700', fontSize: '15px' }}>{formatTemperature(f.maxTemp)}/{formatTemperature(f.minTemp)}</div>
                                            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px', fontWeight: '500' }}>{f.condition}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* RADAR & SATELLITE BOX */}
                                <div style={{
                                    background: 'rgba(0, 0, 0, 0.45)',
                                    backdropFilter: 'blur(16px)',
                                    borderRadius: '24px',
                                    padding: '25px',
                                    border: '1px solid rgba(255,255,255,0.25)',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', color: 'white' }}>
                                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Local Radar & Satellite</h3>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <span style={{ padding: '5px 12px', background: '#0284c7', borderRadius: '12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Air Pressure</span>
                                            <span style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.25)', borderRadius: '12px', fontSize: '12px', cursor: 'pointer' }}>Satellite</span>
                                        </div>
                                    </div>

                                    {/* RADAR VISUAL FX */}
                                    <div style={{
                                        height: '240px',
                                        borderRadius: '16px',
                                        background: 'radial-gradient(circle, #1e3a8a 0%, #0f172a 100%)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        color: 'rgba(255,255,255,0.4)'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            width: '180px',
                                            height: '180px',
                                            borderRadius: '50%',
                                            border: '2px solid rgba(2, 132, 199, 0.4)',
                                            boxShadow: '0 0 20px rgba(2, 132, 199, 0.2)'
                                        }}></div>
                                        <span style={{ zIndex: 2, fontWeight: '500', fontSize: '14px', letterSpacing: '1px' }}>📡 LIVE RADAR CORE ACTIVE</span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* 4. FOOTER SECTION */}
            <footer style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '15px 40px',
                backgroundColor: '#ffffff',
                color: '#64748b',
                fontSize: '13px',
                borderTop: '1px solid #e2e8f0'
            }}>
                <span>© 2026 SkyLine Weather Hub. All rights reserved.</span>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
                    <span style={{ cursor: 'pointer' }}>Terms of Service</span>
                </div>
            </footer>

        </div>
    );
}

export default App;