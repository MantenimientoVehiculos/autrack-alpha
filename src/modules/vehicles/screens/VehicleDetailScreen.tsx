// src/modules/vehicles/screens/VehicleDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { GradientHeader } from '@/src/shared/components/ui/GradientHeader';
import { Button } from '@/src/shared/components/ui/Button';
import { Card } from '@/src/shared/components/ui/Card';
import { EditIcon, TrashIcon, CarIcon, ChevronRight } from '@/src/shared/components/ui/Icons';
import { useVehicles } from '../hooks/useVehicles';
import { Vehicle } from '../models/vehicle';
import { useMaintenance } from '@/src/modules/maintenance/hooks/useMaintenance';
import { MaintenanceRecord } from '@/src/modules/maintenance/models/maintenance';

export const VehicleDetailScreen: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{ id: string }>();
    const { theme } = useAppTheme();
    const {
        vehicles,
        loadVehicles,
        deleteVehicle,
        updateVehicle,
        isLoading: vehiclesLoading
    } = useVehicles();

    const vehicleId = params.id ? parseInt(params.id) : 0;
    const {
        maintenanceRecords,
        loadMaintenanceRecords,
        isLoading: maintenanceLoading
    } = useMaintenance(vehicleId);

    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [recentMaintenances, setRecentMaintenances] = useState<MaintenanceRecord[]>([]);
    const isLoading = vehiclesLoading || maintenanceLoading;

    // Cargar el vehículo y mantenimientos al montar el componente
    useEffect(() => {
        if (vehicleId) {
            const foundVehicle = vehicles.find(v => v.id_vehiculo === vehicleId);
            if (foundVehicle) {
                setVehicle(foundVehicle);
            } else {
                loadVehicles();
            }

            // Cargar los mantenimientos del vehículo
            loadMaintenanceRecords(vehicleId);
        }
    }, [vehicleId, vehicles, loadVehicles, loadMaintenanceRecords]);

    // Actualizar el vehículo cuando cambia la lista de vehículos
    useEffect(() => {
        if (vehicleId && vehicles.length > 0) {
            const foundVehicle = vehicles.find(v => v.id_vehiculo === vehicleId);
            if (foundVehicle) {
                setVehicle(foundVehicle);
            }
        }
    }, [vehicleId, vehicles]);

    // Actualizar la lista de mantenimientos recientes
    useEffect(() => {
        if (maintenanceRecords.length > 0) {
            // Ordenar por fecha (más reciente primero)
            const sorted = [...maintenanceRecords].sort((a, b) =>
                new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
            );
            // Tomar solo los 3 más recientes
            setRecentMaintenances(sorted.slice(0, 3));
        } else {
            setRecentMaintenances([]);
        }
    }, [maintenanceRecords]);

    // Manejar la eliminación del vehículo
    const handleDelete = () => {
        Alert.alert(
            'Eliminar vehículo',
            '¿Estás seguro que deseas eliminar este vehículo? Esta acción no se puede deshacer.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        if (vehicleId) {
                            const result = await deleteVehicle(vehicleId);
                            if (result.success) {
                                Alert.alert('Éxito', 'Vehículo eliminado correctamente');
                                router.replace('/vehicles');
                            } else {
                                Alert.alert('Error', result.error || 'No se pudo eliminar el vehículo');
                            }
                        }
                    }
                },
            ]
        );
    };

    // Manejar la actualización de kilometraje
    const handleUpdateKilometrage = () => {
        Alert.prompt(
            'Actualizar Kilometraje',
            'Ingresa el kilometraje actual del vehículo:',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Actualizar',
                    onPress: async (value: string | undefined) => {
                        if (!value || isNaN(Number(value)) || Number(value) < 0) {
                            Alert.alert('Error', 'Ingresa un valor válido');
                            return;
                        }

                        const newKm = Number(value);
                        if (vehicle && vehicle.kilometraje_actual && newKm < vehicle.kilometraje_actual) {
                            Alert.alert('Error', 'El nuevo kilometraje no puede ser menor al actual');
                            return;
                        }

                        if (vehicleId) {
                            const result = await updateVehicle(vehicleId, { kilometraje_actual: newKm });
                            if (result.success) {
                                Alert.alert('Éxito', 'Kilometraje actualizado correctamente');
                            } else {
                                Alert.alert('Error', result.error || 'No se pudo actualizar el kilometraje');
                            }
                        }
                    }
                }
            ],
            'plain-text',
            vehicle?.kilometraje_actual?.toString()
        );
    };

    // Navegar a la pantalla de edición
    const navigateToEdit = () => {
        router.push(`/vehicles/${vehicleId}/edit`);
    };

    // Navegar al historial completo de mantenimientos
    const navigateToMaintenanceHistory = () => {
        router.push(`/maintenance/history?vehicleId=${vehicleId}`);
    };

    // Navegar a la pantalla para añadir un nuevo mantenimiento
    const navigateToAddMaintenance = () => {
        router.push(`/maintenance/add?vehicleId=${vehicleId}`);
    };

    // Formatear fecha para mostrar
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const cardColor = theme === 'dark' ? '#222222' : '#FFFFFF';
    const borderColor = theme === 'dark' ? '#333333' : '#EEEEEE';

    // Mostrar cargando
    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#111111' : '#FFFFFF' }]}>
                <GradientHeader title="Detalle del Vehículo" showBackButton={true} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme === 'dark' ? '#B27046' : '#9D7E68'} />
                    <Text style={[styles.loadingText, { color: textColor }]}>Cargando...</Text>
                </View>
            </View>
        );
    }

    // Mostrar error si no se encuentra el vehículo
    if (!vehicle && !isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#111111' : '#FFFFFF' }]}>
                <GradientHeader title="Detalle del Vehículo" showBackButton={true} />
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: textColor }]}>
                        No se encontró el vehículo o ha sido eliminado.
                    </Text>
                    <Button
                        buttonVariant="primary"
                        buttonSize="medium"
                        onPress={() => router.replace('/vehicles')}
                        style={styles.backButton}
                    >
                        Volver a mis vehículos
                    </Button>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#111111' : '#FFFFFF' }]}>
            <GradientHeader
                title="Detalle del Vehículo"
                showBackButton={true}
                rightComponent={
                    <View style={styles.headerActions}>
                        <Button
                            buttonVariant="ghost"
                            buttonSize="small"
                            onPress={navigateToEdit}
                            style={styles.headerButton}
                        >
                            <EditIcon size={20} color="#FFFFFF" />
                        </Button>
                        <Button
                            buttonVariant="ghost"
                            buttonSize="small"
                            onPress={handleDelete}
                            style={styles.headerButton}
                        >
                            <TrashIcon size={20} color="#FFFFFF" />
                        </Button>
                    </View>
                }
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Información del vehículo */}
                <View style={styles.vehicleInfoContainer}>
                    <View style={styles.iconContainer}>
                        <CarIcon
                            size={48}
                            color={theme === 'dark' ? '#B27046' : '#9D7E68'}
                        />
                        {vehicle?.color && (
                            <View
                                style={[
                                    styles.colorIndicator,
                                    { backgroundColor: vehicle.color }
                                ]}
                            />
                        )}
                    </View>

                    <Text style={[styles.plateText, { color: textColor }]}>
                        {vehicle?.placa || 'Sin placa'}
                    </Text>

                    <Text style={[styles.nameText, { color: textColor }]}>
                        {vehicle?.marca?.nombre} {vehicle?.modelo?.nombre} ({vehicle?.anio})
                    </Text>
                </View>

                {/* Detalles del vehículo */}
                <Card style={styles.detailsCard}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>Información Básica</Text>

                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Placa:</Text>
                        <Text style={[styles.detailValue, { color: textColor }]}>
                            {vehicle?.placa || 'No disponible'}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Marca:</Text>
                        <Text style={[styles.detailValue, { color: textColor }]}>
                            {vehicle?.marca?.nombre || 'No disponible'}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Modelo:</Text>
                        <Text style={[styles.detailValue, { color: textColor }]}>
                            {vehicle?.modelo?.nombre || 'No disponible'}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Año:</Text>
                        <Text style={[styles.detailValue, { color: textColor }]}>
                            {vehicle?.anio || 'No disponible'}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Kilometraje:</Text>
                        <Text style={[styles.detailValue, { color: textColor }]}>
                            {vehicle?.kilometraje_actual?.toLocaleString() || '0'} km
                        </Text>
                    </View>

                    {vehicle?.color && (
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Color:</Text>
                            <View style={styles.colorDetail}>
                                <View
                                    style={[
                                        styles.colorSwatch,
                                        { backgroundColor: vehicle.color }
                                    ]}
                                />
                                <Text style={[styles.detailValue, { color: textColor }]}>
                                    {getColorName(vehicle.color)}
                                </Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Fecha de registro:</Text>
                        <Text style={[styles.detailValue, { color: textColor }]}>
                            {vehicle?.fecha_creacion
                                ? new Date(vehicle.fecha_creacion).toLocaleDateString()
                                : 'No disponible'}
                        </Text>
                    </View>
                </Card>

                {/* Sección de últimos mantenimientos */}
                <Card style={styles.maintenanceCard}>
                    <View style={styles.maintenanceHeader}>
                        <Text style={[styles.sectionTitle, { color: textColor }]}>
                            Últimos Mantenimientos
                        </Text>

                        <TouchableOpacity onPress={navigateToMaintenanceHistory}>
                            <Text style={[styles.viewAllText, { color: theme === 'dark' ? '#B27046' : '#9D7E68' }]}>
                                Ver todos
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {recentMaintenances.length > 0 ? (
                        <>
                            {recentMaintenances.map((maintenance) => (
                                <View
                                    key={maintenance.id_registro}
                                    style={[
                                        styles.maintenanceItem,
                                        { borderColor: borderColor }
                                    ]}
                                >
                                    <View style={styles.maintenanceItemHeader}>
                                        <Text style={[styles.maintenanceType, { color: textColor }]}>
                                            {maintenance.tipo_mantenimiento?.nombre || 'Mantenimiento'}
                                        </Text>
                                        <Text style={[styles.maintenanceCost, { color: theme === 'dark' ? '#B27046' : '#9D7E68' }]}>
                                            ${Number(maintenance.costo).toFixed(2)}
                                        </Text>
                                    </View>
                                    <View style={styles.maintenanceItemDetails}>
                                        <Text style={[styles.dateText, { color: secondaryTextColor }]}>
                                            {formatDate(maintenance.fecha)}
                                        </Text>
                                        <Text style={[styles.kmText, { color: secondaryTextColor }]}>
                                            {maintenance.kilometraje.toLocaleString()} km
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </>
                    ) : (
                        <View style={styles.emptyStateContainer}>
                            <Text style={[styles.emptyStateText, { color: secondaryTextColor }]}>
                                No hay registros de mantenimiento
                            </Text>
                        </View>
                    )}

                    <Button
                        buttonVariant="outline"
                        buttonSize="medium"
                        onPress={navigateToAddMaintenance}
                        style={styles.addMaintenanceButton}
                    >
                        Registrar Mantenimiento
                    </Button>
                </Card>

                {/* Acciones */}
                <View style={styles.actionsContainer}>
                    <Button
                        buttonVariant="primary"
                        buttonSize="medium"
                        onPress={handleUpdateKilometrage}
                        style={styles.updateKmButton}
                    >
                        Actualizar Kilometraje
                    </Button>

                    <Button
                        buttonVariant="outline"
                        buttonSize="medium"
                        onPress={navigateToEdit}
                        style={styles.editButton}
                    >
                        Editar Vehículo
                    </Button>
                </View>
            </ScrollView>
        </View>
    );
};

// Función auxiliar para obtener el nombre del color
const getColorName = (colorHex: string): string => {
    const colors = [
        { hex: '#000000', name: 'Negro' },
        { hex: '#FFFFFF', name: 'Blanco' },
        { hex: '#9E9E9E', name: 'Gris' },
        { hex: '#C0C0C0', name: 'Plata' },
        { hex: '#F44336', name: 'Rojo' },
        { hex: '#0000FF', name: 'Azul' },
        { hex: '#4CAF50', name: 'Verde' },
        { hex: '#FFEB3B', name: 'Amarillo' },
        { hex: '#A52A2A', name: 'Naranja' },
        { hex: '#800000', name: 'Vino' }
    ];

    const color = colors.find(c => c.hex.toLowerCase() === colorHex.toLowerCase());
    return color ? color.name : 'Personalizado';
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    loadingText: {
        fontSize: 16,
        marginTop: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
    },
    backButton: {
        marginTop: 16,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    headerActions: {
        flexDirection: 'row',
    },
    headerButton: {
        marginLeft: 8,
    },
    vehicleInfoContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    colorIndicator: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    plateText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    nameText: {
        fontSize: 18,
    },
    detailsCard: {
        padding: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    detailLabel: {
        fontSize: 16,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '500',
    },
    colorDetail: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    colorSwatch: {
        width: 20,
        height: 20,
        borderRadius: 4,
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    maintenanceCard: {
        padding: 16,
        marginBottom: 24,
    },
    maintenanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '500',
    },
    maintenanceItem: {
        padding: 12,
        borderBottomWidth: 1,
        marginBottom: 8,
    },
    maintenanceItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
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
    emptyStateContainer: {
        padding: 16,
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 14,
        textAlign: 'center',
    },
    addMaintenanceButton: {
        marginTop: 16,
    },
    actionsContainer: {
        gap: 4,
    },
    updateKmButton: {
        marginBottom: 8,
    },
    editButton: {
        marginBottom: 8,
    },
});

export default VehicleDetailScreen;