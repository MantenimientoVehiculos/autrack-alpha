// src/modules/vehicles/hooks/useVehicles.ts
import { useState, useEffect, useCallback } from 'react';
import { vehicleApi } from '../services/vehicleApi';
import {
    Vehicle,
    Brand,
    Model,
    CustomModelCreate,
} from '../models/vehicle';
import * as Haptics from 'expo-haptics';

export const useVehicles = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [models, setModels] = useState<Model[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);

    const loadVehicles = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const list = await vehicleApi.getVehicles();
            setVehicles(list);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error al cargar vehículos');
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadBrands = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const list = await vehicleApi.getAllBrands();
            setBrands(list);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error al cargar marcas');
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadModelsByBrand = useCallback(
        async (brandId: number) => {
            if (!brandId) return;
            setIsLoading(true);
            setError(null);
            setSelectedBrandId(brandId);
            try {
                const list = await vehicleApi.getModelsByBrand(brandId);
                setModels(list);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Error al cargar modelos');
                Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Error
                );
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const createVehicle = useCallback(
        async (vehicleData: Vehicle) => {
            setIsLoading(true);
            setError(null);
            try {
                const created = await vehicleApi.createVehicle(vehicleData);
                setVehicles((prev) => [...prev, created]);
                await Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                );
                return { success: true, data: created };
            } catch (err: any) {
                console.error(err);
                const msg = err.message || 'Error al crear el vehículo';
                setError(msg);
                await Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Error
                );
                return { success: false, error: msg };
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const updateVehicle = useCallback(
        async (id: number, vehicleData: Partial<Vehicle>) => {
            setIsLoading(true);
            setError(null);
            try {
                const updated = await vehicleApi.updateVehicle(id, vehicleData);
                setVehicles((prev) =>
                    prev.map((v) =>
                        v.id_vehiculo === id ? { ...v, ...updated } : v
                    )
                );
                await Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                );
                return { success: true, data: updated };
            } catch (err: any) {
                console.error(err);
                const msg = err.message || 'Error al actualizar el vehículo';
                setError(msg);
                await Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Error
                );
                return { success: false, error: msg };
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const deleteVehicle = useCallback(async (id: number) => {
        setIsLoading(true);
        setError(null);
        try {
            await vehicleApi.deleteVehicle(id);
            setVehicles((prev) =>
                prev.filter((v) => v.id_vehiculo !== id)
            );
            await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            );
            return { success: true };
        } catch (err: any) {
            console.error(err);
            const msg = err.message || 'Error al eliminar el vehículo';
            setError(msg);
            await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );
            return { success: false, error: msg };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createCustomModel = useCallback(
        async (modelData: CustomModelCreate) => {
            setIsLoading(true);
            setError(null);
            try {
                const created = await vehicleApi.createCustomModel(modelData);
                setModels((prev) => [...prev, created]);
                await Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                );
                return { success: true, data: created };
            } catch (err: any) {
                console.error(err);
                const msg = err.message || 'Error al crear modelo';
                setError(msg);
                await Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Error
                );
                return { success: false, error: msg };
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    useEffect(() => {
        loadVehicles();
        loadBrands();
    }, [loadVehicles, loadBrands]);

    useEffect(() => {
        if (!selectedBrandId) setModels([]);
    }, [selectedBrandId]);

    return {
        vehicles,
        brands,
        models,
        isLoading,
        error,
        selectedBrandId,
        loadVehicles,
        loadBrands,
        loadModelsByBrand,
        createVehicle,
        updateVehicle,
        deleteVehicle,
        createCustomModel,
        clearError,
        setSelectedBrandId,
    };
};
