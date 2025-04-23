// src/shared/components/ui/GradientHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
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

    // Función para manejar el botón de retroceso
    const handleBackPress = () => {
        router.back();
    };

    return (
        <>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={headerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientContainer}
            >
                <SafeAreaView style={styles.safeArea} edges={['top']}>
                    <View style={styles.headerContent}>
                        {showBackButton && (
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={handleBackPress}
                                accessibilityLabel="Botón atrás"
                                accessibilityRole="button"
                            >
                                <ChevronLeft size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                        )}

                        <Text style={styles.headerTitle}>{title}</Text>

                        {rightComponent ? (
                            <View style={styles.rightComponent}>
                                {rightComponent}
                            </View>
                        ) : (
                            <View style={styles.placeholderRight} />
                        )}
                    </View>
                </SafeAreaView>
            </LinearGradient>
        </>
    );
};

const styles = StyleSheet.create({
    gradientContainer: {
        width: '100%',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        // iOS shadow (for the bottom radius)
        zIndex: 10,
    },
    safeArea: {
        width: '100%',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 56,
        paddingBottom: 8,
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
    placeholderRight: {
        width: 40, // Aproximadamente el ancho del botón de retroceso
    },
});

export default GradientHeader;