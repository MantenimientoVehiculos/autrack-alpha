// app/(app)/(navbar)/index.tsx
import React from 'react';
import HomeScreen from '@/src/modules/home/screens/HomeScreen';
import { RequireAuth } from '@/src/shared/components/RequireAuth';
export default function HomePage() {
    return (
        <RequireAuth>
            <HomeScreen />
        </RequireAuth>
    );
}