export const formatTemperature = (temp) => {
    return `${Math.round(temp)}°C`;
};

// Maps official OpenWeather API conditions to beautiful emoticons matching our interface UI
export const getWeatherIcon = (condition) => {
    const cond = condition?.toLowerCase();
    if (cond?.includes('cloud')) return '☁️';
    if (cond?.includes('rain') || cond?.includes('drizzle')) return '🌧️';
    if (cond?.includes('clear') || cond?.includes('sun')) return '☀️';
    if (cond?.includes('snow')) return '❄️';
    if (cond?.includes('thunder')) return '⛈️';
    if (cond?.includes('mist') || cond?.includes('fog') || cond?.includes('haze')) return '🌫️';
    return '☀️';
};