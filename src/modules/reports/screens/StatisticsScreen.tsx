import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { GradientHeader } from '@/src/shared/components/ui/GradientHeader';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import { useStatistics } from '../hooks/useStatistics';
import StatisticsPieChart from '../components/StatisticsPieChart';
import StatisticsBarChart from '../components/StatisticsBarChart';
import StatisticsSummaryCard from '../components/StatisticsSummaryCard';

export const StatisticsScreen: React.FC = () => {
    const router = useRouter();
    const { theme } = useAppTheme();
    const {
        completeCostStats,
        loadCompleteCostStatistics,
        isLoading,
        error
    } = useStatistics();

    const [activeTab, setActiveTab] = useState<'general' | 'vehicles' | 'categories'>('general');

    // Cargar estadísticas al iniciar
    useEffect(() => {
        loadCompleteCostStatistics();
    }, [loadCompleteCostStatistics]);

    // Colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const bgColor = theme === 'dark' ? '#111111' : '#FFFFFF';
    const cardColor = theme === 'dark' ? '#222222' : '#FFFFFF';
    const accentColor = theme === 'dark' ? '#B27046' : '#9D7E68';
    const borderColor = theme === 'dark' ? '#444444' : '#EEEEEE';
    const tabBgColor = theme === 'dark' ? '#222222' : '#FFFFFF';
    const inactiveTextColor = theme === 'dark' ? '#777777' : '#999999';

    // Colores pasteles para gráficos
    const pastelColors = [
        '#FFD6E0', // rosa claro
        '#FFEFCF', // amarillo pastel
        '#D1F0FF', // azul cielo
        '#E2D6FF', // lavanda
        '#D6FFE2', // menta
        '#FFE2D6', // melocotón
        '#F0F0F0', // gris claro
        '#E6F9FF', // celeste
        '#FFF9E6', // crema
        '#F9E6FF'  // lila claro
    ];

    // Bordes más oscuros para los colores pastel
    const borderColors = [
        '#FFA6C0', // rosa más oscuro
        '#FFCF8F', // amarillo más oscuro
        '#A1D0FF', // azul más oscuro
        '#B2A6FF', // lavanda más oscuro
        '#A6FFB2', // menta más oscuro
        '#FFB2A6', // melocotón más oscuro
        '#D0D0D0', // gris más oscuro
        '#B6E9FF', // celeste más oscuro
        '#FFE9B6', // crema más oscuro
        '#E9B6FF'  // lila más oscuro
    ];

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

        return completeCostStats.vehicle_cost_statistics.map((stat, index) => ({
            id: stat.vehicle.id,
            name: `${stat.vehicle.brand} ${stat.vehicle.model}`,
            value: stat.total_maintenance_cost,
            color: pastelColors[index % pastelColors.length],
            borderColor: borderColors[index % borderColors.length]
        }));
    };

    // Preparar datos para costos por categoría (sumados de todos los vehículos)
    const prepareCostByCategoryData = () => {
        if (!completeCostStats) return [];

        // Agrupar costos por categoría a través de todos los vehículos
        const categoryCosts = new Map<number, { id: number, name: string, value: number }>();

        completeCostStats.vehicle_cost_statistics.forEach(vehicleStat => {
            vehicleStat.costs_by_category.forEach(catCost => {
                const existing = categoryCosts.get(catCost.id);
                if (existing) {
                    existing.value += catCost.total_cost;
                } else {
                    categoryCosts.set(catCost.id, {
                        id: catCost.id,
                        name: catCost.name,
                        value: catCost.total_cost
                    });
                }
            });
        });

        return Array.from(categoryCosts.values())
            .sort((a, b) => b.value - a.value)
            .map((item, index) => ({
                ...item,
                color: pastelColors[index % pastelColors.length],
                borderColor: borderColors[index % borderColors.length]
            }));
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

    const vehicleData = prepareCostByVehicleData();
    const categoryData = prepareCostByCategoryData();

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <GradientHeader
                title="Estadísticas"
                showBackButton={true}
            />

            {/* Navegación por pestañas */}
            <View style={[styles.tabBar, { backgroundColor: tabBgColor, borderBottomColor: borderColor }]}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'general' && [styles.activeTab, { borderBottomColor: accentColor }]
                    ]}
                    onPress={() => setActiveTab('general')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'general' ? accentColor : inactiveTextColor }
                    ]}>
                        General
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'vehicles' && [styles.activeTab, { borderBottomColor: accentColor }]
                    ]}
                    onPress={() => setActiveTab('vehicles')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'vehicles' ? accentColor : inactiveTextColor }
                    ]}>
                        Vehículos
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'categories' && [styles.activeTab, { borderBottomColor: accentColor }]
                    ]}
                    onPress={() => setActiveTab('categories')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'categories' ? accentColor : inactiveTextColor }
                    ]}>
                        Categorías
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContainer}>
                {activeTab === 'general' && (
                    <>
                        {/* Tarjeta de resumen */}
                        <StatisticsSummaryCard
                            totalVehicles={completeCostStats?.total_vehicles || 0}
                            totalCost={completeCostStats?.overall_total_cost || 0}
                            averageCostPerVehicle={
                                completeCostStats?.total_vehicles
                                    ? completeCostStats.overall_total_cost / completeCostStats.total_vehicles
                                    : 0
                            }
                        />

                        {/* Distribución general por categoría */}
                        <View style={styles.chartContainer}>
                            <Text style={[styles.sectionTitle, { color: textColor }]}>
                                Distribución de Gastos
                            </Text>
                            <StatisticsPieChart
                                data={categoryData}
                                colors={pastelColors}
                                borderColors={borderColors}
                            />
                        </View>
                    </>
                )}

                {activeTab === 'vehicles' && (
                    <>
                        {/* Visualización por vehículo */}
                        <View style={styles.chartContainer}>
                            <Text style={[styles.sectionTitle, { color: textColor }]}>
                                Costos por Vehículo
                            </Text>

                            <StatisticsBarChart
                                data={vehicleData}
                                valuePrefix="$"
                                colors={pastelColors}
                                borderColors={borderColors}
                            />
                        </View>

                        {/* Lista de vehículos con información básica */}
                        <Text style={[styles.sectionTitle, { color: textColor, marginTop: 24 }]}>
                            Detalles por Vehículo
                        </Text>

                        {completeCostStats?.vehicle_cost_statistics.map(vehicleStat => (
                            <Card
                                key={vehicleStat.vehicle.id}
                                style={styles.vehicleCard}
                                onPress={() => navigateToVehicleStatistics(vehicleStat.vehicle.id)}
                            >
                                <View style={styles.vehicleCardContent}>
                                    <View>
                                        <Text style={[styles.vehicleName, { color: textColor }]}>
                                            {vehicleStat.vehicle.brand} {vehicleStat.vehicle.model}
                                        </Text>
                                        <Text style={[styles.vehiclePlate, { color: secondaryTextColor }]}>
                                            {vehicleStat.vehicle.plate}
                                        </Text>
                                    </View>

                                    <View style={styles.vehicleStats}>
                                        <Text style={[styles.vehicleCost, { color: accentColor }]}>
                                            ${vehicleStat.total_maintenance_cost.toFixed(2)}
                                        </Text>

                                        {/* Barra de progreso relativa */}
                                        <View style={[styles.progressBarBg, { backgroundColor: `${accentColor}20` }]}>
                                            <View
                                                style={[
                                                    styles.progressBarFill,
                                                    {
                                                        width: `${(vehicleStat.total_maintenance_cost / completeCostStats.overall_total_cost) * 100}%`,
                                                        backgroundColor: accentColor
                                                    }
                                                ]}
                                            />
                                        </View>

                                        <TouchableOpacity
                                            style={[styles.detailButton, { borderColor: accentColor }]}
                                            onPress={() => navigateToVehicleStatistics(vehicleStat.vehicle.id)}
                                        >
                                            <Text style={[styles.detailButtonText, { color: accentColor }]}>
                                                Ver detalles
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Card>
                        ))}
                    </>
                )}

                {activeTab === 'categories' && (
                    <>
                        {/* Visualización por categoría */}
                        <View style={styles.chartContainer}>
                            <Text style={[styles.sectionTitle, { color: textColor }]}>
                                Distribución por Categoría
                            </Text>

                            <StatisticsPieChart
                                data={categoryData}
                                colors={pastelColors}
                                borderColors={borderColors}
                            />
                        </View>

                        {/* Lista detallada de categorías */}
                        <Text style={[styles.sectionTitle, { color: textColor, marginTop: 24 }]}>
                            Detalles por Categoría
                        </Text>

                        <Card style={[styles.categoriesCard, { backgroundColor: cardColor }]}>
                            {categoryData.map((category, index) => (
                                <View
                                    key={category.id}
                                    style={[
                                        styles.categoryItem,
                                        index < categoryData.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor }
                                    ]}
                                >
                                    <View style={styles.categoryHeader}>
                                        <View style={styles.categoryNameContainer}>
                                            <View
                                                style={[
                                                    styles.categoryColor,
                                                    {
                                                        backgroundColor: category.color,
                                                        borderColor: category.borderColor
                                                    }
                                                ]}
                                            />
                                            <Text style={[styles.categoryName, { color: textColor }]}>
                                                {category.name}
                                            </Text>
                                        </View>
                                        <Text style={[styles.categoryValue, { color: accentColor }]}>
                                            ${category.value.toFixed(2)}
                                        </Text>
                                    </View>

                                    <View style={styles.categoryProportion}>
                                        <Text style={[styles.categoryPercent, { color: secondaryTextColor }]}>
                                            {((category.value / completeCostStats.overall_total_cost) * 100).toFixed(1)}%
                                        </Text>
                                        <View style={[styles.progressBarBg, { backgroundColor: `${accentColor}20` }]}>
                                            <View
                                                style={[
                                                    styles.progressBarFill,
                                                    {
                                                        width: `${(category.value / completeCostStats.overall_total_cost) * 100}%`,
                                                        backgroundColor: category.color
                                                    }
                                                ]}
                                            />
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </Card>
                    </>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
    },
    activeTab: {
        borderBottomWidth: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
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
    chartContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    vehicleCard: {
        marginBottom: 12,
        borderRadius: 12,
        padding: 16,
    },
    vehicleCardContent: {
        flexDirection: 'column',
    },
    vehicleName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    vehiclePlate: {
        fontSize: 14,
        marginBottom: 12,
    },
    vehicleStats: {
        marginTop: 8,
    },
    vehicleCost: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    progressBarBg: {
        height: 6,
        borderRadius: 3,
        marginBottom: 12,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    detailButton: {
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    detailButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    categoriesCard: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 24,
    },
    categoryItem: {
        padding: 16,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryColor: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 1,
        marginRight: 8,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '500',
    },
    categoryValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    categoryProportion: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryPercent: {
        width: 50,
        fontSize: 12,
        marginRight: 8,
    },
});

export default StatisticsScreen;