// src/shared/components/ui/GradientHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from './Icons';
import { useAppTheme } from '../../theme/ThemeProvider';

interface GradientHeaderProps {
    title: string;
    showBackButton?: boolean;
    rightComponent?: React.ReactNode;
    gradientColors?: string[];
}

export const GradientHeader: React.FC<GradientHeaderProps> = ({
    title,
    showBackButton = true,
    rightComponent,
    gradientColors,
}) => {
    const router = useRouter();
    const { theme } = useAppTheme();

    const headerGradient = (gradientColors || [
        theme === 'dark' ? '#333333' : '#9D7E68',
        theme === 'dark' ? '#222222' : '#774A2F',
    ]) as [string, string, ...string[]];


    return (
        <>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={headerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerContainer}
            >
                <View style={styles.headerContent}>
                    {showBackButton && (
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                            accessibilityLabel="Botón atrás"
                            accessibilityRole="button"
                        >
                            <ChevronLeft size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    )}

                    <Text style={styles.headerTitle}>{title}</Text>

                    {rightComponent && (
                        <View style={styles.rightComponent}>
                            {rightComponent}
                        </View>
                    )}
                </View>
            </LinearGradient>
        </>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        height: 56,
        width: '100%',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
    },
    rightComponent: {
        marginLeft: 'auto',
    },
});

export default GradientHeader;