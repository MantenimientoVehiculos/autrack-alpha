// src/modules/reports/components/VehicleStatisticsCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Card } from '@/src/shared/components/ui/Card';

interface VehicleStatisticsCardProps {
    vehicleName: string;
    totalMaintenanceCount: number;
    totalMaintenanceCost: number;
    lastMaintenanceDate?: string;
    upcomingCount?: number;
}

export const VehicleStatisticsCard: React.FC<VehicleStatisticsCardProps> = ({
    vehicleName,
    totalMaintenanceCount,
    totalMaintenanceCost,
    lastMaintenanceDate,
    upcomingCount = 0
}) => {
    const { theme } = useAppTheme();
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const accentColor = theme === 'dark' ? '#B27046' : '#9D7E68';

    // Formatear fecha
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No disponible';

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        } catch (error) {
            return dateString;
        }
    };

    return (
        <Card style={styles.container}>
            <Text style={[styles.title, { color: textColor }]}>
                {vehicleName}
            </Text>

            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: textColor }]}>
                        {totalMaintenanceCount}
                    </Text>
                    <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
                        Mantenimientos
                    </Text>
                </View>

                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: textColor }]}>
                        ${totalMaintenanceCost.toFixed(2)}
                    </Text>
                    <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
                        Costo Total
                    </Text>
                </View>

                {upcomingCount > 0 && (
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: accentColor }]}>
                            {upcomingCount}
                        </Text>
                        <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
                            Próximos
                        </Text>
                    </View>
                )}
            </View>

            {lastMaintenanceDate && (
                <Text style={[styles.lastMaintenanceText, { color: secondaryTextColor }]}>
                    Último mantenimiento: {formatDate(lastMaintenanceDate)}
                </Text>
            )}
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
    },
    lastMaintenanceText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    }
});

export default VehicleStatisticsCard;