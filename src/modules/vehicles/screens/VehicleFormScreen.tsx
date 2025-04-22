// src/modules/vehicles/screens/VehicleFormScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
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
    const isEditMode = !!vehicleId;

    // Cargar datos del vehículo para edición
    useEffect(() => {
        if (isEditMode) {
            const vehicle = vehicles.find(v => v.id_vehiculo === vehicleId);
            if (vehicle) {
                setInitialData(vehicle);
            } else {
                // Si no se encuentra el vehículo, cargar todos los vehículos
                loadVehicles();
            }
        }
    }, [isEditMode, vehicleId, vehicles, loadVehicles]);

    // Manejar envío del formulario
    const handleSubmit = async (data: Vehicle) => {
        let result;
        const { color, ...vehiculo } = data; // Desestructurar para evitar conflictos con el ID
        if (isEditMode && vehicleId) {
            // Actualizar vehículo existente
            result = await updateVehicle(vehicleId, vehiculo);
        } else {
            // Crear nuevo vehículo
            result = await createVehicle(vehiculo);
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
});

export default VehicleFormScreen;