// src/modules/reports/services/reportsApi.ts
import apiClient from '@/src/shared/api/client';
import {
    ReportFilter,
    ReportResponse,
    ExportReportRequest,
    ExportReportResponse,
    MaintenanceCountByVehicle,
    MaintenanceByCategory,
    CompleteMaintenanceStatistics,
    MaintenanceCostByVehicle,
    MaintenanceCostByCategory,
    MaintenanceCostByType,
    CompleteCostStatistics
} from '../models/report';

class ReportsApi {
    // ==================== Reportes ====================

    // Generar un reporte de mantenimiento con filtros
    async generateReport(filter: ReportFilter): Promise<ReportResponse> {
        return apiClient.post<ReportResponse>('/reports/generate', filter);
    }

    // Exportar un reporte generado previamente
    async exportReport(request: ExportReportRequest): Promise<ExportReportResponse> {
        return apiClient.post<ExportReportResponse>('/reports/export', request);
    }

    // Obtener tipos de mantenimiento disponibles para filtrar
    async getAvailableMaintenanceTypes(vehicleId: number): Promise<{ id: number, nombre: string }[]> {
        return apiClient.get<{ id: number, nombre: string }[]>(`/reports/vehicle/${vehicleId}/maintenance-types`);
    }

    // Obtener rango de kilometraje para el vehículo seleccionado
    async getVehicleKilometrageRange(vehicleId: number): Promise<{ min: number, max: number }> {
        return apiClient.get<{ min: number, max: number }>(`/reports/vehicle/${vehicleId}/kilometrage-range`);
    }

    // Obtener el rango de fechas de los registros de mantenimiento del vehículo
    async getVehicleDateRange(vehicleId: number): Promise<{ min: string, max: string }> {
        return apiClient.get<{ min: string, max: string }>(`/reports/vehicle/${vehicleId}/date-range`);
    }

    // ==================== Estadísticas ====================

    // Conteo de mantenimientos por vehículo
    async getMaintenanceCountByVehicle(): Promise<MaintenanceCountByVehicle> {
        return apiClient.get<MaintenanceCountByVehicle>('/statistics/vehicles/maintenance-count');
    }

    // Conteo de mantenimientos por categoría
    async getMaintenanceByCategory(): Promise<MaintenanceByCategory> {
        return apiClient.get<MaintenanceByCategory>('/statistics/vehicles/maintenance-by-category');
    }

    // Estadísticas completas de mantenimiento
    async getCompleteMaintenanceStatistics(): Promise<CompleteMaintenanceStatistics> {
        return apiClient.get<CompleteMaintenanceStatistics>('/statistics/vehicles/maintenance-stats');
    }

    // Costo de mantenimientos por vehículo
    async getMaintenanceCostByVehicle(): Promise<MaintenanceCostByVehicle> {
        return apiClient.get<MaintenanceCostByVehicle>('/statistics/vehicles/maintenance-cost');
    }

    // Costo por categoría de mantenimiento
    async getMaintenanceCostByCategory(): Promise<MaintenanceCostByCategory> {
        return apiClient.get<MaintenanceCostByCategory>('/statistics/vehicles/maintenance-cost-by-category');
    }

    // Costo por tipo de mantenimiento
    async getMaintenanceCostByType(): Promise<MaintenanceCostByType> {
        return apiClient.get<MaintenanceCostByType>('/statistics/vehicles/maintenance-cost-by-type');
    }

    // Estadísticas económicas completas
    async getCompleteCostStatistics(): Promise<CompleteCostStatistics> {
        return apiClient.get<CompleteCostStatistics>('/statistics/vehicles/complete-cost-statistics');
    }
}

export const reportsApi = new ReportsApi();
export default reportsApi;