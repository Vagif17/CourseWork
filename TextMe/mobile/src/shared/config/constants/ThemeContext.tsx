import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Colors } from './Colors';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
    currentColors: typeof Colors.light;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [theme, setThemeState] = useState<ThemeType>('system');

    useEffect(() => {
        loadTheme();

        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            if (theme === 'system') {
                // Это заставит компонент перерендериться, 
                // так как useColorScheme тоже обновится, 
                // но явный слушатель более надежен.
            }
        });

        return () => subscription.remove();
    }, [theme]);

    const loadTheme = async () => {
        const savedTheme = await SecureStore.getItemAsync('app_theme');
        if (savedTheme) {
            setThemeState(savedTheme as ThemeType);
        }
    };

    const setTheme = async (newTheme: ThemeType) => {
        setThemeState(newTheme);
        await SecureStore.setItemAsync('app_theme', newTheme);
    };

    const isDark = theme === 'system' 
        ? systemColorScheme === 'dark' 
        : theme === 'dark';
    const currentColors = isDark ? Colors.dark : Colors.light;

    return (
        <ThemeContext.Provider value={{ theme, setTheme, currentColors, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useAppTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useAppTheme must be used within a ThemeProvider');
    }
    return context;
};
