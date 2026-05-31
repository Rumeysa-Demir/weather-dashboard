/**
 * @file useWeather.js
 * @description Custom React hook that fetches current weather, forecast,
 *              and air quality data from the OpenWeatherMap free APIs.
 *
 * Covers course topics:
 *  - Asynchronous JS: async/await, fetch, AbortController, Promise.all
 *  - React Hooks: useState, useEffect, useRef — custom hook pattern
 *  - Error handling: network errors, HTTP errors, API key guard, empty states
 *  - Modern ES6+: arrow functions, destructuring, template literals,
 *                 optional chaining, const/let, modules (import/export)
 *  - Separation of concerns: pure helper functions outside the hook
 *
 * FREE endpoints used (no credit card required):
 *  1. /data/2.5/weather       — current weather (temp, wind, humidity,
 *                               pressure, sunrise, sunset, rain/snow)
 *  2. /data/2.5/forecast      — 5-day / 3-hour forecast list
 *  3. /data/2.5/air_pollution — AQI, PM2.5, PM10, CO, NO2, O3
 */

import { useState, useEffect, useRef } from 'react';

// ─── Environment & API config ─────────────────────────────────────────────────

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

if (!API_KEY) {
    console.warn(
        '[useWeather] VITE_WEATHER_API_KEY is not set.\n' +
        'Create a .env file at the project root and add:\n' +
        '  VITE_WEATHER_API_KEY=your_key_here'
    );
}

// ─── URL builders ─────────────────────────────────────────────────────────────

/**
 * Builds the current-weather endpoint URL.
 * Accepts either a city name string or a { lat, lon } coordinates object.
 * @param {string | { lat: number, lon: number }} city
 * @returns {string}
 */
const buildCurrentUrl = (city) => {
    const base = `${BASE_URL}/weather?appid=${API_KEY}&units=metric`;
    return typeof city === 'object' && city.lat != null
        ? `${base}&lat=${city.lat}&lon=${city.lon}`
        : `${base}&q=${encodeURIComponent(city)}`;
};

/**
 * Builds the 5-day / 3-hour forecast endpoint URL.
 * @param {number} lat
 * @param {number} lon
 * @returns {string}
 */
const buildForecastUrl = (lat, lon) =>
    `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&cnt=40`;

/**
 * Builds the Air Pollution endpoint URL (FREE — no subscription needed).
 * Returns AQI (1–5), PM2.5, PM10, CO, NO2, O3 and more.
 * @param {number} lat
 * @param {number} lon
 * @returns {string}
 */
