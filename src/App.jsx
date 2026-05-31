import React, { useState, useEffect, useCallback } from 'react';
import { useWeather } from './hooks/useWeather';
import { formatTemperature, getWeatherIcon, getWeatherBackground } from './utils/weatherUtils';

/* ─────────────────────────────────────────────
   CSS Variables injected once via a <style> tag
   ───────────────────────────────────────────── */
const GlobalStyles = () => (
    <style>{`
    /* ── Design Tokens ── */
    :root {
      --clr-brand:        #0ea5e9;
      --clr-brand-dark:   #0284c7;
      --clr-brand-light:  #e0f2fe;
      --clr-surface:      #ffffff;
      --clr-bg:           #f0f9ff;
      --clr-text:         #0f172a;
      --clr-text-muted:   #64748b;
      --clr-border:       #cbd5e1;
      --clr-danger:       #ef4444;
      --clr-danger-dark:  #dc2626;
      --clr-warn-bg:      #fff3cd;
      --clr-warn-border:  #ffeeba;
      --clr-warn-text:    #856404;
      --clr-error-bg:     #fef2f2;
      --clr-error-border: #f87171;
      --clr-error-text:   #ef4444;
      --clr-dark:         #1e293b;
      --clr-overlay:      rgba(0,0,0,0.45);

      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 20px;
      --radius-xl: 30px;

      --shadow-sm: 0 2px 8px rgba(0,0,0,0.06);
      --shadow-md: 0 4px 20px rgba(0,0,0,0.10);
      --shadow-lg: 0 20px 40px rgba(0,0,0,0.18);

      --font-sans: 'Segoe UI', system-ui, -apple-system, sans-serif;
      --transition: 0.2s ease;
    }

    /* ── Reset & Base ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 16px; scroll-behavior: smooth; }
    body {
      font-family: var(--font-sans);
      background-color: var(--clr-bg);
      color: var(--clr-text);
      min-height: 100vh;
    }

    /* ── Focus ring for keyboard navigation ── */
    :focus-visible {
      outline: 3px solid var(--clr-brand);
      outline-offset: 2px;
    }

    /* ── Skip link ── */
    .skip-link {
      position: absolute;
      top: -100px;
      left: 1rem;
      background: var(--clr-brand);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: var(--radius-sm);
      font-weight: 700;
      z-index: 9999;
      transition: top var(--transition);
    }
    .skip-link:focus { top: 1rem; }

    /* ── Header ── */
    .site-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      height: 72px;
      padding: 0 2rem;
      background-color: var(--clr-surface);
      box-shadow: var(--shadow-sm);
      position: relative;
      z-index: 100;
    }
    .header-logo { display: flex; align-items: center; flex-shrink: 0; cursor: pointer; }
    .header-logo img { height: 50px; width: auto; object-fit: contain; display: block; }

    /* Header center buttons */
    .header-actions {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      flex-shrink: 0;
    }

    /* Login button — slightly taller than regular btns for visual weight */
    .btn-login {
      background: linear-gradient(135deg, var(--clr-brand), var(--clr-brand-dark));
      color: white;
      border: none;
      padding: 0.6875rem 1.5rem;
      border-radius: var(--radius-md);
      font-weight: 700;
      font-size: 0.9375rem;
      cursor: pointer;
      white-space: nowrap;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      height: 44px;
      box-shadow: 0 2px 8px rgba(14,165,233,0.35);
      transition: box-shadow var(--transition), transform var(--transition), background var(--transition);
    }
    .btn-login:hover {
      box-shadow: 0 4px 16px rgba(14,165,233,0.5);
      transform: translateY(-1px);
    }
    .btn-login:active { transform: translateY(0); }
    .btn-login:focus-visible { outline: 3px solid var(--clr-brand); outline-offset: 2px; }

    /* ── Buttons ── */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5625rem 1.125rem;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      border: none;
      white-space: nowrap;
      line-height: 1;
      transition: background-color var(--transition), color var(--transition), border-color var(--transition);
    }
    .btn:focus-visible { outline: 3px solid var(--clr-brand); outline-offset: 2px; }
    .btn-primary { background: var(--clr-brand); color: white; }
    .btn-primary:hover, .btn-primary:focus-visible { background: var(--clr-brand-dark); }
    .btn-outline { background: white; color: var(--clr-brand); border: 1.5px solid var(--clr-brand); }
    .btn-outline:hover { background: var(--clr-brand-light); }
    .btn-dark { background: var(--clr-dark); color: white; text-decoration: none; }
    .btn-dark:hover { background: #0f172a; }
    .btn-ghost { background: var(--clr-bg); color: var(--clr-dark); border: 1.5px solid var(--clr-border); }
    .btn-ghost:hover { background: #e2e8f0; }
    .btn-danger { background: var(--clr-danger); color: white; width: 100%; justify-content: center; padding: 0.75rem; font-size: 0.875rem; border-radius: var(--radius-md); }
    .btn-danger:hover { background: var(--clr-danger-dark); }
    .btn-fixed-w { width: 7.5rem; justify-content: center; }

    /* ── Search box ── */
    .search-wrapper { position: relative; }
    .search-form {
      display: flex;
      align-items: center;
      background: var(--clr-bg);
      border: 1.5px solid var(--clr-border);
      border-radius: var(--radius-md);
      padding: 0 0.75rem;
      gap: 0.5rem;
      transition: border-color var(--transition), box-shadow var(--transition);
      height: 44px;
    }
    .search-form:focus-within {
      border-color: var(--clr-brand);
      box-shadow: 0 0 0 3px rgba(14,165,233,0.15);
      background: var(--clr-surface);
    }
    .search-icon {
      color: var(--clr-text-muted);
      font-size: 1rem;
      flex-shrink: 0;
      line-height: 1;
    }
    .search-input {
      border: none;
      background: transparent;
      font-size: 0.9375rem;
      width: 200px;
      line-height: 1;
      color: var(--clr-text);
      padding: 0;
    }
    .search-input:focus { outline: none; }
    .search-input::placeholder { color: #94a3b8; }

    /* Autocomplete dropdown */
    .autocomplete {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      width: 280px;
      background: var(--clr-dark);
      color: white;
      border-radius: var(--radius-md);
      overflow: hidden;
      box-shadow: var(--shadow-lg);
      z-index: 200;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .autocomplete-item {
      padding: 0.75rem 1rem;
      cursor: pointer;
      border-bottom: 1px solid #1e293b;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transition: background var(--transition);
    }
    .autocomplete-item:last-child { border-bottom: none; }
    .autocomplete-item:hover, .autocomplete-item:focus { background: #334155; outline: none; }
    .autocomplete-icon { font-size: 1.125rem; flex-shrink: 0; }
    .autocomplete-text { display: flex; flex-direction: column; gap: 0.125rem; }
    .autocomplete-city { font-weight: 600; font-size: 0.9375rem; }
    .autocomplete-region { font-size: 0.75rem; color: #94a3b8; }

    /* ── User menu ── */
    .user-menu-wrapper { position: relative; }
    .user-menu-dropdown {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      background: rgba(15,23,42,0.94);
      backdrop-filter: blur(20px);
      border-radius: var(--radius-lg);
      padding: 1.375rem;
      width: 300px;
      border: 1px solid rgba(255,255,255,0.12);
      z-index: 200;
      color: white;
      box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
      max-height: 420px;
      overflow-y: auto;
    }
    .user-menu-section { margin-bottom: 1.25rem; }
    .user-menu-section h3 {
      margin: 0 0 0.75rem;
      font-size: 0.9375rem;
      font-weight: 700;
      color: #94a3b8;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding-bottom: 0.5rem;
    }
    .user-menu-section ul { list-style: none; }
    .user-menu-section li {
      padding: 0.625rem 0.75rem;
      font-size: 0.875rem;
      cursor: pointer;
      border-radius: var(--radius-sm);
      transition: background var(--transition);
      margin-bottom: 0.25rem;
    }
    .user-menu-section li:hover { background: rgba(255,255,255,0.07); }
    .user-menu-empty { opacity: 0.45; font-size: 0.875rem; padding: 0.5rem 0; }

    /* ── Alert banners ── */
    .alert {
      padding: 0.75rem 1.25rem;
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 1.25rem;
      role: alert;
    }
    .alert-warn { color: var(--clr-warn-text); background: var(--clr-warn-bg); border: 1px solid var(--clr-warn-border); }
    .alert-error { color: var(--clr-error-text); background: var(--clr-error-bg); border: 1px solid var(--clr-error-border); }

    /* ── Main content area ── */
    .site-main {
      flex: 1;
      width: 100%;
      padding: 2.5rem;
      transition: background 0.6s ease-in-out;
    }
    .content-inner { max-width: 1650px; margin: 0 auto; width: 100%; }

    /* City heading row */
    .city-heading {
      color: white;
      text-shadow: 0 2px 4px rgba(0,0,0,0.4);
      margin-bottom: 1.875rem;
      display: flex;
      align-items: center;
      gap: 0.9375rem;
    }
    .city-heading h1 { font-size: 2.625rem; font-weight: 700; margin-bottom: 0.3125rem; }
    .city-heading p { opacity: 0.9; font-size: 1.125rem; }
    .fav-btn {
      background: transparent;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
      transition: transform var(--transition);
      padding: 0.25rem;
      border-radius: 50%;
    }
    .fav-btn:hover { transform: scale(1.2); }
    .fav-btn:focus-visible { outline: 3px solid var(--clr-brand); }

    /* ── Weather grid ── */
    .weather-grid {
      display: grid;
      grid-template-columns: 420px 1fr;
      gap: 2.5rem;
      align-items: start;
    }
    .weather-right { display: flex; flex-direction: column; gap: 1.5625rem; }

    /* Glass cards */
    .glass-card {
      background: var(--clr-overlay);
      backdrop-filter: blur(16px);
      border-radius: var(--radius-xl);
      padding: 3.125rem 2.5rem;
      color: white;
      border: 1px solid rgba(255,255,255,0.25);
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    }
    .glass-panel {
      background: var(--clr-overlay);
      backdrop-filter: blur(16px);
      border-radius: 1.5rem;
      padding: 1.5625rem;
      border: 1px solid rgba(255,255,255,0.25);
      color: white;
    }
    .glass-panel h2 { margin: 0 0 0.9375rem; font-size: 1.125rem; font-weight: 600; }

    /* Main weather card internals */
    .weather-icon-area { text-align: center; margin-bottom: 2.5rem; }
    .weather-icon { font-size: 8.125rem; line-height: 1; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3)); }
    .weather-temp { font-size: 5.625rem; font-weight: 700; margin: 0.9375rem 0; text-shadow: 0 4px 8px rgba(0,0,0,0.3); }
    .weather-feels { font-size: 1.375rem; opacity: 0.9; font-weight: 500; }
    .weather-stats { width: 100%; display: flex; flex-direction: column; gap: 1.5625rem; border-top: 2px solid rgba(255,255,255,0.15); padding-top: 1.875rem; }
    .weather-stat { display: flex; justify-content: space-between; font-size: 1.125rem; }
    .weather-stat span:last-child { font-weight: 700; }

    /* Forecast rows */
    .daily-grid { display: flex; justify-content: space-between; gap: 0.75rem; }
    .daily-item {
      flex: 1;
      color: white;
      text-align: center;
      background: rgba(255,255,255,0.1);
      padding: 0.75rem 0.3125rem;
      border-radius: 1rem;
    }
    .daily-day { font-weight: 700; font-size: 0.875rem; }
    .daily-icon { font-size: 1.75rem; margin: 0.625rem 0; }
    .daily-temp { font-weight: 700; font-size: 1rem; }

    .hourly-row { display: flex; justify-content: space-between; align-items: center; }
    .hourly-item { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .hourly-label { font-size: 0.75rem; color: #cbd5e1; font-weight: 600; text-transform: uppercase; }
    .hourly-time { font-size: 0.9375rem; font-weight: 500; }
    .hourly-icon { font-size: 1.75rem; }
    .hourly-temp { font-size: 1.125rem; font-weight: 700; }

    /* Radar */
    .radar-frame { height: 380px; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
    .radar-frame iframe { width: 100%; height: 100%; border: none; display: block; }

    /* ── Loading ── */
    .loading-text { color: white; font-size: 1.25rem; text-align: center; margin-top: 3.125rem; font-weight: 500; }

    /* ── Footer ── */
    .site-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.9375rem 2.5rem;
      background-color: var(--clr-surface);
      color: var(--clr-text-muted);
      font-size: 0.8125rem;
      border-top: 1px solid #e2e8f0;
    }
    .footer-links { display: flex; gap: 1.25rem; }
    .footer-links a { color: var(--clr-text-muted); text-decoration: none; cursor: pointer; transition: color var(--transition); }
    .footer-links a:hover { color: var(--clr-brand); }

    /* ── Modal overlay ── */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(5px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal-box {
      background: var(--clr-surface);
      padding: 2.5rem;
      border-radius: 1.5rem;
      width: 90%;
      max-width: 400px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
    }
    .modal-title { margin: 0 0 1.5625rem; color: var(--clr-dark); text-align: center; font-size: 1.75rem; }
    .modal-title span { color: var(--clr-brand); }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-label { font-size: 0.875rem; color: var(--clr-text-muted); font-weight: 600; margin-left: 0.3125rem; }
    .form-input {
      padding: 0.875rem 1rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--clr-border);
      font-size: 1rem;
      background: #f8fafc;
      color: var(--clr-text);
      transition: border-color var(--transition), box-shadow var(--transition);
    }
    .form-input:focus { border-color: var(--clr-brand); box-shadow: 0 0 0 3px rgba(14,165,233,0.15); outline: none; }
    .login-form-fields { display: flex; flex-direction: column; gap: 1.25rem; }
    .login-form-actions { display: flex; flex-direction: column; gap: 0.625rem; margin-top: 0.625rem; }
    .btn-cancel { background: transparent; color: #94a3b8; border: none; padding: 0.625rem; cursor: pointer; font-weight: 600; font-size: 0.875rem; border-radius: var(--radius-sm); transition: color var(--transition); }
    .btn-cancel:hover { color: var(--clr-text-muted); }

    /* ─────────────── RESPONSIVE ─────────────── */
    /* Tablet: ≤ 1024px */
    @media (max-width: 1024px) {
      .weather-grid { grid-template-columns: 1fr; }
      .header-actions { display: none; }  /* hide center actions, use mobile nav instead */
    }

    /* Mobile: ≤ 768px */
    @media (max-width: 768px) {
      .site-header {
        height: auto;
        flex-wrap: wrap;
        padding: 0.75rem 1rem;
        gap: 0.625rem;
      }
      .header-right { width: 100%; justify-content: flex-end; }
      .search-input { width: 140px; }

      .site-main { padding: 1.25rem 1rem; }

      .mobile-actions {
        display: flex !important;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      .mobile-actions .btn { font-size: 0.8125rem; padding: 0.5rem 0.75rem; }

      .city-heading h1 { font-size: 1.75rem; }
      .city-heading p { font-size: 1rem; }

      .glass-card { padding: 1.5rem; border-radius: 1.25rem; }
      .weather-icon { font-size: 5rem; }
      .weather-temp { font-size: 3.5rem; }
      .weather-feels { font-size: 1rem; }

      .daily-grid { flex-wrap: wrap; }
      .daily-item { min-width: 60px; }

      .hourly-row { gap: 0.25rem; overflow-x: auto; padding-bottom: 0.5rem; }
      .hourly-item { min-width: 60px; }

      .radar-frame { height: 250px; }

      .site-footer { flex-direction: column; gap: 0.5rem; text-align: center; }

      .user-menu-dropdown { width: 260px; right: -0.5rem; }
    }

    /* Small phones: ≤ 480px */
    @media (max-width: 480px) {
      .search-input { width: 120px; font-size: 0.8125rem; }
      .btn { padding: 0.5rem 0.625rem; font-size: 0.8125rem; }
      .weather-grid { gap: 1rem; }
      .glass-panel { padding: 1rem; }
    }

    /* Desktop-only: show center header actions */
    @media (min-width: 1025px) {
      .mobile-actions { display: none !important; }
    }
  `}</style>
);

