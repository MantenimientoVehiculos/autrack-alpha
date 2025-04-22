// src/shared/theme/ThemeProvider.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { lightTheme, darkTheme } from './themes';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
    theme: ThemeType;
    toggleTheme: () => void;
    setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Inicializar con el esquema de color del sistema
    const [theme, setTheme] = useState<ThemeType>(
        (Appearance.getColorScheme() as ThemeType) || 'light'
    );

    // Escuchar cambios en el esquema de color del sistema
    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            setTheme((colorScheme as ThemeType) || 'light');
        });

        return () => subscription.remove();
    }, []);

    // Obtener el tema correcto basado en el estado actual
    const getThemeObject = () => {
        return theme === 'dark' ? darkTheme : lightTheme;
    };

    // Función para alternar el tema
    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            <PaperProvider theme={getThemeObject()}>
                {children}
            </PaperProvider>
        </ThemeContext.Provider>
    );
};

// Hook personalizado para usar el tema
export const useAppTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useAppTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeProvider;