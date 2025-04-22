// src/shared/components/ui/Card.tsx
import React from 'react';
import { Card as PaperCard, useTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';

export interface CustomCardProps {
    variant?: 'elevated' | 'outlined' | 'filled';
    children: React.ReactNode;
    style?: any;
    onPress?: () => void;
}

export const Card: React.FC<CustomCardProps> = ({
    variant = 'elevated',
    children,
    style,
    onPress,
    ...props
}) => {
    const theme = useTheme();

    // Estilos basados en la variante
    const getCardStyles = () => {
        switch (variant) {
            case 'elevated':
                return {
                    backgroundColor: theme.colors.background,
                    elevation: 3,
                };
            case 'outlined':
                return {
                    backgroundColor: theme.colors.background,
                    borderWidth: 1,
                    borderColor: theme.colors.outline,
                    elevation: 0,
                };
            case 'filled':
                return {
                    backgroundColor: theme.colors.surfaceVariant,
                    elevation: 0,
                };
            default:
                return {};
        }
    };

    const cardStyles = getCardStyles();

    return (
        <PaperCard
            style={[styles.card, cardStyles, style]}
            onPress={onPress}
            {...props}
        >
            <PaperCard.Content>
                {children}
            </PaperCard.Content>
        </PaperCard>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 8,
        marginVertical: 8,
        padding: 0,
    },
});