// src/utils/weatherUtils.js

export const formatTemperature = (temp) => {
    return `${Math.round(temp)}°C`;
};

// Maps official OpenWeather API conditions to beautiful emoticons
export const getWeatherIcon = (condition) => {
    const cond = condition?.toLowerCase() || '';
    if (cond.includes('cloud')) return '☁️';
    if (cond.includes('rain') || cond.includes('drizzle')) return '🌧️';
    if (cond.includes('clear') || cond.includes('sun')) return '☀️';
    if (cond.includes('snow')) return '❄️'; // Kar ikonu
    if (cond.includes('thunder')) return '⛈️';
    if (cond.includes('mist') || cond.includes('fog') || cond.includes('haze')) return '🌫️';
    return '☀️';
};

// Course requirement requirement: Dynamic design based on weather.
// Returns a high-resolution, realistic background image URL based on current weather conditions.
export const getWeatherBackground = (condition) => {
    const cond = condition?.toLowerCase() || '';

    // ☀️ SUNNY / CLEAR: Vibrant, realistic sun-reflective sky over a beautiful coastal city landscape
    if (cond.includes('clear') || cond.includes('sun')) {
        return 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80")';
    }

    // ☁️ CLOUDY: Soft, realistic atmospheric overcast sky with beautiful cloud depth
    if (cond.includes('cloud')) {
        return 'url("https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=1920&q=80")';
    }

    // 🌧️ RAINY: "Rainy, but Sunny" vibe - Golden hour sun rays blending with fresh rain drops
    if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('thunder')) {
        return 'url("https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=1920&q=80")';
    }

    // ❄️ SNOWY: Bembeyaz, etkileyici karlı dağ/orman manzarası
    if (cond.includes('snow')) {
        return 'url("https://images.unsplash.com/photo-1478265409131-1f65c88f965c?auto=format&fit=crop&w=1920&q=80")';
    }

    // DEFAULT / LOADING STATE: Cheerful dynamic blue sky horizon
    return 'url("https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80")';
};