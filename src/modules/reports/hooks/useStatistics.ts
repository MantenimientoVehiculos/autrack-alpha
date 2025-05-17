// src/modules/reports/hooks/useStatistics.ts
import { useState, useCallback, useEffect } from 'react';
import { reportsApi } from '../services/reportsApi';
import {
    MaintenanceCountByVehicle,
    MaintenanceByCategory,
    CompleteMaintenanceStatistics,
    MaintenanceCostByVehicle,
    MaintenanceCostByCategory,
    MaintenanceCostByType,
    CompleteCostStatistics
} from '../models/report';

export const useStatistics = () => {
    // Estados para cada tipo de estadística
    const [maintenanceCount, setMaintenanceCount] = useState<MaintenanceCountByVehicle | null>(null);
    const [maintenanceByCategory, setMaintenanceByCategory] = useState<MaintenanceByCategory | null>(null);
    const [completeStats, setCompleteStats] = useState<CompleteMaintenanceStatistics | null>(null);
    const [costByVehicle, setCostByVehicle] = useState<MaintenanceCostByVehicle | null>(null);
    const [costByCategory, setCostByCategory] = useState<MaintenanceCostByCategory | null>(null);
    const [costByType, setCostByType] = useState<MaintenanceCostByType | null>(null);
    const [completeCostStats, setCompleteCostStats] = useState<CompleteCostStatistics | null>(null);

    // Estado de carga y error
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Selección de vehículo actual (para estadísticas específicas)
    const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

    // Cargar conteo de mantenimientos por vehículo
    const loadMaintenanceCount = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await reportsApi.getMaintenanceCountByVehicle();
            setMaintenanceCount(data);
            return data;
        } catch (err: any) {
            setError(err.message || 'Error al cargar estadísticas de mantenimiento');
            console.error('Error loading maintenance count:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Cargar mantenimientos por categoría
    const loadMaintenanceByCategory = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await reportsApi.getMaintenanceByCategory();
            setMaintenanceByCategory(data);
            return data;
        } catch (err: any) {
            setError(err.message || 'Error al cargar estadísticas por categoría');
            console.error('Error loading maintenance by category:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Cargar estadísticas completas de mantenimiento
    const loadCompleteStatistics = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await reportsApi.getCompleteMaintenanceStatistics();
            setCompleteStats(data);

            // Si hay vehículos y no hay ninguno seleccionado, seleccionar el primero
            if (data.vehicle_statistics.length > 0 && !selectedVehicleId) {
                setSelectedVehicleId(data.vehicle_statistics[0].vehicle.id);
            }

            return data;
        } catch (err: any) {
            setError(err.message || 'Error al cargar estadísticas completas');
            console.error('Error loading complete statistics:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [selectedVehicleId]);

    // Cargar costo de mantenimientos por vehículo
    const loadCostByVehicle = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await reportsApi.getMaintenanceCostByVehicle();
            setCostByVehicle(data);
            return data;
        } catch (err: any) {
            setError(err.message || 'Error al cargar costos por vehículo');
            console.error('Error loading cost by vehicle:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Cargar costo por categoría de mantenimiento
    const loadCostByCategory = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await reportsApi.getMaintenanceCostByCategory();
            setCostByCategory(data);
            return data;
        } catch (err: any) {
            setError(err.message || 'Error al cargar costos por categoría');
            console.error('Error loading cost by category:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Cargar costo por tipo de mantenimiento
    const loadCostByType = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await reportsApi.getMaintenanceCostByType();
            setCostByType(data);
            return data;
        } catch (err: any) {
            setError(err.message || 'Error al cargar costos por tipo');
            console.error('Error loading cost by type:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Cargar estadísticas económicas completas
    const loadCompleteCostStatistics = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await reportsApi.getCompleteCostStatistics();
            setCompleteCostStats(data);

            // Si hay vehículos y no hay ninguno seleccionado, seleccionar el primero
            if (data.vehicle_cost_statistics.length > 0 && !selectedVehicleId) {
                setSelectedVehicleId(data.vehicle_cost_statistics[0].vehicle.id);
            }

            return data;
        } catch (err: any) {
            setError(err.message || 'Error al cargar estadísticas de costos completas');
            console.error('Error loading complete cost statistics:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [selectedVehicleId]);

    // Cargar todas las estadísticas
    const loadAllStatistics = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Paralelizar solicitudes para mejor rendimiento
            const [
                countData,
                categoryData,
                completeData,
                costVehicleData,
                costCategoryData,
                costTypeData,
                completeCostData
            ] = await Promise.all([
                reportsApi.getMaintenanceCountByVehicle(),
                reportsApi.getMaintenanceByCategory(),
                reportsApi.getCompleteMaintenanceStatistics(),
                reportsApi.getMaintenanceCostByVehicle(),
                reportsApi.getMaintenanceCostByCategory(),
                reportsApi.getMaintenanceCostByType(),
                reportsApi.getCompleteCostStatistics()
            ]);

            setMaintenanceCount(countData);
            setMaintenanceByCategory(categoryData);
            setCompleteStats(completeData);
            setCostByVehicle(costVehicleData);
            setCostByCategory(costCategoryData);
            setCostByType(costTypeData);
            setCompleteCostStats(completeCostData);

            // Si hay vehículos y no hay ninguno seleccionado, seleccionar el primero
            if (completeCostData.vehicle_cost_statistics.length > 0 && !selectedVehicleId) {
                setSelectedVehicleId(completeCostData.vehicle_cost_statistics[0].vehicle.id);
            }

            return {
                maintenanceCount: countData,
                maintenanceByCategory: categoryData,
                completeStats: completeData,
                costByVehicle: costVehicleData,
                costByCategory: costCategoryData,
                costByType: costTypeData,
                completeCostStats: completeCostData
            };
        } catch (err: any) {
            setError(err.message || 'Error al cargar estadísticas');
            console.error('Error loading all statistics:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [selectedVehicleId]);

    // Obtener estadísticas para el vehículo seleccionado
    const getSelectedVehicleStatistics = useCallback(() => {
        if (!selectedVehicleId) return null;

        const vehicleMaintenanceStats = completeStats?.vehicle_statistics.find(
            stats => stats.vehicle.id === selectedVehicleId
        );

        const vehicleCostStats = completeCostStats?.vehicle_cost_statistics.find(
            stats => stats.vehicle.id === selectedVehicleId
        );

        return {
            maintenanceStats: vehicleMaintenanceStats,
            costStats: vehicleCostStats
        };
    }, [selectedVehicleId, completeStats, completeCostStats]);

    return {
        // Estados
        maintenanceCount,
        maintenanceByCategory,
        completeStats,
        costByVehicle,
        costByCategory,
        costByType,
        completeCostStats,
        isLoading,
        error,
        selectedVehicleId,

        // Acciones
        setSelectedVehicleId,
        loadMaintenanceCount,
        loadMaintenanceByCategory,
        loadCompleteStatistics,
        loadCostByVehicle,
        loadCostByCategory,
        loadCostByType,
        loadCompleteCostStatistics,
        loadAllStatistics,
        getSelectedVehicleStatistics,

        // Limpiar error
        clearError: useCallback(() => setError(null), [])
    };
};

export default useStatistics;