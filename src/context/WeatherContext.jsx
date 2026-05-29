import React, { createContext, useState, useContext } from 'react';

// Context nesnesini oluþturuyoruz
const WeatherContext = createContext();

// Verileri sarmalayacak Provider bileþeni
export const WeatherProvider = ({ children }) => {
    const [selectedCity, setSelectedCity] = useState('Mersin'); // Varsayýlan þehir

    return (
        <WeatherContext.Provider value={{ selectedCity, setSelectedCity }}>
            {children}
        </WeatherContext.Provider>
    );
};

// Kolayca çaðýrmak için custom hook
export const useWeatherContext = () => {
    const context = useContext(WeatherContext);
    if (!context) {
        throw new Error('useWeatherContext bir WeatherProvider içinde kullanýlmalýdýr.');
    }
    return context;
};