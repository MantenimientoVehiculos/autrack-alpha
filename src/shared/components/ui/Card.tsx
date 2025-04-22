// src/shared/components/ui/Card.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { Card as PaperCard, useTheme } from 'react-native-paper';
import type { CardProps } from 'react-native-paper';

export interface CustomCardProps extends Omit<CardProps, 'mode' | 'children'> {
    variant?: 'elevated' | 'outlined' | 'filled';
    children: React.ReactNode;
}

export const Card: React.FC<CustomCardProps> = ({
    variant = 'elevated',
    children,
    style,
    ...props
}) => {
    const theme = useTheme();

    // Mapeo de variantes a mode de Paper
    const getCardMode = (): "elevated" | "outlined" | "contained" => {
        switch (variant) {
            case 'elevated':
                return 'elevated';
            case 'outlined':
                return 'outlined';
            case 'filled':
                return 'contained';
            default:
                return 'elevated';
        }
    };

    // Estilos adicionales basados en la variante
    const getCardStyles = () => {
        switch (variant) {
            case 'elevated':
                return styles.elevated;
            case 'outlined':
                return styles.outlined;
            case 'filled':
                return [styles.filled, { backgroundColor: theme.colors.surfaceVariant }];
            default:
                return {};
        }
    };

    // Remove elevation prop if mode is 'contained'
    const cardProps = variant === 'filled' ?
        (({ elevation, ...rest }) => rest)(props) :
        props;

    return (
        <PaperCard
            mode={getCardMode()}
            style={[getCardStyles(), style]}
            {...cardProps}
        >
            {children}
        </PaperCard>
    );
};

const styles = StyleSheet.create({
    elevated: {
        margin: 8,
    },
    outlined: {
        margin: 8,
    },
    filled: {
        margin: 8,
    },
});