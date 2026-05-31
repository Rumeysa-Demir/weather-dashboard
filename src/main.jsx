/**
 * @file main.jsx
 * @description Application entry point.
 *
 * Responsibilities:
 *  - Mounts the React app into the DOM
 *  - Wraps the tree with global providers (WeatherProvider)
 *  - Wraps the tree with an ErrorBoundary for graceful crash recovery
 *  - Enables React.StrictMode for development-time warnings
 *
 * Covers course topics:
 *  - React: ReactDOM.createRoot (React 18 concurrent mode entry point)
 *  - React: Context API — WeatherProvider wraps the full tree here so every
 *    descendant can access shared state via useWeatherContext()
 *  - React: Class component (ErrorBoundary) — demonstrates the one case where
 *    class components are still necessary (no Hook equivalent for componentDidCatch)
 *  - Modern ES6+: import/export modules, arrow functions, template literals
 *  - Accessibility: lang attribute set on <html>, viewport meta guaranteed
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { WeatherProvider } from './context/WeatherContext.jsx';

// ─── Accessibility: ensure <html lang="en"> ───────────────────────────────────
// Setting the language programmatically here acts as a safety net in case
// index.html was edited and the attribute was removed.
document.documentElement.lang = 'en';

// ─── Error Boundary ───────────────────────────────────────────────────────────

/**
 * ErrorBoundary catches any unhandled render-time errors in the component tree
 * and shows a user-friendly fallback UI instead of a blank white screen.
 *
 * Why a class component?
 *   React does not yet provide Hook equivalents for `componentDidCatch` and
 *   `getDerivedStateFromError`, so a class component is the correct approach here.
 *   This is intentional and minimal — keeping class components to the absolute
 *   minimum as recommended by the course requirements.
 *
 * @extends {React.Component}
 */
class ErrorBoundary extends React.Component {
    /** @param {{ children: React.ReactNode }} props */
    constructor(props) {
        super(props);
        /** @type {{ hasError: boolean, message: string }} */
        this.state = { hasError: false, message: '' };
    }

    /**
     * Called when a descendant throws during rendering.
     * Returns new state to trigger the fallback UI.
     *
     * @param {Error} error
     * @returns {{ hasError: boolean, message: string }}
     */
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            message: error?.message || 'An unexpected error occurred.',
        };
    }

    /**
     * Called after the error is captured.
     * In a production app this is where you would send logs to a monitoring service.
     *
     * @param {Error}            error
     * @param {React.ErrorInfo}  info
     */
    componentDidCatch(error, info) {
        // Log to console in development; swap for a real logger (e.g. Sentry) in production
        console.error('[ErrorBoundary] Uncaught render error:', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    role="alert"
                    aria-live="assertive"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        fontFamily: 'system-ui, sans-serif',
                        background: '#f0f9ff',
                        color: '#0f172a',
                        padding: '2rem',
                        textAlign: 'center',
                        gap: '1rem',
                    }}
                >
                    <span style={{ fontSize: '3rem' }} aria-hidden="true">⚠️</span>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                        Something went wrong
                    </h1>
                    <p style={{ color: '#64748b', maxWidth: '480px', margin: 0 }}>
                        {this.state.message}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '0.5rem',
                            padding: '0.625rem 1.5rem',
                            background: '#0ea5e9',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.9375rem',
                            cursor: 'pointer',
                        }}
                    >
                        Reload page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

// ─── Mount ────────────────────────────────────────────────────────────────────

const rootElement = document.getElementById('root');

// Guard: fail with a clear message if index.html is missing the root div
if (!rootElement) {
    throw new Error(
        '[main.jsx] Could not find #root element in index.html.\n' +
        'Make sure <div id="root"></div> exists in your HTML file.'
    );
}

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        {/*
      ErrorBoundary — outermost layer so any crash anywhere in the tree
      is caught and shown gracefully.
    */}
        <ErrorBoundary>
            {/*
        WeatherProvider — makes selectedCity, isCelsius, toggleUnit, and
        formatTemp available to every component via useWeatherContext().
        Placed here (not inside App) so it wraps the entire tree from root.
      */}
            <WeatherProvider>
                <App />
            </WeatherProvider>
        </ErrorBoundary>
    </React.StrictMode>
);