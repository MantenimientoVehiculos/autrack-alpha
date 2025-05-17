// app/(app)/(navbar)/reports/statistics.tsx
import React from 'react';
import StatisticsScreen from '@/src/modules/reports/screens/StatisticsScreen';
import { RequireAuth } from '@/src/shared/components/RequireAuth';

export default function StatisticsPage() {
    return (
        <RequireAuth>
            <StatisticsScreen />
        </RequireAuth>
    );
}