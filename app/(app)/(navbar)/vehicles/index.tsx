// app/vehicles/index.tsx
import React from 'react';
import VehicleListScreen from '@/src/modules/vehicles/screens/VehicleListScreen';
import { RequireAuth } from '@/src/shared/components/RequireAuth';

export default function VehiclesPage() {
    return (
        <RequireAuth>
            <VehicleListScreen />
        </RequireAuth>
    );
}