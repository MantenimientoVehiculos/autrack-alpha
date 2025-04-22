// src/modules/vehicles/components/VehicleCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Card } from '@/src/shared/components/ui/Card';
import { CarIcon, EditIcon, TrashIcon } from '@/src/shared/components/ui/Icons';
import { Vehicle } from '../models/vehicle';

interface VehicleCardProps {
    vehicle: Vehicle;
    onDelete?: (id: number) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onDelete }) => {
    const router = useRouter();
    const { theme } = useAppTheme();

    const { id_vehiculo, placa, marca, modelo, anio, kilometraje_actual, color } = vehicle;

    const getColorSquare = () => {
        if (!color) return null;

        return (
            <View
                style={[
                    styles.colorSquare,
                    { backgroundColor: color }
                ]}
            />
        );
    };

    const navigateToDetail = () => {
        if (id_vehiculo) {
            router.push(`/vehicles/${id_vehiculo}`);
        }
    };

    const handleEdit = (e: any) => {
        e.stopPropagation();
        if (id_vehiculo) {
            router.push(`/vehicles/${id_vehiculo}/edit`);
        }
    };

    const handleDelete = (e: any) => {
        e.stopPropagation();
        if (id_vehiculo && onDelete) {
            onDelete(id_vehiculo);
        }
    };

    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';

    return (
        <TouchableOpacity onPress={navigateToDetail} activeOpacity={0.7}>
            <Card variant="elevated" style={styles.card}>
                <View style={styles.cardContent}>
                    <View style={styles.iconContainer}>
                        <CarIcon
                            size={32}
                            color={theme === 'dark' ? '#B27046' : '#9D7E68'}
                        />
                        {getColorSquare()}
                    </View>

                    <View style={styles.detailsContainer}>
                        <Text style={[styles.plateText, { color: textColor }]}>
                            {placa}
                        </Text>

                        <Text style={[styles.modelText, { color: textColor }]}>
                            {marca?.nombre} {modelo?.nombre} ({anio})
                        </Text>

                        <Text style={[styles.kmText, { color: textColor }]}>
                            {kilometraje_actual.toLocaleString()} km
                        </Text>
                    </View>

                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleEdit}
                            accessibilityLabel="Editar vehículo"
                        >
                            <EditIcon
                                size={20}
                                color={theme === 'dark' ? '#B27046' : '#9D7E68'}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleDelete}
                            accessibilityLabel="Eliminar vehículo"
                        >
                            <TrashIcon
                                size={20}
                                color="#CF6679"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: 8,
        marginHorizontal: 16,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    iconContainer: {
        position: 'relative',
        marginRight: 16,
    },
    colorSquare: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 12,
        height: 12,
        borderRadius: 3,
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    detailsContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    plateText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    modelText: {
        fontSize: 14,
        marginBottom: 2,
    },
    kmText: {
        fontSize: 12,
        opacity: 0.8,
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        padding: 8,
        marginLeft: 4,
    },
});

export default VehicleCard;