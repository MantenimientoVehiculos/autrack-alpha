// app/(app)/(navbar)/reports/vehicle-statistics.tsx
import React from 'react';
import VehicleStatisticsScreen from '@/src/modules/reports/screens/VehicleStatisticsScreen';
import { RequireAuth } from '@/src/shared/components/RequireAuth';

export default function VehicleStatisticsPage() {
    return (
        <RequireAuth>
            <VehicleStatisticsScreen />
        </RequireAuth>
    );
}