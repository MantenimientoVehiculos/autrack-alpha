// src/modules/reports/components/ReportForm.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Input } from '@/src/shared/components/ui/Input';
import { Button } from '@/src/shared/components/ui/Button';
import { useVehicles } from '@/src/modules/vehicles/hooks/useVehicles';
import { Card } from '@/src/shared/components/ui/Card';
import { ReportFilter } from '../models/report';
import ReportTypeSelector from './ReportTypeSelector';
import { ChevronRight } from '@/src/shared/components/ui/Icons';

// Esquema de validación para el formulario
const reportFilterSchema = z.object({
    id_vehiculo: z.number().min(1, 'Debe seleccionar un vehículo'),
    fecha_inicio: z.string().optional(),
    fecha_fin: z.string().optional(),
    kilometraje_minimo: z.string().optional(),
    kilometraje_maximo: z.string().optional(),
    formato: z.enum(['pdf', 'excel', 'csv'])
}).refine(data => {
    // Si ambos están definidos, verificar que mínimo <= máximo
    if (data.kilometraje_minimo !== undefined && data.kilometraje_maximo !== undefined) {
        return data.kilometraje_minimo <= data.kilometraje_maximo;
    }
    return true;
}, {
    message: "El kilometraje mínimo debe ser menor o igual al máximo",
    path: ["kilometraje_maximo"]
});

// Props para el componente
interface ReportFormProps {
    onSubmit: (data: ReportFilter) => void;
    initialValues?: Partial<ReportFilter>;
    dateRange?: { min: string, max: string } | null;
    kmRange?: { min: number, max: number } | null;
    availableTypes?: { id: number, nombre: string }[];
    isLoading?: boolean;
    error?: string | null;
}

