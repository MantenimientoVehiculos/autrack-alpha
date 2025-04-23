// app/vehicles/[id].tsx
import React from 'react';
import VehicleDetailScreen from '@/src/modules/vehicles/screens/VehicleDetailScreen';
import { RequireAuth } from '@/src/shared/components/RequireAuth';

export default function VehicleDetailPage() {
    return (
        <RequireAuth>
            <VehicleDetailScreen />
        </RequireAuth>
    );
}