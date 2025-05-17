// app/(app)/(navbar)/reports/filters.tsx
import React from 'react';
import ReportFiltersScreen from '@/src/modules/reports/screens/ReportFiltersScreen';
import { RequireAuth } from '@/src/shared/components/RequireAuth';

export default function ReportFiltersPage() {
    return (
        <RequireAuth>
            <ReportFiltersScreen />
        </RequireAuth>
    );
}