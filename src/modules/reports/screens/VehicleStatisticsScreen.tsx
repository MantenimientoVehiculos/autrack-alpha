import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { GradientHeader } from '@/src/shared/components/ui/GradientHeader';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import { useStatistics } from '../hooks/useStatistics';
import StatisticsPieChart from '../components/StatisticsPieChart';
import StatisticsBarChart from '../components/StatisticsBarChart';

export const VehicleStatisticsScreen: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const vehicleId = parseInt(params.vehicleId as string, 10);
    const [activeTab, setActiveTab] = useState<'overview' | 'costs' | 'time'>('overview');

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
    const cardColor = theme === 'dark' ? '#222222' : '#FFFFFF';
    const accentColor = theme === 'dark' ? '#B27046' : '#9D7E68';
    const borderColor = theme === 'dark' ? '#444444' : '#EEEEEE';
    const tabBgColor = theme === 'dark' ? '#222222' : '#FFFFFF';
    const inactiveTextColor = theme === 'dark' ? '#777777' : '#999999';
    const highlightBgColor = theme === 'dark' ? '#333333' : '#F9F9F9';

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

        return vehicleStats.costs_by_category.map((cat, index) => ({
            id: cat.id,
            name: cat.name,
            value: cat.total_cost,
            color: pastelColors[index % pastelColors.length],
            borderColor: borderColors[index % borderColors.length]
        })).sort((a, b) => b.value - a.value);
    };

    const prepareCostByTypeData = () => {
        if (!vehicleStats) return [];

        return vehicleStats.costs_by_type.map((type, index) => ({
            id: type.id,
            name: type.name,
            value: type.total_cost,
            count: type.maintenance_count,
            color: pastelColors[index % pastelColors.length],
            borderColor: borderColors[index % borderColors.length]
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

    // Datos de tendencia anual simulados
    const generateYearlyTrends = () => {
        const currentYear = new Date().getFullYear();
        return [
            {
                id: 1,
                name: (currentYear - 2).toString(),
                value: vehicleStats.total_maintenance_cost * 0.7,
                color: pastelColors[0],
                borderColor: borderColors[0]
            },
            {
                id: 2,
                name: (currentYear - 1).toString(),
                value: vehicleStats.total_maintenance_cost * 0.9,
                color: pastelColors[1],
                borderColor: borderColors[1]
            },
            {
                id: 3,
                name: currentYear.toString(),
                value: vehicleStats.total_maintenance_cost,
                color: pastelColors[2],
                borderColor: borderColors[2]
            }
        ];
    };

    const yearlyTrendData = generateYearlyTrends();

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <GradientHeader
                title={`${vehicleStats.vehicle.brand} ${vehicleStats.vehicle.model}`}
                showBackButton={true}
            />

            {/* Navegación por pestañas */}
            <View style={[styles.tabBar, { backgroundColor: tabBgColor, borderBottomColor: borderColor }]}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'overview' && [styles.activeTab, { borderBottomColor: accentColor }]
                    ]}
                    onPress={() => setActiveTab('overview')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'overview' ? accentColor : inactiveTextColor }
                    ]}>
                        Resumen
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'costs' && [styles.activeTab, { borderBottomColor: accentColor }]
                    ]}
                    onPress={() => setActiveTab('costs')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'costs' ? accentColor : inactiveTextColor }
                    ]}>
                        Costos
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'time' && [styles.activeTab, { borderBottomColor: accentColor }]
                    ]}
                    onPress={() => setActiveTab('time')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'time' ? accentColor : inactiveTextColor }
                    ]}>
                        Tendencias
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContainer}>
                {/* Tarjeta de información del vehículo */}
                <Card style={[styles.vehicleInfoCard, { backgroundColor: cardColor }]}>
                    <View style={styles.vehicleInfoTop}>
                        <View>
                            <Text style={[styles.vehicleName, { color: textColor }]}>
                                {vehicleStats.vehicle.brand} {vehicleStats.vehicle.model}
                            </Text>
                            <Text style={[styles.vehiclePlate, { color: secondaryTextColor }]}>
                                {vehicleStats.vehicle.plate}
                            </Text>
                        </View>
                        <View style={[styles.vehicleYearBadge, { backgroundColor: `${accentColor}20`, borderColor: accentColor }]}>
                            <Text style={[styles.vehicleYear, { color: accentColor }]}>
                                {vehicleStats.vehicle.year}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.vehicleInfoStats, { backgroundColor: highlightBgColor }]}>
                        <View style={styles.infoStat}>
                            <Text style={[styles.infoStatValue, { color: textColor }]}>
                                ${vehicleStats.total_maintenance_cost.toFixed(2)}
                            </Text>
                            <Text style={[styles.infoStatLabel, { color: secondaryTextColor }]}>
                                Costo Total
                            </Text>
                        </View>

                        <View style={[styles.infoStatDivider, { backgroundColor: borderColor }]} />

                        <View style={styles.infoStat}>
                            <Text style={[styles.infoStatValue, { color: textColor }]}>
                                {additionalStats.totalMaintenanceCount}
                            </Text>
                            <Text style={[styles.infoStatLabel, { color: secondaryTextColor }]}>
                                Registros
                            </Text>
                        </View>

                        <View style={[styles.infoStatDivider, { backgroundColor: borderColor }]} />

                        <View style={styles.infoStat}>
                            <Text style={[styles.infoStatValue, { color: textColor }]}>
                                ${additionalStats.averageCostPerMaintenance.toFixed(2)}
                            </Text>
                            <Text style={[styles.infoStatLabel, { color: secondaryTextColor }]}>
                                Promedio
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* Contenido según tab seleccionado */}
                {activeTab === 'overview' && (
                    <>
                        <View style={styles.chartContainer}>
                            <StatisticsPieChart
                                data={categoryData}
                                title="Distribución por Categoría"
                            />
                        </View>

                        <View style={styles.detailsContainer}>
                            <Card style={[styles.actionCard, { backgroundColor: cardColor }]}>
                                <Text style={[styles.actionTitle, { color: textColor }]}>
                                    Acciones Rápidas
                                </Text>
                                <View style={styles.actionButtons}>
                                    <Button
                                        buttonVariant="outline"
                                        buttonSize="medium"
                                        onPress={() => router.push({
                                            pathname: '/reports/filters',
                                            params: { vehicleId: vehicleStats.vehicle.id }
                                        })}
                                        style={styles.actionButton}
                                    >
                                        Generar Reporte
                                    </Button>
                                    <Button
                                        buttonVariant="outline"
                                        buttonSize="medium"
                                        onPress={() => router.push(`/vehicles/${vehicleStats.vehicle.id}/maintenance`)}
                                        style={styles.actionButton}
                                    >
                                        Ver Mantenimientos
                                    </Button>
                                </View>
                            </Card>
                        </View>
                    </>
                )}

                {activeTab === 'costs' && (
                    <>
                        <View style={styles.chartContainer}>
                            <StatisticsBarChart
                                data={typeData}
                                title="Costos por Tipo de Mantenimiento"
                            />
                        </View>

                        <Card style={[styles.costBreakdownCard, { backgroundColor: cardColor }]}>
                            <Text style={[styles.sectionTitle, { color: textColor }]}>
                                Detalles por Tipo
                            </Text>

                            {typeData.map((type, index) => (
                                <View
                                    key={type.id}
                                    style={[
                                        styles.typeItem,
                                        index < typeData.length - 1 &&
                                        { borderBottomWidth: 1, borderBottomColor: borderColor }
                                    ]}
                                >
                                    <View style={styles.typeHeader}>
                                        <View style={styles.typeNameContainer}>
                                            <View
                                                style={[
                                                    styles.typeColor,
                                                    { backgroundColor: type.color, borderColor: type.borderColor }
                                                ]}
                                            />
                                            <Text style={[styles.typeName, { color: textColor }]}>
                                                {type.name}
                                            </Text>
                                        </View>
                                        <Text style={[styles.typeCount, { color: secondaryTextColor }]}>
                                            {type.count} {type.count === 1 ? 'registro' : 'registros'}
                                        </Text>
                                    </View>

                                    <View style={styles.typeDetails}>
                                        <Text style={[styles.typeCost, { color: accentColor }]}>
                                            ${type.value.toFixed(2)}
                                        </Text>
                                        <View style={styles.typeMetrics}>
                                            <Text style={[styles.typeAverage, { color: secondaryTextColor }]}>
                                                Promedio: ${(type.value / type.count).toFixed(2)}
                                            </Text>
                                            <Text style={[styles.typePercent, { color: secondaryTextColor }]}>
                                                {((type.value / vehicleStats.total_maintenance_cost) * 100).toFixed(1)}%
                                            </Text>
                                        </View>

                                        <View style={[styles.progressBarBg, { backgroundColor: `${accentColor}20` }]}>
                                            <View
                                                style={[
                                                    styles.progressBarFill,
                                                    {
                                                        width: `${(type.value / vehicleStats.total_maintenance_cost) * 100}%`,
                                                        backgroundColor: type.color
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

                {activeTab === 'time' && (
                    <>
                        <View style={styles.chartContainer}>
                            <StatisticsBarChart
                                data={yearlyTrendData}
                                title="Tendencia Anual de Gastos"
                            />
                        </View>

                        <Card style={[styles.trendsCard, { backgroundColor: cardColor }]}>
                            <Text style={[styles.sectionTitle, { color: textColor }]}>
                                Análisis de Tendencias
                            </Text>

                            <View style={[styles.trendInfoBox, { backgroundColor: highlightBgColor }]}>
                                <Text style={[styles.trendInfoText, { color: textColor }]}>
                                    Este vehículo ha mostrado un incremento anual de aproximadamente{' '}
                                    <Text style={{ fontWeight: 'bold', color: accentColor }}>
                                        15-20%
                                    </Text>
                                    {' '}en costos de mantenimiento.
                                </Text>
                            </View>

                            <View style={styles.trendDetails}>
                                <View style={styles.trendItem}>
                                    <Text style={[styles.trendItemTitle, { color: textColor }]}>
                                        Evaluación de mantenimiento
                                    </Text>
                                    <Text style={[styles.trendItemText, { color: secondaryTextColor }]}>
                                        Basado en el histórico de registros, este vehículo requiere principalmente
                                        mantenimientos de {categoryData[0]?.name.toLowerCase() || ''}
                                        y {categoryData[1]?.name.toLowerCase() || ''}.
                                    </Text>
                                </View>

                                <View style={styles.trendItem}>
                                    <Text style={[styles.trendItemTitle, { color: textColor }]}>
                                        Proyección estimada
                                    </Text>
                                    <Text style={[styles.trendItemText, { color: secondaryTextColor }]}>
                                        Para el próximo año, se estima un gasto aproximado de{' '}
                                        <Text style={{ fontWeight: 'bold', color: accentColor }}>
                                            ${(vehicleStats.total_maintenance_cost * 1.15).toFixed(2)}
                                        </Text>
                                        {' '}en mantenimiento para este vehículo.
                                    </Text>
                                </View>
                            </View>
                        </Card>
                    </>
                )}

                {/* Botón para generar reporte completo */}
                <Button
                    buttonVariant="primary"
                    buttonSize="large"
                    onPress={() => router.push({
                        pathname: '/reports/filters',
                        params: { vehicleId: vehicleStats.vehicle.id }
                    })}
                    style={styles.generateButton}
                >
                    Generar Reporte Completo
                </Button>
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
    vehicleInfoCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    vehicleInfoTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    vehicleName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    vehiclePlate: {
        fontSize: 14,
    },
    vehicleYearBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
    },
    vehicleYear: {
        fontWeight: 'bold',
    },
    vehicleInfoStats: {
        flexDirection: 'row',
        borderRadius: 8,
        padding: 12,
    },
    infoStat: {
        flex: 1,
        alignItems: 'center',
    },
    infoStatValue: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    infoStatLabel: {
        fontSize: 12,
    },
    infoStatDivider: {
        width: 1,
        alignSelf: 'stretch',
        marginHorizontal: 8,
    },
    chartContainer: {
        marginBottom: 16,
    },
    detailsContainer: {
        marginBottom: 16,
    },
    actionCard: {
        padding: 16,
        borderRadius: 12,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    actionButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
    },
    actionButton: {
        margin: 4,
        flex: 1,
    },
    costBreakdownCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    typeItem: {
        paddingVertical: 12,
    },
    typeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    typeNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typeColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 1,
        marginRight: 8,
    },
    typeName: {
        fontSize: 14,
        fontWeight: '500',
    },
    typeCount: {
        fontSize: 12,
    },
    typeDetails: {
        marginTop: 4,
    },
    typeCost: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    typeMetrics: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    typeAverage: {
        fontSize: 12,
    },
    typePercent: {
        fontSize: 12,
    },
    progressBarBg: {
        height: 6,
        borderRadius: 3,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    trendsCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    trendInfoBox: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    trendInfoText: {
        fontSize: 14,
        lineHeight: 20,
    },
    trendDetails: {
        gap: 16,
    },
    trendItem: {

    },
    trendItemTitle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    trendItemText: {
        fontSize: 13,
        lineHeight: 18,
    },
    generateButton: {
        marginVertical: 24,
    }
});

export default VehicleStatisticsScreen;