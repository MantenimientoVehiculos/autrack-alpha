// src/modules/reports/screens/ReportsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
    Share
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { GradientHeader } from '@/src/shared/components/ui/GradientHeader';
import { Button } from '@/src/shared/components/ui/Button';
import { useVehicles } from '@/src/modules/vehicles/hooks/useVehicles';
import { useReports } from '../hooks/useReports';
import { ReportFilter } from '../models/report';
import { ReportFilterForm, ReportCard, ReportChart, ReportResults } from '../components';

export const ReportsScreen: React.FC = () => {
    const router = useRouter();
    const { theme } = useAppTheme();
    const { vehicles, loadVehicles } = useVehicles();
    const {
        reportState,
        dateRange,
        kmRange,
        availableTypes,
        loadVehicleInfo,
        updateFilter,
        generateReport,
        exportReport,
        clearReport
    } = useReports();

    const [activeStep, setActiveStep] = useState<'filter' | 'results'>('filter');

    // Cargar vehículos al iniciar
    useEffect(() => {
        loadVehicles();
    }, [loadVehicles]);

    // Cargar información del vehículo cuando se selecciona uno
    useEffect(() => {
        if (reportState.filter.id_vehiculo) {
            loadVehicleInfo(reportState.filter.id_vehiculo);
        }
    }, [reportState.filter.id_vehiculo, loadVehicleInfo]);

    // Manejar generación de reporte
    const handleGenerateReport = async (filter: ReportFilter) => {
        const result = await generateReport();

        if (result.success) {
            setActiveStep('results');
        } else {
            Alert.alert('Error', result.error || 'No se pudo generar el reporte');
        }
    };

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
        setActiveStep('filter');
    };

    // Crear un nuevo reporte
    const handleNewReport = () => {
        clearReport();
        setActiveStep('filter');
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

    // Colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const bgColor = theme === 'dark' ? '#111111' : '#FFFFFF';

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <GradientHeader
                title="Reportes de Mantenimiento"
                showBackButton={false}
            />

            {activeStep === 'filter' ? (
                <ScrollView style={styles.scrollContainer}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>
                        Generar Reporte
                    </Text>
                    <Text style={[styles.sectionDescription, { color: textColor }]}>
                        Configura los parámetros para generar un reporte de mantenimiento.
                    </Text>

                    {/* Formulario de filtros */}
                    <ReportFilterForm
                        onSubmit={handleGenerateReport}
                        initialValues={reportState.filter}
                        dateRange={dateRange}
                        kmRange={kmRange}
                        availableTypes={availableTypes}
                        isLoading={reportState.isGenerating}
                        error={reportState.error}
                    />
                </ScrollView>
            ) : (
                <ScrollView style={styles.scrollContainer}>
                    <View style={styles.resultHeader}>
                        <Text style={[styles.sectionTitle, { color: textColor }]}>
                            Resultados del Reporte
                        </Text>
                        <Button
                            buttonVariant="outline"
                            buttonSize="small"
                            onPress={handleBackToFilters}
                        >
                            Editar filtros
                        </Button>
                    </View>

                    {/* Tarjeta de estadísticas */}
                    {reportState.result && (
                        <>
                            <ReportCard
                                statistics={reportState.result.estadisticas}
                                byType={reportState.result.por_tipo}
                                vehicleName={getSelectedVehicleName()}
                                dateRange={getDateRange()}
                                onExport={handleExportReport}
                            />

                            {/* Gráfico de barras por tipo */}
                            {reportState.result.por_tipo.length > 0 && (
                                <ReportChart
                                    data={reportState.result.por_tipo}
                                    title="Costos por Tipo de Mantenimiento"
                                    type="bar"
                                />
                            )}

                            {/* Gráfico de pastel */}
                            {reportState.result.por_tipo.length > 0 && (
                                <ReportChart
                                    data={reportState.result.por_tipo}
                                    title="Distribución de Gastos"
                                    type="pie"
                                />
                            )}

                            {/* Lista detallada de registros */}
                            <ReportResults
                                records={reportState.result.registros}
                                title="Detalle de Registros"
                            />

                            {/* Botón para generar nuevo reporte */}
                            <Button
                                buttonVariant="primary"
                                buttonSize="large"
                                onPress={handleNewReport}
                                style={styles.newReportButton}
                            >
                                Generar Nuevo Reporte
                            </Button>
                        </>
                    )}

                    {/* Estado de carga */}
                    {reportState.isGenerating && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={theme === 'dark' ? '#B27046' : '#9D7E68'} />
                            <Text style={[styles.loadingText, { color: textColor }]}>
                                Generando reporte...
                            </Text>
                        </View>
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
            )}
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
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: 14,
        marginBottom: 16,
        opacity: 0.8,
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        marginTop: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
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
    newReportButton: {
        marginVertical: 24,
    },
});

export default ReportsScreen;