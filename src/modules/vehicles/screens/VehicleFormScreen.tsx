// src/modules/vehicles/screens/VehicleFormScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { GradientHeader } from '@/src/shared/components/ui/GradientHeader';
import { useVehicles } from '../hooks/useVehicles';
import VehicleForm from '../components/VehicleForm';
import { Vehicle } from '../models/vehicle';

export const VehicleFormScreen: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{ id: string }>();
    const { theme } = useAppTheme();
    const {
        vehicles,
        createVehicle,
        updateVehicle,
        isLoading,
        loadVehicles,
    } = useVehicles();

    const vehicleId = params.id ? parseInt(params.id) : undefined;
    const [initialData, setInitialData] = useState<Vehicle | undefined>(undefined);
    const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
    const isEditMode = !!vehicleId;

    // Cargar datos del vehículo para edición
    useEffect(() => {
        const loadInitialData = async () => {
            if (isEditMode) {
                // Intentar encontrar el vehículo en el estado actual
                const vehicle = vehicles.find(v => v.id_vehiculo === vehicleId);

                if (vehicle) {
                    setInitialData(vehicle);
                    setIsDataLoaded(true);
                } else {
                    // Si no lo encuentra, cargar todos los vehículos
                    await loadVehicles();

                    // Después de cargar, intentar encontrar el vehículo nuevamente
                    const refreshedVehicle = vehicles.find(v => v.id_vehiculo === vehicleId);
                    if (refreshedVehicle) {
                        setInitialData(refreshedVehicle);
                    }
                    setIsDataLoaded(true);
                }
            } else {
                // Si no es modo edición, no hay datos iniciales que cargar
                setIsDataLoaded(true);
            }
        };

        loadInitialData();
    }, [isEditMode, vehicleId, vehicles, loadVehicles]);

    // Actualizar datos iniciales cuando cambia la lista de vehículos
    useEffect(() => {
        if (isEditMode && vehicles.length > 0) {
            const vehicle = vehicles.find(v => v.id_vehiculo === vehicleId);
            if (vehicle) {
                setInitialData(vehicle);
                setIsDataLoaded(true);
            }
        }
    }, [isEditMode, vehicleId, vehicles]);

    // Manejar envío del formulario
    const handleSubmit = async (data: Vehicle) => {
        const { id_vehiculo, ...rest } = data; // Desestructurar para evitar enviar idVehiculo al crear un nuevo vehículo
        let result;

        if (isEditMode && vehicleId) {
            // Para actualizar, aseguramos mantener el id_vehiculo y enviar los datos actualizados
            result = await updateVehicle(vehicleId, rest);
        } else {
            // Para crear, enviamos los datos completos
            result = await createVehicle(rest);
        }

        if (result.success) {
            Alert.alert(
                'Éxito',
                isEditMode
                    ? 'Vehículo actualizado correctamente.'
                    : 'Vehículo registrado correctamente.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/vehicles')
                    }
                ]
            );
        } else {
            Alert.alert(
                'Error',
                'Ha ocurrido un error. Intente de nuevo.'
            );
        }
    };

    // Mostrar pantalla de carga mientras se obtienen los datos iniciales
    if ((isEditMode && !isDataLoaded) || (isEditMode && isLoading)) {
        return (
            <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#111111' : '#FFFFFF' }]}>
                <GradientHeader
                    title={isEditMode ? 'Editar Vehículo' : 'Registrar Vehículo'}
                    showBackButton={true}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme === 'dark' ? '#B27046' : '#9D7E68'} />
                    <Text style={{ color: theme === 'dark' ? '#F9F9F9' : '#313131', marginTop: 16 }}>
                        Cargando datos del vehículo...
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#111111' : '#FFFFFF' }]}>
            <GradientHeader
                title={isEditMode ? 'Editar Vehículo' : 'Registrar Vehículo'}
                showBackButton={true}
            />

            <VehicleForm
                initialData={initialData}
                onSubmit={handleSubmit}
                isLoading={isLoading}
            />
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
        padding: 24,
    },
});

export default VehicleFormScreen;