// src/modules/maintenance/hooks/useMaintenance.ts
import { useState, useEffect, useCallback } from 'react';
import { maintenanceApi } from '../services/maintenanceApi';
import {
    MaintenanceCategory,
    MaintenanceType,
    MaintenanceRecord,
    MaintenanceRecordCreate,
    CustomMaintenanceTypeCreate,
    MaintenanceReminder,
    NextMaintenanceResponse
} from '../models/maintenance';
import * as Haptics from 'expo-haptics';

export const useMaintenance = (vehicleId?: number) => {
    const [categories, setCategories] = useState<MaintenanceCategory[]>([]);
    const [maintenanceTypes, setMaintenanceTypes] = useState<MaintenanceType[]>([]);
    const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
    const [maintenanceReminders, setMaintenanceReminders] = useState<MaintenanceReminder[]>([]);
    const [nextMaintenance, setNextMaintenance] = useState<NextMaintenanceResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar categorías de mantenimiento
    const loadCategories = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const categoriesList = await maintenanceApi.getCategories();
            setCategories(categoriesList);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error al cargar categorías de mantenimiento');
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Cargar tipos de mantenimiento
    const loadMaintenanceTypes = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const typesList = await maintenanceApi.getMaintenanceTypes();
            setMaintenanceTypes(typesList);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error al cargar tipos de mantenimiento');
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Cargar registros de mantenimiento por vehículo
    const loadMaintenanceRecords = useCallback(async (id?: number) => {
        if (!id && !vehicleId) return;

        const vId = id || vehicleId;
        if (!vId) return;

        setIsLoading(true);
        setError(null);
        try {
            const recordsList = await maintenanceApi.getMaintenanceRecordsByVehicle(vId);
            setMaintenanceRecords(recordsList);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error al cargar registros de mantenimiento');
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );
        } finally {
            setIsLoading(false);
        }
    }, [vehicleId]);

    // Cargar recordatorios de mantenimiento
    const loadMaintenanceReminders = useCallback(async (id?: number) => {
        if (!id && !vehicleId) return;

        const vId = id || vehicleId;
        if (!vId) return;

        setIsLoading(true);
        setError(null);
        try {
            const remindersList = await maintenanceApi.getMaintenanceRemindersByVehicle(vId);
            setMaintenanceReminders(remindersList);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error al cargar recordatorios de mantenimiento');
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );
        } finally {
            setIsLoading(false);
        }
    }, [vehicleId]);

    // Cargar información del próximo mantenimiento
    const loadNextMaintenance = useCallback(async (id?: number) => {
        if (!id && !vehicleId) return;

        const vId = id || vehicleId;
        if (!vId) return;

        setIsLoading(true);
        setError(null);
        try {
            const nextMaintenanceData = await maintenanceApi.getNextMaintenance(vId);
            setNextMaintenance(nextMaintenanceData);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error al cargar información del próximo mantenimiento');
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );
        } finally {
            setIsLoading(false);
        }
    }, [vehicleId]);

    // Crear un tipo de mantenimiento personalizado
    const createCustomMaintenanceType = useCallback(async (data: CustomMaintenanceTypeCreate) => {
        setIsLoading(true);
        setError(null);
        try {
            const createdType = await maintenanceApi.createCustomMaintenanceType(data);
            setMaintenanceTypes(prev => [...prev, createdType]);
            await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            );
            return { success: true, data: createdType };
        } catch (err: any) {
            console.error(err);
            const msg = err.message || 'Error al crear tipo de mantenimiento personalizado';
            setError(msg);
            await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );
            return { success: false, error: msg };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Crear un registro de mantenimiento
    const createMaintenanceRecord = useCallback(async (data: MaintenanceRecordCreate) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await maintenanceApi.createMaintenanceRecord(data);

            // Si el vehículo ID del registro coincide con el vehicleId actual, actualizamos la lista
            if (data.id_vehiculo === vehicleId && result.record) {
                setMaintenanceRecords(prev => [...prev, result.record]);
            }

            // Si se necesitaba configuración (primera vez para este tipo) y se proporcionaron 
            // parámetros de programación, se habrá creado la configuración automáticamente
            if (result.needsConfig) {
                // La configuración ya fue creada por el servidor con los datos proporcionados
                console.log('Se creó configuración de mantenimiento:', result.config);
            }

            // Actualizar recordatorios y próximo mantenimiento si existe ID de vehículo
            if (vehicleId) {
                loadMaintenanceReminders(vehicleId);
                loadNextMaintenance(vehicleId);
            }

            await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            );
            return { success: true, data: result };
        } catch (err: any) {
            console.error(err);
            const msg = err.message || 'Error al crear registro de mantenimiento';
            setError(msg);
            await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );
            return { success: false, error: msg };
        } finally {
            setIsLoading(false);
        }
    }, [vehicleId, loadMaintenanceReminders, loadNextMaintenance]);

    // Eliminar un registro de mantenimiento
    const deleteMaintenanceRecord = useCallback(async (recordId: number) => {
        setIsLoading(true);
        setError(null);
        try {
            await maintenanceApi.deleteMaintenanceRecord(recordId);
            setMaintenanceRecords(prev =>
                prev.filter(record => record.id_registro !== recordId)
            );

            // Actualizar recordatorios y próximo mantenimiento si existe ID de vehículo
            if (vehicleId) {
                loadMaintenanceReminders(vehicleId);
                loadNextMaintenance(vehicleId);
            }

            await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            );
            return { success: true };
        } catch (err: any) {
            console.error(err);
            const msg = err.message || 'Error al eliminar registro de mantenimiento';
            setError(msg);
            await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );
            return { success: false, error: msg };
        } finally {
            setIsLoading(false);
        }
    }, [vehicleId, loadMaintenanceReminders, loadNextMaintenance]);

    // Verificar mantenimientos manualmente
    const checkMaintenance = useCallback(async (id?: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await maintenanceApi.checkMaintenance(id);

            // Actualizar recordatorios y próximo mantenimiento si existe ID de vehículo
            if (vehicleId || id) {
                const vId = id || vehicleId;
                if (vId) {
                    loadMaintenanceReminders(vId);
                    loadNextMaintenance(vId);
                }
            }

            await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            );
            return { success: true, message: result.message };
        } catch (err: any) {
            console.error(err);
            const msg = err.message || 'Error al verificar mantenimientos';
            setError(msg);
            await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );
            return { success: false, error: msg };
        } finally {
            setIsLoading(false);
        }
    }, [vehicleId, loadMaintenanceReminders, loadNextMaintenance]);

    // Limpiar errores
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Calcular la fecha del próximo mantenimiento basado en la frecuencia
    const calculateNextMaintenanceDate = useCallback((
        lastMaintenanceDate: string,
        frequencyMonths: number
    ): Date => {
        const date = new Date(lastMaintenanceDate);
        date.setMonth(date.getMonth() + frequencyMonths);
        return date;
    }, []);

    // Calcular el próximo kilometraje de mantenimiento
    const calculateNextMaintenanceKm = useCallback((
        lastMaintenanceKm: number,
        frequencyKm: number
    ): number => {
        return lastMaintenanceKm + frequencyKm;
    }, []);

    // Cargar datos al montar el componente
    useEffect(() => {
        loadCategories();
        loadMaintenanceTypes();
        if (vehicleId) {
            loadMaintenanceRecords();
            loadMaintenanceReminders();
            loadNextMaintenance();
        }
    }, [
        loadCategories,
        loadMaintenanceTypes,
        loadMaintenanceRecords,
        loadMaintenanceReminders,
        loadNextMaintenance,
        vehicleId
    ]);

    return {
        categories,
        maintenanceTypes,
        maintenanceRecords,
        maintenanceReminders,
        nextMaintenance,
        isLoading,
        error,
        loadCategories,
        loadMaintenanceTypes,
        loadMaintenanceRecords,
        loadMaintenanceReminders,
        loadNextMaintenance,
        createCustomMaintenanceType,
        createMaintenanceRecord,
        deleteMaintenanceRecord,
        checkMaintenance,
        clearError,
        calculateNextMaintenanceDate,
        calculateNextMaintenanceKm
    };
};