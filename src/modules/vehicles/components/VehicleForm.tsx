// src/modules/vehicles/components/VehicleForm.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Input } from '@/src/shared/components/ui/Input';
import { Button } from '@/src/shared/components/ui/Button';
import BrandModelSelect from './BrandModelSelect';
import { Vehicle } from '../models/vehicle';
import { useVehicles } from '../hooks/useVehicles';

// Colores disponibles para seleccionar
const VEHICLE_COLORS = [
    { name: 'Negro', value: '#000000' },
    { name: 'Blanco', value: '#FFFFFF' },
    { name: 'Gris', value: '#9E9E9E' },
    { name: 'Plata', value: '#C0C0C0' },
    { name: 'Rojo', value: '#F44336' },
    { name: 'Azul', value: '#0000FF' },
    { name: 'Verde', value: '#4CAF50' },
    { name: 'Amarillo', value: '#FFEB3B' },
    { name: 'Naranja', value: '#A52A2A' },
    { name: 'Vino', value: '#800000' }
];

// Esquema de validación con Zod
const vehicleSchema = z.object({
    placa: z.string()
        .min(1, 'La placa es requerida')
        .max(10, 'La placa no puede tener más de 10 caracteres'),
    anio: z.string()
        .min(1, 'El año es requerido')
        .refine(val => !isNaN(Number(val)), 'Debe ser un número válido')
        .refine(val => Number(val) >= 1900 && Number(val) <= new Date().getFullYear() + 1,
            `El año debe estar entre 1900 y ${new Date().getFullYear() + 1}`),
    kilometraje_actual: z.string()
        .min(1, 'El kilometraje es requerido')
        .refine(val => !isNaN(Number(val)), 'Debe ser un número válido')
        .refine(val => Number(val) >= 0, 'El kilometraje no puede ser negativo'),
});

// Tipo inferido del esquema
type VehicleFormData = z.infer<typeof vehicleSchema>;

