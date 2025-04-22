// app/vehicles/[id]/edit.tsx
import React from 'react';
import VehicleFormScreen from '@/src/modules/vehicles/screens/VehicleFormScreen';
import { RequireAuth } from '@/src/shared/components/RequireAuth';

export default function EditVehiclePage() {
    return (
        <RequireAuth>
            <VehicleFormScreen />
        </RequireAuth>
    );
}