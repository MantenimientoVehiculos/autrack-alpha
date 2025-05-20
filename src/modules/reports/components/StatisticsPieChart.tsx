import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Card } from '@/src/shared/components/ui/Card';

interface DataItem {
    id: number;
    name: string;
    value: number;
    color: string;
    borderColor: string;
}

interface PieSegment extends DataItem {
    percentage: number;
    startAngle: number;
    endAngle: number;
}

interface StatisticsPieChartProps {
    data: DataItem[];
    valuePrefix?: string;
    showLegend?: boolean;
    title?: string;
}

const StatisticsPieChart: React.FC<StatisticsPieChartProps> = ({
    data,
    valuePrefix = '$',
    showLegend = true,
    title,
}) => {
    const { theme } = useAppTheme();
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const cardBgColor = theme === 'dark' ? '#222222' : '#FFFFFF';

    if (!data?.length) {
        return (
            <Card style={[styles.container, { backgroundColor: cardBgColor }]}>
                <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
                    No hay datos disponibles para mostrar
                </Text>
            </Card>
        );
    }

    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    const segments: PieSegment[] = data.map((item, index) => {
        const prevTotal = data
            .slice(0, index)
            .reduce((sum, p) => sum + p.value, 0);
        const startAngle = (prevTotal / totalValue) * 360;
        const endAngle = startAngle + (item.value / totalValue) * 360;
        return {
            ...item,
            percentage: (item.value / totalValue) * 100,
            startAngle,
            endAngle,
        };
    });

    const generatePiePath = (seg: PieSegment) => {
        const cx = 100;
        const cy = 100;
        const r = 80;
        const startRad = ((seg.startAngle - 90) * Math.PI) / 180;
        const endRad = ((seg.endAngle - 90) * Math.PI) / 180;

        const x1 = cx + r * Math.cos(startRad);
        const y1 = cy + r * Math.sin(startRad);
        const x2 = cx + r * Math.cos(endRad);
        const y2 = cy + r * Math.sin(endRad);
        const largeArc = seg.endAngle - seg.startAngle > 180 ? 1 : 0;

        return `
      M ${cx},${cy}
      L ${x1},${y1}
      A ${r},${r} 0 ${largeArc} 1 ${x2},${y2}
      Z
    `;
    };

    return (
        <Card style={[styles.container, { backgroundColor: cardBgColor }]}>
            {title && <Text style={[styles.title, { color: textColor }]}>{title}</Text>}

            <View style={styles.chartContainer}>
                <View style={styles.pieContainer}>
                    <Svg width={200} height={200} viewBox="0 0 200 200">
                        {segments.map((seg, i) => (
                            <Path
                                key={i}
                                d={generatePiePath(seg)}
                                fill={seg.color}
                                stroke={seg.borderColor}
                                strokeWidth={1}
                            />
                        ))}

                        <Circle cx={100} cy={100} r={40} fill={cardBgColor} />
                    </Svg>

                    <View style={styles.centerLabel}>
                        <Text style={[styles.totalValue, { color: textColor }]}>
                            {valuePrefix}
                            {totalValue.toFixed(2)}
                        </Text>
                        <Text style={[styles.totalLabel, { color: secondaryTextColor }]}>
                            Total
                        </Text>
                    </View>
                </View>

                {showLegend && (
                    <View style={styles.legend}>
                        {segments.map((seg, i) => (
                            <View key={i} style={styles.legendItem}>
                                <View style={styles.legendLeft}>
                                    <View
                                        style={[
                                            styles.legendColor,
                                            {
                                                backgroundColor: seg.color,
                                                borderColor: seg.borderColor,
                                            },
                                        ]}
                                    />
                                    <Text
                                        style={[styles.legendName, { color: textColor }]}
                                        numberOfLines={1}
                                        ellipsizeMode="middle"
                                    >
                                        {seg.name}
                                    </Text>
                                </View>

                                <View style={styles.legendRight}>
                                    <Text style={[styles.legendValue, { color: textColor }]}>
                                        {valuePrefix}
                                        {seg.value.toFixed(2)}
                                    </Text>
                                    <Text style={[styles.legendPercent, { color: secondaryTextColor }]}>
                                        {seg.percentage.toFixed(1)}%
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    chartContainer: {
        alignItems: 'center',
    },
    pieContainer: {
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    centerLabel: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    totalLabel: {
        fontSize: 12,
    },
    legend: {
        width: '100%',
        marginTop: 24,
    },
    legendItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    legendLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    legendColor: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1,
        marginRight: 8,
    },
    legendName: {
        fontSize: 14,
        flex: 1,
    },
    legendRight: {
        alignItems: 'flex-end',
    },
    legendValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    legendPercent: {
        fontSize: 12,
    },
    emptyText: {
        textAlign: 'center',
        padding: 40,
        fontSize: 14,
    },
});

export default StatisticsPieChart;
