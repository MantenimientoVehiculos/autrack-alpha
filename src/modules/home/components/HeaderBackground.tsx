// src/modules/home/components/HeaderBackground.tsx
import React from 'react';
import { StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';

interface HeaderBackgroundProps {
    scrollY: Animated.Value;
    maxHeight?: number;
}

/**
 * Componente para el fondo de gradiente del encabezado.
 * Este componente se renderiza en una capa inferior.
 */
const HeaderBackground: React.FC<HeaderBackgroundProps> = ({
    scrollY,
    maxHeight = 200,
}) => {
    const { theme } = useAppTheme();
    const HEADER_SCROLL_DISTANCE = maxHeight;

    // Colores según el tema
    const primaryColor = theme === 'dark' ? '#B27046' : '#9D7E68';
    const secondaryColor = theme === 'dark' ? '#774A2F' : '#955D3B';

    // Animar altura del encabezado de completa a cero con una curva suave
    const headerHeight = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [maxHeight, 0],
        extrapolate: 'clamp',
    });

    return (
        <Animated.View style={[styles.header, { height: headerHeight }]}>
            <LinearGradient
                colors={[primaryColor, secondaryColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 0, //Capa más inferior (debajo del ScrollView)
        elevation: 0, // Sin elevación en Android
        overflow: 'hidden',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    gradient: {
        flex: 1,
        width: '100%',
    },
});

export default HeaderBackground;