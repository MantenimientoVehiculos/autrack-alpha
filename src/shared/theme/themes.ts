// src/shared/theme/theme.ts
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { Appearance } from 'react-native';

// Colores basados en los temas originales
const colors = {
    primary: '#9D7E68',
    primaryContainer: '#F9F2ED',
    secondary: '#955D3B',
    secondaryContainer: '#F6EBE4',
    surface: '#F4F4F4',
    background: '#FFFFFF',
    error: '#CF6679',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: '#313131',
    onBackground: '#313131',
    elevation: {
        level0: 'transparent',
        level1: '#F9F9F9',
        level2: '#F4F4F4',
        level3: '#EDEDED',
        level4: '#E6E6E6',
        level5: '#E3E3E3',
    },
};

// Colores basados en los temas originales para el modo oscuro
const darkColors = {
    primary: '#B27046',
    primaryContainer: '#593823',
    secondary: '#774A2F',
    secondaryContainer: '#593823',
    surface: '#313131',
    background: '#111111',
    error: '#CF6679',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: '#F9F9F9',
    onBackground: '#F9F9F9',
    elevation: {
        level0: 'transparent',
        level1: '#1C1C1C',
        level2: '#222222',
        level3: '#272727',
        level4: '#2C2C2C',
        level5: '#313131',
    },
};

export const lightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        ...colors,
    },
};

export const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        ...darkColors,
    },
};

// Función para obtener el tema basado en el modo del sistema
export const getTheme = (mode?: 'light' | 'dark') => {
    const colorScheme = mode || Appearance.getColorScheme() || 'light';
    return colorScheme === 'dark' ? darkTheme : lightTheme;
};

export default {
    light: lightTheme,
    dark: darkTheme,
    getTheme,
};