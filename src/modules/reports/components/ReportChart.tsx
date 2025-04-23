// src/modules/reports/components/ReportChart.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Card } from '@/src/shared/components/ui/Card';
import { ReportByType } from '../models/report';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportChartProps {
    data: ReportByType[];
    title: string;
    type: 'bar' | 'pie';
}

export const ReportChart: React.FC<ReportChartProps> = ({
    data,
    title,
    type = 'bar'
}) => {
    const { theme } = useAppTheme();
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const screenWidth = Dimensions.get('window').width - 64; // Ajustar para padding

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

    // Preparar datos para el gráfico
    const chartData = data.map(item => ({
        name: item.nombre,
        value: item.costo_total,
        count: item.cantidad
    }));

    // Formatear valores monetarios
    const formatMoney = (value: number) => `$${value.toFixed(2)}`;

    return (
        <Card style={styles.container}>
            <Text style={[styles.title, { color: textColor }]}>{title}</Text>

            <View style={styles.chartContainer}>
                {type === 'bar' ? (
                    // Gráfico de barras con Recharts
                    <View style={{ height: 300, width: screenWidth }}>
                        <BarChart
                            width={screenWidth}
                            height={300}
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                        >
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                tick={{ fill: textColor, fontSize: 12 }}
                            />
                            <YAxis
                                tickFormatter={formatMoney}
                                tick={{ fill: textColor, fontSize: 12 }}
                            />
                            <Tooltip
                                formatter={(value) => [`${formatMoney(Number(value))}`, 'Costo total']}
                                labelStyle={{ color: theme === 'dark' ? '#FFF' : '#333' }}
                                contentStyle={{
                                    backgroundColor: theme === 'dark' ? '#333' : '#FFF',
                                    border: `1px solid ${theme === 'dark' ? '#444' : '#DDD'}`
                                }}
                            />
                            <Bar
                                dataKey="value"
                                fill="#9D7E68"
                                radius={[4, 4, 0, 0]}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </View>
                ) : (
                    // Gráfico de pastel con Recharts
                    <View style={{ height: 350, width: screenWidth }}>
                        <PieChart
                            width={screenWidth}
                            height={300}
                        >
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={90}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => [`${formatMoney(Number(value))}`, 'Costo total']}
                                labelStyle={{ color: theme === 'dark' ? '#FFF' : '#333' }}
                                contentStyle={{
                                    backgroundColor: theme === 'dark' ? '#333' : '#FFF',
                                    border: `1px solid ${theme === 'dark' ? '#444' : '#DDD'}`
                                }}
                            />
                            <Legend
                                formatter={(value, entry, index) => (
                                    <Text style={{ color: textColor }}>
                                        {value} (${chartData[index].value.toFixed(2)})
                                    </Text>
                                )}
                            />
                        </PieChart>
                    </View>
                )}
            </View>
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
    }
});

export default ReportChart;