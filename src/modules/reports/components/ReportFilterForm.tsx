// ============================================
// REPORTFILTERFORM CORREGIDO
// src/modules/reports/components/ReportFilterForm.tsx
// ============================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Input } from '@/src/shared/components/ui/Input';
import { Button } from '@/src/shared/components/ui/Button';
import { useVehicles } from '@/src/modules/vehicles/hooks/useVehicles';
import { ReportFilter } from '../models/report';
import { ReportTypeSelector } from './ReportTypeSelector';

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

    // Estado local inicializado de forma estable
    const [filter, setFilter] = useState<ReportFilter>(() => ({
        id_vehiculo: initialValues?.id_vehiculo || 0,
        fecha_inicio: initialValues?.fecha_inicio || '',
        fecha_fin: initialValues?.fecha_fin || '',
        kilometraje_minimo: initialValues?.kilometraje_minimo,
        kilometraje_maximo: initialValues?.kilometraje_maximo,
        tipos_mantenimiento: initialValues?.tipos_mantenimiento || [],
        formato: initialValues?.formato || 'pdf'
    }));

    const [showTypeSelector, setShowTypeSelector] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Cargar vehículos solo una vez
    useEffect(() => {
        if (vehicles.length === 0) {
            loadVehicles();
        }
    }, [vehicles.length, loadVehicles]);

    // Actualizar valores cuando cambian los rangos - con debounce implícito
    useEffect(() => {
        const updates: Partial<ReportFilter> = {};
        let hasUpdates = false;

        if (dateRange) {
            if (dateRange.min !== filter.fecha_inicio) {
                updates.fecha_inicio = dateRange.min;
                hasUpdates = true;
            }
            if (dateRange.max !== filter.fecha_fin) {
                updates.fecha_fin = dateRange.max;
                hasUpdates = true;
            }
        }

        if (kmRange) {
            if (kmRange.min !== filter.kilometraje_minimo) {
                updates.kilometraje_minimo = kmRange.min;
                hasUpdates = true;
            }
            if (kmRange.max !== filter.kilometraje_maximo) {
                updates.kilometraje_maximo = kmRange.max;
                hasUpdates = true;
            }
        }

        if (hasUpdates) {
            setFilter(prev => ({
                ...prev,
                ...updates
            }));
        }
    }, [dateRange?.min, dateRange?.max, kmRange?.min, kmRange?.max]); // Dependencias específicas

    // Actualizar valores iniciales solo cuando realmente cambian
    useEffect(() => {
        if (initialValues) {
            const newFilter: Partial<ReportFilter> = {};
            let hasChanges = false;

            Object.entries(initialValues).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    const typedKey = key as keyof ReportFilter;
                    if (filter[typedKey] !== value) {
                        (newFilter[typedKey] as any) = value;
                        hasChanges = true;
                    }
                }
            });

            if (hasChanges) {
                setFilter(prev => ({
                    ...prev,
                    ...newFilter
                }));
            }
        }
    }, [
        initialValues?.id_vehiculo,
        initialValues?.fecha_inicio,
        initialValues?.fecha_fin,
        initialValues?.kilometraje_minimo,
        initialValues?.kilometraje_maximo,
        initialValues?.formato
    ]); // Solo dependencias específicas que realmente importan

    // Función optimizada para actualizar filtro
    const updateFilter = useCallback((field: keyof ReportFilter, value: any) => {
        setFilter(prev => {
            // Solo actualizar si el valor realmente cambió
            if (prev[field] === value) return prev;

            return {
                ...prev,
                [field]: value
            };
        });

        // Eliminar error si existe
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }, [errors]);

    // Validar formulario - memorizada
    const validateForm = useCallback((): boolean => {
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
    }, [filter]);

    // Manejar envío del formulario
    const handleSubmit = useCallback(() => {
        if (validateForm()) {
            // Crear filtro limpio sin valores vacíos
            const cleanFilter: Partial<ReportFilter> = {};

            Object.entries(filter).forEach(([key, value]) => {
                const typedKey = key as keyof ReportFilter;

                if (value !== null && value !== undefined) {
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

            // Asegurar que id_vehiculo siempre esté incluido
            if (cleanFilter.id_vehiculo === undefined) {
                cleanFilter.id_vehiculo = filter.id_vehiculo;
            }

            onSubmit(cleanFilter as ReportFilter);
        }
    }, [filter, validateForm, onSubmit]);

    // Manejar selección de tipos
    const handleTypesSelected = useCallback((ids: number[]) => {
        updateFilter('tipos_mantenimiento', ids);
        setShowTypeSelector(false);
    }, [updateFilter]);

    // Obtener colores según el tema - memorizado
    const themeColors = useMemo(() => ({
        textColor: theme === 'dark' ? '#F9F9F9' : '#313131',
        subtitleColor: theme === 'dark' ? '#BBBBBB' : '#666666',
        bgColor: theme === 'dark' ? '#222222' : '#FFFFFF',
        borderColor: theme === 'dark' ? '#444444' : '#DDDDDD'
    }), [theme]);

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollContainer}>
                {/* Selector de Vehículo */}
                <Text style={[styles.sectionTitle, { color: themeColors.textColor }]}>Vehículo</Text>
                <View style={styles.selectContainer}>
                    <Text style={[styles.label, { color: themeColors.textColor }]}>Seleccione un vehículo *</Text>
                    <View style={[
                        styles.vehicleSelector,
                        { borderColor: errors.id_vehiculo ? '#CF6679' : themeColors.borderColor, backgroundColor: themeColors.bgColor }
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
                <Text style={[styles.sectionTitle, { color: themeColors.textColor }]}>Período</Text>
                <View style={styles.row}>
                    <View style={styles.halfField}>
                        <Text style={[styles.label, { color: themeColors.textColor }]}>Desde</Text>
                        <Input
                            value={filter.fecha_inicio || ''}
                            onChangeText={(text) => updateFilter('fecha_inicio', text)}
                            placeholder="AAAA-MM-DD"
                            keyboardType="default"
                            error={errors.fecha_inicio}
                        />
                    </View>
                    <View style={styles.halfField}>
                        <Text style={[styles.label, { color: themeColors.textColor }]}>Hasta</Text>
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
                <Text style={[styles.sectionTitle, { color: themeColors.textColor }]}>Kilometraje</Text>
                <View style={styles.row}>
                    <View style={styles.halfField}>
                        <Text style={[styles.label, { color: themeColors.textColor }]}>Mínimo</Text>
                        <Input
                            value={filter.kilometraje_minimo?.toString() || ''}
                            onChangeText={(text) => updateFilter('kilometraje_minimo', parseInt(text) || undefined)}
                            placeholder="0"
                            keyboardType="numeric"
                            error={errors.kilometraje_minimo}
                        />
                    </View>
                    <View style={styles.halfField}>
                        <Text style={[styles.label, { color: themeColors.textColor }]}>Máximo</Text>
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
                <Text style={[styles.sectionTitle, { color: themeColors.textColor }]}>Tipos de Mantenimiento</Text>
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