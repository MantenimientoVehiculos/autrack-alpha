import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Card } from '@/src/shared/components/ui/Card';

interface StatisticsSummaryCardProps {
    totalVehicles: number;
    totalCost: number;
    averageCostPerVehicle: number;
    period?: { start: string; end: string };
}

const StatisticsSummaryCard: React.FC<StatisticsSummaryCardProps> = ({
    totalVehicles,
    totalCost,
    averageCostPerVehicle,
    period
}) => {
    const { theme } = useAppTheme();
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const accentColor = theme === 'dark' ? '#B27046' : '#9D7E68';
    const cardBgColor = theme === 'dark' ? '#222222' : '#FFFFFF';
    const borderColor = theme === 'dark' ? '#444444' : '#EEEEEE';
    const highlightBgColor = theme === 'dark' ? '#333333' : '#F9F9F9';

    // Preparar ícono para cada estadística
    const renderIcon = (name: string, color: string) => {
        const size = 32;
        const renderCircle = () => (
            <View
                style={[
                    styles.iconCircle,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: `${color}30`
                    }
                ]}
            >
                <Text style={[styles.iconText, { color }]}>
                    {name.charAt(0).toUpperCase()}
                </Text>
            </View>
        );

        return renderCircle();
    };

    return (
        <View style={[, { marginBottom: 24 }]}>
            {period && (
                <View style={[styles.periodContainer, { backgroundColor: highlightBgColor, borderColor }]}>
                    <Text style={[styles.periodLabel, { color: secondaryTextColor }]}>
                        Período:
                    </Text>
                    <Text style={[styles.periodValue, { color: textColor }]}>
                        {period.start} - {period.end}
                    </Text>
                </View>
            )}

            <Text style={[styles.title, { color: textColor }]}>
                Resumen General
            </Text>

            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    {renderIcon('V', accentColor)}
                    <View style={styles.statContent}>
                        <Text style={[styles.statValue, { color: textColor }]}>
                            {totalVehicles}
                        </Text>
                        <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
                            Vehículos
                        </Text>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: borderColor }]} />

                <View style={styles.statCard}>
                    {renderIcon('T', accentColor)}
                    <View style={styles.statContent}>
                        <Text style={[styles.statValue, { color: accentColor }]}>
                            ${totalCost.toFixed(2)}
                        </Text>
                        <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
                            Costo Total
                        </Text>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: borderColor }]} />

                <View style={styles.statCard}>
                    {renderIcon('P', accentColor)}
                    <View style={styles.statContent}>
                        <Text style={[styles.statValue, { color: textColor }]}>
                            ${averageCostPerVehicle.toFixed(2)}
                        </Text>
                        <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
                            Promedio/Vehículo
                        </Text>
                    </View>
                </View>
            </View>

            {/* Información adicional */}
            <View style={[styles.infoContainer, { backgroundColor: highlightBgColor }]}>
                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Text style={[styles.infoLabel, { color: secondaryTextColor }]}>
                            Costo por vehículo:
                        </Text>
                        <Text style={[styles.infoValue, { color: textColor }]}>
                            ${(totalCost / totalVehicles).toFixed(2)}
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={[styles.infoLabel, { color: secondaryTextColor }]}>
                            Eficiencia relativa:
                        </Text>
                        <Text style={[styles.infoValue, { color: textColor }]}>
                            {totalVehicles > 0 ? (100 - (averageCostPerVehicle / (totalCost / totalVehicles) * 100)).toFixed(1) : 0}%
                        </Text>
                    </View>
                </View>

                <Text style={[styles.infoNote, { color: secondaryTextColor }]}>
                    * Estos datos representan un resumen del gasto en mantenimiento para todos los vehículos en el sistema.
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    periodContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 16,
    },
    periodLabel: {
        fontSize: 14,
        marginRight: 8,
    },
    periodValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    iconCircle: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    iconText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    statContent: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'center',
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    divider: {
        width: 1,
        alignSelf: 'stretch',
        marginHorizontal: 8,
    },
    infoContainer: {
        padding: 12,
        borderRadius: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    infoItem: {
        flex: 1,
        marginHorizontal: 4,
    },
    infoLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    infoNote: {
        fontSize: 11,
        fontStyle: 'italic',
        marginTop: 8,
    }
});

export default StatisticsSummaryCard;