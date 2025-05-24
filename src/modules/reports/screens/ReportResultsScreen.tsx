import React, { useState, useEffect, useCallback } from 'react';
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
import { useVehicles } from '@/src/modules/vehicles/hooks/useVehicles';
import { useReports } from '../context/ReportsProvider';
import ReportCard from '../components/ReportCard';
import ReportChart from '../components/ReportChart';
import ReportResults from '../components/ReportResults';
import { useInterstitialAd } from '@/src/shared/context/InterstitialAdContext';

export const ReportResultsScreen: React.FC = () => {
    const router = useRouter();
    const { theme } = useAppTheme();
    const { vehicles } = useVehicles();
    const { reportState, exportReport } = useReports();
    const [activeTab, setActiveTab] = useState<'summary' | 'charts' | 'details'>('summary');
    const [vehicleName, setVehicleName] = useState<string | undefined>(undefined);
    const [dateRange, setDateRange] = useState<{ start: string; end: string } | undefined>(undefined);

    // Colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const bgColor = theme === 'dark' ? '#111111' : '#FFFFFF';
    const tabBgColor = theme === 'dark' ? '#222222' : '#FFFFFF';
    const accentColor = theme === 'dark' ? '#B27046' : '#9D7E68';
    const borderColor = theme === 'dark' ? '#444444' : '#EEEEEE';
    const activeBorderColor = accentColor;
    const inactiveTextColor = theme === 'dark' ? '#777777' : '#999999';

    const { showAd, isLoaded } = useInterstitialAd(); // 1. Usa el contexto

    useEffect(() => {
        if (isLoaded && !__DEV__) {
            showAd();
        }
    }, [isLoaded]); // solo se ejecuta una vez cuando el ad esté listo

    // Efecto para calcular valores derivados una sola vez
    useEffect(() => {
        if (reportState.filter.id_vehiculo && vehicles.length > 0) {
            const vehicle = vehicles.find(v => v.id_vehiculo === reportState.filter.id_vehiculo);
            if (vehicle) {
                const name = `${vehicle.marca?.nombre || ''} ${vehicle.modelo?.nombre || ''} (${vehicle.placa})`;
                setVehicleName(name);
            }
        }

        if (reportState.filter.fecha_inicio && reportState.filter.fecha_fin) {
            setDateRange({
                start: reportState.filter.fecha_inicio,
                end: reportState.filter.fecha_fin
            });
        }
    }, [reportState.filter.id_vehiculo, reportState.filter.fecha_inicio, reportState.filter.fecha_fin, vehicles]);

    // Verificar que hay resultados - usar useEffect para redirigir
    useEffect(() => {
        if (!reportState.result && !reportState.isGenerating) {
            router.replace('/reports/filters');
        }
    }, [reportState.result, reportState.isGenerating, router]);

    // Manejar exportación de reporte - usar useCallback
    const handleExportReport = useCallback(async (format: 'pdf' | 'excel' | 'csv') => {
        if (!vehicleName) {
            return { success: false, error: 'No se pudo obtener el nombre del vehículo' };
        }

        return await exportReport(format, vehicleName);
    }, [exportReport, vehicleName]);

    // Volver a los filtros - usar useCallback
    const handleBackToFilters = useCallback(() => {
        router.push('/reports/filters');
    }, [router]);

    // Transformar los datos para los gráficos - usar useMemo o función pura
    const prepareChartData = useCallback(() => {
        if (!reportState.result?.por_tipo) return [];

        return reportState.result.por_tipo.map(item => ({
            name: item.nombre,
            value: item.costo_total
        }));
    }, [reportState.result?.por_tipo]);

    const chartData = prepareChartData();

    // Si no hay resultado y no está cargando, no renderizar nada (la redirección se maneja en useEffect)
    if (!reportState.result && !reportState.isGenerating) {
        return null;
    }

    // Si está cargando, mostrar loading
    if (reportState.isGenerating) {
        return (
            <View style={[styles.container, { backgroundColor: bgColor }]}>
                <GradientHeader
                    title="Generando Reporte"
                    showBackButton={true}
                />
                <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, { color: textColor }]}>
                        Generando reporte...
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <GradientHeader
                title="Resultados del Reporte"
                showBackButton={true}
            />

            {/* Navegación por pestañas */}
            <View style={[styles.tabBar, { backgroundColor: tabBgColor, borderBottomColor: borderColor }]}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'summary' && [styles.activeTab, { borderBottomColor: activeBorderColor }]
                    ]}
                    onPress={() => setActiveTab('summary')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'summary' ? accentColor : inactiveTextColor }
                    ]}>
                        Resumen
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'charts' && [styles.activeTab, { borderBottomColor: activeBorderColor }]
                    ]}
                    onPress={() => setActiveTab('charts')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'charts' ? accentColor : inactiveTextColor }
                    ]}>
                        Gráficos
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'details' && [styles.activeTab, { borderBottomColor: activeBorderColor }]
                    ]}
                    onPress={() => setActiveTab('details')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'details' ? accentColor : inactiveTextColor }
                    ]}>
                        Detalle
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContainer}>
                {/* Acciones rápidas */}
                <View style={styles.actionBar}>
                    <Button
                        buttonVariant="outline"
                        buttonSize="small"
                        onPress={handleBackToFilters}
                    >
                        Editar filtros
                    </Button>
                </View>

                {reportState.result && (
                    <>
                        {/* Pestaña de Resumen */}
                        {activeTab === 'summary' && (
                            <ReportCard
                                statistics={reportState.result.estadisticas}
                                byType={reportState.result.por_tipo}
                                vehicleName={vehicleName}
                                dateRange={dateRange}
                                onExport={handleExportReport}
                                isExporting={reportState.isExporting}
                            />
                        )}

                        {/* Pestaña de Gráficos */}
                        {activeTab === 'charts' && chartData.length > 0 && (
                            <View style={styles.chartsContainer}>
                                {/* Título de la sección */}
                                <Text style={[styles.sectionTitle, { color: textColor }]}>
                                    Visualización de Gastos
                                </Text>

                                {/* Descripción */}
                                <Card style={[styles.infoCard, { backgroundColor: tabBgColor }]}>
                                    <Text style={[styles.infoText, { color: secondaryTextColor }]}>
                                        Visualice la distribución de sus gastos de mantenimiento por tipo.
                                        Los gráficos muestran la proporción de cada categoría en relación
                                        al costo total.
                                    </Text>
                                </Card>

                                {/* Gráfico de pastel */}
                                <ReportChart
                                    data={chartData}
                                    title="Distribución de Gastos"
                                    type="pie"
                                    valuePrefix="$"
                                />

                                {/* Gráfico de barras */}
                                <ReportChart
                                    data={chartData}
                                    title="Costos por Tipo de Mantenimiento"
                                    type="bar"
                                    valuePrefix="$"
                                />

                                {/* Botón de exportar en la sección de gráficos */}
                                <Button
                                    buttonVariant="primary"
                                    buttonSize="large"
                                    onPress={() => handleExportReport('pdf')}
                                    isLoading={reportState.isExporting}
                                    style={styles.exportButton}
                                >
                                    Exportar con Gráficos
                                </Button>
                            </View>
                        )}

                        {/* Pestaña de Detalles */}
                        {activeTab === 'details' && (
                            <View style={styles.detailsContainer}>
                                {/* Título de la sección */}
                                <Text style={[styles.sectionTitle, { color: textColor }]}>
                                    Detalle de Registros
                                </Text>

                                {/* Lista detallada de registros */}
                                <ReportResults
                                    records={reportState.result.registros}
                                    title={`Registros (${reportState.result.registros.length})`}
                                />

                                {/* Botón de exportar en la sección de detalles */}
                                <Button
                                    buttonVariant="primary"
                                    buttonSize="large"
                                    onPress={() => handleExportReport('excel')}
                                    isLoading={reportState.isExporting}
                                    style={styles.exportButton}
                                >
                                    Exportar Detalles
                                </Button>
                            </View>
                        )}
                    </>
                )}

                {/* Estado de error */}
                {reportState.error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>
                            {reportState.error}
                        </Text>
                        <Button
                            buttonVariant="outline"
                            buttonSize="medium"
                            onPress={handleBackToFilters}
                            style={styles.errorButton}
                        >
                            Volver a los filtros
                        </Button>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        textAlign: 'center',
    },
    scrollContainer: {
        flex: 1,
        padding: 16,
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
    actionBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    chartsContainer: {
        marginBottom: 16,
    },
    detailsContainer: {
        marginBottom: 16,
    },
    infoCard: {
        padding: 12,
        marginBottom: 16,
        borderRadius: 8,
    },
    infoText: {
        fontSize: 14,
        lineHeight: 20,
    },
    errorContainer: {
        padding: 20,
        alignItems: 'center',
        marginTop: 20,
    },
    errorText: {
        color: '#CF6679',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
    },
    errorButton: {
        marginTop: 8,
    },
    exportButton: {
        marginVertical: 16,
    },
});

export default ReportResultsScreen;