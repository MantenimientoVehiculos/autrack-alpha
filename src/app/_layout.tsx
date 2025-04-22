// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { TamaguiProvider } from 'tamagui';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';

import config from '@/tamagui.config';
import { AuthProvider } from '../modules/auth';

// Prevenir que la pantalla de splash se oculte automáticamente
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
        InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    });

    // Cuando las fuentes estén cargadas, ocultar la pantalla de splash
    React.useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <TamaguiProvider config={config}>
            <AuthProvider>
                <Stack>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="auth" options={{ headerShown: false }} />
                    <Stack.Screen name="vehicles" options={{ headerShown: false }} />
                    <Stack.Screen name="maintenance" options={{ headerShown: false }} />
                </Stack>
            </AuthProvider>
        </TamaguiProvider>
    );
}