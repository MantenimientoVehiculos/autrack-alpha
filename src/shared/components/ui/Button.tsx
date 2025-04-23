// src/shared/components/ui/Button.tsx
import React from 'react';
import { Button as PaperButton } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

// Extender las props del botón para nuestras necesidades
export interface CustomButtonProps {
    buttonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    buttonSize?: 'small' | 'medium' | 'large' | 'noPadding';
    isLoading?: boolean;
    children: React.ReactNode;
    disabled?: boolean;
    onPress?: () => void;
    style?: any;
}

// Componente Button personalizado
export const Button: React.FC<CustomButtonProps> = ({
    buttonVariant = 'primary',
    buttonSize = 'medium',
    isLoading = false,
    children,
    disabled,
    onPress,
    style,
    ...props
}) => {
    const theme = useTheme();

    // Configuración de estilos basados en variante
    const getButtonStyles = () => {
        const styles: any = {};

        switch (buttonVariant) {
            case 'primary':
                styles.backgroundColor = theme.colors.primary;
                styles.borderWidth = 0;
                break;
            case 'secondary':
                styles.backgroundColor = theme.colors.secondary;
                styles.borderWidth = 0;
                break;
            case 'outline':
                styles.backgroundColor = 'transparent';
                styles.borderWidth = 1;
                styles.borderColor = theme.colors.primary;
                break;
            case 'ghost':
                styles.backgroundColor = 'transparent';
                styles.borderWidth = 0;
                break;
            default:
                break;
        }

        return styles;
    };

    // Configuración de tamaño
    const getSizeStyles = () => {
        switch (buttonSize) {
            case 'small':
                return {
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                    fontSize: 12,
                };
            case 'medium':
                return {
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    fontSize: 14,
                };
            case 'large':
                return {
                    paddingHorizontal: 22,
                    paddingVertical: 10,
                    fontSize: 16,
                };
            case 'noPadding':
                return {
                    paddingHorizontal: 0,
                    paddingVertical: 0,
                    fontSize: 14,
                };
            default:
                return {};
        }
    };

    const buttonStyles = getButtonStyles();
    const sizeStyles = getSizeStyles();

    // Determinar el modo basado en la variante
    const getMode = () => {
        switch (buttonVariant) {
            case 'primary':
            case 'secondary':
                return 'contained';
            case 'outline':
                return 'outlined';
            case 'ghost':
                return 'text';
            default:
                return 'contained';
        }
    };

    // Obtener el color del texto para el botón
    const getTextColor = () => {
        switch (buttonVariant) {
            case 'primary':
            case 'secondary':
                return 'white';
            case 'outline':
            case 'ghost':
                return theme.colors.primary;
            default:
                return 'white';
        }
    };

    return (
        <PaperButton
            mode={getMode()}
            style={[styles.button, buttonStyles, , style]}
            labelStyle={sizeStyles}
            onPress={onPress}
            loading={isLoading}
            disabled={disabled || isLoading}
            textColor={getTextColor()}
            {...props}
        >
            {children}
        </PaperButton>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 12,
    },
});