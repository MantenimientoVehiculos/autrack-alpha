// src/modules/reports/hooks/useReports.ts
import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { reportsApi } from '../services/reportsApi';
import {
    ReportFilter,
    ReportResponse,
    ExportReportRequest,
    ExportReportResponse,
    ReportState
} from '../models/report';

export const useReports = () => {
    // Estado para gestionar el reporte actual
    const [reportState, setReportState] = useState<ReportState>({
        filter: {
            id_vehiculo: 0
        },
        isGenerating: false,
        isExporting: false,
        error: null
    });

    // Estado para mantener información de rango de fechas y kilometraje
    const [dateRange, setDateRange] = useState<{ min: string, max: string } | null>(null);
    const [kmRange, setKmRange] = useState<{ min: number, max: number } | null>(null);
    const [availableTypes, setAvailableTypes] = useState<{ id: number, nombre: string }[]>([]);

    // Actualizar filtros de reporte
    const updateFilter = useCallback((filter: Partial<ReportFilter>) => {
        setReportState(prev => ({
            ...prev,
            filter: {
                ...prev.filter,
                ...filter
            }
        }));
    }, []);

    // Cargar información del vehículo seleccionado (rangos de fecha, km, tipos)
    const loadVehicleInfo = useCallback(async (vehicleId: number) => {
        if (!vehicleId) return;

        setReportState(prev => ({
            ...prev,
            isGenerating: true,
            error: null
        }));

        try {
            // Obtener información en paralelo
            const [dateRangeResult, kmRangeResult, typesResult] = await Promise.all([
                reportsApi.getVehicleDateRange(vehicleId),
                reportsApi.getVehicleKilometrageRange(vehicleId),
                reportsApi.getAvailableMaintenanceTypes(vehicleId)
            ]);

            setDateRange(dateRangeResult);
            setKmRange(kmRangeResult);
            setAvailableTypes(typesResult);

            // Actualizar filtros con valores iniciales
            updateFilter({
                id_vehiculo: vehicleId,
                fecha_inicio: dateRangeResult.min,
                fecha_fin: dateRangeResult.max,
                kilometraje_minimo: kmRangeResult.min,
                kilometraje_maximo: kmRangeResult.max
            });

            return true;
        } catch (err: any) {
            console.error('Error loading vehicle info:', err);
            setReportState(prev => ({
                ...prev,
                error: err.message || 'Error al cargar información del vehículo'
            }));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return false;
        } finally {
            setReportState(prev => ({
                ...prev,
                isGenerating: false
            }));
        }
    }, [updateFilter]);

    // Generar reporte
    const generateReport = useCallback(async () => {
        setReportState(prev => ({
            ...prev,
            isGenerating: true,
            error: null
        }));

        try {
            const result = await reportsApi.generateReport(reportState.filter);

            setReportState(prev => ({
                ...prev,
                result,
                isGenerating: false
            }));

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return { success: true, data: result };
        } catch (err: any) {
            console.error('Error generating report:', err);
            setReportState(prev => ({
                ...prev,
                isGenerating: false,
                error: err.message || 'Error al generar reporte'
            }));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return { success: false, error: err.message || 'Error al generar reporte' };
        }
    }, [reportState.filter]);

    // Exportar reporte
    const exportReport = useCallback(async (format: 'pdf' | 'excel' | 'csv' = 'pdf') => {
        if (!reportState.result) {
            return { success: false, error: 'No hay reporte generado para exportar' };
        }

        setReportState(prev => ({
            ...prev,
            isExporting: true,
            error: null
        }));

        try {
            const registroIds = reportState.result.registros.map(reg => reg.id_registro);

            const result = await reportsApi.exportReport({
                registros: registroIds,
                formato: format
            });

            setReportState(prev => ({
                ...prev,
                isExporting: false
            }));

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return { success: true, data: result };
        } catch (err: any) {
            console.error('Error exporting report:', err);
            setReportState(prev => ({
                ...prev,
                isExporting: false,
                error: err.message || 'Error al exportar reporte'
            }));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return { success: false, error: err.message || 'Error al exportar reporte' };
        }
    }, [reportState.result]);

    // Limpiar estado actual
    const clearReport = useCallback(() => {
        setReportState({
            filter: {
                id_vehiculo: reportState.filter.id_vehiculo
            },
            isGenerating: false,
            isExporting: false,
            error: null
        });
    }, [reportState.filter.id_vehiculo]);

    return {
        reportState,
        dateRange,
        kmRange,
        availableTypes,
        updateFilter,
        loadVehicleInfo,
        generateReport,
        exportReport,
        clearReport,
        clearError: () => setReportState(prev => ({ ...prev, error: null }))
    };
};