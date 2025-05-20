import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { GradientHeader } from '@/src/shared/components/ui/GradientHeader';
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
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const bgColor = theme === 'dark' ? '#111111' : '#F8F9FC';
    const cardColor = theme === 'dark' ? '#222222' : '#FFFFFF';
    const accentColor = theme === 'dark' ? '#B27046' : '#9D7E68';
    const borderColor = theme === 'dark' ? '#444444' : '#EEEEEE';
    const highlightBgColor = theme === 'dark' ? '#333333' : '#F9F9F9';

    // Colores pasteles para elementos visuales
    const pastelColors = [
        '#FFD6E0', // rosa claro
        '#FFEFCF', // amarillo pastel
        '#D1F0FF', // azul cielo
        '#E2D6FF', // lavanda
        '#D6FFE2', // menta
    ];

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

    // Ejemplos de gráficos simplificados para la página principal
    const renderMiniPieChart = () => {
        // Simulación de datos para el gráfico
        const pieData = [
            { value: 45, color: pastelColors[0] },
            { value: 25, color: pastelColors[1] },
            { value: 20, color: pastelColors[2] },
            { value: 10, color: pastelColors[3] }
        ];

        return (
            <View style={styles.miniChartContainer}>
                <View style={styles.pieChart}>
                    {pieData.map((segment, index) => {
                        const startDegree = pieData
                            .slice(0, index)
                            .reduce((sum, slice) => sum + slice.value, 0) / 100 * 360;

                        return (
                            <View
                                key={index}
                                style={[
                                    styles.pieSegment,
                                    {
                                        backgroundColor: segment.color,
                                        transform: [{ rotate: `${startDegree}deg` }],
                                        zIndex: 5 - index
                                    }
                                ]}
                            />
                        );
                    })}
                    <View style={[styles.pieCenter, { backgroundColor: cardColor }]} />
                </View>
                <View style={styles.chartIconOverlay}>
                    <BarChartIcon size={18} color={accentColor} />
                </View>
            </View>
        );
    };

    const renderMiniBarChart = () => {
        // Simulación de datos para el gráfico
        const barData = [
            { value: 85, color: pastelColors[0] },
            { value: 65, color: pastelColors[1] },
            { value: 100, color: pastelColors[2] },
            { value: 45, color: pastelColors[3] }
        ];

        return (
            <View style={styles.miniChartContainer}>
                <View style={styles.barChart}>
                    {barData.map((bar, index) => (
                        <View
                            key={index}
                            style={[
                                styles.bar,
                                {
                                    height: `${bar.value}%`,
                                    backgroundColor: bar.color,
                                }
                            ]}
                        />
                    ))}
                </View>
                <View style={styles.chartIconOverlay}>
                    <BarChartIcon size={18} color={accentColor} />
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <GradientHeader
                title="Reportes y Estadísticas"
                showBackButton={false}
            />

            <ScrollView style={styles.scrollContainer}>
                {/* Sección de Reportes */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>
                        Reportes
                    </Text>
                    <Text style={[styles.sectionDescription, { color: secondaryTextColor }]}>
                        Genera reportes personalizados para analizar el mantenimiento de tus vehículos
                    </Text>

                    {/* Card elegante para generar reportes */}
                    <Card
                        style={[styles.featuredCard, { backgroundColor: cardColor }]}
                        onPress={navigateToReportFilters}
                    >
                        <View style={styles.featuredCardContent}>
                            <View style={styles.featuredCardInfo}>
                                <View style={[styles.iconContainer, { backgroundColor: `${accentColor}20` }]}>
                                    <BarChartIcon size={24} color={accentColor} />
                                </View>
                                <Text style={[styles.featuredCardTitle, { color: textColor }]}>
                                    Generar Reporte Personalizado
                                </Text>
                                <Text style={[styles.featuredCardDescription, { color: secondaryTextColor }]}>
                                    Crea reportes detallados filtrando por vehículo, fechas y tipo de mantenimiento.
                                </Text>
                                <TouchableOpacity
                                    style={[styles.featuredButton, { backgroundColor: accentColor }]}
                                    onPress={navigateToReportFilters}
                                >
                                    <Text style={styles.featuredButtonText}>
                                        Crear Reporte
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.featuredCardVisual}>
                                {renderMiniPieChart()}
                            </View>
                        </View>
                    </Card>
                </View>

                {/* Sección de Estadísticas */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>
                        Estadísticas
                    </Text>
                    <Text style={[styles.sectionDescription, { color: secondaryTextColor }]}>
                        Visualiza y analiza los datos de mantenimiento de todos tus vehículos
                    </Text>

                    {/* Card para estadísticas generales */}
                    <Card
                        style={[styles.card, { backgroundColor: cardColor }]}
                        onPress={navigateToStatistics}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.cardInfo}>
                                <View style={[styles.iconContainer, { backgroundColor: `${accentColor}20` }]}>
                                    <BarChartIcon size={20} color={accentColor} />
                                </View>
                                <Text style={[styles.cardTitle, { color: textColor }]}>
                                    Estadísticas Generales
                                </Text>
                                <Text style={[styles.cardDescription, { color: secondaryTextColor }]}>
                                    Visualiza costos totales, distribución por categoría y comparativas entre vehículos.
                                </Text>
                            </View>

                            <View style={styles.cardVisual}>
                                {renderMiniBarChart()}
                            </View>
                        </View>

                        <View style={[styles.cardActions, { borderTopColor: borderColor }]}>
                            <TouchableOpacity
                                style={[styles.cardButton, { borderColor: accentColor }]}
                                onPress={navigateToStatistics}
                            >
                                <Text style={[styles.cardButtonText, { color: accentColor }]}>
                                    Ver Estadísticas
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Card>
                </View>

                {/* Sección de Vehículos */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>
                        Estadísticas por Vehículo
                    </Text>

                    {vehicles.length > 0 ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.vehiclesScrollContent}
                        >
                            {vehicles.map((vehicle, index) => (
                                <Card
                                    key={vehicle.id_vehiculo}
                                    style={[
                                        styles.vehicleCard,
                                        { backgroundColor: cardColor }
                                    ]}
                                    onPress={() => navigateToVehicleStatistics(vehicle.id_vehiculo || 0)}
                                >
                                    <View style={styles.vehicleCardContent}>
                                        <View style={[
                                            styles.vehicleIconContainer,
                                            { backgroundColor: pastelColors[index % pastelColors.length] }
                                        ]}>
                                            <CarIcon size={24} color={theme === 'dark' ? '#222' : '#FFF'} />
                                        </View>

                                        <Text
                                            style={[styles.vehicleName, { color: textColor }]}
                                            numberOfLines={1}
                                        >
                                            {vehicle.marca?.nombre || ''} {vehicle.modelo?.nombre || ''}
                                        </Text>

                                        <Text
                                            style={[styles.vehiclePlate, { color: secondaryTextColor }]}
                                            numberOfLines={1}
                                        >
                                            {vehicle.placa || ''}
                                        </Text>

                                        <TouchableOpacity
                                            style={[styles.vehicleButton, { backgroundColor: `${accentColor}15` }]}
                                            onPress={() => navigateToVehicleStatistics(vehicle.id_vehiculo || 0)}
                                        >
                                            <Text style={[styles.vehicleButtonText, { color: accentColor }]}>
                                                Ver Estadísticas
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </Card>
                            ))}
                        </ScrollView>
                    ) : (
                        <Card style={[styles.emptyCard, { backgroundColor: cardColor }]}>
                            <Text style={[styles.emptyText, { color: textColor }]}>
                                No tienes vehículos registrados
                            </Text>
                            <TouchableOpacity
                                style={[styles.emptyButton, { borderColor: accentColor }]}
                                onPress={() => router.push('/vehicles/add')}
                            >
                                <Text style={[styles.emptyButtonText, { color: accentColor }]}>
                                    Agregar Vehículo
                                </Text>
                            </TouchableOpacity>
                        </Card>
                    )}
                </View>
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
        paddingVertical: 16,
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    sectionDescription: {
        fontSize: 14,
        marginBottom: 16,
        opacity: 0.8,
    },
    featuredCard: {
        padding: 0,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    featuredCardContent: {
        flexDirection: 'row',
        padding: 16,
    },
    featuredCardInfo: {
        flex: 1,
        paddingRight: 16,
    },
    featuredCardVisual: {
        width: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    featuredCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    featuredCardDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    featuredButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    featuredButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    card: {
        padding: 0,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    cardContent: {
        flexDirection: 'row',
        padding: 16,
    },
    cardInfo: {
        flex: 1,
        paddingRight: 8,
    },
    cardVisual: {
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    cardDescription: {
        fontSize: 13,
        lineHeight: 18,
    },
    cardActions: {
        borderTopWidth: 1,
        padding: 12,
        alignItems: 'center',
    },
    cardButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 6,
        borderWidth: 1,
    },
    cardButtonText: {
        fontWeight: '600',
        fontSize: 14,
    },
    vehiclesScrollContent: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    vehicleCard: {
        width: 150,
        borderRadius: 16,
        overflow: 'hidden',
        marginRight: 12,
        padding: 0,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    vehicleCardContent: {
        padding: 16,
        alignItems: 'center',
    },
    vehicleIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    vehicleName: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 4,
    },
    vehiclePlate: {
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 12,
    },
    vehicleButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignItems: 'center',
        width: '100%',
    },
    vehicleButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyCard: {
        padding: 24,
        alignItems: 'center',
        borderRadius: 16,
    },
    emptyText: {
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    emptyButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
    },
    emptyButtonText: {
        fontWeight: '600',
    },
    quickActionsSection: {
        paddingHorizontal: 16,
        marginBottom: 30,
    },
    quickActionsCard: {
        padding: 16,
        borderRadius: 16,
    },
    quickActionsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        margin: -4,
    },
    quickActionButton: {
        width: '48%',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 4,
    },
    quickActionText: {
        color: '#333333',
        fontWeight: '600',
        fontSize: 13,
    },
    miniChartContainer: {
        position: 'relative',
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pieChart: {
        width: 70,
        height: 70,
        borderRadius: 35,
        overflow: 'hidden',
    },
    pieSegment: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)',
        transformOrigin: 'center',
    },
    pieCenter: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
        top: '50%',
        left: '50%',
        transform: [{ translateX: -15 }, { translateY: -15 }],
    },
    barChart: {
        width: 70,
        height: 70,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    bar: {
        width: 12,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },
    chartIconOverlay: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -15 }, { translateY: -15 }],
    },
});

export default ReportsScreen;