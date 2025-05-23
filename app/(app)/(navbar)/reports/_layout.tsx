import React from 'react';
import { Stack } from 'expo-router';
import { ReportsProvider } from '@/src/modules/reports/context/ReportsProvider';

export default function ReportsLayout() {
    return (
        <ReportsProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="filters" />
                <Stack.Screen name="results" />
                <Stack.Screen name="statistics" />
                <Stack.Screen name="vehicle-statistics" />
            </Stack>
        </ReportsProvider>
    );
}
