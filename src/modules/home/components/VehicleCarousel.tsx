// src/modules/home/components/VehicleCarousel.tsx
import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Vehicle } from '@/src/modules/vehicles/models/vehicle';

// Obtener dimensiones de la pantalla
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VehicleCarouselProps {
    vehicles: Vehicle[];
    onVehicleChange?: (index: number) => void;
}

const VehicleCarousel: React.FC<VehicleCarouselProps> = ({
    vehicles,
    onVehicleChange
}) => {
    const { theme } = useAppTheme();
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef<ScrollView>(null);

    // Cambiar a otro vehículo
    const handleVehicleChange = (index: number) => {
        setActiveIndex(index);
        if (onVehicleChange) {
            onVehicleChange(index);
        }
        if (flatListRef.current) {
            flatListRef.current.scrollTo({ x: index * SCREEN_WIDTH * 0.9, animated: true });
        }
    };

    // Navegación a la pantalla de detalle del vehículo
    const navigateToVehicleDetail = (vehicleId?: number) => {
        if (vehicleId) {
            router.push(`/vehicles/${vehicleId}`);
        }
    };

    // Colores según el tema
    const primaryColor = theme === 'dark' ? '#B27046' : '#9D7E68';
    const cardColor = theme === 'dark' ? '#222222' : '#FFFFFF';
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';

    // Calcular el porcentaje de estado general (mocked para el ejemplo)
    const calculateVehicleStatus = (vehicle: Vehicle) => {
        // Simulación: En un caso real, esto debería calcularse basándose en los mantenimientos pendientes
        return Math.floor(Math.random() * 30) + 70; // Valor entre 70 y 100
    };

    if (vehicles.length === 0) {
        return (
            <View style={[styles.emptyStateContainer, { backgroundColor: cardColor }]}>
                <Text style={[styles.emptyStateText, { color: textColor }]}>
                    No tienes vehículos registrados
                </Text>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: primaryColor }]}
                    onPress={() => router.push('/vehicles/add')}
                >
                    <Text style={styles.addButtonText}>Agregar vehículo</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.carouselContainer}>
            <ScrollView
                ref={flatListRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                snapToInterval={SCREEN_WIDTH * 0.9}
                decelerationRate="fast"
                contentContainerStyle={styles.carouselContent}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(
                        e.nativeEvent.contentOffset.x / (SCREEN_WIDTH * 0.9)
                    );
                    setActiveIndex(index);
                    if (onVehicleChange) {
                        onVehicleChange(index);
                    }
                }}
            >
                {vehicles.map((vehicle, index) => {
                    const status = calculateVehicleStatus(vehicle);

                    return (
                        <TouchableOpacity
                            key={`vehicle-${vehicle.id_vehiculo || index}`}
                            style={[
                                styles.vehicleCard,
                                { backgroundColor: cardColor, width: SCREEN_WIDTH * 0.9 - 16 }
                            ]}
                            onPress={() => navigateToVehicleDetail(vehicle.id_vehiculo)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.vehicleImageContainer}>
                                <Image
                                    source={require('@/assets/images/icon.png')}
                                    style={styles.vehicleImage}
                                    resizeMode="contain"
                                />
                            </View>
                            <View style={styles.vehicleInfo}>
                                <View style={styles.vehicleHeader}>
                                    <Text style={[styles.vehicleName, { color: textColor }]}>
                                        {vehicle.marca?.nombre} {vehicle.modelo?.nombre}
                                    </Text>
                                    <Text style={[styles.vehicleYear, { color: secondaryTextColor }]}>
                                        {vehicle.anio}
                                    </Text>
                                </View>

                                <View style={styles.vehicleDetails}>
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>
                                            Kilometraje
                                        </Text>
                                        <Text style={[styles.detailValue, { color: textColor }]}>
                                            {vehicle.kilometraje_actual?.toLocaleString() || 0}km
                                        </Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>
                                            Último servicio
                                        </Text>
                                        <Text style={[styles.detailValue, { color: textColor }]}>
                                            15/01/2024
                                        </Text>
                                    </View>


                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Indicadores de página */}
            {vehicles.length > 1 && (
                <View style={styles.paginationContainer}>
                    {vehicles.map((_, index) => (
                        <TouchableOpacity
                            key={`dot-${index}`}
                            style={[
                                styles.paginationDot,
                                activeIndex === index
                                    ? [styles.paginationDotActive, { backgroundColor: primaryColor }]
                                    : { backgroundColor: theme === 'dark' ? '#444' : '#DDD' }
                            ]}
                            onPress={() => handleVehicleChange(index)}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    carouselContainer: {
        marginBottom: 12,
    },
    carouselContent: {
    },
    vehicleCard: {
        borderRadius: 12,
        overflow: 'hidden',
        marginHorizontal: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    vehicleImageContainer: {
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    vehicleImage: {
        width: '80%',
        height: '80%',
    },
    vehicleInfo: {
        padding: 16,
    },
    vehicleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    vehicleName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    vehicleYear: {
        fontSize: 14,
    },
    vehicleDetails: {
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    statusContainer: {
        marginTop: 8,
    },
    statusLabel: {
        fontSize: 14,
        marginBottom: 4,
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 4,
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    statusPercentage: {
        fontSize: 12,
        textAlign: 'right',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    paginationDotActive: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    emptyStateContainer: {
        borderRadius: 12,
        padding: 24,
        marginHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    emptyStateText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
    },
    addButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontWeight: '500',
    },
});

export default VehicleCarousel;