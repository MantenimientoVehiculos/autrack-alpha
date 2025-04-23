// src/modules/maintenance/components/MaintenanceForm.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Input } from '@/src/shared/components/ui/Input';
import { Button } from '@/src/shared/components/ui/Button';
import TypeCategorySelect from './TypeCategorySelect';
import { MaintenanceRecordCreate } from '../models/maintenance';
import { useMaintenance } from '../hooks/useMaintenance';

// Esquema de validación con Zod
const maintenanceSchema = z.object({
    fecha: z.string()
        .min(1, 'La fecha es requerida'),
    kilometraje: z.string()
        .min(1, 'El kilometraje es requerido')
        .refine(val => !isNaN(Number(val)), 'Debe ser un número válido')
        .refine(val => Number(val) >= 0, 'El kilometraje no puede ser negativo'),
    costo: z.string()
        .min(1, 'El costo es requerido')
        .refine(val => !isNaN(Number(val)), 'Debe ser un número válido')
        .refine(val => Number(val) >= 0, 'El costo no puede ser negativo'),
    notas: z.string().optional(),
    frecuencia_cambio_meses: z.string()
        .refine(val => val === '' || !isNaN(Number(val)), 'Debe ser un número válido')
        .refine(val => val === '' || Number(val) >= 0, 'La frecuencia no puede ser negativa')
        .optional(),
    frecuencia_cambio_km: z.string()
        .refine(val => val === '' || !isNaN(Number(val)), 'Debe ser un número válido')
        .refine(val => val === '' || Number(val) >= 0, 'La frecuencia no puede ser negativa')
        .optional(),
    costo_estimado: z.string()
        .refine(val => val === '' || !isNaN(Number(val)), 'Debe ser un número válido')
        .refine(val => val === '' || Number(val) >= 0, 'El costo estimado no puede ser negativo')
        .optional(),
});

// Tipo inferido del esquema
type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

