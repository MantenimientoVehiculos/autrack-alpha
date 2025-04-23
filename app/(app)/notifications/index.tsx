// app/vehicles/index.tsx
import React from 'react';
import { NotificationsScreen } from '@/src/modules/notifications';
import { RequireAuth } from '@/src/shared/components/RequireAuth';

export default function VehiclesPage() {
    return (
        <RequireAuth>
            <NotificationsScreen />
        </RequireAuth>
    );
}