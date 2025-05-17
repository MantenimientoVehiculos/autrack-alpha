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
import { useReports } from '../hooks/useReports';
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
        updateFilter,
        generateReport,
        clearReport
    } = useReports();

    // Colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const bgColor = theme === 'dark' ? '#111111' : '#FFFFFF';

    // Cargar vehículos al iniciar
    useEffect(() => {
        loadVehicles();

        // No limpiar todo el reporte si tenemos un parámetro de vehículo
        const vehicleId = params.vehicleId ? parseInt(params.vehicleId as string, 10) : 0;
        if (vehicleId && vehicleId !== reportState.filter.id_vehiculo) {
            // Si venimos con un ID de vehículo preseleccionado, cargar su información
            loadVehicleInfo(vehicleId);
        } else if (!vehicleId) {
            // Solo limpiar si no hay un vehículo preseleccionado
            clearReport();
        }
    }, [loadVehicles, clearReport, loadVehicleInfo, reportState.filter.id_vehiculo]);

    // Manejar generación de reporte
    const handleGenerateReport = async (filter: ReportFilter) => {
        console.log("Generando reporte con filtros:", filter);
        const result = await generateReport(filter); // Pasamos el filtro explícitamente

        if (result.success) {
            router.push('/reports/results');
        } else {
            Alert.alert('Error', result.error || 'No se pudo generar el reporte');
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
});

export default ReportFiltersScreen;