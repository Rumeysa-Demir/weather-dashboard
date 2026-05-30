// src/utils/weatherUtils.js

export const formatTemperature = (temp) => {
    return `${Math.round(temp)}°C`;
};

// Maps official OpenWeather API conditions to beautiful emoticons
// İkonların çalışması için React'i import ediyoruz
import React from 'react';

// YENİ: Animasyonlu ve Filtreli SVG İkon Motoru
export const getWeatherIcon = (condition, isNight = false) => {
    const cond = condition?.toLowerCase() || '';
    let iconName = '';
    let isFoggy = false; // Sis/Pus durumu için özel anahtar

    if (cond.includes('clear') || cond.includes('sun')) {
        iconName = isNight ? 'night.svg' : 'day.svg';
    } else if (cond === 'clouds') {
        iconName = 'cloudy.svg';
    } else if (cond.includes('cloud')) {
        iconName = isNight ? 'cloudy-night-1.svg' : 'cloudy-day-1.svg';
    } else if (cond.includes('rain') || cond.includes('drizzle')) {
        iconName = 'rainy-6.svg';
    } else if (cond.includes('thunder') || cond.includes('storm')) {
        iconName = 'thunder.svg';
    } else if (cond.includes('snow')) {
        iconName = 'snowy-1.svg';
    } else if (cond.includes('mist') || cond.includes('fog') || cond.includes('haze') || cond.includes('smoke') || cond.includes('dust')) {
        iconName = 'cloudy.svg';
        isFoggy = true; // Hava puslu, filtreyi aç!
    } else {
        iconName = isNight ? 'night.svg' : 'day.svg';
    }

    const iconUrl = `https://www.amcharts.com/wp-content/themes/amcharts4/css/img/icons/weather/animated/${iconName}`;

    return (
        <img
            src={iconUrl}
            alt={condition}
            style={{
                width: '1em',
                height: '1em',
                verticalAlign: 'middle',
                // SİHİRLİ DOKUNUŞ: Eğer hava sisli/puslu ise bulutu gri (grayscale) yap ve saydamlaştır (opacity)
                filter: isFoggy
                    ? 'drop-shadow(0px 8px 16px rgba(0,0,0,0.2)) grayscale(100%) opacity(70%)'
                    : 'drop-shadow(0px 8px 16px rgba(0,0,0,0.3))',
                transform: 'scale(1.7)'
            }}
        />
    );
};
// Gelişmiş Arka Plan Resim Motoru
export const getWeatherBackground = (condition) => {
    const cond = condition?.toLowerCase() || '';

    // 1. GÜNEŞLİ / AÇIK
    if (cond.includes('clear') || cond.includes('sun')) {
        return 'url("https://images.unsplash.com/photo-1601297183305-6df142704ea2?q=80&w=1920")';
    }
    // 2. BULUTLU (Çok daha dramatik ve net bir bulut manzarası)
    if (cond.includes('cloud')) {
        return 'url("https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?q=80&w=1920")';
    }
    // 3. YAĞMURLU
    if (cond.includes('rain') || cond.includes('drizzle')) {
        return 'url("https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=1920")';
    }
    // 4. KARLI (Yeni eklendi)
    if (cond.includes('snow')) {
        return 'url("https://images.unsplash.com/photo-1478265409131-1f65c88f965c?q=80&w=1920")';
    }
    // 5. FIRTINA / ŞİMŞEK (Yeni eklendi)
    if (cond.includes('thunder') || cond.includes('storm')) {
        return 'url("https://images.unsplash.com/photo-1605727216801-e27ce1d0ce16?q=80&w=1920")';
    }
    // 6. SİS / PUS / DUMAN (Delhi'deki sorunu çözen kısım)
    if (cond.includes('mist') || cond.includes('fog') || cond.includes('haze') || cond.includes('smoke') || cond.includes('dust')) {
        return 'url("https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?q=80&w=1920")';
    }

    // VARSAYILAN (API'den hiç bilinmeyen bir veri gelirse)
    return 'url("https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=1920")';
};