import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    Share,
    TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { GradientHeader } from '@/src/shared/components/ui/GradientHeader';
import { Button } from '@/src/shared/components/ui/Button';
import { Card } from '@/src/shared/components/ui/Card';
import { useVehicles } from '@/src/modules/vehicles/hooks/useVehicles';
import { useReports } from '../hooks/useReports';
import ReportCard from '../components/ReportCard';
import ReportChart from '../components/ReportChart';
import ReportResults from '../components/ReportResults';

export const ReportResultsScreen: React.FC = () => {
    const router = useRouter();
    const { theme } = useAppTheme();
    const { vehicles } = useVehicles();
    const { reportState, exportReport } = useReports();
    const [activeTab, setActiveTab] = useState<'summary' | 'charts' | 'details'>('summary');

    // Colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const bgColor = theme === 'dark' ? '#111111' : '#FFFFFF';
    const tabBgColor = theme === 'dark' ? '#222222' : '#FFFFFF';
    const accentColor = theme === 'dark' ? '#B27046' : '#9D7E68';
    const borderColor = theme === 'dark' ? '#444444' : '#EEEEEE';
    const activeBorderColor = accentColor;
    const inactiveTextColor = theme === 'dark' ? '#777777' : '#999999';

    // Verificar que hay resultados
    if (!reportState.result) {
        // Redirigir a la pantalla de filtros si no hay resultados
        router.replace('/reports/filters');
        return null;
    }

    // Manejar exportación de reporte
    const handleExportReport = async () => {
        const formato = reportState.filter.formato || 'pdf';

        Alert.alert(
            'Exportar reporte',
            `¿Deseas exportar el reporte en formato ${formato.toUpperCase()}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Exportar',
                    onPress: async () => {
                        const result = await exportReport(formato);

                        if (result.success) {
                            Alert.alert(
                                'Éxito',
                                'El reporte se ha exportado correctamente',
                                [
                                    { text: 'OK' },
                                    {
                                        text: 'Compartir',
                                        onPress: () => {
                                            if (result.data?.url) {
                                                Share.share({
                                                    url: result.data.url,
                                                    title: 'Reporte de Mantenimiento',
                                                    message: 'Compartir reporte de mantenimiento'
                                                });
                                            }
                                        }
                                    }
                                ]
                            );
                        } else {
                            Alert.alert('Error', result.error || 'No se pudo exportar el reporte');
                        }
                    }
                }
            ]
        );
    };

    // Volver a los filtros
    const handleBackToFilters = () => {
        router.push('/reports/filters');
    };

    // Obtener información del vehículo seleccionado
    const getSelectedVehicleName = () => {
        if (!reportState.filter.id_vehiculo) return undefined;

        const vehicle = vehicles.find(v => v.id_vehiculo === reportState.filter.id_vehiculo);
        if (!vehicle) return undefined;

        return `${vehicle.marca?.nombre || ''} ${vehicle.modelo?.nombre || ''} (${vehicle.placa})`;
    };

    // Obtener fechas seleccionadas
    const getDateRange = () => {
        if (!reportState.filter.fecha_inicio || !reportState.filter.fecha_fin) return undefined;

        return {
            start: reportState.filter.fecha_inicio,
            end: reportState.filter.fecha_fin
        };
    };

    // Transformar los datos para los gráficos
    const prepareChartData = () => {
        if (!reportState.result?.por_tipo) return [];

        return reportState.result.por_tipo.map(item => ({
            name: item.nombre,
            value: item.costo_total
        }));
    };

    const chartData = prepareChartData();

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

                    <Button
                        buttonVariant="outline"
                        buttonSize="small"
                        onPress={handleExportReport}
                    >
                        Exportar
                    </Button>
                </View>

                {reportState.result && (
                    <>
                        {/* Pestaña de Resumen */}
                        {activeTab === 'summary' && (
                            <ReportCard
                                statistics={reportState.result.estadisticas}
                                byType={reportState.result.por_tipo}
                                vehicleName={getSelectedVehicleName()}
                                dateRange={getDateRange()}
                                onExport={handleExportReport}
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
                            </View>
                        )}

                        {/* Botón para exportar siempre visible al final */}
                        <Button
                            buttonVariant="primary"
                            buttonSize="large"
                            onPress={handleExportReport}
                            style={styles.exportButton}
                        >
                            Exportar Reporte
                        </Button>
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
        marginVertical: 24,
    },
});

export default ReportResultsScreen;