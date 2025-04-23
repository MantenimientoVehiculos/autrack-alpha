// src/modules/reports/services/reportsApi.ts
import apiClient from '@/src/shared/api/client';
import {
    ReportFilter,
    ReportResponse,
    ExportReportRequest,
    ExportReportResponse
} from '../models/report';

class ReportsApi {
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
}

export const reportsApi = new ReportsApi();
export default ReportsApi;