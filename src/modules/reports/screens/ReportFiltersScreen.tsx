import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { GradientHeader } from '@/src/shared/components/ui/GradientHeader';
import { useVehicles } from '@/src/modules/vehicles/hooks/useVehicles';
import { useReports } from '../context/ReportsProvider';
import { ReportFilterForm } from '../components/ReportFilterForm';
import { ReportFilter } from '../models/report';

export const ReportFiltersScreen: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { theme } = useAppTheme();
    const { vehicles, loadVehicles } = useVehicles();
    const {
        reportState,
        dateRange,
        kmRange,
        availableTypes,
        loadVehicleInfo,
        generateReport,
        clearReport
    } = useReports();

    // Colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const bgColor = theme === 'dark' ? '#111111' : '#FFFFFF';

    // Cargar vehículos al iniciar
    useEffect(() => {
        loadVehicles();

        const vehicleId = params.vehicleId ? parseInt(params.vehicleId as string, 10) : 0;
        if (vehicleId && vehicleId !== reportState.filter.id_vehiculo) {
            // Si venimos con un ID de vehículo preseleccionado, cargar su información
            loadVehicleInfo(vehicleId);
        } else if (!vehicleId) {
            // Solo limpiar si no hay un vehículo preseleccionado
            clearReport();
        }
    }, [loadVehicles, clearReport, loadVehicleInfo, params.vehicleId]);

    // Manejar generación de reporte
    const handleGenerateReport = async (filter: ReportFilter) => {
        console.log("=== INICIANDO GENERACIÓN DE REPORTE ===");
        console.log("Filtros recibidos:", filter);

        // Validaciones antes de generar
        if (!filter.id_vehiculo) {
            Alert.alert('Error', 'Debe seleccionar un vehículo');
            return;
        }

        try {
            console.log("Llamando a generateReport...");
            const result = await generateReport(filter);
            console.log("Resultado de generateReport:", result);

            if (result.success) {
                console.log("=== REPORTE GENERADO EXITOSAMENTE ===");
                console.log("Registros encontrados:", result.data?.registros?.length || 0);
                console.log("Navegando a /reports/results...");

                // Navegar a resultados
                router.push('/reports/results');
                console.log("Navegación completada");
            } else {
                console.log("=== ERROR AL GENERAR REPORTE ===");
                console.log("Error:", result.error);
                Alert.alert('Error', result.error || 'No se pudo generar el reporte');
            }
        } catch (error) {
            console.error("=== ERROR INESPERADO ===");
            console.error("Error:", error);
            Alert.alert('Error', 'Ocurrió un error inesperado al generar el reporte');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <GradientHeader
                title="Filtros de Reporte"
                showBackButton={true}
            />

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
    debugInfo: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    debugTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    debugText: {
        fontSize: 12,
        marginBottom: 4,
    },
});

export default ReportFiltersScreen;