// src/shared/components/ui/BottomNav.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { HomeIcon, CarIcon, BarChartIcon, SettingsIcon } from './Icons';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import NotificationBadge from './NotificationBadge';
import { NotificationProvider } from '@/src/modules/notifications/context/NotificationProvider';

// Definición de rutas con patrones para identificar pantallas hijas
const routes = [
    {
        name: 'home',
        path: '/',
        label: 'Inicio',
        icon: HomeIcon,
        // Patrón para identificar cuando esta ruta está activa
        pattern: /^\/$/
    },
    {
        name: 'vehicles',
        path: '/vehicles',
        label: 'Vehículos',
        icon: CarIcon,
        // Patrón para identificar cuando cualquier subruta de vehículos está activa
        pattern: /^\/vehicles($|\/)/
    },
    {
        name: 'notifications',
        path: '/notifications',
        label: 'Notificaciones',
        icon: BarChartIcon,
        pattern: /^\/notifications($|\/)/,
        showBadge: true
    },
    {
        name: 'settings',
        path: '/settings',
        label: 'Ajustes',
        icon: SettingsIcon,
        pattern: /^\/settings($|\/)/
    }
];

// Altura base del navbar
const BASE_NAVBAR_HEIGHT = 65;

export const BottomNav: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { theme } = useAppTheme();

    // Obtener colores de tema
    const getThemeColors = () => {
        return {
            card: theme === 'dark' ? '#222222' : '#FFFFFF',
            tabBarActive: theme === 'dark' ? '#B27046' : '#9D7E68',
            tabBarInactive: theme === 'dark' ? '#777777' : '#AAAAAA'
        };
    };

    const themeColors = getThemeColors();

    return (
        <NotificationProvider>
            <View style={[styles.container, { backgroundColor: 'transparent' }]}>
                <SafeAreaView style={[styles.safeAreaContainer, { backgroundColor: themeColors.card }]}>
                    <View style={[styles.navContent, { backgroundColor: themeColors.card }]}>
                        {routes.map((route) => {
                            // Comprobar si la ruta actual coincide con el patrón de esta pestaña
                            const isActive = route.pattern.test(pathname);
                            const Icon = route.icon;

                            return (
                                <TouchableOpacity
                                    key={route.name}
                                    style={styles.tabButton}
                                    onPress={() => router.push(route.path as any)}
                                    accessibilityRole="button"
                                    accessibilityLabel={route.label}
                                    accessibilityState={{ selected: isActive }}
                                >
                                    <View style={styles.iconContainer}>
                                        <Icon
                                            size={24}
                                            color={isActive ? themeColors.tabBarActive : themeColors.tabBarInactive}
                                        />
                                        {/* Mostrar badge de notificaciones si corresponde */}
                                        {route.showBadge && (
                                            <NotificationBadge size={16} />
                                        )}
                                    </View>
                                    <Text style={[
                                        styles.tabLabel,
                                        { color: isActive ? themeColors.tabBarActive : themeColors.tabBarInactive }
                                    ]}>
                                        {route.label}
                                    </Text>
                                    {isActive && (
                                        <View style={[
                                            styles.indicator,
                                            { backgroundColor: themeColors.tabBarActive }
                                        ]} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </SafeAreaView>
            </View>
        </NotificationProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    safeAreaContainer: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    navContent: {
        flexDirection: 'row',
        height: BASE_NAVBAR_HEIGHT,
    },
    tabButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    iconContainer: {
        position: 'relative',
    },
    tabLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    indicator: {
        position: 'absolute',
        bottom: 0,
        width: 24,
        height: 3,
        borderRadius: 1.5,
        marginBottom: 5,
    },
});

export default BottomNav;