interface MaintenanceFormProps {
    vehicleId: number;
    onSubmit: (data: MaintenanceRecordCreate) => Promise<void>;
    isLoading: boolean;
}

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
    vehicleId,
    onSubmit,
    isLoading
}) => {
    const { theme } = useAppTheme();
    const {
        categories,
        maintenanceTypes,
        maintenanceRecords,
        createCustomMaintenanceType,
        isLoading: typesLoading,
        error: typesError,
        clearError
    } = useMaintenance(vehicleId);

    // Estado para categoría y tipo seleccionados
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [isFirstTimeConfig, setIsFirstTimeConfig] = useState<boolean>(false);
    const [showConfigFields, setShowConfigFields] = useState<boolean>(false);

    // Obtener fecha actual en formato YYYY-MM-DD
    const getCurrentDate = (): string => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Configurar React Hook Form con Zod
    const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<MaintenanceFormData>({
        resolver: zodResolver(maintenanceSchema),
        defaultValues: {
            fecha: getCurrentDate(),
            kilometraje: '',
            costo: '',
            notas: '',
            frecuencia_cambio_meses: '6',
            frecuencia_cambio_km: '5000',
            costo_estimado: '',
        }
    });

    // Observar el tipo de mantenimiento seleccionado
    useEffect(() => {
        if (selectedTypeId && maintenanceRecords.length > 0) {
            // Comprobar si ya existe un registro de este tipo para este vehículo
            const existingRecord = maintenanceRecords.find(
                record => record.id_tipo === selectedTypeId && record.id_vehiculo === vehicleId
            );

            // Si no existe registro previo, es primera configuración
            const isFirstTime = !existingRecord;
            setIsFirstTimeConfig(isFirstTime);
            setShowConfigFields(isFirstTime);
        } else if (selectedTypeId) {
            // Si no hay registros, es primera configuración
            setIsFirstTimeConfig(true);
            setShowConfigFields(true);
        } else {
            setIsFirstTimeConfig(false);
            setShowConfigFields(false);
        }
    }, [selectedTypeId, maintenanceRecords, vehicleId]);

    // Cargar kilometraje del vehículo al iniciar
    useEffect(() => {
        // Aquí podrías cargar el kilometraje actual del vehículo
        // y asignarlo al campo de kilometraje
        // Por ejemplo:
        // setValue('kilometraje', vehicle.kilometraje_actual.toString());
    }, []);

    // Manejar selección de categoría
    const handleSelectCategory = (categoryId: number) => {
        setSelectedCategoryId(categoryId);
        setSelectedTypeId(null);
        clearError();
    };

    // Manejar selección de tipo
    const handleSelectType = (typeId: number) => {
        setSelectedTypeId(typeId);
        clearError();
    };

    // Crear tipo personalizado
    const handleCreateCustomType = async (data: { id_categoria: number, nombre: string, descripcion: string }) => {
        if (!data.id_categoria) {
            Alert.alert('Error', 'Primero debe seleccionar una categoría');
            return;
        }

        const result = await createCustomMaintenanceType(data);
        if (result.success && result.data) {
            setSelectedTypeId(result.data.id_tipo);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    // Validar y enviar formulario
    const handleFormSubmit = (data: MaintenanceFormData) => {
        // Validar campos obligatorios
        if (!selectedTypeId) {
            setFormError('Debe seleccionar un tipo de mantenimiento');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        setFormError(null);

        // Preparar datos para enviar
        const maintenanceData: MaintenanceRecordCreate = {
            id_vehiculo: vehicleId,
            id_tipo: selectedTypeId,
            fecha: data.fecha,
            kilometraje: parseInt(data.kilometraje),
            costo: parseFloat(data.costo),
            notas: data.notas || undefined,
        };

        // Añadir configuración solo si es primera vez para este tipo de mantenimiento
        if (isFirstTimeConfig) {
            maintenanceData.frecuencia_cambio_meses = data.frecuencia_cambio_meses ? parseInt(data.frecuencia_cambio_meses) : undefined;
            maintenanceData.frecuencia_cambio_km = data.frecuencia_cambio_km ? parseInt(data.frecuencia_cambio_km) : undefined;
            maintenanceData.costo_estimado = data.costo_estimado ? parseFloat(data.costo_estimado) : undefined;
        }

        onSubmit(maintenanceData);
    };

    // Colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const containerBg = theme === 'dark' ? '#111111' : '#FFFFFF';

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: containerBg }]}
            contentContainerStyle={styles.contentContainer}
        >
            {/* Selector de Categoría y Tipo */}
            <TypeCategorySelect
                categories={categories}
                maintenanceTypes={maintenanceTypes}
                isLoading={typesLoading}
                selectedCategoryId={selectedCategoryId}
                selectedTypeId={selectedTypeId}
                onSelectCategory={handleSelectCategory}
                onSelectType={handleSelectType}
                onCreateCustomType={handleCreateCustomType}
                error={typesError}
            />

            {/* Fecha */}
            <Controller
                control={control}
                name="fecha"
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        label="Fecha del mantenimiento *"
                        placeholder="YYYY-MM-DD"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.fecha?.message}
                        keyboardType="default"
                    />
                )}
            />

            {/* Kilometraje */}
            <Controller
                control={control}
                name="kilometraje"
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        label="Kilometraje al momento del servicio *"
                        placeholder="45000"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.kilometraje?.message}
                        keyboardType="numeric"
                    />
                )}
            />

            {/* Costo */}
            <Controller
                control={control}
                name="costo"
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        label="Costo del servicio ($) *"
                        placeholder="180.50"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.costo?.message}
                        keyboardType="numeric"
                    />
                )}
            />

            {/* Notas */}
            <Controller
                control={control}
                name="notas"
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        label="Notas o detalles adicionales"
                        placeholder="Detalles del servicio, repuestos, etc."
                        value={value || ''}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.notas?.message}
                        multiline
                        numberOfLines={3}
                    />
                )}
            />

            {/* Sección de configuración de programación (solo se muestra si es primera vez) */}
            {showConfigFields && (
                <>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>
                        Programación de mantenimiento
                    </Text>
                    <Text style={[styles.sectionDescription, { color: secondaryTextColor }]}>
                        Establece cada cuánto tiempo o kilometraje debería realizarse este mantenimiento para futuras alertas.
                    </Text>
                    <View style={styles.configInfoContainer}>
                        <Text style={[styles.configInfoText, { color: theme === 'dark' ? '#B27046' : '#9D7E68' }]}>
                            Este es el primer registro de este tipo de mantenimiento para este vehículo.
                            La configuración que establezca se utilizará para programar los próximos mantenimientos.
                        </Text>
                    </View>

                    {/* Frecuencia en meses */}
                    <Controller
                        control={control}
                        name="frecuencia_cambio_meses"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Frecuencia en meses"
                                placeholder="6"
                                value={value || ''}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.frecuencia_cambio_meses?.message}
                                keyboardType="numeric"
                            />
                        )}
                    />

                    {/* Frecuencia en kilómetros */}
                    <Controller
                        control={control}
                        name="frecuencia_cambio_km"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Frecuencia en kilómetros"
                                placeholder="5000"
                                value={value || ''}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.frecuencia_cambio_km?.message}
                                keyboardType="numeric"
                            />
                        )}
                    />

                    {/* Costo estimado */}
                    <Controller
                        control={control}
                        name="costo_estimado"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Costo estimado para próximo servicio ($)"
                                placeholder="180.00"
                                value={value || ''}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.costo_estimado?.message}
                                keyboardType="numeric"
                            />
                        )}
                    />
                </>
            )}

            {/* Error del formulario */}
            {formError && (
                <Text style={styles.formErrorText}>
                    {formError}
                </Text>
            )}

            {/* Botones de acción */}
            <View style={styles.buttonContainer}>
                <Button
                    buttonVariant="primary"
                    buttonSize="large"
                    onPress={handleSubmit(handleFormSubmit)}
                    isLoading={isLoading}
                    style={styles.submitButton}
                >
                    Guardar Mantenimiento
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
        paddingBottom: 90, // Añadir espacio extra para evitar que el botón flotante tape contenido
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: 14,
        marginBottom: 16,
    },
    configInfoContainer: {
        backgroundColor: 'rgba(157, 126, 104, 0.1)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    configInfoText: {
        fontSize: 14,
    },
    formErrorText: {
        color: '#CF6679',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    buttonContainer: {
        marginTop: 24,
    },
    submitButton: {
        width: '100%',
    },
});

export default MaintenanceForm;