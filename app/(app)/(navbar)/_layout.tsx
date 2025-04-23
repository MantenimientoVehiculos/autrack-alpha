// app/vehicles/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { BottomNav } from '@/src/shared/components/ui/BottomNav';

export default function VehiclesLayout() {
    const { theme } = useAppTheme();

    return (
        <View style={[
            styles.container,
            { backgroundColor: theme === 'dark' ? '#111111' : '#FFFFFF' }
        ]}>
            <Stack screenOptions={{
                headerShown: false,
                animation: 'slide_from_right'
            }} />
            <BottomNav />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});