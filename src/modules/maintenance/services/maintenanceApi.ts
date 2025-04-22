// src/modules/maintenance/services/maintenanceApi.ts
import apiClient from '@/src/shared/api/client';
import {
    MaintenanceCategory,
    MaintenanceType,
    CustomMaintenanceTypeCreate,
    MaintenanceRecord,
    MaintenanceRecordCreate,
    MaintenanceRecordResponse
} from '../models/maintenance';

class MaintenanceApi {
    // Obtener todas las categorías de mantenimiento
    async getCategories(): Promise<MaintenanceCategory[]> {
        return apiClient.get<MaintenanceCategory[]>('/maintenance/categories');
    }

    // Obtener todos los tipos de mantenimiento
    async getMaintenanceTypes(): Promise<MaintenanceType[]> {
        return apiClient.get<MaintenanceType[]>('/maintenance/types');
    }

    // Crear un tipo de mantenimiento personalizado
    async createCustomMaintenanceType(
        data: CustomMaintenanceTypeCreate
    ): Promise<MaintenanceType> {
        return apiClient.post<MaintenanceType>('/maintenance/types', data);
    }

    // Crear un registro de mantenimiento
    async createMaintenanceRecord(
        data: MaintenanceRecordCreate
    ): Promise<MaintenanceRecordResponse> {
        return apiClient.post<MaintenanceRecordResponse>('/maintenance/records', data);
    }

    // Obtener registros de mantenimiento por vehículo
    async getMaintenanceRecordsByVehicle(
        vehicleId: number
    ): Promise<MaintenanceRecord[]> {
        return apiClient.get<MaintenanceRecord[]>(
            `/maintenance/vehicles/${vehicleId}/records`
        );
    }

    // Eliminar un registro de mantenimiento
    async deleteMaintenanceRecord(recordId: number): Promise<void> {
        await apiClient.delete(`/maintenance/records/${recordId}`);
    }
}

export const maintenanceApi = new MaintenanceApi();
export default MaintenanceApi;