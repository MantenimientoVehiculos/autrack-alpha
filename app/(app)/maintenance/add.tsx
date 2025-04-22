// app/maintenance/add.tsx
import React from 'react';
import { MaintenanceFormScreen } from '@/src/modules/maintenance';
import { RequireAuth } from '@/src/shared/components/RequireAuth';

export default function MaintenanceAddRoute() {
    return (
        <RequireAuth>
            <MaintenanceFormScreen />
        </RequireAuth>
    );
}