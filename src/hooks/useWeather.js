import { useState, useEffect } from 'react';

export const useWeather = (city) => {
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // OpenWeatherMap free API key from environment variables
    const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

    useEffect(() => {
        if (!city) return;

        const fetchWeatherAndForecast = async () => {
            setLoading(true);
            setError(null);
            try {
                // Step 1: Fetch current weather data to get coordinates (lat, lon) and country code
                const currentWeatherResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
                );

                if (!currentWeatherResponse.ok) {
                    throw new Error("City not found. Please try another city.");
                }

                const currentData = await currentWeatherResponse.json();
                const { lat, lon } = currentData.coord;

                // Step 2: Fetch 3-hour forecast data (Free API alternative for daily forecast aggregation)
                const forecastResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
                );

                if (!forecastResponse.ok) {
                    throw new Error("Failed to load forecast data.");
                }

                const forecastData = await forecastResponse.json();

                // Process OpenWeather 3-hour blocks to get unique daily values for the 7-day row
                const dailyForecastMap = {};
                forecastData.list.forEach((item) => {
                    const date = new Date(item.dt * 1000);
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                    // Group by unique day name to extract max/min temperatures
                    if (!dailyForecastMap[dayName]) {
                        dailyForecastMap[dayName] = {
                            day: dayName,
                            date: dateStr,
                            maxTemp: item.main.temp_max,
                            minTemp: item.main.temp_min,
                            condition: item.weather[0].main
                        };
                    } else {
                        if (item.main.temp_max > dailyForecastMap[dayName].maxTemp) {
                            dailyForecastMap[dayName].maxTemp = item.main.temp_max;
                        }
                        if (item.main.temp_min < dailyForecastMap[dayName].minTemp) {
                            dailyForecastMap[dayName].minTemp = item.main.temp_min;
                        }
                    }
                });

                // Convert the map back into an array list for our UI layout
                const formattedForecast = Object.values(dailyForecastMap).slice(0, 7);

                // Format current timestamp beautifully matching our modern design layout
                const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
                const formattedDate = new Date().toLocaleDateString('en-US', options);

                // YENÝ EKLENEN KISIM: 1. Eleman olarak "ÞU AN" (Now) verisini manuel oluþturuyoruz
                const now = new Date();
                const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' });

                const nowItem = {
                    time: 'Now',
                    day: currentDay,
                    temp: currentData.main.temp,
                    condition: currentData.weather[0].main
                };

                // Diðer 5 eleman: API'den gelen GELECEK saatlerin tahmini
                // 1. Þehrin UTC'ye göre saniye farkýný alýyoruz
                const timezoneOffset = currentData.timezone;

                // 2. Gelecek saatleri hesaplarken þehrin kendi saat dilimini (timezone) ekliyoruz
                const futureItems = forecastData.list.slice(0, 5).map((item) => {
                    // SÝHÝRLÝ FORMÜL: Evrensel saate (dt) þehrin kendi saat farkýný ekle
                    const localTime = new Date((item.dt + timezoneOffset) * 1000);

                    // getHours yerine getUTCHours kullanýyoruz çünkü farký üstte biz manuel ekledik!
                    const hours = localTime.getUTCHours().toString().padStart(2, '0');
                    const minutes = localTime.getUTCMinutes().toString().padStart(2, '0');
                    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

                    return {
                        time: `${hours}:${minutes}`,
                        day: days[localTime.getUTCDay()],
                        temp: item.main.temp,
                        condition: item.weather[0].main
                    };
                });

                // "Þimdi" verisini en baþa koyup, arkasýna gelecek tahminlerini ekliyoruz
                const hourlyForecast = [nowItem, ...futureItems];

                setWeatherData({
                    cityName: `${currentData.name}, ${currentData.sys.country}`,
                    // "GMT+3" sabit yazýsýný kaldýrdýk, sadece formatlý tarih görünecek
                    dateStr: formattedDate,
                    temp: currentData.main.temp,
                    feelsLike: currentData.main.feels_like,
                    condition: currentData.weather[0].main,
                    wind: `${currentData.wind.speed} km/h`,
                    humidity: `${currentData.main.humidity}%`,
                    dewPoint: `${Math.round(currentData.main.temp - ((100 - currentData.main.humidity) / 5))}°C`,
                    pressure: `${currentData.main.pressure} hPa`,
                    forecast: formattedForecast,
                    hourly: hourlyForecast,
                    lat: lat,
                    lon: lon,
                    // GECE/GÜNDÜZ KONTROLÜ (Bunu eklemeyi unutma!)
                    isNight: currentData.weather[0].icon.includes('n')
                });

            } catch (err) {
                setError(err.message || "An error occurred while fetching weather data.");
                setWeatherData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchWeatherAndForecast();
    }, [city, API_KEY]);

    return { weatherData, loading, error };
};