// app/maintenance/history.tsx
import React from 'react';
import { MaintenanceListScreen } from '@/src/modules/maintenance';
import { RequireAuth } from '@/src/shared/components/RequireAuth';

export default function MaintenanceHistoryRoute() {
    return (
        <RequireAuth>
            <MaintenanceListScreen />
        </RequireAuth>
    );
}