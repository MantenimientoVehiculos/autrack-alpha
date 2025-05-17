// src/modules/reports/screens/ReportsScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { GradientHeader } from '@/src/shared/components/ui/GradientHeader';
import { Button } from '@/src/shared/components/ui/Button';
import { Card } from '@/src/shared/components/ui/Card';
import { BarChartIcon, CarIcon } from '@/src/shared/components/ui/Icons';
import { useVehicles } from '@/src/modules/vehicles/hooks/useVehicles';
import { useStatistics } from '../hooks/useStatistics';

export const ReportsScreen: React.FC = () => {
    const router = useRouter();
    const { theme } = useAppTheme();
    const { vehicles } = useVehicles();
    const { costByVehicle, loadCostByVehicle, isLoading } = useStatistics();

    // Colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const bgColor = theme === 'dark' ? '#111111' : '#FFFFFF';
    const cardColor = theme === 'dark' ? '#222222' : '#FFFFFF';
    const accentColor = theme === 'dark' ? '#B27046' : '#9D7E68';

    // Ir a los filtros de reporte
    const navigateToReportFilters = () => {
        router.push('/reports/filters');
    };

    // Ir a estadísticas generales
    const navigateToStatistics = () => {
        router.push('/reports/statistics');
    };

    // Ir a estadísticas de vehículo específico
    const navigateToVehicleStatistics = (vehicleId: number) => {
        router.push({
            pathname: '/reports/vehicle-statistics',
            params: { vehicleId }
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <GradientHeader
                title="Reportes y Estadísticas"
                showBackButton={false}
            />

            <ScrollView style={styles.scrollContainer}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                    Reportes
                </Text>

                {/* Tarjeta de generar reporte */}
                <Card
                    style={styles.card}
                    onPress={navigateToReportFilters}
                >
                    <View style={styles.cardHeader}>
                        <BarChartIcon size={24} color={accentColor} />
                        <Text style={[styles.cardTitle, { color: textColor }]}>
                            Generar Reporte
                        </Text>
                    </View>
                    <Text style={[styles.cardDescription, { color: textColor }]}>
                        Crea reportes personalizados sobre el mantenimiento de tus vehículos. Filtra por fecha, kilometraje y tipo de mantenimiento.
                    </Text>
                    <Button
                        buttonVariant="primary"
                        buttonSize="medium"
                        onPress={navigateToReportFilters}
                        style={styles.cardButton}
                    >
                        Crear Reporte
                    </Button>
                </Card>

                {/* Tarjeta de estadísticas generales */}
                <Card
                    style={styles.card}
                    onPress={navigateToStatistics}
                >
                    <View style={styles.cardHeader}>
                        <BarChartIcon size={24} color={accentColor} />
                        <Text style={[styles.cardTitle, { color: textColor }]}>
                            Estadísticas Generales
                        </Text>
                    </View>
                    <Text style={[styles.cardDescription, { color: textColor }]}>
                        Visualiza estadísticas sobre todos tus vehículos, incluyendo costos totales, distribución por categoría y más.
                    </Text>
                    <Button
                        buttonVariant="primary"
                        buttonSize="medium"
                        onPress={navigateToStatistics}
                        style={styles.cardButton}
                    >
                        Ver Estadísticas
                    </Button>
                </Card>

                <Text style={[styles.sectionTitle, { color: textColor, marginTop: 24 }]}>
                    Estadísticas por Vehículo
                </Text>

                {/* Lista de vehículos para estadísticas */}
                {vehicles.length > 0 ? (
                    vehicles.map(vehicle => (
                        <Card
                            key={vehicle.id_vehiculo}
                            style={styles.vehicleCard}
                            onPress={() => navigateToVehicleStatistics(vehicle.id_vehiculo || 0)}
                        >
                            <View style={styles.vehicleCardContent}>
                                <View style={[styles.vehicleIcon, { backgroundColor: accentColor }]}>
                                    <CarIcon size={24} color="#FFFFFF" />
                                </View>
                                <View style={styles.vehicleInfo}>
                                    <Text style={[styles.vehicleName, { color: textColor }]}>
                                        {vehicle.marca?.nombre} {vehicle.modelo?.nombre}
                                    </Text>
                                    <Text style={[styles.vehiclePlate, { color: textColor }]}>
                                        {vehicle.placa}
                                    </Text>
                                </View>
                                <View style={styles.vehicleArrowContainer}>
                                    <Text style={[styles.vehicleArrow, { color: accentColor }]}>›</Text>
                                </View>
                            </View>
                        </Card>
                    ))
                ) : (
                    <Card style={styles.emptyCard}>
                        <Text style={[styles.emptyText, { color: textColor }]}>
                            No tienes vehículos registrados
                        </Text>
                        <Button
                            buttonVariant="outline"
                            buttonSize="medium"
                            onPress={() => router.push('/vehicles/add')}
                            style={styles.emptyButton}
                        >
                            Agregar Vehículo
                        </Button>
                    </Card>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    card: {
        padding: 16,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    cardDescription: {
        fontSize: 14,
        marginBottom: 16,
    },
    cardButton: {
        alignSelf: 'flex-start',
    },
    vehicleCard: {
        marginBottom: 12,
    },
    vehicleCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    vehicleIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    vehicleInfo: {
        flex: 1,
    },
    vehicleName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    vehiclePlate: {
        fontSize: 14,
    },
    vehicleArrowContainer: {
        justifyContent: 'center',
    },
    vehicleArrow: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    emptyCard: {
        padding: 24,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    emptyButton: {
        alignSelf: 'center',
    },
});

export default ReportsScreen;