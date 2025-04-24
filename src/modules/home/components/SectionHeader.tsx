// src/modules/home/components/SectionHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';

interface SectionHeaderProps {
    title: string;
    actionLabel?: string;
    onAction?: () => void;
    style?: any;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    actionLabel = 'Ver todos',
    onAction,
    style
}) => {
    const { theme } = useAppTheme();
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const primaryColor = theme === 'dark' ? '#B27046' : '#9D7E68';

    return (
        <View style={[styles.sectionHeader, style]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
                {title}
            </Text>
            {onAction && (
                <TouchableOpacity onPress={onAction}>
                    <Text style={[styles.viewAllLink, { color: primaryColor }]}>
                        {actionLabel}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    viewAllLink: {
        fontSize: 14,
        fontWeight: '500',
    },
});

export default SectionHeader;