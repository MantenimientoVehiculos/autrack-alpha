// src/modules/vehicles/screens/VehicleMaintenanceScreen.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { GradientHeader } from '@/src/shared/components/ui/GradientHeader';
import { Button } from '@/src/shared/components/ui/Button';
import { PlusIcon } from '@/src/shared/components/ui/Icons';
import { useVehicles } from '../hooks/useVehicles';
import { useMaintenance } from '@/src/modules/maintenance/hooks/useMaintenance';
import { MaintenanceStatusCard } from '@/src/modules/maintenance/components/MaintenanceStatusCard';
import { MaintenanceCard } from '@/src/modules/maintenance/components/MaintenanceCard';
import { MaintenanceRecord } from '@/src/modules/maintenance/models/maintenance';

export const VehicleMaintenanceScreen: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{ id: string }>();
    const { theme } = useAppTheme();
    const vehicleId = params.id ? parseInt(params.id) : 0;

    const { vehicles, loadVehicles } = useVehicles();
    const {
        maintenanceRecords,
        loadMaintenanceRecords,
        deleteMaintenanceRecord,
        isLoading
    } = useMaintenance(vehicleId);

    const [recentRecords, setRecentRecords] = useState<MaintenanceRecord[]>([]);
    const vehicle = vehicles.find(v => v.id_vehiculo === vehicleId);

    // Cargar datos al montar el componente
    useEffect(() => {
        if (vehicleId) {
            loadMaintenanceRecords(vehicleId);
            if (!vehicle) {
                loadVehicles();
            }
        }
    }, [vehicleId, loadMaintenanceRecords, vehicle, loadVehicles]);

    // Filtrar y ordenar registros de mantenimiento recientes
    useEffect(() => {
        if (maintenanceRecords.length > 0) {
            // Ordenar por fecha descendente
            const sorted = [...maintenanceRecords].sort((a, b) =>
                new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
            );
            // Obtener los 3 más recientes
            setRecentRecords(sorted.slice(0, 3));
        } else {
            setRecentRecords([]);
        }
    }, [maintenanceRecords]);

    // Calcular el próximo mantenimiento recomendado
    const nextMaintenance = useMemo(() => {
        if (recentRecords.length === 0 || !vehicle) return null;

        // Tomar el mantenimiento más reciente
        const lastMaintenance = recentRecords[0];

        // Ejemplo simplificado: programar próximo mantenimiento a los 5000 km
        const nextDate = new Date();
        nextDate.setMonth(nextDate.getMonth() + 3); // 3 meses por defecto

        return {
            date: nextDate.toISOString(),
            type: lastMaintenance.tipo_mantenimiento?.nombre || 'Mantenimiento general'
        };
    }, [recentRecords, vehicle]);

    // Calcular estado general de mantenimiento (simplificado)
    const maintenanceStatus = useMemo(() => {
        if (!vehicle || recentRecords.length === 0) return 65; // Valor por defecto

        // Simplificación: calcular basado en km desde último mantenimiento
        const lastServiceKm = recentRecords[0].kilometraje;
        const currentKm = vehicle.kilometraje_actual;
        const kmDifference = currentKm - lastServiceKm;

        // Ejemplo: consideramos que a los 5000 km necesita mantenimiento
        const recommendedInterval = 5000;
        const percentage = Math.max(0, Math.min(100, 100 - (kmDifference / recommendedInterval * 100)));

        return Math.round(percentage);
    }, [vehicle, recentRecords]);

    // Navegar a la pantalla de agregar mantenimiento
    const navigateToAddMaintenance = () => {
        router.push(`/maintenance/add?vehicleId=${vehicleId}`);
    };

    // Navegar a la pantalla de historial completo
    const navigateToMaintenanceHistory = () => {
        router.push(`/maintenance/history?vehicleId=${vehicleId}`);
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

    // Colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const containerBg = theme === 'dark' ? '#111111' : '#FFFFFF';

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

            <View style={styles.content}>
                {/* Tarjeta de estado de mantenimiento */}
                <MaintenanceStatusCard
                    vehicle={vehicle}
                    nextMaintenance={nextMaintenance || undefined}
                    maintenanceStatus={maintenanceStatus}
                    onScheduleMaintenance={navigateToAddMaintenance}
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
                        recentRecords.map((record) => (
                            <MaintenanceCard
                                key={record.id_registro}
                                record={record}
                                onDelete={handleDeleteMaintenance}
                            />
                        ))
                    ) : (
                        <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
                            No hay registros de mantenimiento
                        </Text>
                    )}
                </View>
            </View>

            {/* Botones de acción */}
            <View style={styles.buttonContainer}>
                <Button
                    buttonVariant="outline"
                    buttonSize="large"
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    Eliminar mantenimiento
                </Button>

                <Button
                    buttonVariant="primary"
                    buttonSize="large"
                    onPress={navigateToAddMaintenance}
                    style={styles.addButton}
                >
                    Agregar Mantenimiento
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
        marginTop: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '500',
    },
    emptyText: {
        textAlign: 'center',
        padding: 16,
        fontSize: 14,
    },
    buttonContainer: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    backButton: {
        flex: 1,
        marginRight: 8,
    },
    addButton: {
        flex: 1,
        marginLeft: 8,
    },
});

export default VehicleMaintenanceScreen;