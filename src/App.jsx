import React, { useState, useEffect } from 'react';
import { useWeather } from './hooks/useWeather';
import { formatTemperature, getWeatherIcon, getWeatherBackground } from './utils/weatherUtils';

function App() {
    const [city, setCity] = useState('Mersin');
    const [searchInput, setSearchInput] = useState('');
    const [validationError, setValidationError] = useState('');
    // Temel State'ler
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('weatherUser')) || null);
    const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('weatherFavorites')) || []);
    const [recentSearches, setRecentSearches] = useState(JSON.parse(localStorage.getItem('weatherRecents')) || []);

    // Login ve Hata Yönetimi State'leri
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginInput, setLoginInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [loginError, setLoginError] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    // --- KULLANICI İŞLEMLERİ ---
    const handleLogin = (e) => {
        e.preventDefault();
        setLoginError(''); // Her denemede eski hatayı temizle

        const userVal = loginInput.trim();
        const passVal = passwordInput.trim();

        if (!userVal || !passVal) {
            setLoginError('Please enter both username and password.');
            return;
        }

        // HOCA İÇİN GİZLİ DEMO HESABI (Büyük/küçük harf duyarsız)
        if (userVal.toLowerCase() === 'rumeysa' && passVal === '123456') {
            const newUser = { name: 'Rumeysa' };
            setUser(newUser);
            localStorage.setItem('weatherUser', JSON.stringify(newUser));
            setShowLoginModal(false);
            setLoginInput('');
            setPasswordInput('');
        } else {
            // Şifre yanlışsa o profesyonel kırmızı hata mesajını ver!
            setLoginError('Invalid username or password. Please try again.');
        }
    };

    const handleLogout = () => {
        setUser(null);
        setShowUserMenu(false);
        localStorage.removeItem('weatherUser');
    };

    const toggleFavorite = () => {
        if (!user) {
            alert('Favorilere eklemek için lütfen önce giriş yapın!');
            return;
        }
        const city = weatherData.cityName;
        let newFavs;
        if (favorites.includes(city)) {
            newFavs = favorites.filter(f => f !== city); // Varsa çıkar
        } else {
            newFavs = [...favorites, city]; // Yoksa ekle
        }
        setFavorites(newFavs);
        localStorage.setItem('weatherFavorites', JSON.stringify(newFavs));
    };

    // BU FONKSİYONU ARAMA YAPTIĞIN YERE (Örn: handleSearch) EKLEMELİSİN
    const addToRecents = (city) => {
        // Aynı şehri tekrar eklememek ve son 5 aramayı tutmak için filtreleme yapıyoruz
        const newRecents = [city, ...recentSearches.filter(c => c !== city)].slice(0, 5);
        setRecentSearches(newRecents);
        localStorage.setItem('weatherRecents', JSON.stringify(newRecents));
    };

    // Otomatik tamamlama (Autocomplete) State'leri
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const { weatherData, loading, error } = useWeather(city);

    // Arama kutusuna yazı yazıldıkça Open-Meteo API'den canlı şehir tahminlerini çeker
    useEffect(() => {
        if (searchInput.trim().length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const fetchCities = async () => {
            try {
                const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${searchInput}&count=5&language=en&format=json`);
                const data = await res.json();

                if (data.results) {
                    setSuggestions(data.results);
                } else {
                    setSuggestions([]);
                }
                setShowSuggestions(true);
            } catch (err) {
                console.error("City search error:", err);
            }
        };

        const timerId = setTimeout(() => {
            fetchCities();
        }, 300);

        return () => clearTimeout(timerId);
    }, [searchInput]);

    const handleSelectCity = (cityName) => {
        setCity(cityName);
        setSearchInput('');
        setShowSuggestions(false);
        setValidationError('');

        addToRecents(cityName);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setValidationError('');
        const cleanInput = searchInput.trim();

        if (!cleanInput) {
            setValidationError('Please enter a valid city name.');
            return;
        }
        if (cleanInput.length < 2) {
            setValidationError('City name must be at least 2 characters long.');
            return;
        }

        setCity(cleanInput);
        setSearchInput('');
        setShowSuggestions(false);

        addToRecents(cleanInput);
    };

    const dynamicBackgroundImage = weatherData && !loading
        ? getWeatherBackground(weatherData.condition)
        : getWeatherBackground('default');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f5f7fb', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', margin: 0, padding: 0, boxSizing: 'border-box' }}>
               
               

                {/* HEADER BÖLÜMÜ ... */}
            {/* HEADER BÖLÜMÜ */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', backgroundColor: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', zIndex: 10 }}>
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

                {/* SEARCH & AUTOCOMPLETE */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="Search city..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            style={{ padding: '8px 15px', borderRadius: '20px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', width: '180px', transition: 'all 0.3s' }}
                        />
                    </form>

                    {showSuggestions && suggestions.length > 0 && (
                        <div style={{ position: 'absolute', top: '110%', left: 0, width: '240px', backgroundColor: '#1e293b', color: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 50 }}>
                            {suggestions.map((s, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleSelectCity(s.name)}
                                    style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: idx !== suggestions.length - 1 ? '1px solid #334155' : 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{s.name}</span>
                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{s.admin1 ? `${s.admin1}, ` : ''}{s.country_code}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* HEADER SAĞ KISIM: KULLANICI MENÜSÜ */}
                    <div style={{ position: 'relative' }}>
                        {!user ? (
                            <button
                                onClick={() => setShowLoginModal(true)}
                                style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '8px 24px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600' }}
                            >
                                Login
                            </button>
                        ) : (
                            <div>
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    👤 {user.name}
                                </button>

                                {/* AÇILIR KULLANICI MENÜSÜ */}
                                    {/* --- YENİ VE BÜYÜTÜLMÜŞ PROFESYONEL KULLANICI MENÜSÜ --- */}
                                    {showUserMenu && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            right: 0,
                                            marginTop: '15px',
                                            background: 'rgba(0,0,0,0.85)', // Biraz daha koyu, daha okunabilir
                                            backdropFilter: 'blur(20px)', // Daha yoğun bulanıklık efekti
                                            borderRadius: '24px', // Daha yumuşak köşeler
                                            padding: '25px', // Daha ferah iç boşluk
                                            width: '350px', // Çok daha geniş bir menü
                                            border: '1px solid rgba(255,255,255,0.15)', // Zarif, ince bir sınır
                                            zIndex: 100,
                                            color: 'white',
                                            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.6)', // Derinlik katan gölge
                                            maxHeight: '450px', // Çok uzarsa ekranı kaplamasın
                                            overflowY: 'auto' // Çok uzunsa kendi içinde aşağı kaysın
                                        }}>

                                            {/* FAVORİLER BÖLÜMÜ */}
                                            <div style={{ marginBottom: '25px' }}>
                                                <h4 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '700', color: '#cbd5e1', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    ⭐ Favorites
                                                </h4>
                                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                    {favorites.length === 0 ? (
                                                        <li style={{ opacity: 0.5, fontSize: '16px', padding: '10px 0' }}>No favorites yet.</li>
                                                    ) : favorites.map((fav, i) => (
                                                        <li key={i} style={{
                                                            padding: '12px 15px',
                                                            fontSize: '16px',
                                                            cursor: 'pointer',
                                                            borderRadius: '12px',
                                                            transition: 'background 0.2s',
                                                            marginBottom: '5px'
                                                        }}
                                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                            onClick={() => handleSearch(fav)} // Şehre tıklayınca hava durumunu aç!
                                                        >
                                                            🏙️ {fav}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* SON ARAMALAR BÖLÜMÜ */}
                                            <div style={{ marginBottom: '25px' }}>
                                                <h4 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '700', color: '#cbd5e1', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    🕒 Recent Searches
                                                </h4>
                                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                    {recentSearches.length === 0 ? (
                                                        <li style={{ opacity: 0.5, fontSize: '16px', padding: '10px 0' }}>No recent searches.</li>
                                                    ) : recentSearches.map((rec, i) => (
                                                        <li key={i} style={{
                                                            padding: '12px 15px',
                                                            fontSize: '16px',
                                                            cursor: 'pointer',
                                                            borderRadius: '12px',
                                                            transition: 'background 0.2s',
                                                            marginBottom: '5px'
                                                        }}
                                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                            onClick={() => handleSearch(rec)} // Şehre tıklayınca hava durumunu aç!
                                                        >
                                                            🔍 {rec}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* LOGOUT BUTONU */}
                                            <button
                                                onClick={handleLogout}
                                                style={{
                                                    width: '100%',
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '14px',
                                                    borderRadius: '14px',
                                                    cursor: 'pointer',
                                                    fontWeight: '700',
                                                    fontSize: '16px',
                                                    transition: 'background 0.2s',
                                                    marginTop: '10px'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ANA İÇERİK BÖLÜMÜ (ARKA PLAN) */}
            <div style={{
                flex: 1,
                background: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.35)), ${dynamicBackgroundImage} center/cover no-repeat`,
                width: '100%',
                padding: '40px',
                boxSizing: 'border-box',
                transition: 'background 0.6s ease-in-out'
            }}>

                {validationError && (
                    <div style={{ color: '#856404', backgroundColor: '#fff3cd', border: '1px solid #ffeeba', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '500', marginBottom: '20px' }}>⚠️ {validationError}</div>
                )}

                {error && !validationError && (
                    <div style={{ color: '#721c24', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '500', marginBottom: '20px' }}>❌ {error}</div>
                )}

                {loading && (
                    <div style={{ color: 'white', fontSize: '20px', textAlign: 'center', marginTop: '50px', fontWeight: '500' }}>Syncing live satellite coordinates...</div>
                )}

                {weatherData && !loading && (
                    <>
                        {/* --- DIŞ KAPSAYICI (Genişliği 1400'den 1650'ye çıkardık ki sağa yayılsın) --- */}
                        <div style={{ maxWidth: '1650px', margin: '0 auto', width: '100%', padding: '0 20px' }}>

                            {/* Şehir ve Tarih Başlığı + Favori Butonu */}
                            <div style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.4)', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div>
                                    <h2 style={{ margin: '0 0 5px 0', fontSize: '42px', fontWeight: '700' }}>{weatherData.cityName}</h2>
                                    <p style={{ margin: 0, opacity: 0.9, fontSize: '18px' }}>{weatherData.dateStr}</p>
                                </div>

                                {/* FAVORİ (YILDIZ) BUTONU */}
                                {user && (
                                    <button
                                        onClick={toggleFavorite}
                                        style={{ background: 'transparent', border: 'none', fontSize: '32px', cursor: 'pointer', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))', transition: 'transform 0.2s' }}
                                        title={favorites.includes(weatherData.cityName) ? "Remove from Favorites" : "Add to Favorites"}
                                    >
                                        {favorites.includes(weatherData.cityName) ? '⭐' : '☆'}
                                    </button>
                                )}
                            </div>

                            {/* ESKİZDEKİ ASİMETRİK GRID SİSTEMİ */}
                            <main style={{
                                display: 'grid',
                                // KİLİT NOKTA: Sol tarafı 420px'e çiviledik (asla bozulmaz), sağ taraf ise '1fr' ile kalan tüm alanı yutarak sağa uzar!
                                gridTemplateColumns: '420px 1fr',
                                gap: '40px',
                                alignItems: 'start'
                            }}>

                                {/* SOL KOLON: ANA HAVA DURUMU KARTI ... (Buradan aşağısı tamamen aynı kalacak) */}

                                {/* SOL KOLON: ANA HAVA DURUMU KARTI */}
                                <div style={{
                                    background: 'rgba(0, 0, 0, 0.45)', backdropFilter: 'blur(16px)', borderRadius: '30px', padding: '50px 40px', color: 'white', border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                                }}>
                                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                        {/* Gece/Gündüz kontrolü ve Hilal ikonu */}
                                        {/* YENİ: weatherData.isNight kontrolü eklendi. weathermap api verisinde sys.pod = 'n' ise */}
                                        <div className="animated-weather-icon" style={{ fontSize: '130px', lineHeight: 1, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }}>
                                            {/* useWeather hook'undan gelen isNight flag'ini kontrol ediyoruz */}
                                            {weatherData.isNight ? '🌙' : getWeatherIcon(weatherData.condition)}
                                        </div>

                                        <div style={{ fontSize: '90px', fontWeight: '700', margin: '15px 0', textShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>{formatTemperature(weatherData.temp)}</div>
                                        <div style={{ fontSize: '22px', opacity: 0.9, fontWeight: '500' }}>Feeling like {formatTemperature(weatherData.feelsLike)}</div>
                                    </div>

                                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '25px', borderTop: '2px solid rgba(255,255,255,0.15)', paddingTop: '30px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px' }}><span>💨 WIND</span><span style={{ fontWeight: '700' }}>{weatherData.wind}</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px' }}><span>💧 HUMIDITY</span><span style={{ fontWeight: '700' }}>{weatherData.humidity}</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px' }}><span>🌡️ DEW POINT</span><span style={{ fontWeight: '700' }}>{weatherData.dewPoint}</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px' }}><span>⏲️ PRESSURE</span><span style={{ fontWeight: '700' }}>{weatherData.pressure}</span></div>
                                    </div>
                                </div>

                                {/* SAĞ KOLON: 7-DAY -> HOURLY -> RADAR */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

                                    {/* 1. DAILY FORECAST */}
                                    <div style={{ background: 'rgba(0, 0, 0, 0.45)', backdropFilter: 'blur(16px)', borderRadius: '24px', padding: '25px', border: '1px solid rgba(255,255,255,0.25)' }}>
                                        <h3 style={{ color: 'white', margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600' }}>📅 Daily Forecast</h3>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                                            {weatherData.forecast.map((f, i) => (
                                                <div key={i} style={{ flex: 1, color: 'white', textAlign: 'center', background: 'rgba(255,255,255,0.1)', padding: '12px 5px', borderRadius: '16px' }}>
                                                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{f.day}</div>
                                                    <div style={{ fontSize: '28px', margin: '10px 0' }}>{getWeatherIcon(f.condition)}</div>
                                                    <div style={{ fontWeight: '700', fontSize: '16px' }}>{formatTemperature(f.maxTemp)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2. HOURLY FORECAST */}
                                    <div style={{ background: 'rgba(0, 0, 0, 0.45)', backdropFilter: 'blur(16px)', borderRadius: '24px', padding: '25px', border: '1px solid rgba(255,255,255,0.25)', color: 'white' }}>
                                        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600' }}>🕒 Hourly Forecast</h3>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            {weatherData.hourly.map((h, i) => (
                                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '600', textTransform: 'uppercase' }}>{h.day}</span>
                                                    <span style={{ fontSize: '15px', fontWeight: '500' }}>{h.time}</span>
                                                    <span style={{ fontSize: '28px' }}>{getWeatherIcon(h.condition)}</span>
                                                    <span style={{ fontSize: '18px', fontWeight: '700' }}>{formatTemperature(h.temp)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 3. LOCAL RADAR & SATELLITE */}
                                    <div style={{ background: 'rgba(0, 0, 0, 0.45)', backdropFilter: 'blur(16px)', borderRadius: '24px', padding: '25px', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', color: 'white' }}>
                                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>📡 Local Radar & Satellite</h3>
                                        </div>
                                        <div style={{ height: '380px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                                            <iframe width="100%" height="100%" src={`https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=km/h&zoom=5&overlay=rain&product=ecmwf&level=surface&lat=${weatherData.lat}&lon=${weatherData.lon}`} frameBorder="0" title="Live Weather Radar"></iframe>
                                        </div>
                                    </div>

                                </div>
                            </main>
                        </div>
                        {/* --- BURAYA KADAR KOPYALA --- */}
                    </>
                )}
            </div>

            {/* FOOTER BÖLÜMÜ */}
            <footer style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 40px', backgroundColor: '#ffffff', color: '#64748b', fontSize: '13px', borderTop: '1px solid #e2e8f0' }}>
                <span>© 2026 SkyLine Weather Hub. All rights reserved.</span>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
                    <span style={{ cursor: 'pointer' }}>Terms of Service</span>
                </div>
            </footer>

            {/* LOGIN MODAL EKRANI (ŞİFRELİ VERSİYON) */}
            {showLoginModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '40px', borderRadius: '24px', width: '90%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>

                        <h2 style={{ margin: '0 0 25px 0', color: '#1e293b', textAlign: 'center', fontSize: '28px' }}>SkyLine<span style={{ color: '#0ea5e9' }}>.</span></h2>

                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                            {/* KULLANICI ADI KISMI */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '14px', color: '#64748b', fontWeight: '600', marginLeft: '5px' }}>Username</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Emre"
                                    value={loginInput}
                                    onChange={(e) => setLoginInput(e.target.value)}
                                    style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none', background: '#f8fafc', transition: 'border 0.2s' }}
                                    onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                                    onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                                    autoFocus
                                />
                            </div>

                            {/* ŞİFRE KISMI */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '14px', color: '#64748b', fontWeight: '600', marginLeft: '5px' }}>Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none', background: '#f8fafc', transition: 'border 0.2s' }}
                                    onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                                    onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                                />
                            </div>
                            {loginError && (
                                <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#ef4444', padding: '10px', borderRadius: '8px', fontSize: '14px', textAlign: 'center', fontWeight: '500' }}>
                                    ⚠️ {loginError}
                                </div>
                            )}

                            {/* BUTONLAR */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s' }}
                                    onMouseEnter={(e) => e.target.style.background = '#0284c7'}
                                    onMouseLeave={(e) => e.target.style.background = '#0ea5e9'}
                                >
                                    Sign In
                                </button>
                                <button type="button" onClick={() => setShowLoginModal(false)} style={{ background: 'transparent', color: '#94a3b8', border: 'none', padding: '10px', cursor: 'pointer', fontWeight: '600', transition: 'color 0.2s' }}
                                    onMouseEnter={(e) => e.target.style.color = '#64748b'}
                                    onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                                >
                                    Cancel
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;