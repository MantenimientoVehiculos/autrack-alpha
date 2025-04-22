// src/shared/theme/theme.ts
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Define el tema claro personalizado basado en los colores existentes
export const lightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#9D7E68',
        primaryContainer: '#B27046',
        onPrimary: '#FFFFFF',
        secondary: '#955D3B',
        secondaryContainer: '#774A2F',
        onSecondary: '#FFFFFF',
        surface: '#F4F4F4',
        background: '#FFFFFF',
        error: '#B00020',
        text: '#313131',
        onBackground: '#313131',
        onSurface: '#313131',
    },
    roundness: 8,
};

// Define el tema oscuro personalizado
export const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#B27046',
        primaryContainer: '#9E633E',
        onPrimary: '#FFFFFF',
        secondary: '#774A2F',
        secondaryContainer: '#593823',
        onSecondary: '#FFFFFF',
        surface: '#313131',
        background: '#111111',
        error: '#CF6679',
        text: '#F9F9F9',
        onBackground: '#F9F9F9',
        onSurface: '#F9F9F9',
    },
    roundness: 8,
};

// Exporta ambos temas y los tipos para TypeScript
export const themes = {
    light: lightTheme,
    dark: darkTheme,
};

export type AppTheme = typeof lightTheme;