interface VehicleFormProps {
    initialData?: Vehicle;
    onSubmit: (vehicle: Vehicle) => void;
    isLoading: boolean;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({
    initialData,
    onSubmit,
    isLoading
}) => {
    const { theme } = useAppTheme();
    const {
        brands,
        models,
        loadModelsByBrand,
        createCustomModel,
        isLoading: apiLoading,
        error: apiError,
        clearError
    } = useVehicles();

    // Estado para los campos adicionales que no maneja React Hook Form
    const [selectedBrandId, setSelectedBrandId] = useState<number | null>(initialData?.id_marca || null);
    const [selectedModelId, setSelectedModelId] = useState<number | null>(initialData?.id_modelo || null);
    const [selectedColor, setSelectedColor] = useState<string>(initialData?.color || '');
    const [formError, setFormError] = useState<string | null>(null);
    const [isFormInitialized, setIsFormInitialized] = useState(false);

    // Configurar React Hook Form con Zod
    const { control, handleSubmit, formState: { errors }, setValue, reset } = useForm<VehicleFormData>({
        resolver: zodResolver(vehicleSchema),
        defaultValues: {
            placa: initialData?.placa || '',
            anio: initialData?.anio ? initialData.anio.toString() : '',
            kilometraje_actual: initialData?.kilometraje_actual ? initialData.kilometraje_actual.toString() : '',
        }
    });

    // Inicializar el formulario con datos iniciales cuando cambian
    useEffect(() => {
        if (initialData && !isFormInitialized) {
            // Actualizar los campos de React Hook Form
            reset({
                placa: initialData.placa || '',
                anio: initialData.anio ? initialData.anio.toString() : '',
                kilometraje_actual: initialData.kilometraje_actual ? initialData.kilometraje_actual.toString() : '',
            });

            // Actualizar estados adicionales
            setSelectedBrandId(initialData.id_marca || null);
            setSelectedModelId(initialData.id_modelo || null);
            setSelectedColor(initialData.color || '');

            // Cargar modelos si hay una marca seleccionada
            if (initialData.id_marca) {
                loadModelsByBrand(initialData.id_marca);
            }

            setIsFormInitialized(true);
        }
    }, [initialData, reset, loadModelsByBrand, isFormInitialized]);

    // Cargar modelos cuando cambia la marca seleccionada
    const handleSelectBrand = async (brandId: number) => {
        setSelectedBrandId(brandId);
        setSelectedModelId(null);
        await loadModelsByBrand(brandId);
    };

    // Seleccionar un modelo
    const handleSelectModel = (modelId: number) => {
        setSelectedModelId(modelId);
    };

    // Crear modelo personalizado
    const handleCreateCustomModel = async (modelName: string) => {
        if (!selectedBrandId) return;

        const result = await createCustomModel({
            id_marca: selectedBrandId,
            nombre: modelName
        });

        if (result.success && result.data) {
            setSelectedModelId(result.data.id_modelo);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    // Seleccionar un color
    const handleSelectColor = (color: string) => {
        setSelectedColor(color);
        Haptics.selectionAsync();
    };

    // Validar y enviar formulario
    const handleFormSubmit = (data: VehicleFormData) => {
        // Validar campos obligatorios que no maneja React Hook Form
        if (!selectedBrandId) {
            setFormError('Debe seleccionar una marca');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        if (!selectedModelId) {
            setFormError('Debe seleccionar un modelo');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        setFormError(null);

        // Preparar datos para enviar
        const vehicleData: Vehicle = {
            ...(initialData?.id_vehiculo && { id_vehiculo: initialData.id_vehiculo }),
            placa: data.placa,
            id_marca: selectedBrandId,
            id_modelo: selectedModelId,
            anio: parseInt(data.anio),
            kilometraje_actual: parseInt(data.kilometraje_actual),
            color: selectedColor || undefined
        };

        onSubmit(vehicleData);
    };

    // Cancelar y volver atrás
    const handleCancel = () => {
        // Aquí podrías implementar la navegación hacia atrás
        // Por ejemplo: router.back();
    };

    // Colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const containerBg = theme === 'dark' ? '#111111' : '#FFFFFF';

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: containerBg }]}
            contentContainerStyle={styles.contentContainer}
        >
            {/* Placa */}
            <Controller
                control={control}
                name="placa"
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        label="Número de placa (opcional)"
                        placeholder="ABC-123"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.placa?.message}
                        autoCapitalize="characters"
                    />
                )}
            />

            {/* Selector de Marca y Modelo */}
            <BrandModelSelect
                brands={brands}
                models={models}
                isLoading={apiLoading}
                selectedBrandId={selectedBrandId}
                selectedModelId={selectedModelId}
                onSelectBrand={handleSelectBrand}
                onSelectModel={handleSelectModel}
                onCreateCustomModel={handleCreateCustomModel}
                error={apiError}
            />

            {/* Año */}
            <Controller
                control={control}
                name="anio"
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        label="Año de fabricación *"
                        placeholder="2024"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.anio?.message}
                        keyboardType="numeric"
                    />
                )}
            />

            {/* Kilometraje */}
            <Controller
                control={control}
                name="kilometraje_actual"
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        label="Kilometraje actual *"
                        placeholder="45000"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.kilometraje_actual?.message}
                        keyboardType="numeric"
                    />
                )}
            />

            {/* Selector de Color */}
            <Text style={[styles.colorLabel, { color: textColor }]}>
                Color del vehículo
            </Text>
            <View style={styles.colorPickerContainer}>
                {VEHICLE_COLORS.map(color => (
                    <TouchableOpacity
                        key={color.value}
                        style={[
                            styles.colorOption,
                            { backgroundColor: color.value },
                            selectedColor === color.value && styles.selectedColorOption
                        ]}
                        onPress={() => handleSelectColor(color.value)}
                        accessibilityLabel={`Color ${color.name}`}
                    />
                ))}
            </View>

            {/* Error del formulario */}
            {formError && (
                <Text style={styles.formErrorText}>
                    {formError}
                </Text>
            )}

            {/* Botones de acción */}
            <View style={styles.buttonContainer}>
                <Button
                    buttonVariant="outline"
                    buttonSize="small"
                    style={styles.cancelButton}
                    onPress={handleCancel}
                >
                    Cancelar
                </Button>

                <Button
                    buttonVariant="primary"
                    buttonSize="small"
                    style={styles.submitButton}
                    onPress={handleSubmit(handleFormSubmit)}
                    isLoading={isLoading}
                >
                    Guardar Vehículo
                </Button>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    colorLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        marginTop: 16,
    },
    colorPickerContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    colorOption: {
        width: 32,
        height: 32,
        borderRadius: 16,
        margin: 4,
        borderWidth: 1,
        borderColor: '#DDDDDD',
    },
    selectedColorOption: {
        borderWidth: 3,
        borderColor: '#9D7E68',
    },
    formErrorText: {
        color: '#CF6679',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    cancelButton: {
        flex: 1,
        marginRight: 8,
    },
    submitButton: {
        flex: 1,
        marginLeft: 8,
    },
});

export default VehicleForm;