// src/modules/reports/screens/StatisticsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { GradientHeader } from '@/src/shared/components/ui/GradientHeader';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import { useStatistics } from '../hooks/useStatistics';
import { StatisticsChart } from '../components/StatisticsChart';

export const StatisticsScreen: React.FC = () => {
    const router = useRouter();
    const { theme } = useAppTheme();
    const {
        completeCostStats,
        loadCompleteCostStatistics,
        isLoading,
        error
    } = useStatistics();

    // Cargar estadísticas al iniciar
    useEffect(() => {
        loadCompleteCostStatistics();
    }, [loadCompleteCostStatistics]);

    // Colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const bgColor = theme === 'dark' ? '#111111' : '#FFFFFF';
    const accentColor = theme === 'dark' ? '#B27046' : '#9D7E68';

    // Navegar a estadísticas de vehículo específico
    const navigateToVehicleStatistics = (vehicleId: number) => {
        router.push({
            pathname: '/reports/vehicle-statistics',
            params: { vehicleId }
        });
    };

    // Preparar datos para gráficos
    const prepareCostByVehicleData = () => {
        if (!completeCostStats) return [];

        return completeCostStats.vehicle_cost_statistics.map(stat => ({
            name: `${stat.vehicle.brand} ${stat.vehicle.model}`,
            value: stat.total_maintenance_cost
        }));
    };

    // Preparar datos para costos por categoría (sumados de todos los vehículos)
    const prepareCostByCategoryData = () => {
        if (!completeCostStats) return [];

        // Agrupar costos por categoría a través de todos los vehículos
        const categoryCosts = new Map<number, { name: string, value: number }>();

        completeCostStats.vehicle_cost_statistics.forEach(vehicleStat => {
            vehicleStat.costs_by_category.forEach(catCost => {
                const existing = categoryCosts.get(catCost.id);
                if (existing) {
                    existing.value += catCost.total_cost;
                } else {
                    categoryCosts.set(catCost.id, {
                        name: catCost.name,
                        value: catCost.total_cost
                    });
                }
            });
        });

        return Array.from(categoryCosts.values()).sort((a, b) => b.value - a.value);
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: bgColor }]}>
                <GradientHeader
                    title="Estadísticas"
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

    if (error) {
        return (
            <View style={[styles.container, { backgroundColor: bgColor }]}>
                <GradientHeader
                    title="Estadísticas"
                    showBackButton={true}
                />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                        {error}
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

    const costByVehicleData = prepareCostByVehicleData();
    const costByCategoryData = prepareCostByCategoryData();

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <GradientHeader
                title="Estadísticas"
                showBackButton={true}
            />

            <ScrollView style={styles.scrollContainer}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                    Estadísticas Generales
                </Text>

                {/* Resumen general */}
                <Card style={styles.summaryCard}>
                    <Text style={[styles.cardTitle, { color: textColor }]}>
                        Resumen
                    </Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: textColor }]}>
                                {completeCostStats?.total_vehicles || 0}
                            </Text>
                            <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
                                Vehículos
                            </Text>
                        </View>

                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: textColor }]}>
                                ${completeCostStats?.overall_total_cost.toFixed(2) || '0.00'}
                            </Text>
                            <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
                                Costo Total
                            </Text>
                        </View>

                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: textColor }]}>
                                ${completeCostStats ? (completeCostStats.overall_total_cost / Math.max(completeCostStats.total_vehicles, 1)).toFixed(2) : '0.00'}
                            </Text>
                            <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
                                Promedio/Vehículo
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* Gráfico de costos por vehículo */}
                <StatisticsChart
                    data={costByVehicleData}
                    title="Costos por Vehículo"
                    type="bar"
                    valuePrefix="$"
                />

                {/* Gráfico de distribución por categoría */}
                <StatisticsChart
                    data={costByCategoryData}
                    title="Distribución por Categoría"
                    type="pie"
                    valuePrefix="$"
                />

                <Text style={[styles.sectionTitle, { color: textColor, marginTop: 24 }]}>
                    Estadísticas por Vehículo
                </Text>

                {/* Lista de vehículos con información básica */}
                {completeCostStats?.vehicle_cost_statistics.map(vehicleStat => (
                    <Card
                        key={vehicleStat.vehicle.id}
                        style={styles.vehicleCard}
                        onPress={() => navigateToVehicleStatistics(vehicleStat.vehicle.id)}
                    >
                        <Text style={[styles.vehicleName, { color: textColor }]}>
                            {vehicleStat.vehicle.brand} {vehicleStat.vehicle.model}
                        </Text>
                        <Text style={[styles.vehiclePlate, { color: secondaryTextColor }]}>
                            {vehicleStat.vehicle.plate}
                        </Text>

                        <View style={styles.vehicleStatsRow}>
                            <Text style={[styles.vehicleCost, { color: accentColor }]}>
                                Costo total: ${vehicleStat.total_maintenance_cost.toFixed(2)}
                            </Text>
                            <Button
                                buttonVariant="outline"
                                buttonSize="small"
                                onPress={() => navigateToVehicleStatistics(vehicleStat.vehicle.id)}
                            >
                                Ver detalles
                            </Button>
                        </View>
                    </Card>
                ))}
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
    summaryCard: {
        padding: 16,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
    },
    vehicleCard: {
        padding: 16,
        marginBottom: 12,
    },
    vehicleName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    vehiclePlate: {
        fontSize: 14,
        marginBottom: 8,
    },
    vehicleStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    vehicleCost: {
        fontSize: 14,
        fontWeight: '500',
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
});

export default StatisticsScreen;