// src/shared/components/ui/Button.tsx
import React from 'react';
import { Button as TamaguiButton, Text, styled, ButtonProps } from 'tamagui';

// Extender las props del botón para nuestras necesidades
export interface CustomButtonProps extends Omit<ButtonProps, 'size' | 'variant'> {
    buttonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    buttonSize?: 'small' | 'medium' | 'large';
    isLoading?: boolean;
}

// Componente Button personalizado
export const Button: React.FC<CustomButtonProps> = ({
    buttonVariant = 'primary',
    buttonSize = 'medium',
    isLoading = false,
    children,
    ...props
}) => {
    // Configuración de estilos basados en variante
    const getButtonStyles = () => {
        switch (buttonVariant) {
            case 'primary':
                return {
                    backgroundColor: '$primary',
                    color: 'white',
                    borderWidth: 0,
                    hoverStyle: { backgroundColor: '$primaryHover' },
                    pressStyle: { backgroundColor: '$primaryPress' },
                };
            case 'secondary':
                return {
                    backgroundColor: '$secondary',
                    color: 'white',
                    borderWidth: 0,
                    hoverStyle: { backgroundColor: '$secondaryHover' },
                    pressStyle: { backgroundColor: '$secondaryPress' },
                };
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    color: '$primary',
                    borderWidth: 1,
                    borderColor: '$primary',
                    hoverStyle: { backgroundColor: '$backgroundHover' },
                    pressStyle: { backgroundColor: '$backgroundPress' },
                };
            case 'ghost':
                return {
                    backgroundColor: 'transparent',
                    color: '$primary',
                    borderWidth: 0,
                    hoverStyle: { backgroundColor: '$backgroundHover' },
                    pressStyle: { backgroundColor: '$backgroundPress' },
                };
            default:
                return {};
        }
    };

    // Configuración de tamaño
    const getSizeStyles = () => {
        switch (buttonSize) {
            case 'small':
                return {
                    paddingHorizontal: '$2',
                    paddingVertical: '$1',
                    fontSize: 14,
                };
            case 'medium':
                return {
                    paddingHorizontal: '$3',
                    paddingVertical: '$2',
                    fontSize: 16,
                };
            case 'large':
                return {
                    paddingHorizontal: '$4',
                    paddingVertical: '$3',
                    fontSize: 18,
                };
            default:
                return {};
        }
    };

    const buttonStyles = getButtonStyles();
    const sizeStyles = getSizeStyles();

    return (
        <TamaguiButton
            {...buttonStyles}
            {...sizeStyles}
            {...props}
            opacity={isLoading || props.disabled ? 0.7 : 1}
        >
            {isLoading ? 'Cargando...' : children}
        </TamaguiButton>
    );
};



