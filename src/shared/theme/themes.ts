import { createTheme } from 'tamagui';

// Tema claro basado en tus colores
export const lightTheme = createTheme({
    background: '#FFFFFF',
    backgroundHover: '#F9F9F9',
    backgroundPress: '#EDEDED',
    backgroundFocus: '#F9F9F9',
    color: '#313131',
    colorHover: '#2A2A2A',
    colorPress: '#242424',
    colorFocus: '#313131',

    // Colores de acento
    primary: '#9D7E68',
    primaryHover: '#B27046',
    primaryPress: '#9E633E',

    secondary: '#955D3B',
    secondaryHover: '#774A2F',
    secondaryPress: '#593823',

    surface: '#F4F4F4',
    surfaceHover: '#E6E6E6',
    surfacePress: '#D8D8D8',
});

// Tema oscuro (opcional, lo dejamos preparado)
export const darkTheme = createTheme({
    background: '#111111',
    backgroundHover: '#0C0C0C',
    backgroundPress: '#050505',
    backgroundFocus: '#111111',
    color: '#F9F9F9',
    colorHover: '#EDEDED',
    colorPress: '#E3E3E3',
    colorFocus: '#F9F9F9',

    // Colores de acento
    primary: '#B27046',
    primaryHover: '#9E633E',
    primaryPress: '#955D3B',

    secondary: '#774A2F',
    secondaryHover: '#593823',
    secondaryPress: '#593823',

    surface: '#313131',
    surfaceHover: '#2A2A2A',
    surfacePress: '#242424',
});

// Exportar temas
export const themes = {
    light: lightTheme,
    dark: darkTheme,
};