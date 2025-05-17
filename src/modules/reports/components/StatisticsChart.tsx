// src/modules/reports/components/StatisticsChart.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Card } from '@/src/shared/components/ui/Card';

// Interfaces para los tipos de datos de gráficos
interface BarChartData {
    name: string;
    value: number;
}

interface PieChartData {
    name: string;
    value: number;
}

interface StatisticsChartProps {
    data: BarChartData[] | PieChartData[];
    title: string;
    type: 'bar' | 'pie';
    valuePrefix?: string; // Para moneda ($) o porcentajes (%)
    valueFormatter?: (value: number) => string;
}

export const StatisticsChart: React.FC<StatisticsChartProps> = ({
    data,
    title,
    type = 'bar',
    valuePrefix = '',
    valueFormatter = (value) => `${valuePrefix}${value.toFixed(2)}`
}) => {
    const { theme } = useAppTheme();
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';

    // Colores para los gráficos
    const COLORS = [
        '#9D7E68', // Primary
        '#B27046', // Primary variant
        '#955D3B', // Secondary
        '#774A2F', // Secondary variant
        '#3D85C6', // Blue
        '#6AA84F', // Green
        '#C27BA0', // Pink
        '#674EA7', // Purple
        '#E69138', // Orange
        '#999999', // Gray
    ];

    // Calcular valores máximos y totales para normalización
    const maxValue = data.length > 0
        ? Math.max(...data.map(item => item.value))
        : 0;

    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <Card style={styles.container}>
            <Text style={[styles.title, { color: textColor }]}>{title}</Text>

            <View style={styles.chartContainer}>
                {type === 'bar' ? (
                    // Gráfico de barras
                    <View style={styles.barChart}>
                        {data.map((item, index) => {
                            const barHeight = maxValue > 0
                                ? (item.value / maxValue) * 200
                                : 0;

                            return (
                                <View key={index} style={styles.barItemContainer}>
                                    <Text
                                        style={[styles.barValue, { color: textColor }]}
                                        numberOfLines={1}
                                    >
                                        {valueFormatter(item.value)}
                                    </Text>

                                    <View style={styles.barWrapper}>
                                        <View
                                            style={[
                                                styles.bar,
                                                {
                                                    height: barHeight,
                                                    backgroundColor: COLORS[index % COLORS.length]
                                                }
                                            ]}
                                        />
                                    </View>

                                    <Text
                                        style={[styles.barLabel, { color: textColor }]}
                                        numberOfLines={2}
                                        ellipsizeMode="tail"
                                    >
                                        {item.name}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    // Gráfico de pastel
                    <View style={styles.pieChartContainer}>
                        <View style={styles.pieChart}>
                            {data.map((item, index) => {
                                const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
                                const size = 30 + (percentage / 2);

                                return (
                                    <View
                                        key={index}
                                        style={[
                                            styles.pieSlice,
                                            {
                                                width: size,
                                                height: size,
                                                backgroundColor: COLORS[index % COLORS.length],
                                                position: 'absolute',
                                                top: 70 - size / 2,
                                                left: index % 2 === 0 ? 80 - size / 2 : 120 - size / 2,
                                                borderRadius: size / 2,
                                                zIndex: Math.round(percentage)
                                            }
                                        ]}
                                    />
                                );
                            })}
                        </View>

                        <View style={styles.pieLegend}>
                            {data.map((item, index) => {
                                const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;

                                return (
                                    <View key={index} style={styles.legendItem}>
                                        <View
                                            style={[
                                                styles.legendColor,
                                                { backgroundColor: COLORS[index % COLORS.length] }
                                            ]}
                                        />
                                        <Text
                                            style={[styles.legendText, { color: textColor }]}
                                            numberOfLines={1}
                                            ellipsizeMode="middle"
                                        >
                                            {item.name} ({percentage.toFixed(1)}%)
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}
            </View>

            <Text style={[styles.note, { color: secondaryTextColor }]}>
                {`Total: ${valueFormatter(totalValue)}`}
            </Text>
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
        marginBottom: 16,
    },
    chartContainer: {
        marginTop: 8,
        alignItems: 'center',
    },
    barChart: {
        flexDirection: 'row',
        height: 270,
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    barItemContainer: {
        flex: 1,
        alignItems: 'center',
        maxWidth: 80,
    },
    barValue: {
        fontSize: 10,
        marginBottom: 4,
        height: 30,
        textAlign: 'center',
    },
    barWrapper: {
        height: 200,
        width: '80%',
        justifyContent: 'flex-end',
    },
    bar: {
        width: '100%',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    barLabel: {
        fontSize: 10,
        textAlign: 'center',
        marginTop: 6,
        height: 30,
    },
    pieChartContainer: {
        height: 250,
        width: '100%',
        alignItems: 'center',
    },
    pieChart: {
        height: 140,
        width: 200,
        position: 'relative',
        marginBottom: 16,
    },
    pieSlice: {
        // Los estilos específicos se aplican inline
    },
    pieLegend: {
        width: '100%',
        paddingHorizontal: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    legendColor: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 8,
    },
    legendText: {
        fontSize: 12,
    },
    note: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 16,
        fontStyle: 'italic',
    }
});

export default StatisticsChart;