// src/modules/home/components/HeaderContent.tsx
import React from 'react';
import {
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BellIcon } from '@/src/shared/components/ui/Icons';
import { NotificationBadge } from '@/src/shared/components/ui/NotificationBadge';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';

interface HeaderContentProps {
    scrollY: Animated.Value;
    title: string;
    subtitle?: string;
    unreadCount?: number;
    onNotificationPress?: () => void;
    maxHeight?: number;
}

const HeaderContent: React.FC<HeaderContentProps> = ({
    scrollY,
    title,
    subtitle,
    unreadCount = 0,
    onNotificationPress,
    maxHeight = 200,
}) => {
    const { theme } = useAppTheme();
    const HEADER_SCROLL_DISTANCE = maxHeight;

    // Opacidad del contenido
    const headerContentOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    // (Opcional) TranslateY para un efecto de subida
    const translateY = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [0, -HEADER_SCROLL_DISTANCE / 2],
        extrapolate: 'clamp',
    });

    // Color objetivo según el tema
    const targetBgColor =
        theme === 'dark'
            ? 'rgba(220,220,220,0.8)'   // gris oscuro semitransparente
            : 'rgba(60,60,60,0.8)'; // gris claro semitransparente

    // Animación de backgroundColor: transparente → targetBgColor
    const notificationBg = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: ['transparent', targetBgColor],
        extrapolate: 'clamp',
    });

    const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <Animated.View
                style={[
                    styles.headerContent,
                    {
                        opacity: headerContentOpacity,
                        transform: [{ translateY }],
                    },
                ]}
                pointerEvents="box-none"
            >
                {subtitle && (
                    <Text style={styles.headerGreeting}>{subtitle}</Text>
                )}
                <Text style={styles.headerSubtitle}>{title}</Text>
            </Animated.View>

            {onNotificationPress && (
                <AnimatedTouchable
                    activeOpacity={0.7}
                    onPress={onNotificationPress}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    style={[
                        styles.notificationButton,
                        { backgroundColor: notificationBg },
                    ]}
                >
                    <BellIcon size={24} color="#FFFFFF" />
                    {unreadCount > 0 && <NotificationBadge size={16} />}
                </AnimatedTouchable>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        elevation: 10,
    },
    headerContent: {
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 40 : 0,
        paddingBottom: 16,
    },
    headerGreeting: {
        color: '#FFFFFF',
        fontSize: 16,
        marginBottom: 4,
    },
    headerSubtitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    notificationButton: {
        position: 'absolute',
        top: Platform.OS === 'android' ? 40 : 44,
        right: 16,
        padding: 8,
        borderRadius: 20,
        zIndex: 101,
        elevation: 11,
    },
});

export default HeaderContent;