const buildAirPollutionUrl = (lat, lon) =>
    `${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

// ─── Pure helper functions ────────────────────────────────────────────────────

/**
 * Converts wind speed from m/s to km/h.
 * @param {number} ms
 * @returns {string}  e.g. "18 km/h"
 */
const formatWind = (ms) => {
    if (ms == null || Number.isNaN(ms)) return 'N/A';
    return `${Math.round(ms * 3.6)} km/h`;
};

/**
 * Calculates dew point using the Magnus formula shortcut:
 *   Td ≈ T − ((100 − RH) / 5)
 * @param {number} tempCelsius
 * @param {number} humidityPct  0–100
 * @returns {string}  e.g. "14°C"
 */
const calcDewPoint = (tempCelsius, humidityPct) => {
    if (tempCelsius == null || humidityPct == null) return 'N/A';
    return `${Math.round(tempCelsius - (100 - humidityPct) / 5)}°C`;
};

/**
 * Converts a Unix UTC timestamp + a timezone offset (seconds) to a
 * human-readable local time string, e.g. "06:23" or "19:47".
 *
 * We add the city's UTC offset to the raw UTC stamp, then read the
 * UTC hours/minutes of that adjusted Date — this avoids the browser's
 * own timezone influencing the result.
 *
 * @param {number} unixUtc      Unix timestamp in seconds (UTC).
 * @param {number} tzOffsetSec  City timezone offset in seconds (from OWM `timezone` field).
 * @returns {string}  "HH:MM"
 */
const unixToLocalTime = (unixUtc, tzOffsetSec) => {
    if (unixUtc == null) return 'N/A';
    const localMs = (unixUtc + tzOffsetSec) * 1000;
    const d = new Date(localMs);
    const hh = d.getUTCHours().toString().padStart(2, '0');
    const mm = d.getUTCMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
};

/**
 * Maps the OpenWeatherMap AQI integer (1–5) to a label and color token.
 * Used to render the air quality badge.
 *
 * @param {number} aqi  1 = Good … 5 = Very Poor
 * @returns {{ label: string, level: 'good'|'fair'|'moderate'|'poor'|'verypoor' }}
 */
const parseAqi = (aqi) => {
    const map = {
        1: { label: 'Good', level: 'good' },
        2: { label: 'Fair', level: 'fair' },
        3: { label: 'Moderate', level: 'moderate' },
        4: { label: 'Poor', level: 'poor' },
        5: { label: 'Very Poor', level: 'verypoor' },
    };
    return map[aqi] ?? { label: 'Unknown', level: 'moderate' };
};

/**
 * Extracts precipitation in the last hour from the current weather response.
 * OWM only includes `rain` or `snow` keys when there IS precipitation;
 * when it's dry those keys are absent — we default to 0.
 *
 * @param {object} current  Raw OWM /weather response object.
 * @returns {string}  e.g. "2.3 mm" or "0 mm"
 */
const parsePrecipitation = (current) => {
    const rain = current?.rain?.['1h'] ?? 0;
    const snow = current?.snow?.['1h'] ?? 0;
    const total = rain + snow;
    return total > 0 ? `${total.toFixed(1)} mm` : '0 mm';
};

/**
 * Aggregates 3-hour forecast blocks into per-day summaries.
 * Skips today so the list shows only *future* days.
 *
 * @param {object[]} list  `forecast.list` from OWM.
 * @returns {object[]}  Up to 6 daily objects: { day, date, maxTemp, minTemp, condition }.
 */
const aggregateDailyForecast = (list) => {
    if (!Array.isArray(list) || list.length === 0) return [];

    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const map = {};

    list.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });

        if (day === todayStr && Object.keys(map).length === 0) return;

        if (!map[day]) {
            map[day] = {
                day,
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                maxTemp: item.main.temp_max,
                minTemp: item.main.temp_min,
                condition: item.weather[0]?.main ?? 'Clear',
            };
        } else {
            if (item.main.temp_max > map[day].maxTemp) map[day].maxTemp = item.main.temp_max;
            if (item.main.temp_min < map[day].minTemp) map[day].minTemp = item.main.temp_min;
        }
    });

    return Object.values(map).slice(0, 6);
};

/**
 * Builds the hourly forecast strip shown in the "🕒 Hourly" panel.
 * First entry = "Now" (from current weather), next 5 = upcoming 3-hour blocks.
 *
 * @param {object}   currentData   Parsed OWM /weather response.
 * @param {object[]} forecastList  `forecast.list`.
 * @returns {object[]}  Array of 6 items: { time, day, temp, condition }.
 */
const buildHourlyForecast = (currentData, forecastList) => {
    if (!currentData || !Array.isArray(forecastList)) return [];

    const nowItem = {
        time: 'Now',
        day: new Date().toLocaleDateString('en-US', { weekday: 'short' }),
        temp: currentData.main.temp,
        condition: currentData.weather[0]?.main ?? 'Clear',
    };

    const tzOffsetMs = currentData.timezone * 1000;

    const futureItems = forecastList.slice(0, 5).map((item) => {
        const localDate = new Date(item.dt * 1000 + tzOffsetMs);
        const hh = localDate.getUTCHours().toString().padStart(2, '0');
        const mm = localDate.getUTCMinutes().toString().padStart(2, '0');
        const dayAbbr = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][localDate.getUTCDay()];
        return {
            time: `${hh}:${mm}`,
            day: dayAbbr,
            temp: item.main.temp,
            condition: item.weather[0]?.main ?? 'Clear',
        };
    });

    return [nowItem, ...futureItems];
};

// ─── Custom Hook ──────────────────────────────────────────────────────────────

/**
 * `useWeather` — fetches and returns live weather, forecast, and air quality data.
 *
 * NEW fields added (all from FREE endpoints, no credit card):
 *  - weatherData.sunrise        "06:23"  — local sunrise time
 *  - weatherData.sunset         "19:47"  — local sunset time
 *  - weatherData.precipitation  "1.2 mm" — rain + snow in last hour
 *  - weatherData.visibility     "10 km"  — visibility distance
 *  - weatherData.cloudiness     "75%"    — cloud cover percentage
 *  - weatherData.airQuality     object   — { aqi, label, level, pm25, pm10, co, no2, o3 }
 *
 * @param {string | { lat: number, lon: number } | null} city
 * @returns {{ weatherData: object|null, loading: boolean, error: string|null }}
 */
export const useWeather = (city) => {
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const abortRef = useRef(null);

    useEffect(() => {
        if (!city) return;

        if (!API_KEY) {
            setError('Weather API key is missing. Please set VITE_WEATHER_API_KEY in your .env file.');
            return;
        }

        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        const { signal } = controller;

        const fetchAll = async () => {
            setLoading(true);
            setError(null);

            try {
                // ── Step 1: Current weather ───────────────────────────────────
                const currentRes = await fetch(buildCurrentUrl(city), { signal });

                if (!currentRes.ok) {
                    const s = currentRes.status;
                    if (s === 404) throw new Error('City not found. Please check the spelling and try again.');
                    if (s === 401) throw new Error('Invalid API key. Please check your VITE_WEATHER_API_KEY.');
                    if (s === 429) throw new Error('Too many requests. Please wait a moment and try again.');
                    throw new Error(`Weather service error (${s}). Please try again later.`);
                }

                const current = await currentRes.json();

                const {
                    coord: { lat, lon },
                    main: { temp, feels_like, humidity, pressure },
                    weather: [{ main: condition, icon }],
                    wind: { speed: windSpeed },
                    sys: { country, sunrise: sunriseUnix, sunset: sunsetUnix },
                    name: cityName,
                    timezone,
                    visibility,
                    clouds: { all: cloudsAll },
                } = current;

                // ── Step 2 & 3: Forecast + Air Pollution in parallel ──────────
                // Promise.all sends both requests simultaneously — faster than sequential
                const [forecastRes, airRes] = await Promise.all([
                    fetch(buildForecastUrl(lat, lon), { signal }),
                    fetch(buildAirPollutionUrl(lat, lon), { signal }),
                ]);

                if (!forecastRes.ok) throw new Error('Failed to load forecast data. Please try again.');

                const forecastJson = await forecastRes.json();
                const forecastList = forecastJson.list ?? [];

                // ── Parse air quality (soft-fail: show null if unavailable) ───
                let airQuality = null;
                if (airRes.ok) {
                    const airJson = await airRes.json();
                    const airItem = airJson?.list?.[0];
                    if (airItem) {
                        const { main: { aqi }, components } = airItem;
                        const { label, level } = parseAqi(aqi);
                        airQuality = {
                            aqi,
                            label,
                            level,
                            pm25: components.pm2_5?.toFixed(1) ?? 'N/A',
                            pm10: components.pm10?.toFixed(1) ?? 'N/A',
                            co: components.co?.toFixed(1) ?? 'N/A',
                            no2: components.no2?.toFixed(1) ?? 'N/A',
                            o3: components.o3?.toFixed(1) ?? 'N/A',
                        };
                    }
                }

                // ── Assemble final state object ───────────────────────────────

                /**
                 * Build a date string in the *city's* local time, not the
                 * browser's local time.
                 *
                 * How it works:
                 *  - `timezone` from OWM is the city's UTC offset in seconds.
                 *  - We take the current UTC timestamp (ms), add the city's
                 *    offset (converted to ms), then create a new Date from that.
                 *  - Reading that Date with getUTC* methods gives us the city's
                 *    wall-clock time without the browser's own timezone
                 *    interfering.
                 *
                 * Example: Tokyo is UTC+9 (32400 s).
                 *   UTC now  = 09:05  →  cityLocalMs = 18:05  ✓
                 */
                const cityLocalMs = Date.now() + timezone * 1000;
                const cityDate = new Date(cityLocalMs);

                const MONTHS = [
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December',
                ];
                const month = MONTHS[cityDate.getUTCMonth()];
                const day2 = cityDate.getUTCDate();
                const year2 = cityDate.getUTCFullYear();
                const rawH = cityDate.getUTCHours();
                const min2 = cityDate.getUTCMinutes().toString().padStart(2, '0');
                const ampm = rawH >= 12 ? 'PM' : 'AM';
                const hour12 = (rawH % 12 || 12).toString().padStart(2, '0');
                const dateStr = `${month} ${day2}, ${year2} at ${hour12}:${min2} ${ampm}`;

                setWeatherData({
                    cityName: `${cityName}, ${country}`,
                    dateStr,

                    temp,
                    feelsLike: feels_like,
                    condition,

                    wind: formatWind(windSpeed),
                    humidity: `${humidity}%`,
                    dewPoint: calcDewPoint(temp, humidity),
                    pressure: `${pressure} hPa`,

                    // ── NEW ──────────────────────────────────────────────────
                    sunrise: unixToLocalTime(sunriseUnix, timezone),
                    sunset: unixToLocalTime(sunsetUnix, timezone),
                    precipitation: parsePrecipitation(current),
                    visibility: visibility != null
                        ? `${(visibility / 1000).toFixed(1)} km`
                        : 'N/A',
                    cloudiness: `${cloudsAll}%`,
                    airQuality,
                    // ────────────────────────────────────────────────────────

                    forecast: aggregateDailyForecast(forecastList),
                    hourly: buildHourlyForecast(current, forecastList),

                    lat,
                    lon,
                    timezone,
                    isNight: icon?.endsWith('n') ?? false,
                });

            } catch (err) {
                if (err.name === 'AbortError') return;
                const message = err.message?.includes('fetch')
                    ? 'Network error. Please check your internet connection.'
                    : (err.message || 'An unexpected error occurred. Please try again.');
                setError(message);
                setWeatherData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
        return () => { controller.abort(); };
    }, [city]);

    return { weatherData, loading, error };
};