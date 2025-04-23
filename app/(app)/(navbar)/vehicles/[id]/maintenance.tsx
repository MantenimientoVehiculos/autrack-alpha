// app/vehicles/[id]/maintenance.tsx
import React from 'react';
import { VehicleMaintenanceScreen } from '@/src/modules/vehicles/screens/VehicleMaintenanceScreen';
import { RequireAuth } from '@/src/shared/components/RequireAuth';

export default function VehicleMaintenanceRoute() {
    return (
        <RequireAuth>
            <VehicleMaintenanceScreen />
        </RequireAuth>
    );
}