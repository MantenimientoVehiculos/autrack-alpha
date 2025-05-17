import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Input } from '@/src/shared/components/ui/Input';
import { Button } from '@/src/shared/components/ui/Button';
import { useVehicles } from '@/src/modules/vehicles/hooks/useVehicles';
import { ReportFilter } from '../models/report';
import { ReportTypeSelector } from './ReportTypeSelector';

// Props para el componente
interface ReportFilterFormProps {
    onSubmit: (data: ReportFilter) => void;
    initialValues?: Partial<ReportFilter>;
    dateRange?: { min: string, max: string } | null;
    kmRange?: { min: number, max: number } | null;
    availableTypes?: { id: number, nombre: string }[];
    isLoading?: boolean;
    error?: string | null;
}

export const ReportFilterForm: React.FC<ReportFilterFormProps> = ({
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

    // Estado local
    const [filter, setFilter] = useState<ReportFilter>({
        id_vehiculo: initialValues?.id_vehiculo || 0,
        fecha_inicio: initialValues?.fecha_inicio || '',
        fecha_fin: initialValues?.fecha_fin || '',
        kilometraje_minimo: initialValues?.kilometraje_minimo,
        kilometraje_maximo: initialValues?.kilometraje_maximo,
        tipos_mantenimiento: initialValues?.tipos_mantenimiento || [],
        formato: initialValues?.formato || 'pdf'
    });

    const [showTypeSelector, setShowTypeSelector] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Cargar vehículos si no están cargados
    useEffect(() => {
        if (vehicles.length === 0) {
            loadVehicles();
        }
    }, [vehicles, loadVehicles]);

    // Actualizar valores cuando cambian los rangos
    useEffect(() => {
        const updates: Partial<ReportFilter> = {};

        if (dateRange) {
            updates.fecha_inicio = dateRange.min;
            updates.fecha_fin = dateRange.max;
        }

        if (kmRange) {
            updates.kilometraje_minimo = kmRange.min;
            updates.kilometraje_maximo = kmRange.max;
        }

        if (Object.keys(updates).length > 0) {
            setFilter(prev => ({
                ...prev,
                ...updates
            }));
        }
    }, [dateRange, kmRange]);

    // Actualizar valores iniciales cuando cambian
    useEffect(() => {
        if (initialValues) {
            // Conservar solo los valores definidos para no sobrescribir todo
            const definedValues: Partial<ReportFilter> = {};
            Object.entries(initialValues).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    definedValues[key as keyof ReportFilter] = value as any;
                }
            });

            setFilter(prev => ({
                ...prev,
                ...definedValues
            }));
        }
    }, [initialValues]);

    // Actualizar un campo del filtro
    const updateFilter = (field: keyof ReportFilter, value: any) => {
        setFilter(prev => ({
            ...prev,
            [field]: value
        }));

        // Eliminar error si existe
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Validar formulario
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!filter.id_vehiculo) {
            newErrors.id_vehiculo = 'Debes seleccionar un vehículo';
        }

        // Validar rango de fechas
        if (filter.fecha_inicio && filter.fecha_fin) {
            if (new Date(filter.fecha_inicio) > new Date(filter.fecha_fin)) {
                newErrors.fecha_fin = 'La fecha final debe ser posterior a la inicial';
            }
        }

        // Validar rango de kilometraje
        if (filter.kilometraje_minimo !== undefined &&
            filter.kilometraje_maximo !== undefined &&
            filter.kilometraje_minimo > filter.kilometraje_maximo) {
            newErrors.kilometraje_maximo = 'El kilometraje máximo debe ser mayor que el mínimo';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejar envío del formulario
    const handleSubmit = () => {
        if (validateForm()) {
            // Clonar el objeto filter para evitar referencias
            const filterToSubmit = { ...filter };

            // Eliminar campos vacíos o indefinidos para optimizar la petición
            const cleanFilter: Partial<ReportFilter> = {};

            // Solo incluir campos con valores válidos
            Object.entries(filterToSubmit).forEach(([key, value]) => {
                // Verificar que el valor no sea null, undefined, string vacío o array vacío
                if (value !== null && value !== undefined) {
                    const typedKey = key as keyof ReportFilter;
                    if (Array.isArray(value)) {
                        if (value.length > 0) {
                            (cleanFilter[typedKey] as any) = value;
                        }
                    } else if (typeof value === 'string') {
                        if (value.trim() !== '') {
                            (cleanFilter[typedKey] as any) = value;
                        }
                    } else {
                        (cleanFilter[typedKey] as any) = value;
                    }
                }
            });

            // Asegurarnos de que id_vehiculo siempre se incluya, incluso si es 0
            if (cleanFilter.id_vehiculo === undefined) {
                cleanFilter.id_vehiculo = filterToSubmit.id_vehiculo;
            }

            console.log("Enviando filtro limpio:", cleanFilter);
            onSubmit(cleanFilter as ReportFilter);
        }
    };

    // Manejar selección de tipos de mantenimiento
    const handleTypesSelected = (ids: number[]) => {
        updateFilter('tipos_mantenimiento', ids);
        setShowTypeSelector(false);
    };

    // Obtener colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const subtitleColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const bgColor = theme === 'dark' ? '#222222' : '#FFFFFF';
    const borderColor = theme === 'dark' ? '#444444' : '#DDDDDD';

    // Debug
    useEffect(() => {
        console.log("Current filter state:", filter);
    }, [filter]);

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollContainer}>
                {/* Selector de Vehículo */}
                <Text style={[styles.sectionTitle, { color: textColor }]}>Vehículo</Text>
                <View style={styles.selectContainer}>
                    <Text style={[styles.label, { color: textColor }]}>Seleccione un vehículo *</Text>
                    <View style={[
                        styles.vehicleSelector,
                        { borderColor: errors.id_vehiculo ? '#CF6679' : borderColor, backgroundColor: bgColor }
                    ]}>
                        {vehicles.map(vehicle => (
                            <Button
                                key={vehicle.id_vehiculo}
                                buttonVariant={filter.id_vehiculo === vehicle.id_vehiculo ? 'primary' : 'outline'}
                                buttonSize="medium"
                                onPress={() => updateFilter('id_vehiculo', vehicle.id_vehiculo)}
                                style={styles.vehicleOption}
                            >
                                {vehicle.marca?.nombre} {vehicle.modelo?.nombre} ({vehicle.placa})
                            </Button>
                        ))}
                    </View>
                    {errors.id_vehiculo && (
                        <Text style={styles.errorText}>{errors.id_vehiculo}</Text>
                    )}
                </View>

                {/* Período de fechas */}
                <Text style={[styles.sectionTitle, { color: textColor }]}>Período</Text>
                <View style={styles.row}>
                    <View style={styles.halfField}>
                        <Text style={[styles.label, { color: textColor }]}>Desde</Text>
                        <Input
                            value={filter.fecha_inicio || ''}
                            onChangeText={(text) => updateFilter('fecha_inicio', text)}
                            placeholder="AAAA-MM-DD"
                            keyboardType="default"
                            error={errors.fecha_inicio}
                        />
                    </View>
                    <View style={styles.halfField}>
                        <Text style={[styles.label, { color: textColor }]}>Hasta</Text>
                        <Input
                            value={filter.fecha_fin || ''}
                            onChangeText={(text) => updateFilter('fecha_fin', text)}
                            placeholder="AAAA-MM-DD"
                            keyboardType="default"
                            error={errors.fecha_fin}
                        />
                    </View>
                </View>

                {/* Rango de Kilometraje */}
                <Text style={[styles.sectionTitle, { color: textColor }]}>Kilometraje</Text>
                <View style={styles.row}>
                    <View style={styles.halfField}>
                        <Text style={[styles.label, { color: textColor }]}>Mínimo</Text>
                        <Input
                            value={filter.kilometraje_minimo?.toString() || ''}
                            onChangeText={(text) => updateFilter('kilometraje_minimo', parseInt(text) || undefined)}
                            placeholder="0"
                            keyboardType="numeric"
                            error={errors.kilometraje_minimo}
                        />
                    </View>
                    <View style={styles.halfField}>
                        <Text style={[styles.label, { color: textColor }]}>Máximo</Text>
                        <Input
                            value={filter.kilometraje_maximo?.toString() || ''}
                            onChangeText={(text) => updateFilter('kilometraje_maximo', parseInt(text) || undefined)}
                            placeholder="100000"
                            keyboardType="numeric"
                            error={errors.kilometraje_maximo}
                        />
                    </View>
                </View>

                {/* Selector de Tipos de Mantenimiento */}
                <Text style={[styles.sectionTitle, { color: textColor }]}>Tipos de Mantenimiento</Text>
                <Button
                    buttonVariant="outline"
                    buttonSize="medium"
                    onPress={() => setShowTypeSelector(true)}
                    style={styles.typeButton}
                >
                    {filter.tipos_mantenimiento?.length
                        ? `${filter.tipos_mantenimiento.length} tipos seleccionados`
                        : 'Seleccionar tipos de mantenimiento'}
                </Button>

                {/* Mensaje de error general */}
                {error && (
                    <Text style={styles.errorText}>{error}</Text>
                )}

                {/* Botón de Generar */}
                <Button
                    buttonVariant="primary"
                    buttonSize="large"
                    onPress={handleSubmit}
                    isLoading={isLoading}
                    style={styles.generateButton}
                    disabled={isLoading}
                >
                    Generar Reporte
                </Button>
            </ScrollView>

            {/* Modal para selección de tipos */}
            {showTypeSelector && (
                <ReportTypeSelector
                    types={availableTypes}
                    selectedIds={filter.tipos_mantenimiento || []}
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
        marginBottom: 16,
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
        marginBottom: 8,
        gap: 8,
    },
    vehicleOption: {
        marginBottom: 8,
    },
    typeButton: {
        marginBottom: 16,
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

export default ReportFilterForm;