/* ─────────────────────────────────────────────
   Main App Component
   ───────────────────────────────────────────── */
function App() {
    // ── STATE ──────────────────────────────────────────────────────────────────
    const [city, setCity] = useState('Mersin');
    const [searchInput, setSearchInput] = useState('');
    const [validationError, setValidationError] = useState('');
    const [isCelsius, setIsCelsius] = useState(true);
    const [isLocating, setIsLocating] = useState(false);

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('weatherUser')) || null; } catch { return null; }
    });
    const [favorites, setFavorites] = useState(() => {
        try { return JSON.parse(localStorage.getItem('weatherFavorites')) || []; } catch { return []; }
    });
    const [recentSearches, setRecentSearches] = useState(() => {
        try { return JSON.parse(localStorage.getItem('weatherRecents')) || []; } catch { return []; }
    });

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginInput, setLoginInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [loginError, setLoginError] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);

    const { weatherData, loading, error } = useWeather(city);

    // ── HELPERS ────────────────────────────────────────────────────────────────
    const displayTemp = useCallback((celsiusValue) => {
        if (isCelsius) return `${Math.round(celsiusValue)}°C`;
        return `${Math.round((celsiusValue * 9 / 5) + 32)}°F`;
    }, [isCelsius]);

    const addToRecents = useCallback((cityName) => {
        const newRecents = [cityName, ...recentSearches.filter(c => c !== cityName)].slice(0, 5);
        setRecentSearches(newRecents);
        try { localStorage.setItem('weatherRecents', JSON.stringify(newRecents)); } catch { }
    }, [recentSearches]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.user-menu-wrapper')) setShowUserMenu(false);
            if (!e.target.closest('.search-wrapper')) setShowSuggestions(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ── GEOLOCATION ────────────────────────────────────────────────────────────
    const handleGeolocation = () => {
        if (!navigator.geolocation) {
            alert('Your browser does not support geolocation.');
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            ({ coords: { latitude: lat, longitude: lon } }) => {
                setCity({ lat, lon });
                setSearchInput('');
                setIsLocating(false);
            },
            () => {
                alert('Could not get location. Please check your browser permissions.');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // ── SEARCH & AUTOCOMPLETE ──────────────────────────────────────────────────
    useEffect(() => {
        const trimmed = searchInput.trim();
        if (trimmed.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        const timerId = setTimeout(async () => {
            try {
                const res = await fetch(
                    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=5&language=en&format=json`
                );
                if (!res.ok) throw new Error('Search failed');
                const data = await res.json();
                setSuggestions(data.results || []);
                setShowSuggestions((data.results || []).length > 0);
            } catch (err) {
                console.error('City search error:', err);
                setSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(timerId);
    }, [searchInput]);

    const handleSearch = (e) => {
        e.preventDefault();
        setValidationError('');
        const cleanInput = searchInput.trim();
        if (!cleanInput) { setValidationError('Please enter a valid city name.'); return; }
        if (cleanInput.length < 2) { setValidationError('City name must be at least 2 characters long.'); return; }
        setCity(cleanInput);
        setSearchInput('');
        setShowSuggestions(false);
        addToRecents(cleanInput);
    };

    const handleSelectCity = (cityName) => {
        setCity(cityName);
        setSearchInput('');
        setShowSuggestions(false);
        setValidationError('');
        addToRecents(cityName);
    };

    // Keyboard navigation for autocomplete
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Escape') { setShowSuggestions(false); setSearchInput(''); }
    };

    // ── AUTH ───────────────────────────────────────────────────────────────────
    const handleLogin = (e) => {
        e.preventDefault();
        setLoginError('');
        const userVal = loginInput.trim();
        const passVal = passwordInput.trim();
        if (!userVal || !passVal) { setLoginError('Please enter both username and password.'); return; }
        if (userVal.toLowerCase() === 'rumeysa' && passVal === '123456') {
            const newUser = { name: 'Rumeysa' };
            setUser(newUser);
            try { localStorage.setItem('weatherUser', JSON.stringify(newUser)); } catch { }
            setShowLoginModal(false);
            setLoginInput('');
            setPasswordInput('');
        } else {
            setLoginError('Invalid username or password. Please try again.');
        }
    };

    const handleLogout = () => {
        setUser(null);
        setShowUserMenu(false);
        try { localStorage.removeItem('weatherUser'); } catch { }
    };

    const toggleFavorite = () => {
        if (!user) { alert('Please log in to add favorites!'); return; }
        const currentCity = weatherData?.cityName;
        if (!currentCity) return;
        const newFavs = favorites.includes(currentCity)
            ? favorites.filter(f => f !== currentCity)
            : [...favorites, currentCity];
        setFavorites(newFavs);
        try { localStorage.setItem('weatherFavorites', JSON.stringify(newFavs)); } catch { }
    };

    const dynamicBg = weatherData && !loading
        ? getWeatherBackground(weatherData.condition)
        : getWeatherBackground('default');

    // ── RENDER ─────────────────────────────────────────────────────────────────
    return (
        <>
            <GlobalStyles />

            {/* Skip navigation – accessibility */}
            <a href="#main-content" className="skip-link">Skip to main content</a>

            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

                {/* ════════════════ HEADER ════════════════ */}
                <header className="site-header" role="banner">

                    {/* Logo */}
                    <div
                        className="header-logo"
                        onClick={() => { setCity('Mersin'); setSearchInput(''); setValidationError(''); setShowSuggestions(false); }}
                        role="link"
                        tabIndex={0}
                        aria-label="SkyLine Weather – go to homepage"
                        onKeyDown={(e) => e.key === 'Enter' && setCity('Mersin')}
                    >
                        <img src="/logo.png" alt="SkyLine Weather logo" height="50" />
                    </div>

                    {/* Center buttons – hidden on mobile via CSS, shown inline on desktop */}
                    <nav className="header-actions" aria-label="Main actions">
                        <button
                            className="btn btn-primary"
                            onClick={handleGeolocation}
                            aria-label="Use my current location"
                            aria-busy={isLocating}
                            disabled={isLocating}
                        >
                            {isLocating ? '⏳ Locating…' : '📍 My Location'}
                        </button>

                        <button
                            className="btn btn-outline btn-fixed-w"
                            onClick={() => setIsCelsius(prev => !prev)}
                            aria-label={`Switch to ${isCelsius ? 'Fahrenheit' : 'Celsius'}`}
                        >
                            {isCelsius ? '🌡️ °C → °F' : '🌡️ °F → °C'}
                        </button>

                        <a
                            href="https://github.com/Rumeysa-Demir/weather-dashboard"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-dark"
                            aria-label="View source code on GitHub (opens in new tab)"
                        >
                            ⭐ GitHub
                        </a>
                    </nav>

                    {/* Right: search + login */}
                    <div className="header-right">

                        {/* Search */}
                        <div className="search-wrapper" role="search">
                            <form className="search-form" onSubmit={handleSearch} aria-label="City search">
                                <label htmlFor="city-search" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                                    Search for a city
                                </label>
                                <span className="search-icon" aria-hidden="true">🔍</span>
                                <input
                                    id="city-search"
                                    type="search"
                                    className="search-input"
                                    placeholder="Search city…"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                    autoComplete="off"
                                    aria-autocomplete="list"
                                    aria-controls={showSuggestions ? 'city-suggestions' : undefined}
                                    aria-expanded={showSuggestions}
                                />
                            </form>

                            {showSuggestions && suggestions.length > 0 && (
                                <ul
                                    id="city-suggestions"
                                    className="autocomplete"
                                    role="listbox"
                                    aria-label="City suggestions"
                                >
                                    {suggestions.map((s, idx) => (
                                        <li
                                            key={idx}
                                            className="autocomplete-item"
                                            role="option"
                                            tabIndex={0}
                                            aria-selected={false}
                                            onClick={() => handleSelectCity(s.name)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSelectCity(s.name)}
                                        >
                                            <span className="autocomplete-icon" aria-hidden="true">📍</span>
                                            <span className="autocomplete-text">
                                                <span className="autocomplete-city">{s.name}</span>
                                                <span className="autocomplete-region">
                                                    {s.admin1 ? `${s.admin1}, ` : ''}{s.country_code}
                                                </span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Auth */}
                        <div className="user-menu-wrapper">
                            {!user ? (
                                <button
                                    className="btn-login"
                                    onClick={() => setShowLoginModal(true)}
                                    aria-haspopup="dialog"
                                >
                                    🔐 Login
                                </button>
                            ) : (
                                <>
                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => setShowUserMenu(prev => !prev)}
                                        aria-haspopup="true"
                                        aria-expanded={showUserMenu}
                                        aria-label={`User menu for ${user.name}`}
                                    >
                                        👤 {user.name}
                                    </button>

                                    {showUserMenu && (
                                        <div
                                            className="user-menu-dropdown"
                                            role="menu"
                                            aria-label="User menu"
                                        >
                                            {/* Favorites */}
                                            <section className="user-menu-section" aria-labelledby="fav-heading">
                                                <h3 id="fav-heading">⭐ Favorites</h3>
                                                <ul>
                                                    {favorites.length === 0
                                                        ? <li className="user-menu-empty">No favorites yet.</li>
                                                        : favorites.map((fav, i) => (
                                                            <li
                                                                key={i}
                                                                role="menuitem"
                                                                tabIndex={0}
                                                                onClick={() => { setCity(fav); setShowUserMenu(false); }}
                                                                onKeyDown={(e) => e.key === 'Enter' && setCity(fav)}
                                                                aria-label={`Switch to ${fav}`}
                                                            >
                                                                🏙️ {fav}
                                                            </li>
                                                        ))
                                                    }
                                                </ul>
                                            </section>

                                            {/* Recent searches */}
                                            <section className="user-menu-section" aria-labelledby="recent-heading">
                                                <h3 id="recent-heading">🕒 Recent Searches</h3>
                                                <ul>
                                                    {recentSearches.length === 0
                                                        ? <li className="user-menu-empty">No recent searches.</li>
                                                        : recentSearches.map((rec, i) => (
                                                            <li
                                                                key={i}
                                                                role="menuitem"
                                                                tabIndex={0}
                                                                onClick={() => { setCity(rec); setShowUserMenu(false); }}
                                                                onKeyDown={(e) => e.key === 'Enter' && setCity(rec)}
                                                                aria-label={`Search again for ${rec}`}
                                                            >
                                                                🔍 {rec}
                                                            </li>
                                                        ))
                                                    }
                                                </ul>
                                            </section>

                                            <button className="btn-danger btn" onClick={handleLogout} role="menuitem">
                                                🚪 Logout
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                    </div>
                </header>
                {/* ════════════════ HEADER END ════════════════ */}

                {/* Mobile-only action bar (shown below 1024px) */}
                <div className="mobile-actions" style={{ display: 'none', padding: '0.75rem 1rem', background: 'var(--clr-surface)', borderBottom: '1px solid var(--clr-border)' }} aria-label="Quick actions">
                    <button className="btn btn-primary" onClick={handleGeolocation} aria-busy={isLocating} disabled={isLocating}>
                        {isLocating ? '⏳' : '📍'} My Location
                    </button>
                    <button className="btn btn-outline" onClick={() => setIsCelsius(prev => !prev)}>
                        {isCelsius ? '°C→°F' : '°F→°C'}
                    </button>
                    <a href="https://github.com/Rumeysa-Demir/weather-dashboard" target="_blank" rel="noopener noreferrer" className="btn btn-dark">
                        ⭐ GitHub
                    </a>
                </div>

                {/* ════════════════ MAIN CONTENT ════════════════ */}
                <main
                    id="main-content"
                    className="site-main"
                    style={{
                        flex: 1,
                        background: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.35)), ${dynamicBg} center/cover no-repeat`,
                    }}
                    aria-label="Weather information"
                    aria-live="polite"
                    aria-busy={loading}
                >
                    <div className="content-inner">

                        {/* Validation error */}
                        {validationError && (
                            <div role="alert" aria-live="assertive" className="alert alert-warn">
                                ⚠️ {validationError}
                            </div>
                        )}

                        {/* API error */}
                        {error && !validationError && (
                            <div role="alert" aria-live="assertive" className="alert alert-error">
                                ❌ {error}
                            </div>
                        )}

                        {/* Loading */}
                        {loading && (
                            <p className="loading-text" aria-live="polite">
                                <span aria-hidden="true">🌐</span> Syncing live satellite coordinates…
                            </p>
                        )}

                        {/* Weather data */}
                        {weatherData && !loading && (
                            <>
                                {/* City heading */}
                                <div className="city-heading">
                                    <div>
                                        <h1>{weatherData.cityName}</h1>
                                        <p>
                                            <time dateTime={new Date().toISOString().split('T')[0]}>
                                                {weatherData.dateStr}
                                            </time>
                                        </p>
                                    </div>
                                    {user && (
                                        <button
                                            className="fav-btn"
                                            onClick={toggleFavorite}
                                            aria-label={
                                                favorites.includes(weatherData.cityName)
                                                    ? `Remove ${weatherData.cityName} from favorites`
                                                    : `Add ${weatherData.cityName} to favorites`
                                            }
                                            aria-pressed={favorites.includes(weatherData.cityName)}
                                        >
                                            {favorites.includes(weatherData.cityName) ? '⭐' : '☆'}
                                        </button>
                                    )}
                                </div>

                                {/* Asymmetric grid */}
                                <div className="weather-grid">

                                    {/* LEFT: Main weather card */}
                                    <article className="glass-card" aria-labelledby="current-weather-heading">
                                        <h2 id="current-weather-heading" className="visually-hidden" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                                            Current weather in {weatherData.cityName}
                                        </h2>
                                        <div className="weather-icon-area">
                                            <div className="weather-icon" role="img" aria-label={`Weather condition: ${weatherData.condition}`}>
                                                {weatherData.isNight ? '🌙' : getWeatherIcon(weatherData.condition)}
                                            </div>
                                            <div className="weather-temp" aria-label={`Temperature: ${displayTemp(weatherData.temp)}`}>
                                                {displayTemp(weatherData.temp)}
                                            </div>
                                            <div className="weather-feels">
                                                Feels like {displayTemp(weatherData.feelsLike)}
                                            </div>
                                        </div>

                                        <dl className="weather-stats">
                                            <div className="weather-stat">
                                                <dt>💨 Wind</dt>
                                                <dd>{weatherData.wind}</dd>
                                            </div>
                                            <div className="weather-stat">
                                                <dt>💧 Humidity</dt>
                                                <dd>{weatherData.humidity}</dd>
                                            </div>
                                            <div className="weather-stat">
                                                <dt>🌡️ Dew Point</dt>
                                                <dd>{weatherData.dewPoint}</dd>
                                            </div>
                                            <div className="weather-stat">
                                                <dt>⏲️ Pressure</dt>
                                                <dd>{weatherData.pressure}</dd>
                                            </div>
                                        </dl>
                                    </article>

                                    {/* RIGHT: Forecasts + Radar */}
                                    <div className="weather-right">

                                        {/* Daily forecast */}
                                        <section className="glass-panel" aria-labelledby="daily-heading">
                                            <h2 id="daily-heading">📅 Daily Forecast</h2>
                                            <div className="daily-grid" role="list">
                                                {weatherData.forecast.map((f, i) => (
                                                    <div key={i} className="daily-item" role="listitem" aria-label={`${f.day}: ${getWeatherIcon(f.condition)}, high ${formatTemperature(f.maxTemp)}`}>
                                                        <div className="daily-day">{f.day}</div>
                                                        <div className="daily-icon" role="img" aria-hidden="true">{getWeatherIcon(f.condition)}</div>
                                                        <div className="daily-temp">{formatTemperature(f.maxTemp)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>

                                        {/* Hourly forecast */}
                                        <section className="glass-panel" aria-labelledby="hourly-heading">
                                            <h2 id="hourly-heading">🕒 Hourly Forecast</h2>
                                            <div className="hourly-row" role="list">
                                                {weatherData.hourly.map((h, i) => (
                                                    <div key={i} className="hourly-item" role="listitem" aria-label={`${h.day} ${h.time}: ${formatTemperature(h.temp)}`}>
                                                        <span className="hourly-label">{h.day}</span>
                                                        <span className="hourly-time">{h.time}</span>
                                                        <span className="hourly-icon" role="img" aria-hidden="true">{getWeatherIcon(h.condition)}</span>
                                                        <span className="hourly-temp">{formatTemperature(h.temp)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>

                                        {/* Radar */}
                                        <section className="glass-panel" aria-labelledby="radar-heading">
                                            <h2 id="radar-heading">📡 Local Radar &amp; Satellite</h2>
                                            <div className="radar-frame">
                                                <iframe
                                                    title="Live Weather Radar – Windy.com"
                                                    src={`https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=km/h&zoom=5&overlay=rain&product=ecmwf&level=surface&lat=${weatherData.lat}&lon=${weatherData.lon}`}
                                                    loading="lazy"
                                                    allowFullScreen
                                                />
                                            </div>
                                        </section>

                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </main>
                {/* ════════════════ MAIN END ════════════════ */}

                {/* ════════════════ FOOTER ════════════════ */}
                <footer className="site-footer" role="contentinfo">
                    <small>© 2026 SkyLine Weather Hub. All rights reserved.</small>
                    <nav className="footer-links" aria-label="Legal links">
                        <a href="#privacy">Privacy Policy</a>
                        <a href="#terms">Terms of Service</a>
                    </nav>
                </footer>

                {/* ════════════════ LOGIN MODAL ════════════════ */}
                {showLoginModal && (
                    <div
                        className="modal-overlay"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="login-modal-title"
                        onClick={(e) => { if (e.target === e.currentTarget) setShowLoginModal(false); }}
                    >
                        <div className="modal-box">
                            <h2 id="login-modal-title" className="modal-title">
                                SkyLine<span>.</span>
                            </h2>

                            <form
                                className="login-form-fields"
                                onSubmit={handleLogin}
                                noValidate
                                aria-label="Login form"
                            >
                                <div className="form-group">
                                    <label htmlFor="login-username" className="form-label">Username</label>
                                    <input
                                        id="login-username"
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Rumeysa"
                                        value={loginInput}
                                        onChange={(e) => setLoginInput(e.target.value)}
                                        autoComplete="username"
                                        autoFocus
                                        required
                                        aria-required="true"
                                        aria-describedby={loginError ? 'login-error' : undefined}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="login-password" className="form-label">Password</label>
                                    <input
                                        id="login-password"
                                        type="password"
                                        className="form-input"
                                        placeholder="••••••••"
                                        value={passwordInput}
                                        onChange={(e) => setPasswordInput(e.target.value)}
                                        autoComplete="current-password"
                                        required
                                        aria-required="true"
                                        aria-describedby={loginError ? 'login-error' : undefined}
                                    />
                                </div>

                                {loginError && (
                                    <div
                                        id="login-error"
                                        role="alert"
                                        className="alert alert-error"
                                        style={{ textAlign: 'center' }}
                                    >
                                        ⚠️ {loginError}
                                    </div>
                                )}

                                <div className="login-form-actions">
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '1rem', borderRadius: 'var(--radius-md)' }}>
                                        Sign In
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-cancel"
                                        onClick={() => setShowLoginModal(false)}
                                        aria-label="Cancel login"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}

export default App;