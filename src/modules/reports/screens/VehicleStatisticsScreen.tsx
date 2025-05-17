// src/modules/reports/screens/VehicleStatisticsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { GradientHeader } from '@/src/shared/components/ui/GradientHeader';
import { Button } from '@/src/shared/components/ui/Button';
import { useStatistics } from '../hooks/useStatistics';
import { StatisticsChart } from '../components/StatisticsChart';
import { VehicleStatisticsCard } from '../components/VehicleStatisticsCard';

export const VehicleStatisticsScreen: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const vehicleId = parseInt(params.vehicleId as string, 10);

    const { theme } = useAppTheme();
    const {
        completeCostStats,
        loadCompleteCostStatistics,
        isLoading,
        error
    } = useStatistics();

    // Colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const bgColor = theme === 'dark' ? '#111111' : '#FFFFFF';
    const accentColor = theme === 'dark' ? '#B27046' : '#9D7E68';

    // Cargar estadísticas al iniciar
    useEffect(() => {
        loadCompleteCostStatistics();
    }, [loadCompleteCostStatistics]);

    // Obtener datos del vehículo seleccionado
    const getVehicleStatistics = () => {
        if (!completeCostStats) return null;

        return completeCostStats.vehicle_cost_statistics.find(
            stat => stat.vehicle.id === vehicleId
        );
    };

    const vehicleStats = getVehicleStatistics();

    // Preparar datos para gráficos
    const prepareCostByCategoryData = () => {
        if (!vehicleStats) return [];

        return vehicleStats.costs_by_category.map(cat => ({
            name: cat.name,
            value: cat.total_cost
        })).sort((a, b) => b.value - a.value);
    };

    const prepareCostByTypeData = () => {
        if (!vehicleStats) return [];

        return vehicleStats.costs_by_type.map(type => ({
            name: type.name,
            value: type.total_cost
        })).sort((a, b) => b.value - a.value);
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: bgColor }]}>
                <GradientHeader
                    title="Estadísticas de Vehículo"
                    showBackButton={true}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={accentColor} />
                    <Text style={[styles.loadingText, { color: textColor }]}>
                        Cargando estadísticas...
                    </Text>
                </View>
            </View>
        );
    }

    if (error || !vehicleStats) {
        return (
            <View style={[styles.container, { backgroundColor: bgColor }]}>
                <GradientHeader
                    title="Estadísticas de Vehículo"
                    showBackButton={true}
                />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                        {error || `No se encontraron estadísticas para el vehículo seleccionado.`}
                    </Text>
                    <Button
                        buttonVariant="primary"
                        buttonSize="medium"
                        onPress={() => loadCompleteCostStatistics()}
                    >
                        Reintentar
                    </Button>
                </View>
            </View>
        );
    }

    const categoryData = prepareCostByCategoryData();
    const typeData = prepareCostByTypeData();

    // Calcular estadísticas adicionales
    const calculateAdditionalStats = () => {
        // Contar mantenimientos
        const totalMaintenanceCount = vehicleStats.costs_by_type.reduce(
            (sum, type) => sum + type.maintenance_count, 0
        );

        return {
            totalMaintenanceCount,
            averageCostPerMaintenance: totalMaintenanceCount > 0
                ? vehicleStats.total_maintenance_cost / totalMaintenanceCount
                : 0
        };
    };

    const additionalStats = calculateAdditionalStats();

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <GradientHeader
                title={`${vehicleStats.vehicle.brand} ${vehicleStats.vehicle.model}`}
                showBackButton={true}
            />

            <ScrollView style={styles.scrollContainer}>
                {/* Resumen del vehículo */}
                <VehicleStatisticsCard
                    vehicleName={`${vehicleStats.vehicle.brand} ${vehicleStats.vehicle.model} (${vehicleStats.vehicle.plate})`}
                    totalMaintenanceCount={additionalStats.totalMaintenanceCount}
                    totalMaintenanceCost={vehicleStats.total_maintenance_cost}
                />

                {/* Costos promedio */}
                <View style={styles.statsCardRow}>
                    <View style={[styles.statsCard, { backgroundColor: theme === 'dark' ? '#222222' : '#FFFFFF' }]}>
                        <Text style={[styles.statsCardValue, { color: accentColor }]}>
                            ${additionalStats.averageCostPerMaintenance.toFixed(2)}
                        </Text>
                        <Text style={[styles.statsCardLabel, { color: secondaryTextColor }]}>
                            Costo Promedio por Mantenimiento
                        </Text>
                    </View>

                    <View style={[styles.statsCard, { backgroundColor: theme === 'dark' ? '#222222' : '#FFFFFF' }]}>
                        <Text style={[styles.statsCardValue, { color: accentColor }]}>
                            {new Date().getFullYear() - vehicleStats.vehicle.year}
                        </Text>
                        <Text style={[styles.statsCardLabel, { color: secondaryTextColor }]}>
                            Edad del Vehículo (Años)
                        </Text>
                    </View>
                </View>

                {/* Distribución por categoría */}
                {categoryData.length > 0 && (
                    <StatisticsChart
                        data={categoryData}
                        title="Distribución por Categoría"
                        type="pie"
                        valuePrefix="$"
                    />
                )}

                {/* Distribución por tipo */}
                {typeData.length > 0 && (
                    <StatisticsChart
                        data={typeData}
                        title="Costos por Tipo de Mantenimiento"
                        type="bar"
                        valuePrefix="$"
                    />
                )}

                {/* Comparativa anual - simulada */}
                <StatisticsChart
                    data={[
                        { name: '2023', value: vehicleStats.total_maintenance_cost * 0.7 },
                        { name: '2024', value: vehicleStats.total_maintenance_cost * 0.9 },
                        { name: '2025', value: vehicleStats.total_maintenance_cost }
                    ]}
                    title="Costos Anuales"
                    type="bar"
                    valuePrefix="$"
                />

                {/* Botón para generar reporte específico */}
                <Button
                    buttonVariant="primary"
                    buttonSize="large"
                    onPress={() => {
                        router.push({
                            pathname: '/reports/filters',
                            params: { vehicleId: vehicleStats.vehicle.id }
                        });
                    }}
                    style={styles.reportButton}
                >
                    Generar Reporte de este Vehículo
                </Button>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    errorText: {
        color: '#CF6679',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
    },
    statsCardRow: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 12,
    },
    statsCard: {
        flex: 1,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    statsCardValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    statsCardLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    reportButton: {
        marginVertical: 24,
    }
});

export default VehicleStatisticsScreen;