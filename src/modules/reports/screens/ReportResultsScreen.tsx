// src/modules/reports/screens/ReportResultsScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    Share
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { GradientHeader } from '@/src/shared/components/ui/GradientHeader';
import { Button } from '@/src/shared/components/ui/Button';
import { useVehicles } from '@/src/modules/vehicles/hooks/useVehicles';
import { useReports } from '../hooks/useReports';
import { ReportCard, ReportChart, ReportResults } from '../components';

export const ReportResultsScreen: React.FC = () => {
    const router = useRouter();
    const { theme } = useAppTheme();
    const { vehicles } = useVehicles();
    const { reportState, exportReport } = useReports();

    // Colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const bgColor = theme === 'dark' ? '#111111' : '#FFFFFF';

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

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <GradientHeader
                title="Resultados del Reporte"
                showBackButton={true}
            />

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

                        {/* Botón para exportar */}
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
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
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