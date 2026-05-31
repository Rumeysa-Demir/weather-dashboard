/**
 * @file WeatherContext.jsx
 * @description Global state management for the SkyLine Weather application
 *              using React Context API + custom hook pattern.
 *
 * Covers course topics:
 *  - React: Context API, functional components, hooks (useState, useMemo, useContext)
 *  - Modern ES6+: destructuring, arrow functions, template literals, modules
 *  - Error-safe code: guard clause in custom hook, meaningful error messages
 *  - Separation of concerns: context handles only shared global state,
 *    local UI state stays in individual components
 *  - PropTypes: runtime type checking for the Provider's children prop
 *
 * When to use Context (vs local state):
 *  Context is justified here because `selectedCity` and `isCelsius` are needed
 *  by multiple components at different nesting levels (Header search, main
 *  weather card, forecast panels). Prop-drilling these values would require
 *  passing through 3+ layers — the classic signal to lift state into Context.
 */

import React, {
    createContext,
    useState,
    useMemo,
    useContext,
} from 'react';
import PropTypes from 'prop-types';

// ─── Context creation ─────────────────────────────────────────────────────────

/**
 * WeatherContext holds the app-wide state that multiple components need:
 *  - which city is displayed
 *  - whether temperatures show in °C or °F
 *
 * Do NOT consume this context directly — use the `useWeatherContext` hook
 * below, which includes a helpful error guard.
 *
 * @type {React.Context<WeatherContextValue | undefined>}
 */
const WeatherContext = createContext(undefined);

// ─── Default values ───────────────────────────────────────────────────────────

/** @type {string} The city shown on first load. */
const DEFAULT_CITY = 'Mersin';

// ─── Provider component ───────────────────────────────────────────────────────

/**
 * WeatherProvider wraps the entire app and makes shared weather state
 * available to any descendant component via `useWeatherContext()`.
 *
 * Place it as high in the tree as needed — typically in `main.jsx` around `<App />`.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {React.ReactElement}
 *
 * @example
 * // main.jsx
 * root.render(
 *   <WeatherProvider>
 *     <App />
 *   </WeatherProvider>
 * );
 */
export const WeatherProvider = ({ children }) => {
    // ── Shared state ────────────────────────────────────────────────────────────

    /**
     * The currently displayed city.
     * Accepts either a plain string ("Istanbul") or a coords object ({ lat, lon })
     * so geolocation works without an extra reverse-geocoding step.
     *
     * @type {[string | { lat: number, lon: number }, Function]}
     */
    const [selectedCity, setSelectedCity] = useState(DEFAULT_CITY);

    /**
     * Temperature unit preference.
     * true  → Celsius (default)
     * false → Fahrenheit
     *
     * @type {[boolean, Function]}
     */
    const [isCelsius, setIsCelsius] = useState(true);

    // ── Derived helpers ─────────────────────────────────────────────────────────

    /**
     * Toggles between °C and °F.
     * Defined here (not in individual components) so every consumer
     * shares the same toggle function reference.
     */
    const toggleUnit = () => setIsCelsius((prev) => !prev);

    /**
     * Converts a Celsius value to the currently selected unit and returns
     * a formatted string, e.g. "23°C" or "73°F".
     *
     * Memoised with useMemo so the function reference only changes when
     * `isCelsius` changes — avoids unnecessary re-renders in consumers.
     *
     * @type {(tempCelsius: number) => string}
     */
    const formatTemp = useMemo(
        () => (tempCelsius) => {
            if (tempCelsius == null || Number.isNaN(Number(tempCelsius))) {
                return isCelsius ? '--°C' : '--°F';
            }
            const rounded = Math.round(Number(tempCelsius));
            if (isCelsius) return `${rounded}°C`;
            return `${Math.round((rounded * 9) / 5 + 32)}°F`;
        },
        [isCelsius]
    );

    // ── Context value ───────────────────────────────────────────────────────────

    /**
     * Memoising the context value object prevents every consumer from
     * re-rendering on unrelated state changes elsewhere in the tree.
     * This is the recommended pattern when the context value is an object.
     *
     * @type {WeatherContextValue}
     */
    const contextValue = useMemo(
        () => ({
            // City state
            selectedCity,
            setSelectedCity,

            // Unit state
            isCelsius,
            toggleUnit,
            formatTemp,
        }),
        [selectedCity, isCelsius, formatTemp]
    );

    return (
        <WeatherContext.Provider value={contextValue}>
            {children}
        </WeatherContext.Provider>
    );
};

// ── Runtime prop-type checking ─────────────────────────────────────────────────
WeatherProvider.propTypes = {
    /** Any valid React node(s) — required. */
    children: PropTypes.node.isRequired,
};

// ─── Custom hook ──────────────────────────────────────────────────────────────

/**
 * `useWeatherContext` — consumes the WeatherContext safely.
 *
 * Throws a descriptive error if called outside of a `<WeatherProvider>`,
 * so developers get an actionable message instead of a cryptic
 * "Cannot read properties of undefined".
 *
 * @returns {WeatherContextValue} The shared weather state and helpers.
 *
 * @example
 * const { selectedCity, setSelectedCity, isCelsius, toggleUnit, formatTemp } =
 *   useWeatherContext();
 */
export const useWeatherContext = () => {
    const context = useContext(WeatherContext);

    // Guard clause: fail fast and loud during development
    if (context === undefined) {
        throw new Error(
            'useWeatherContext must be used inside a <WeatherProvider>.\n' +
            'Wrap your component tree with <WeatherProvider> in main.jsx.'
        );
    }

    return context;
};

// ─── JSDoc type definition (for IDE autocomplete) ─────────────────────────────

/**
 * @typedef {object} WeatherContextValue
 * @property {string | { lat: number, lon: number }} selectedCity
 *   Currently displayed city — string name or coordinates object.
 * @property {function(string | { lat: number, lon: number }): void} setSelectedCity
 *   Updates the displayed city; triggers a new weather fetch in useWeather.
 * @property {boolean}  isCelsius  - true = °C, false = °F.
 * @property {function(): void}    toggleUnit  - Switches between °C and °F.
 * @property {function(number): string} formatTemp
 *   Converts a Celsius value to a formatted string in the current unit.
 */