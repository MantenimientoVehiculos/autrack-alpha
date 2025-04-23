// src/modules/vehicles/screens/VehicleListScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { useVehicles } from '../hooks/useVehicles';
import VehicleCard from '../components/VehicleCard';
import { Vehicle } from '../models/vehicle';
import { GradientHeader } from '@/src/shared/components/ui/GradientHeader';
import { Button } from '@/src/shared/components/ui/Button';
import { PlusIcon } from '@/src/shared/components/ui/Icons';
import { useAuth } from '@/src/modules/auth/context/AuthContext';

export const VehicleListScreen: React.FC = () => {
    const router = useRouter();
    const { theme } = useAppTheme();
    const { isAuthenticated } = useAuth();
    const { vehicles, isLoading, error, loadVehicles, deleteVehicle } = useVehicles();
    const [refreshing, setRefreshing] = useState(false);

    // Cargar vehículos al montar el componente
    useEffect(() => {
        if (isAuthenticated) {
            loadVehicles();
        }
    }, [isAuthenticated, loadVehicles]);

    // Manejar recarga manual
    const handleRefresh = async () => {
        setRefreshing(true);
        await loadVehicles();
        setRefreshing(false);
    };

    // Navegar a la pantalla de añadir vehículo
    const navigateToAddVehicle = () => {
        router.push('/vehicles/add');
    };

    // Manejar la eliminación de un vehículo
    const handleDeleteVehicle = (id: number) => {
        Alert.alert(
            'Eliminar vehículo',
            '¿Estás seguro que deseas eliminar este vehículo? Esta acción no se puede deshacer.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await deleteVehicle(id);
                        if (result.success) {
                            Alert.alert('Éxito', 'Vehículo eliminado correctamente');
                        } else {
                            Alert.alert('Error', result.error || 'No se pudo eliminar el vehículo');
                        }
                    }
                },
            ]
        );
    };

    // Renderizar cada vehículo
    const renderVehicle = ({ item }: { item: Vehicle }) => (
        <VehicleCard
            vehicle={item}
            onDelete={handleDeleteVehicle}
        />
    );

    // Renderizar mensaje cuando no hay vehículos
    const renderEmptyState = () => (
        <View style={styles.emptyStateContainer}>
            <Text style={[styles.emptyStateText, { color: theme === 'dark' ? '#F9F9F9' : '#313131' }]}>
                No tienes vehículos registrados
            </Text>
            <Button
                buttonVariant="primary"
                buttonSize="medium"
                onPress={navigateToAddVehicle}
                style={styles.addButton}
            >
                Agregar mi primer vehículo
            </Button>
        </View>
    );

    // Renderizar el botón de añadir vehículo (flotante)
    const renderAddButton = () => (
        <View style={styles.fabContainer}>
            <Button
                buttonVariant="primary"
                style={styles.fab}
                onPress={navigateToAddVehicle}
                buttonSize='noPadding'
            >
                <PlusIcon size={24} color="#FFFFFF" />
            </Button>
        </View>
    );

    // Mensaje de error
    if (error) {
        return (
            <View style={styles.container}>
                <GradientHeader title="Mis Vehículos" showBackButton={false} />
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
            <GradientHeader title="Mis Vehículos" showBackButton={false} />

            <FlatList
                data={vehicles}
                renderItem={renderVehicle}
                keyExtractor={(item) => item.id_vehiculo?.toString() || Math.random().toString()}
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

            {vehicles.length > 0 && renderAddButton()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        padding: 0,
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

export default VehicleListScreen;