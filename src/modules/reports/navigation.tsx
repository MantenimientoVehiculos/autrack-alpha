// src/modules/reports/navigation.tsx
import { Stack } from 'expo-router';

export type ReportsStackParamList = {
    'index': undefined;
    'filters': undefined;
    'results': { reportId?: string };
};

export const ReportsStack = () => {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Reportes',
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="filters"
                options={{
                    title: 'Filtros',
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="results"
                options={{
                    title: 'Resultados',
                    headerShown: false
                }}
            />
        </Stack>
    );
};

export default ReportsStack;