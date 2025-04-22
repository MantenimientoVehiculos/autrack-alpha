// src/modules/vehicles/services/vehicleApi.ts
import apiClient from '@/src/shared/api/client';
import {
    Vehicle,
    Brand,
    Model,
    CustomModelCreate,
    KilometrageUpdate,
} from '../models/vehicle';

class VehicleApi {
    // Obtener todos los vehículos
    async getVehicles(): Promise<Vehicle[]> {
        return apiClient.get<Vehicle[]>('/vehicles');
    }

    // Obtener un vehículo por ID
    async getVehicleById(id: number): Promise<Vehicle> {
        return apiClient.get<Vehicle>(`/vehicles/${id}`);
    }

    // Crear un nuevo vehículo
    async createVehicle(vehicleData: Vehicle): Promise<Vehicle> {
        return apiClient.post<Vehicle>('/vehicles', vehicleData);
    }

    // Actualizar un vehículo
    async updateVehicle(
        id: number,
        vehicleData: Partial<Vehicle>
    ): Promise<Vehicle> {
        return apiClient.put<Vehicle>(`/vehicles/${id}`, vehicleData);
    }

    // Actualizar el kilometraje de un vehículo
    async updateKilometrage(
        id: number,
        data: KilometrageUpdate
    ): Promise<Vehicle> {
        return apiClient.patch<Vehicle>(`/vehicles/${id}/kilometraje`, data);
    }

    // Eliminar un vehículo
    async deleteVehicle(id: number): Promise<void> {
        await apiClient.delete(`/vehicles/${id}`);
    }

    // Obtener todas las marcas
    async getAllBrands(): Promise<Brand[]> {
        return apiClient.get<Brand[]>('/vehicles/brands/all');
    }

    // Obtener modelos por marca
    async getModelsByBrand(brandId: number): Promise<Model[]> {
        return apiClient.get<Model[]>(
            `/vehicles/brands/${brandId}/models`
        );
    }

    // Crear un modelo personalizado
    async createCustomModel(modelData: CustomModelCreate): Promise<Model> {
        return apiClient.post<Model>('/vehicles/models', modelData);
    }
}

export const vehicleApi = new VehicleApi();
export default VehicleApi;
