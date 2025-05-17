// app/(app)/(navbar)/reports/results.tsx
import React from 'react';
import ReportResultsScreen from '@/src/modules/reports/screens/ReportResultsScreen';
import { RequireAuth } from '@/src/shared/components/RequireAuth';

export default function ReportResultsPage() {
    return (
        <RequireAuth>
            <ReportResultsScreen />
        </RequireAuth>
    );
}