export const ReportForm: React.FC<ReportFormProps> = ({
    onSubmit,
    initialValues,
    dateRange,
    kmRange,
    availableTypes = [],
    isLoading = false,
    error
}) => {
    const { theme } = useAppTheme();
    const { vehicles, loadVehicles } = useVehicles();
    const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
    const [showTypeSelector, setShowTypeSelector] = useState(false);

    // Configurar React Hook Form con Zod
    const { control, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<z.infer<typeof reportFilterSchema>>({
        resolver: zodResolver(reportFilterSchema),
        defaultValues: {
            id_vehiculo: initialValues?.id_vehiculo || 0,
            fecha_inicio: initialValues?.fecha_inicio || '',
            fecha_fin: initialValues?.fecha_fin || '',
            kilometraje_minimo: initialValues?.kilometraje_minimo?.toString() || '',
            kilometraje_maximo: initialValues?.kilometraje_maximo?.toString() || '',
            formato: initialValues?.formato || 'pdf' as const
        }
    });

    // Vigilar el vehículo seleccionado
    const vehicleId = watch('id_vehiculo');

    // Cargar vehículos si no están cargados
    useEffect(() => {
        if (vehicles.length === 0) {
            loadVehicles();
        }
    }, [vehicles, loadVehicles]);

    // Actualizar campos cuando cambian los rangos
    useEffect(() => {
        if (dateRange) {
            setValue('fecha_inicio', dateRange.min);
            setValue('fecha_fin', dateRange.max);
        }

        if (kmRange) {
            setValue('kilometraje_minimo', kmRange.min.toString());
            setValue('kilometraje_maximo', kmRange.max.toString());
        }
    }, [dateRange, kmRange, setValue]);

    // Actualizar valores iniciales cuando cambian
    useEffect(() => {
        if (initialValues) {
            reset({
                id_vehiculo: initialValues.id_vehiculo || 0,
                fecha_inicio: initialValues.fecha_inicio || '',
                fecha_fin: initialValues.fecha_fin || '',
                kilometraje_minimo: initialValues.kilometraje_minimo?.toString() || '',
                kilometraje_maximo: initialValues.kilometraje_maximo?.toString() || '',
                formato: initialValues.formato || 'pdf'
            });

            if (initialValues.tipos_mantenimiento) {
                setSelectedTypes(initialValues.tipos_mantenimiento);
            }
        }
    }, [initialValues, reset]);

    // Manejar selección de tipos de mantenimiento
    const handleTypesSelected = (types: number[]) => {
        setSelectedTypes(types);
        setShowTypeSelector(false);
    };

    // Manejar envío del formulario
    const handleFormSubmit = (data: z.infer<typeof reportFilterSchema>) => {
        // Convertir valores a su tipo correcto
        const formattedData: ReportFilter = {
            ...data,
            kilometraje_minimo: data.kilometraje_minimo !== undefined ? Number(data.kilometraje_minimo) : undefined,
            kilometraje_maximo: data.kilometraje_maximo !== undefined ? Number(data.kilometraje_maximo) : undefined,
            tipos_mantenimiento: selectedTypes.length > 0 ? selectedTypes : undefined
        };

        onSubmit(formattedData);
    };

    // Obtener colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const subtitleColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const bgColor = theme === 'dark' ? '#222222' : '#FFFFFF';
    const borderColor = theme === 'dark' ? '#444444' : '#DDDDDD';

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollContainer}>
                {/* Selector de Vehículo */}
                <Text style={[styles.sectionTitle, { color: textColor }]}>Vehículo</Text>
                <Controller
                    control={control}
                    name="id_vehiculo"
                    render={({ field: { onChange, value } }) => (
                        <View style={styles.selectContainer}>
                            <Text style={[styles.label, { color: textColor }]}>Seleccione un vehículo *</Text>
                            <View style={[
                                styles.vehicleSelector,
                                { borderColor: borderColor, backgroundColor: bgColor }
                            ]}>
                                {vehicles.map(vehicle => (
                                    <TouchableOpacity
                                        key={vehicle.id_vehiculo}
                                        style={[
                                            styles.vehicleOption,
                                            value === vehicle.id_vehiculo && {
                                                backgroundColor: theme === 'dark' ? '#3A3A3A' : '#F0F0F0'
                                            }
                                        ]}
                                        onPress={() => onChange(vehicle.id_vehiculo)}
                                    >
                                        <Text style={{ color: textColor }}>
                                            {vehicle.marca?.nombre} {vehicle.modelo?.nombre} ({vehicle.placa})
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {errors.id_vehiculo && (
                                <Text style={styles.errorText}>{errors.id_vehiculo.message}</Text>
                            )}
                        </View>
                    )}
                />

                {/* Período de fechas */}
                <Text style={[styles.sectionTitle, { color: textColor }]}>Período</Text>
                <View style={styles.row}>
                    <Controller
                        control={control}
                        name="fecha_inicio"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.halfField}>
                                <Text style={[styles.label, { color: textColor }]}>Desde</Text>
                                <Input
                                    value={value || ''}
                                    onChangeText={onChange}
                                    placeholder="AAAA-MM-DD"
                                    keyboardType="default"
                                    error={errors.fecha_inicio?.message}
                                />
                            </View>
                        )}
                    />
                    <Controller
                        control={control}
                        name="fecha_fin"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.halfField}>
                                <Text style={[styles.label, { color: textColor }]}>Hasta</Text>
                                <Input
                                    value={value || ''}
                                    onChangeText={onChange}
                                    placeholder="AAAA-MM-DD"
                                    keyboardType="default"
                                    error={errors.fecha_fin?.message}
                                />
                            </View>
                        )}
                    />
                </View>

                {/* Rango de Kilometraje */}
                <Text style={[styles.sectionTitle, { color: textColor }]}>Kilometraje</Text>
                <View style={styles.row}>
                    <Controller
                        control={control}
                        name="kilometraje_minimo"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.halfField}>
                                <Text style={[styles.label, { color: textColor }]}>Mínimo</Text>
                                <Input
                                    value={value || ''}
                                    onChangeText={onChange}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    error={errors.kilometraje_minimo?.message}
                                />
                            </View>
                        )}
                    />
                    <Controller
                        control={control}
                        name="kilometraje_maximo"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.halfField}>
                                <Text style={[styles.label, { color: textColor }]}>Máximo</Text>
                                <Input
                                    value={value || ''}
                                    onChangeText={onChange}
                                    placeholder="100000"
                                    keyboardType="numeric"
                                    error={errors.kilometraje_maximo?.message}
                                />
                            </View>
                        )}
                    />
                </View>

                {/* Selector de Tipos de Mantenimiento */}
                <Text style={[styles.sectionTitle, { color: textColor }]}>Tipos de Mantenimiento</Text>
                <TouchableOpacity
                    style={[styles.typeSelector, { borderColor, backgroundColor: bgColor }]}
                    onPress={() => setShowTypeSelector(true)}
                >
                    <Text style={{ color: selectedTypes.length > 0 ? textColor : subtitleColor }}>
                        {selectedTypes.length > 0
                            ? `${selectedTypes.length} tipos seleccionados`
                            : 'Seleccionar tipos de mantenimiento'}
                    </Text>
                    <ChevronRight size={20} color={textColor} />
                </TouchableOpacity>

                {/* Formato de Exportación */}
                <Text style={[styles.sectionTitle, { color: textColor }]}>Formato de Exportación</Text>
                <Controller
                    control={control}
                    name="formato"
                    render={({ field: { onChange, value } }) => (
                        <View style={styles.formatOptions}>
                            {(['pdf', 'excel', 'csv'] as const).map(format => (
                                <TouchableOpacity
                                    key={format}
                                    style={[
                                        styles.formatOption,
                                        { borderColor },
                                        value === format && {
                                            backgroundColor: theme === 'dark' ? '#B27046' : '#9D7E68',
                                            borderColor: theme === 'dark' ? '#B27046' : '#9D7E68'
                                        }
                                    ]}
                                    onPress={() => onChange(format)}
                                >
                                    <Text style={{
                                        color: value === format ? '#FFFFFF' : textColor,
                                        fontWeight: value === format ? 'bold' : 'normal'
                                    }}>
                                        {format.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                />

                {/* Mensaje de error general */}
                {error && (
                    <Text style={styles.errorText}>{error}</Text>
                )}

                {/* Botón de Generar */}
                <Button
                    buttonVariant="primary"
                    buttonSize="large"
                    onPress={handleSubmit(handleFormSubmit)}
                    isLoading={isLoading}
                    style={styles.generateButton}
                >
                    Generar Reporte
                </Button>
            </ScrollView>

            {/* Modal para selección de tipos */}
            {showTypeSelector && (
                <ReportTypeSelector
                    types={availableTypes}
                    selectedIds={selectedTypes}
                    onConfirm={handleTypesSelected}
                    onCancel={() => setShowTypeSelector(false)}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfField: {
        width: '48%',
    },
    label: {
        fontSize: 14,
        marginBottom: 4,
    },
    selectContainer: {
        marginBottom: 16,
    },
    vehicleSelector: {
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 8,
    },
    vehicleOption: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    typeSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 16,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
    },
    formatOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    formatOption: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginHorizontal: 4,
        borderWidth: 1,
        borderRadius: 8,
    },
    errorText: {
        color: '#CF6679',
        fontSize: 14,
        marginTop: 4,
        marginBottom: 8,
    },
    generateButton: {
        marginVertical: 24,
    },
});

export default ReportForm;