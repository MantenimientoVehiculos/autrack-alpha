// app/(app)/reports/index.tsx
import React from 'react';
import ReportsScreen from '@/src/modules/reports/screens/ReportsScreen';
import { RequireAuth } from '@/src/shared/components/RequireAuth';

export default function ReportsPage() {
    return (
        <RequireAuth>
            <ReportsScreen />
        </RequireAuth>
    );
}