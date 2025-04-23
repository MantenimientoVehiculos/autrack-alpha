// src/shared/components/AppLayout.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { NotificationToast } from '@/src/modules/notifications/components/NotificationToast';
import { NotificationProvider } from '@/src/modules/notifications/context/NotificationProvider';
import { websocketService } from '@/src/shared/services/websocket';
import { useAuth } from '@/src/modules/auth/context/AuthContext';
import { Slot } from 'expo-router';

interface AppLayoutProps {
    children: React.ReactNode;
    hideBottomNav?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
}) => {
    const { theme } = useAppTheme();
    const { isAuthenticated } = useAuth();

    // Manejar conexión inicial de WebSocket
    useEffect(() => {
        if (isAuthenticated) {
            // Conectar WebSocket cuando el usuario está autenticado
            websocketService.connect();

            // Limpiar al desmontar
            return () => {
                websocketService.disconnect();
            };
        }
    }, [isAuthenticated]);

    return (
        <NotificationProvider>
            <StatusBar
                barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent
            />

            {/* Contenido principal */}
            <View style={styles.content}>
                <Slot />
            </View>


            {/* Toast de notificaciones */}
            <NotificationToast />
        </NotificationProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0,
    },
    content: {
        flex: 1,
    },
});

export default AppLayout;