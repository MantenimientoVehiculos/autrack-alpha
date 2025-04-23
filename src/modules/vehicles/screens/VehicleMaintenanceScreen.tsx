// src/modules/vehicles/screens/VehicleMaintenanceScreen.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { GradientHeader } from '@/src/shared/components/ui/GradientHeader';
import { Button } from '@/src/shared/components/ui/Button';
import { PlusIcon } from '@/src/shared/components/ui/Icons';
import { useVehicles } from '../hooks/useVehicles';
import { useMaintenance } from '@/src/modules/maintenance/hooks/useMaintenance';
import { MaintenanceStatusCard } from '@/src/modules/maintenance/components/MaintenanceStatusCard';
import { MaintenanceRecord } from '@/src/modules/maintenance/models/maintenance';

export const VehicleMaintenanceScreen: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{ id: string }>();
    const { theme } = useAppTheme();
    const vehicleId = params.id ? parseInt(params.id) : 0;

    const { vehicles, loadVehicles } = useVehicles();
    const {
        maintenanceRecords,
        nextMaintenance,
        loadMaintenanceRecords,
        loadNextMaintenance,
        deleteMaintenanceRecord,
        isLoading
    } = useMaintenance(vehicleId);

    const [recentRecords, setRecentRecords] = useState<MaintenanceRecord[]>([]);
    const vehicle = vehicles.find(v => v.id_vehiculo === vehicleId);

    // Cargar datos al montar el componente
    useEffect(() => {
        if (vehicleId) {
            loadMaintenanceRecords(vehicleId);
            loadNextMaintenance(vehicleId);

            if (!vehicle) {
                loadVehicles();
            }
        }
    }, [vehicleId, loadMaintenanceRecords, loadNextMaintenance, vehicle, loadVehicles]);

    // Filtrar y ordenar registros de mantenimiento recientes
    useEffect(() => {
        if (maintenanceRecords.length > 0) {
            // Ordenar por fecha descendente
            const sorted = [...maintenanceRecords].sort((a, b) =>
                new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
            );
            // Obtener los 3 más recientes
            setRecentRecords(sorted.slice(0, 5));
        } else {
            setRecentRecords([]);
        }
    }, [maintenanceRecords]);

    // Calcular el próximo mantenimiento recomendado
    const nextMaintenanceInfo = useMemo(() => {
        // Si tenemos información de la API sobre el próximo mantenimiento
        if (nextMaintenance && nextMaintenance.maintenance_items.length > 0) {
            // Buscar el mantenimiento más próximo
            const sortedByDate = [...nextMaintenance.maintenance_items]
                .sort((a, b) =>
                    new Date(a.next_maintenance.by_date).getTime() -
                    new Date(b.next_maintenance.by_date).getTime()
                );

            const nextItem = sortedByDate[0];

            return {
                date: nextItem.next_maintenance.by_date,
                type: nextItem.type.nombre
            };
        }

        // Fallback calculado a partir de los registros
        if (recentRecords.length > 0 && vehicle) {
            // Tomar el mantenimiento más reciente
            const lastMaintenance = recentRecords[0];

            // Ejemplo simplificado: programar próximo mantenimiento a los 5000 km
            const nextDate = new Date();
            nextDate.setMonth(nextDate.getMonth() + 3); // 3 meses por defecto

            return {
                date: nextDate.toISOString(),
                type: lastMaintenance.tipo_mantenimiento?.nombre || 'Mantenimiento general'
            };
        }

        return null;
    }, [nextMaintenance, recentRecords, vehicle]);

    // Calcular estado general de mantenimiento
    const maintenanceStatus = useMemo(() => {
        // Si tenemos información de la API sobre el próximo mantenimiento
        if (nextMaintenance && nextMaintenance.maintenance_items.length > 0) {
            // Calcular promedio de estado basado en días y km restantes
            let totalPercentage = 0;
            let itemsCount = 0;

            nextMaintenance.maintenance_items.forEach(item => {
                // Convertir días restantes a porcentaje (máximo 180 días = 100%)
                const daysPercentage = Math.min(100, (item.status.time_status.days_remaining / 180) * 100);

                // Convertir km restantes a porcentaje (máximo 5000 km = 100%)
                const kmPercentage = Math.min(100, (item.status.km_status.km_remaining / 5000) * 100);

                // Tomar el menor de los dos porcentajes
                const itemPercentage = Math.min(daysPercentage, kmPercentage);

                totalPercentage += itemPercentage;
                itemsCount++;
            });

            // Calcular promedio
            if (itemsCount > 0) {
                return Math.round(totalPercentage / itemsCount);
            }
        }

        // Fallback si no hay información de la API
        if (!vehicle || recentRecords.length === 0) return 85; // Valor por defecto

        // Simplificación: calcular basado en km desde último mantenimiento
        const lastServiceKm = recentRecords[0].kilometraje;
        const currentKm = vehicle.kilometraje_actual;
        const kmDifference = currentKm - lastServiceKm;

        // Ejemplo: consideramos que a los 5000 km necesita mantenimiento
        const recommendedInterval = 5000;
        const percentage = Math.max(0, Math.min(100, 100 - (kmDifference / recommendedInterval * 100)));

        return Math.round(percentage);
    }, [vehicle, recentRecords, nextMaintenance]);

    // Navegar a la pantalla de agregar mantenimiento
    const navigateToAddMaintenance = () => {
        router.push(`/maintenance/add?vehicleId=${vehicleId}`);
    };

    // Navegar a la pantalla de historial completo
    const navigateToMaintenanceHistory = () => {
        router.push(`/maintenance/history?vehicleId=${vehicleId}`);
    };

    // Navegar a la pantalla de programación de mantenimiento
    const navigateToMaintenanceSchedule = () => {
        router.push(`/maintenance/schedule?vehicleId=${vehicleId}`);
    };

    // Manejar la eliminación de un registro
    const handleDeleteMaintenance = (id: number) => {
        Alert.alert(
            'Eliminar mantenimiento',
            '¿Estás seguro que deseas eliminar este registro de mantenimiento? Esta acción no se puede deshacer.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await deleteMaintenanceRecord(id);
                        if (result.success) {
                            Alert.alert('Éxito', 'Registro eliminado correctamente');
                        } else {
                            Alert.alert('Error', result.error || 'No se pudo eliminar el registro');
                        }
                    }
                },
            ]
        );
    };

    // Formatear fecha para los registros de mantenimiento
    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString();
    };

    // Colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const containerBg = theme === 'dark' ? '#111111' : '#FFFFFF';
    const cardColor = theme === 'dark' ? '#222222' : '#FFFFFF';
    const borderColor = theme === 'dark' ? '#333333' : '#EEEEEE';

    if (!vehicle) {
        return (
            <View style={[styles.container, { backgroundColor: containerBg }]}>
                <GradientHeader
                    title="Detalle del Vehículo"
                    showBackButton={true}
                />
                <View style={styles.centeredContainer}>
                    <Text style={[styles.errorText, { color: textColor }]}>
                        No se encontró el vehículo
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: containerBg }]}>
            <GradientHeader
                title="Detalle del Vehículo"
                showBackButton={true}
            />

            <ScrollView style={styles.content}>
                {/* Tarjeta de estado de mantenimiento */}
                <MaintenanceStatusCard
                    vehicle={vehicle}
                    nextMaintenance={nextMaintenanceInfo || undefined}
                    maintenanceStatus={maintenanceStatus}
                    onScheduleMaintenance={navigateToAddMaintenance}
                    onViewSchedule={navigateToMaintenanceSchedule}
                />

                {/* Sección de mantenimientos recientes */}
                <View style={styles.recentMaintenanceSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: textColor }]}>
                            Mantenimientos recientes
                        </Text>
                        <TouchableOpacity onPress={navigateToMaintenanceHistory}>
                            <Text style={[styles.viewAllText, { color: theme === 'dark' ? '#B27046' : '#9D7E68' }]}>
                                Ver todos
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {recentRecords.length > 0 ? (
                        <View style={styles.maintenancesList}>
                            {recentRecords.map((record) => (
                                <View
                                    key={record.id_registro}
                                    style={[
                                        styles.maintenanceItem,
                                        { backgroundColor: cardColor, borderColor: borderColor }
                                    ]}
                                >
                                    <View style={styles.maintenanceItemHeader}>
                                        <Text style={[styles.maintenanceType, { color: textColor }]}>
                                            {record.tipo_mantenimiento?.nombre || "Mantenimiento"}
                                        </Text>
                                        <Text style={[styles.maintenanceCost, { color: theme === 'dark' ? '#B27046' : '#9D7E68' }]}>
                                            ${record.costo.toFixed(2)}
                                        </Text>
                                    </View>
                                    <View style={styles.maintenanceItemDetails}>
                                        <Text style={[styles.dateText, { color: secondaryTextColor }]}>
                                            {formatDate(record.fecha)}
                                        </Text>
                                        <Text style={[styles.kmText, { color: secondaryTextColor }]}>
                                            {record.kilometraje.toLocaleString()}km
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
                            No hay registros de mantenimiento
                        </Text>
                    )}
                </View>
            </ScrollView>

            {/* Botones de acción */}
            <View style={styles.buttonsContainer}>
                <Button
                    buttonVariant="outline"
                    buttonSize="medium"
                    onPress={navigateToMaintenanceSchedule}
                    style={styles.scheduleButton}
                >
                    Ver Programación
                </Button>

                <Button
                    buttonVariant="primary"
                    buttonSize="medium"
                    onPress={navigateToAddMaintenance}
                    style={styles.addButton}
                >
                    Registrar Mantenimiento
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    recentMaintenanceSection: {
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '500',
    },
    maintenancesList: {
        marginTop: 8,
    },
    maintenanceItem: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        elevation: 1,
    },
    maintenanceItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    maintenanceType: {
        fontSize: 16,
        fontWeight: '600',
    },
    maintenanceCost: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    maintenanceItemDetails: {
        flexDirection: 'row',
    },
    dateText: {
        fontSize: 14,
        marginRight: 12,
    },
    kmText: {
        fontSize: 14,
    },
    emptyText: {
        textAlign: 'center',
        padding: 16,
        fontSize: 14,
    },
    buttonsContainer: {
        padding: 16,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
    },
    scheduleButton: {
        flex: 1,
        marginRight: 8,
    },
    addButton: {
        flex: 1,
        marginLeft: 8,
    },
});

export default VehicleMaintenanceScreen;