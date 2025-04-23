// src/modules/maintenance/components/MaintenanceCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Card } from '@/src/shared/components/ui/Card';
import { TrashIcon } from '@/src/shared/components/ui/Icons';
import { MaintenanceRecord } from '../models/maintenance';

interface MaintenanceCardProps {
    record: MaintenanceRecord;
    onDelete?: (id: number) => void;
    onPress?: () => void;
}

export const MaintenanceCard: React.FC<MaintenanceCardProps> = ({
    record,
    onDelete,
    onPress
}) => {
    const { theme } = useAppTheme();

    const {
        id_registro,
        fecha,
        kilometraje,
        costo,
        tipo_mantenimiento
    } = record;

    // Formatear la fecha
    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString();
    };

    // Manejar la eliminación
    const handleDelete = (e: any) => {
        e.stopPropagation();
        if (id_registro && onDelete) {
            onDelete(id_registro);
        }
    };

    // Colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const cardColor = theme === 'dark' ? '#222222' : '#FFFFFF';
    const borderColor = theme === 'dark' ? '#333333' : '#EEEEEE';

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            style={[
                styles.container,
                { backgroundColor: cardColor, borderColor: borderColor }
            ]}
        >
            <View style={styles.mainContent}>
                <View style={styles.header}>
                    <Text style={[styles.typeText, { color: textColor }]}>
                        {tipo_mantenimiento?.nombre || 'Mantenimiento'}
                    </Text>
                    <Text style={[styles.costText, { color: theme === 'dark' ? '#B27046' : '#9D7E68' }]}>
                        ${Number(costo).toFixed(2)}
                    </Text>
                </View>

                <View style={styles.details}>
                    <Text style={[styles.dateText, { color: secondaryTextColor }]}>
                        {formatDate(fecha)}
                    </Text>
                    <Text style={[styles.kmText, { color: secondaryTextColor }]}>
                        {kilometraje.toLocaleString()}km
                    </Text>
                </View>
            </View>

            {onDelete && (
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                    accessibilityLabel="Eliminar mantenimiento"
                >
                    <TrashIcon size={18} color={theme === 'dark' ? '#CF6679' : '#CF6679'} />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        elevation: 1,
    },
    mainContent: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    typeText: {
        fontSize: 16,
        fontWeight: '600',
    },
    costText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    details: {
        flexDirection: 'row',
    },
    dateText: {
        fontSize: 14,
        marginRight: 12,
    },
    kmText: {
        fontSize: 14,
    },
    deleteButton: {
        padding: 8,
    }
});

export default MaintenanceCard;