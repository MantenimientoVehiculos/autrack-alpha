// src/modules/maintenance/screens/MaintenanceListScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { GradientHeader } from '@/src/shared/components/ui/GradientHeader';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import { PlusIcon } from '@/src/shared/components/ui/Icons';
import { useMaintenance } from '../hooks/useMaintenance';
import { useVehicles } from '@/src/modules/vehicles/hooks/useVehicles';
import MaintenanceCard from '../components/MaintenanceCard';

export const MaintenanceListScreen: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{ vehicleId: string }>();
    const { theme } = useAppTheme();
    const {
        maintenanceRecords,
        loadMaintenanceRecords,
        deleteMaintenanceRecord,
        isLoading,
        error
    } = useMaintenance();
    const { vehicles, loadVehicles } = useVehicles();
    const [refreshing, setRefreshing] = useState(false);

    const vehicleId = params.vehicleId ? parseInt(params.vehicleId) : 0;
    const vehicle = vehicles.find(v => v.id_vehiculo === vehicleId);

    // Cargar datos al montar el componente
    useEffect(() => {
        if (vehicleId) {
            loadMaintenanceRecords(vehicleId);
            if (!vehicle) {
                loadVehicles();
            }
        } else {
            router.replace('/vehicles');
        }
    }, [vehicleId, loadMaintenanceRecords, vehicle, loadVehicles, router]);

    // Manejar recarga manual
    const handleRefresh = async () => {
        setRefreshing(true);
        await loadMaintenanceRecords(vehicleId);
        setRefreshing(false);
    };

    // Navegar a la pantalla de añadir mantenimiento
    const navigateToAddMaintenance = () => {
        router.push(`/maintenance/add?vehicleId=${vehicleId}`);
    };

    // Manejar la eliminación de un registro de mantenimiento
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

    // Renderizar cada registro de mantenimiento
    const renderMaintenanceItem = ({ item }: any) => (
        <MaintenanceCard
            record={item}
            onDelete={handleDeleteMaintenance}
        />
    );

    // Renderizar mensaje cuando no hay registros
    const renderEmptyState = () => (
        <View style={styles.emptyStateContainer}>
            <Text style={[styles.emptyStateText, { color: theme === 'dark' ? '#F9F9F9' : '#313131' }]}>
                No hay registros de mantenimiento para este vehículo
            </Text>
            <Button
                buttonVariant="primary"
                buttonSize="medium"
                onPress={navigateToAddMaintenance}
                style={styles.addButton}
            >
                Registrar primer mantenimiento
            </Button>
        </View>
    );

    // Renderizar el botón de añadir mantenimiento (flotante)
    const renderAddButton = () => (
        <View style={styles.fabContainer}>
            <Button
                buttonVariant="primary"
                style={styles.fab}
                onPress={navigateToAddMaintenance}
            >
                <PlusIcon size={24} color="#FFFFFF" />
            </Button>
        </View>
    );

    // Colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const subtitleColor = theme === 'dark' ? '#BBBBBB' : '#666666';

    // Mensaje de error
    if (error) {
        return (
            <View style={styles.container}>
                <GradientHeader
                    title="Historial de Mantenimiento"
                    showBackButton={true}
                />
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: theme === 'dark' ? '#CF6679' : '#CF6679' }]}>
                        {error}
                    </Text>
                    <Button
                        buttonVariant="primary"
                        buttonSize="medium"
                        onPress={handleRefresh}
                        style={styles.retryButton}
                    >
                        Reintentar
                    </Button>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#111111' : '#FFFFFF' }]}>
            <GradientHeader
                title="Historial de Mantenimiento"
                showBackButton={true}
            />

            {vehicle && (
                <Card variant="filled" style={styles.vehicleInfoCard}>
                    <Text style={[styles.vehicleTitle, { color: textColor }]}>
                        {vehicle.marca?.nombre} {vehicle.modelo?.nombre}
                    </Text>
                    <Text style={[styles.vehicleSubtitle, { color: subtitleColor }]}>
                        {vehicle.placa} - {vehicle.anio}
                    </Text>
                </Card>
            )}

            <FlatList
                data={maintenanceRecords}
                renderItem={renderMaintenanceItem}
                keyExtractor={(item) => item.id_registro?.toString() || Math.random().toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme === 'dark' ? '#B27046' : '#9D7E68']}
                        tintColor={theme === 'dark' ? '#B27046' : '#9D7E68'}
                    />
                }
                ListEmptyComponent={!isLoading ? renderEmptyState : null}
            />

            {maintenanceRecords.length > 0 && renderAddButton()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    vehicleInfoCard: {
        marginVertical: 8,
        marginHorizontal: 16,
    },
    vehicleTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    vehicleSubtitle: {
        fontSize: 14,
    },
    listContent: {
        flexGrow: 1,
        paddingVertical: 8,
        paddingBottom: 80, // Para dar espacio al botón flotante
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        marginTop: 48,
    },
    emptyStateText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
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
    retryButton: {
        marginTop: 8,
    },
    addButton: {
        marginTop: 16,
    },
    fabContainer: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        zIndex: 999,
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});

export default MaintenanceListScreen;