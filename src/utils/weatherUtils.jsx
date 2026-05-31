/**
 * @file weatherUtils.js
 * @description Utility functions for weather data formatting, icon rendering,
 *              and dynamic background selection.
 *
 * Covers course topics:
 *  - Modern ES6+: arrow functions, template literals, destructuring, default params
 *  - Error-safe code: null/undefined guards throughout
 *  - DOM / JSX accessibility: meaningful alt text, aria-hidden on decorative icons
 *  - Separation of concerns: each function has a single, clear responsibility
 */

import React from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Base URL for animated weather SVG icons (amCharts free set). */
const ICON_BASE_URL =
    'https://www.amcharts.com/wp-content/themes/amcharts4/css/img/icons/weather/animated/';

/**
 * Condition → icon filename mapping.
 * Ordered from most-specific to most-general so the first match wins.
 * Each entry: [matchStrings[], dayIcon, nightIcon, isFoggy?]
 *
 * @type {Array<[string[], string, string, boolean?]>}
 */
const ICON_MAP = [
    [['thunder', 'storm'], 'thunder.svg', 'thunder.svg'],
    [['snow', 'blizzard'], 'snowy-1.svg', 'snowy-1.svg'],
    [['rain', 'drizzle', 'shower'], 'rainy-6.svg', 'rainy-6.svg'],
    [['mist', 'fog', 'haze', 'smoke', 'dust'], 'cloudy.svg', 'cloudy.svg', true],
    [['cloud', 'overcast', 'broken'], 'cloudy-day-1.svg', 'cloudy-night-1.svg'],
    [['clouds'], 'cloudy.svg', 'cloudy.svg'],
    [['clear', 'sun', 'fair'], 'day.svg', 'night.svg'],
];

/**
 * Condition → Unsplash background URL mapping.
 * Ordered most-specific first.
 *
 * @type {Array<[string[], string]>}
 */
const BACKGROUND_MAP = [
    [
        ['thunder', 'storm'],
        'https://images.unsplash.com/photo-1605727216801-e27ce1d0ce16?q=80&w=1920',
    ],
    [
        ['snow', 'blizzard'],
        'https://images.unsplash.com/photo-1478265409131-1f65c88f965c?q=80&w=1920',
    ],
    [
        ['rain', 'drizzle', 'shower'],
        'https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=1920',
    ],
    [
        ['mist', 'fog', 'haze', 'smoke', 'dust'],
        'https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?q=80&w=1920',
    ],
    [
        ['cloud', 'overcast', 'broken', 'clouds'],
        'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?q=80&w=1920',
    ],
    [
        ['clear', 'sun', 'fair'],
        'https://images.unsplash.com/photo-1601297183305-6df142704ea2?q=80&w=1920',
    ],
];

/** Fallback background when no condition matches. */
const DEFAULT_BACKGROUND =
    'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=1920';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns true if any keyword in `keywords` is a substring of `str`.
 *
 * @param {string}   str      - Lower-cased condition string.
 * @param {string[]} keywords - Keywords to search for.
 * @returns {boolean}
 */
const matchesAny = (str, keywords) =>
    keywords.some((kw) => str.includes(kw));

// ─── Exported Utilities ───────────────────────────────────────────────────────

/**
 * Formats a temperature value in either Celsius or Fahrenheit.
 *
 * @param {number}  tempCelsius - Temperature in degrees Celsius.
 * @param {boolean} [isCelsius=true] - When false, converts and returns °F.
 * @returns {string} Formatted string, e.g. "23°C" or "73°F".
 *
 * @example
 * formatTemperature(20);           // "20°C"
 * formatTemperature(20, false);    // "68°F"
 * formatTemperature(null);         // "--°C"  (graceful fallback)
 */
export const formatTemperature = (tempCelsius, isCelsius = true) => {
    // Guard: handle null / undefined / NaN gracefully
    if (tempCelsius == null || Number.isNaN(Number(tempCelsius))) {
        return isCelsius ? '--°C' : '--°F';
    }

    const rounded = Math.round(Number(tempCelsius));

    if (isCelsius) {
        return `${rounded}°C`;
    }

    const fahrenheit = Math.round((rounded * 9) / 5 + 32);
    return `${fahrenheit}°F`;
};

/**
 * Returns an accessible animated weather icon as a React `<img>` element.
 *
 * Accessibility notes:
 *  - When used purely as decoration (parent already describes the condition),
 *    pass `decorative={true}` → sets `alt=""` and `aria-hidden="true"`.
 *  - Otherwise, `alt` is set to a human-readable description of the condition.
 *
 * @param {string}  [condition='']   - Weather condition string (e.g. "rain").
 * @param {boolean} [isNight=false]  - Whether to use the night variant.
 * @param {boolean} [decorative=false] - Mark as decorative (no alt text).
 * @returns {React.ReactElement} An `<img>` element with the weather icon.
 *
 * @example
 * getWeatherIcon('rain');                     // rainy icon, meaningful alt
 * getWeatherIcon('clear', true);             // moon icon, night variant
 * getWeatherIcon('fog', false, true);        // foggy icon, decorative (aria-hidden)
 */
export const getWeatherIcon = (condition = '', isNight = false, decorative = false) => {
    // Normalise: lower-case, trim whitespace — guard against non-string input
    const cond = typeof condition === 'string' ? condition.toLowerCase().trim() : '';

    let iconFilename = isNight ? 'night.svg' : 'day.svg'; // sensible default
    let isFoggy = false;

    // Walk the map; first match wins
    for (const [keywords, dayIcon, nightIcon, foggy = false] of ICON_MAP) {
        if (matchesAny(cond, keywords)) {
            iconFilename = isNight ? nightIcon : dayIcon;
            isFoggy = foggy;
            break;
        }
    }

    const iconUrl = `${ICON_BASE_URL}${iconFilename}`;

    /**
     * Construct a human-readable description for screen readers.
     * Example: "rain" → "Rain weather condition"
     */
    const altText = decorative
        ? ''
        : condition
            ? `${condition.charAt(0).toUpperCase() + condition.slice(1)} weather condition`
            : 'Weather condition icon';

    return (
        <img
            src={iconUrl}
            alt={altText}
            aria-hidden={decorative ? 'true' : undefined}
            loading="lazy"
            style={{
                width: '1em',
                height: '1em',
                verticalAlign: 'middle',
                transform: 'scale(1.7)',
                /**
                 * Foggy / misty conditions → greyscale + reduced opacity
                 * to visually communicate low visibility.
                 */
                filter: isFoggy
                    ? 'drop-shadow(0px 8px 16px rgba(0,0,0,0.2)) grayscale(100%) opacity(70%)'
                    : 'drop-shadow(0px 8px 16px rgba(0,0,0,0.3))',
            }}
        />
    );
};

/**
 * Returns a CSS `url("…")` string for a full-page background image
 * matching the current weather condition.
 *
 * All images are sourced from Unsplash (free-to-use).
 *
 * @param {string} [condition=''] - Weather condition string.
 * @returns {string} A CSS background-image value, e.g. `url("https://…")`.
 *
 * @example
 * getWeatherBackground('rain');   // → url("…rain photo…")
 * getWeatherBackground('');       // → url("…default photo…")
 */
export const getWeatherBackground = (condition = '') => {
    const cond = typeof condition === 'string' ? condition.toLowerCase().trim() : '';

    // Walk the map; first match wins
    for (const [keywords, imageUrl] of BACKGROUND_MAP) {
        if (matchesAny(cond, keywords)) {
            return `url("${imageUrl}")`;
        }
    }

    return `url("${DEFAULT_BACKGROUND}")`;
};