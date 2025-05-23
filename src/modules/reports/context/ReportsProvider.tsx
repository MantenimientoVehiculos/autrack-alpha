
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { reportsApi } from '../services/reportsApi';
import { exportService } from '../services/exportService';
import {
    ReportFilter,
    ReportResponse,
    ReportState
} from '../models/report';

interface ReportsContextType {
    reportState: ReportState;
    dateRange: { min: string, max: string } | null;
    kmRange: { min: number, max: number } | null;
    availableTypes: { id: number, nombre: string }[];
    updateFilter: (filter: Partial<ReportFilter>) => void;
    loadVehicleInfo: (vehicleId: number) => Promise<boolean>;
    generateReport: (filter?: ReportFilter) => Promise<{ success: boolean; data?: ReportResponse; error?: string }>;
    exportReport: (format: 'pdf' | 'excel' | 'csv', vehicleName?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
    clearReport: () => void;
    clearError: () => void;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export const ReportsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [reportState, setReportState] = useState<ReportState>({
        filter: {
            id_vehiculo: 0
        },
        isGenerating: false,
        isExporting: false,
        error: null
    });

    const [dateRange, setDateRange] = useState<{ min: string, max: string } | null>(null);
    const [kmRange, setKmRange] = useState<{ min: number, max: number } | null>(null);
    const [availableTypes, setAvailableTypes] = useState<{ id: number, nombre: string }[]>([]);

    // Referencias para evitar actualizaciones durante el renderizado
    const updateTimeoutRef = useRef<number | null>(null);
    const isUpdatingRef = useRef(false);

    // Función auxiliar para actualizar estado de forma segura
    const safeSetState = useCallback((updater: (prev: ReportState) => ReportState) => {
        if (isUpdatingRef.current) return;

        isUpdatingRef.current = true;
        setReportState(updater);

        // Resetear flag después de un tick
        if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
        }
        updateTimeoutRef.current = setTimeout(() => {
            isUpdatingRef.current = false;
        }, 0);
    }, []);

    const updateFilter = useCallback((filter: Partial<ReportFilter>) => {
        console.log('🔄 Actualizando filtro:', filter);
        safeSetState(prev => ({
            ...prev,
            filter: {
                ...prev.filter,
                ...filter
            }
        }));
    }, [safeSetState]);

    const loadVehicleInfo = useCallback(async (vehicleId: number) => {
        if (!vehicleId) return false;

        console.log('📡 Cargando info del vehículo:', vehicleId);
        safeSetState(prev => ({
            ...prev,
            isGenerating: true,
            error: null
        }));

        try {
            const [dateRangeResult, kmRangeResult, typesResult] = await Promise.all([
                reportsApi.getVehicleDateRange(vehicleId),
                reportsApi.getVehicleKilometrageRange(vehicleId),
                reportsApi.getAvailableMaintenanceTypes(vehicleId)
            ]);

            // Actualizar datos auxiliares
            setDateRange(dateRangeResult);
            setKmRange(kmRangeResult);
            setAvailableTypes(typesResult);

            // Actualizar filtros
            safeSetState(prev => ({
                ...prev,
                filter: {
                    ...prev.filter,
                    id_vehiculo: vehicleId,
                    fecha_inicio: dateRangeResult.min,
                    fecha_fin: dateRangeResult.max,
                    kilometraje_minimo: kmRangeResult.min,
                    kilometraje_maximo: kmRangeResult.max
                },
                isGenerating: false
            }));

            console.log('✅ Info del vehículo cargada');
            return true;
        } catch (err: any) {
            console.error('❌ Error loading vehicle info:', err);
            safeSetState(prev => ({
                ...prev,
                isGenerating: false,
                error: err.message || 'Error al cargar información del vehículo'
            }));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return false;
        }
    }, [safeSetState]);

    const generateReport = useCallback(async (filter?: ReportFilter) => {
        const filterToUse = filter || reportState.filter;
        console.log('🚀 Generando reporte con filtro:', filterToUse);

        // Validar que hay un vehículo seleccionado
        if (!filterToUse.id_vehiculo) {
            const error = 'Debe seleccionar un vehículo para generar el reporte';
            console.log('❌ Sin vehículo seleccionado');
            safeSetState(prev => ({
                ...prev,
                error
            }));
            return { success: false, error };
        }

        safeSetState(prev => ({
            ...prev,
            isGenerating: true,
            error: null,
            filter: filterToUse
        }));

        try {
            console.log('📡 Llamando a API...');
            const result = await reportsApi.generateReport(filterToUse);
            console.log('📊 Respuesta de API:', {
                registros: result.registros?.length || 0,
                costo_total: result.estadisticas?.costo_total || 0
            });

            safeSetState(prev => ({
                ...prev,
                result,
                isGenerating: false
            }));

            console.log('✅ Reporte generado exitosamente');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return { success: true, data: result };
        } catch (err: any) {
            console.error('❌ Error generating report:', err);
            safeSetState(prev => ({
                ...prev,
                isGenerating: false,
                error: err.message || 'Error al generar reporte'
            }));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return { success: false, error: err.message || 'Error al generar reporte' };
        }
    }, [reportState.filter, safeSetState]);

    const exportReport = useCallback(async (
        format: 'pdf' | 'excel' | 'csv' = 'pdf',
        vehicleName?: string
    ) => {
        if (!reportState.result) {
            return { success: false, error: 'No hay reporte generado para exportar' };
        }

        if (!vehicleName) {
            return { success: false, error: 'Nombre del vehículo requerido para exportar' };
        }

        console.log('📤 Exportando reporte en formato:', format);
        safeSetState(prev => ({
            ...prev,
            isExporting: true,
            error: null
        }));

        try {
            const exportOptions = {
                vehicleName,
                dateRange: reportState.filter.fecha_inicio && reportState.filter.fecha_fin
                    ? {
                        start: reportState.filter.fecha_inicio,
                        end: reportState.filter.fecha_fin
                    }
                    : undefined
            };

            await exportService.exportReport(reportState.result, format, exportOptions);

            safeSetState(prev => ({
                ...prev,
                isExporting: false
            }));

            console.log('✅ Reporte exportado');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return { success: true, message: `Reporte exportado en formato ${format.toUpperCase()}` };
        } catch (err: any) {
            console.error('❌ Error exporting report:', err);
            safeSetState(prev => ({
                ...prev,
                isExporting: false,
                error: err.message || 'Error al exportar reporte'
            }));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return { success: false, error: err.message || 'Error al exportar reporte' };
        }
    }, [reportState.result, reportState.filter, safeSetState]);

    const clearReport = useCallback(() => {
        console.log('🧹 Limpiando reporte');
        safeSetState(prev => ({
            filter: {
                id_vehiculo: prev.filter.id_vehiculo
            },
            isGenerating: false,
            isExporting: false,
            error: null
        }));
    }, [safeSetState]);

    const clearError = useCallback(() => {
        safeSetState(prev => ({ ...prev, error: null }));
    }, [safeSetState]);

    const value: ReportsContextType = {
        reportState,
        dateRange,
        kmRange,
        availableTypes,
        updateFilter,
        loadVehicleInfo,
        generateReport,
        exportReport,
        clearReport,
        clearError
    };

    return (
        <ReportsContext.Provider value={value}>
            {children}
        </ReportsContext.Provider>
    );
};

// Hook personalizado para usar el contexto
export const useReports = (): ReportsContextType => {
    const context = useContext(ReportsContext);
    if (context === undefined) {
        throw new Error('useReports debe ser usado dentro de un ReportsProvider');
    }
    return context;
};