// app/_layout.tsx
import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/src/modules/auth/context/AuthContext';
import ThemeProvider from '@/src/shared/theme/ThemeProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Prevenir que la pantalla de splash se oculte automáticamente
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    // Cargar fuentes para React Native Paper
    const [fontsLoaded] = useFonts({
        // Fuentes opcionales que podrías querer usar con Paper
        'SpaceMono': require('@/assets/fonts/SpaceMono-Regular.ttf'),
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
                <AuthProvider>
                    <Stack screenOptions={{ headerShown: false }} />
                </AuthProvider>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}