// src/modules/home/hooks/useHome.ts
import { useState, useEffect, useCallback } from 'react';
import { useVehicles } from '@/src/modules/vehicles/hooks/useVehicles';
import { useMaintenance } from '@/src/modules/maintenance/hooks/useMaintenance';
import { useNotificationContext } from '@/src/modules/notifications/context/NotificationProvider';
import {
    VehicleStatus,
    VehicleMaintenance,
    DashboardSummary,
    calculateVehicleStatusPercentage
} from '../models/home';
import { NextMaintenanceItem } from '@/src/modules/maintenance/models/maintenance';
import { Vehicle } from '@/src/modules/vehicles/models/vehicle';

export const useHome = () => {
    // Hooks de otros módulos
    const { vehicles, loadVehicles, isLoading: isLoadingVehicles } = useVehicles();
    const { unreadCount } = useNotificationContext();

    // Estados locales
    const [vehicleStatuses, setVehicleStatuses] = useState<VehicleStatus[]>([]);
    const [upcomingMaintenance, setUpcomingMaintenance] = useState<VehicleMaintenance[]>([]);
    const [summary, setSummary] = useState<DashboardSummary>({
        totalVehicles: 0,
        vehiclesRequiringMaintenance: 0,
        upcomingMaintenanceCount: 0,
        totalMaintenanceCost: 0,
        averageMaintenanceCost: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeVehicleIndex, setActiveVehicleIndex] = useState(0);

    // Simular datos de mantenimiento para cada vehículo
    const generateMockMaintenanceData = (vehicles: Vehicle[]): VehicleMaintenance[] => {
        return vehicles.map(vehicle => {
            // Generar entre 1 y 3 elementos de mantenimiento por vehículo
            const numItems = Math.floor(Math.random() * 3) + 1;
            const maintenanceItems: NextMaintenanceItem[] = [];

            const maintenanceTypes = [
                { id_tipo: 1, nombre: "Cambio de aceite" },
                { id_tipo: 2, nombre: "Revisión de frenos" },
                { id_tipo: 3, nombre: "Rotación de neumáticos" },
                { id_tipo: 4, nombre: "Cambio de filtros" },
                { id_tipo: 5, nombre: "Alineación y balanceo" }
            ];

            // Fechas para los mantenimientos
            const today = new Date();
            const oneMonthAgo = new Date(today);
            oneMonthAgo.setMonth(today.getMonth() - 1);

            const oneMonthLater = new Date(today);
            oneMonthLater.setMonth(today.getMonth() + 1);

            const twoMonthsLater = new Date(today);
            twoMonthsLater.setMonth(today.getMonth() + 2);

            for (let i = 0; i < numItems; i++) {
                const typeIndex = Math.floor(Math.random() * maintenanceTypes.length);
                const isDue = Math.random() > 0.7; // 30% de probabilidad de que esté vencido
                const isUpcoming = !isDue && Math.random() > 0.5; // 50% de probabilidad de que esté próximo

                const lastMaintenanceDate = oneMonthAgo.toISOString().split('T')[0];
                const nextMaintenanceDate = isDue
                    ? today.toISOString().split('T')[0]
                    : isUpcoming
                        ? oneMonthLater.toISOString().split('T')[0]
                        : twoMonthsLater.toISOString().split('T')[0];

                const lastKm = vehicle.kilometraje_actual ? vehicle.kilometraje_actual - 1000 : 40000;
                const nextKm = vehicle.kilometraje_actual ? vehicle.kilometraje_actual + 2000 : 45000;

                maintenanceItems.push({
                    type: maintenanceTypes[typeIndex],
                    type_id: maintenanceTypes[typeIndex].id_tipo,
                    last_maintenance_date: lastMaintenanceDate,
                    last_maintenance_km: lastKm,
                    config: {
                        frequency_months: 3,
                        frequency_km: 5000,
                        estimated_cost: 120 + (Math.random() * 100)
                    },
                    next_maintenance: {
                        by_date: nextMaintenanceDate,
                        by_km: nextKm
                    },
                    status: {
                        time_status: {
                            days_remaining: isDue ? 0 : isUpcoming ? 15 : 45,
                            is_due: isDue,
                            is_upcoming: isUpcoming
                        },
                        km_status: {
                            km_remaining: isDue ? 0 : isUpcoming ? 1000 : 3000,
                            is_due: isDue,
                            is_upcoming: isUpcoming
                        }
                    }
                });
            }

            return {
                vehicle,
                maintenanceItems
            };
        });
    };

    // Cargar datos
    const loadDashboardData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Cargar vehículos si no están ya cargados
            if (vehicles.length === 0) {
                await loadVehicles();
            }

            // Aquí simularemos los datos de mantenimiento que en un caso real
            // obtendrías del backend
            const mockMaintenanceData = generateMockMaintenanceData(vehicles);
            setUpcomingMaintenance(mockMaintenanceData);

            // Generar estado de los vehículos
            const statuses = vehicles.map(vehicle => {
                const vehicleMaintenance = mockMaintenanceData.find(
                    vm => vm.vehicle.id_vehiculo === vehicle.id_vehiculo
                );
                const statusPercentage = calculateVehicleStatusPercentage(
                    vehicle,
                    vehicleMaintenance?.maintenanceItems || []
                );

                let statusDescription: 'Bueno' | 'Regular' | 'Requiere atención';

                if (statusPercentage >= 80) {
                    statusDescription = 'Bueno';
                } else if (statusPercentage >= 50) {
                    statusDescription = 'Regular';
                } else {
                    statusDescription = 'Requiere atención';
                }

                return {
                    vehicle,
                    statusPercentage,
                    statusDescription,
                    lastServiceDate: '15/01/2024' // Fecha simulada
                };
            });

            setVehicleStatuses(statuses);

            // Calcular resumen
            const totalMaintenanceItems = mockMaintenanceData.reduce(
                (total, vm) => total + vm.maintenanceItems.length, 0
            );

            const totalCost = mockMaintenanceData.reduce(
                (total, vm) => total + vm.maintenanceItems.reduce(
                    (subtotal, item) => subtotal + item.config.estimated_cost, 0
                ), 0
            );

            const vehiclesNeedingMaintenance = mockMaintenanceData.filter(
                vm => vm.maintenanceItems.some(
                    item => item.status.time_status.is_due || item.status.km_status.is_due
                )
            ).length;

            setSummary({
                totalVehicles: vehicles.length,
                vehiclesRequiringMaintenance: vehiclesNeedingMaintenance,
                upcomingMaintenanceCount: totalMaintenanceItems,
                totalMaintenanceCost: totalCost,
                averageMaintenanceCost: totalMaintenanceItems > 0 ? totalCost / totalMaintenanceItems : 0
            });

        } catch (err: any) {
            console.error('Error loading dashboard data:', err);
            setError(err.message || 'Error al cargar datos del dashboard');
        } finally {
            setIsLoading(false);
        }
    }, [vehicles, loadVehicles]);

    // Cargar datos al montar el componente
    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    // Handler para cambio de vehículo activo
    const handleVehicleChange = (index: number) => {
        setActiveVehicleIndex(index);
    };

    // Obtener estado del vehículo actualmente seleccionado
    const getActiveVehicleStatus = () => {
        if (vehicleStatuses.length === 0) return null;
        return vehicleStatuses[activeVehicleIndex] || vehicleStatuses[0];
    };

    // Obtener mantenimientos del vehículo actualmente seleccionado
    const getActiveVehicleMaintenance = () => {
        if (upcomingMaintenance.length === 0) return null;
        if (!vehicles[activeVehicleIndex]) return upcomingMaintenance[0];

        return upcomingMaintenance.find(
            vm => vm.vehicle.id_vehiculo === vehicles[activeVehicleIndex].id_vehiculo
        ) || upcomingMaintenance[0];
    };

    return {
        vehicles,
        upcomingMaintenance,
        vehicleStatuses,
        summary,
        isLoading,
        error,
        activeVehicleIndex,
        unreadCount,
        loadDashboardData,
        handleVehicleChange,
        getActiveVehicleStatus,
        getActiveVehicleMaintenance
    };
};

export default useHome;