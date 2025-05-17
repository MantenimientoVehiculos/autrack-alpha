// src/modules/home/components/AnimatedHeader.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BellIcon } from '@/src/shared/components/ui/Icons';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { NotificationBadge } from '@/src/shared/components/ui/NotificationBadge';

interface AnimatedHeaderProps {
    scrollY: Animated.Value;
    title: string;
    subtitle?: string;
    unreadCount?: number;
    onNotificationPress?: () => void;
    maxHeight?: number;
}

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
    scrollY,
    title,
    subtitle,
    unreadCount = 0,
    onNotificationPress,
    maxHeight = 200,
}) => {
    const { theme } = useAppTheme();
    const HEADER_SCROLL_DISTANCE = maxHeight;

    // Colors per theme
    const primaryColor = theme === 'dark' ? '#B27046' : '#9D7E68';
    const secondaryColor = theme === 'dark' ? '#774A2F' : '#955D3B';

    // Animate header height from full to zero
    const headerHeight = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [maxHeight, 0],
        extrapolate: 'clamp',
    });

    // Content fades out as it collapses
    const headerContentOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE * 0.5, HEADER_SCROLL_DISTANCE],
        outputRange: [1, 0.5, 0],
        extrapolate: 'clamp',
    });

    return (
        <Animated.View style={[styles.header, { height: headerHeight }]}>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
            <LinearGradient
                colors={[primaryColor, secondaryColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.safeArea}>
                    <Animated.View style={[styles.headerContent, { opacity: headerContentOpacity }]}>
                        {subtitle && (
                            <Text style={styles.headerGreeting}>{subtitle}</Text>
                        )}
                        <Text style={styles.headerSubtitle}>{title}</Text>

                        {onNotificationPress && (
                            <TouchableOpacity
                                style={styles.expandedNotificationButton}
                                onPress={onNotificationPress}
                            >
                                <BellIcon size={24} color="#FFFFFF" />
                                {unreadCount > 0 && <NotificationBadge size={16} />}
                            </TouchableOpacity>
                        )}
                    </Animated.View>
                </SafeAreaView>
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10, // Aumentamos zIndex para asegurar que esté por encima
        elevation: 5, // Aumentamos elevation para Android
        overflow: 'hidden',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    gradient: {
        flex: 1,
        width: '100%',
    },
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 24 : 0,
    },
    headerContent: {
        paddingHorizontal: 16,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
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
    expandedNotificationButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 8,
        zIndex: 15, // Aseguramos que el botón esté por encima
    },
});

export default AnimatedHeader;