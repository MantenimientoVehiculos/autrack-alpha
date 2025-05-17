// src/modules/home/screens/HomeScreen.tsx
import React, { useRef } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Platform,
    StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/modules/auth/context/AuthContext';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import useHome from '../hooks/useHome';

// Importamos los componentes separados en lugar de AnimatedHeader
import HeaderBackground from '../components/HeaderBackground';
import HeaderContent from '../components/HeaderContent';
import VehicleCarousel from '../components/VehicleCarousel';
import MaintenanceList from '../components/MaintenanceList';
import SectionHeader from '../components/SectionHeader';
import ReportsSummaryWidget from '../../reports/components/ReportsSummaryWidget';

// Obtener dimensiones de la pantalla
const HEADER_MAX_HEIGHT = 200; // Altura máxima del header
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 90 : 70; // Altura mínima (contraída)

const HomeScreen: React.FC = () => {
    const { theme } = useAppTheme();
    const router = useRouter();
    const { user } = useAuth();
    const scrollY = useRef(new Animated.Value(0)).current;

    // Usar el hook personalizado para obtener los datos del dashboard
    const {
        vehicles,
        upcomingMaintenance,
        isLoading,
        unreadCount,
        activeVehicleIndex,
        handleVehicleChange
    } = useHome();

    // Navegación a la pantalla de notificaciones
    const navigateToNotifications = () => {
        router.push('/notifications');
    };

    // Navegación a todos los vehículos
    const navigateToAllVehicles = () => {
        router.push('/vehicles');
    };

    // Navegación a todos los mantenimientos
    const navigateToAllMaintenance = () => {
        // Si hay un vehículo activo, navegar a su historial de mantenimiento
        const activeVehicle = vehicles[activeVehicleIndex];
        if (activeVehicle?.id_vehiculo) {
            router.push(`/vehicles/${activeVehicle.id_vehiculo}/maintenance`);
        } else {
            router.push('/vehicles');
        }
    };

    // Colores según el tema
    const bgColor = theme === 'dark' ? '#111111' : '#F4F4F4';

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
            />

            {/* Fondo del encabezado (gradiente) - Capa inferior (por debajo del ScrollView) */}
            <HeaderBackground
                scrollY={scrollY}
                maxHeight={HEADER_MAX_HEIGHT}
            />

            {/* Contenido principal con scroll - Capa media */}
            <Animated.ScrollView
                contentContainerStyle={[
                    styles.scrollViewContent,
                    { paddingTop: HEADER_MAX_HEIGHT - 40 }
                ]}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
            >
                {/* Sección de Vehículos con Carrusel */}
                <View style={styles.section}>

                    {/* Carrusel de vehículos */}
                    <VehicleCarousel
                        vehicles={vehicles}
                        onVehicleChange={handleVehicleChange}
                    />
                </View>

                {/* Widget de resumen de reportes */}
                <View style={styles.section}>
                    <ReportsSummaryWidget />
                </View>

                {/* Sección de Próximos Mantenimientos */}
                <View style={styles.section}>
                    <SectionHeader
                        title="Próximos mantenimientos"
                        onAction={navigateToAllMaintenance}
                    />

                    {/* Lista de mantenimientos */}
                    <MaintenanceList
                        upcomingMaintenance={upcomingMaintenance}
                        isLoading={isLoading}
                    />
                </View>
            </Animated.ScrollView>

            {/* Contenido del encabezado (texto y botones) - Capa superior (por encima de todo) */}
            <HeaderContent
                scrollY={scrollY}
                title="Autrack"
                subtitle={`Hola, ${user?.nombre_completo?.split(' ')[0] || 'Usuario'}`}
                unreadCount={unreadCount}
                onNotificationPress={navigateToNotifications}
                maxHeight={HEADER_MAX_HEIGHT}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    scrollViewContent: {
        paddingBottom: 20,
    },
    section: {
        marginBottom: 20,
    }
});

export default HomeScreen;