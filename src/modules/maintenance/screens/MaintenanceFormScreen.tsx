// src/modules/maintenance/screens/MaintenanceFormScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { GradientHeader } from '@/src/shared/components/ui/GradientHeader';
import { Button } from '@/src/shared/components/ui/Button';
import { useVehicles } from '@/src/modules/vehicles/hooks/useVehicles';
import { useMaintenance } from '../hooks/useMaintenance';
import MaintenanceForm from '../components/MaintenanceForm';
import { MaintenanceRecordCreate } from '../models/maintenance';

export const MaintenanceFormScreen: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{ vehicleId: string }>();
    const { theme } = useAppTheme();

    const vehicleId = params.vehicleId ? parseInt(params.vehicleId) : 0;
    const { vehicles, loadVehicles } = useVehicles();
    const {
        createMaintenanceRecord,
        categories,
        maintenanceTypes,
        loadCategories,
        loadMaintenanceTypes,
        isLoading
    } = useMaintenance(vehicleId);

    const [initialized, setInitialized] = useState(false);
    const vehicle = vehicles.find(v => v.id_vehiculo === vehicleId);

    // Cargar datos necesarios al iniciar
    useEffect(() => {
        const init = async () => {
            if (vehicleId) {
                // Cargar el vehículo si no lo tenemos
                if (!vehicle) {
                    await loadVehicles();
                }

                // Cargar categorías y tipos de mantenimiento
                await Promise.all([
                    loadCategories(),
                    loadMaintenanceTypes()
                ]);

                setInitialized(true);
            } else {
                // Redirigir si no hay ID de vehículo
                Alert.alert(
                    'Error',
                    'No se especificó un vehículo',
                    [{
                        text: 'Volver',
                        onPress: () => router.back()
                    }]
                );
            }
        };

        init();
    }, [vehicleId, vehicle, loadVehicles, loadCategories, loadMaintenanceTypes, router]);

    // Si no hay vehículo o los datos no se han inicializado aún, mostrar cargando
    if (!vehicle || !initialized) {
        return (
            <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#111111' : '#FFFFFF' }]}>
                <GradientHeader
                    title="Registrar Mantenimiento"
                    showBackButton={true}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme === 'dark' ? '#B27046' : '#9D7E68'} />
                    <Text style={{ color: theme === 'dark' ? '#F9F9F9' : '#313131', marginTop: 16 }}>
                        Cargando...
                    </Text>
                </View>
            </View>
        );
    }

    // Manejar envío del formulario
    const handleSubmit = async (data: MaintenanceRecordCreate) => {
        try {
            const result = await createMaintenanceRecord({
                ...data,
                id_vehiculo: vehicleId
            });

            if (result.success) {
                Alert.alert(
                    'Éxito',
                    'Mantenimiento registrado correctamente',
                    [{
                        text: 'Ver detalles',
                        onPress: () => router.replace(`/vehicles/${vehicleId}`)
                    }]
                );
            } else {
                Alert.alert('Error', result.error || 'No se pudo registrar el mantenimiento');
            }
        } catch (error) {
            Alert.alert('Error', 'Ocurrió un error al procesar la solicitud');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#111111' : '#FFFFFF' }]}>
            <GradientHeader
                title="Registrar Mantenimiento"
                showBackButton={true}
            />

            <MaintenanceForm
                vehicleId={vehicleId}
                onSubmit={handleSubmit}
                isLoading={isLoading}
            />

            <View style={styles.bottomButtons}>
                <Button
                    buttonVariant="outline"
                    buttonSize="large"
                    onPress={() => router.back()}
                    style={styles.cancelButton}
                >
                    Cancelar
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomButtons: {
        padding: 16,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    cancelButton: {
        marginBottom: 8,
    }
});

export default MaintenanceFormScreen;