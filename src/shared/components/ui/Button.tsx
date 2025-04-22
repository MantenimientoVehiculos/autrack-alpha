// src/shared/components/ui/Button.tsx
import React from 'react';
import { Button as PaperButton } from 'react-native-paper';
import { StyleSheet } from 'react-native';

// Extendemos las props del botón para nuestras necesidades
export interface CustomButtonProps {
    buttonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    buttonSize?: 'small' | 'medium' | 'large';
    isLoading?: boolean;
    onPress?: () => void;
    disabled?: boolean;
    children: React.ReactNode;
    icon?: string;
    contentStyle?: any;
    style?: any;
}

// Componente Button personalizado
export const Button: React.FC<CustomButtonProps> = ({
    buttonVariant = 'primary',
    buttonSize = 'medium',
    isLoading = false,
    children,
    disabled,
    icon,
    onPress,
    contentStyle,
    style,
    ...props
}) => {
    // Configuración de estilos basados en variante
    const getButtonMode = () => {
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

    // Configuración de colores basados en variante
    const getButtonColor = () => {
        switch (buttonVariant) {
            case 'primary':
                return undefined; // Usará el color primary del tema
            case 'secondary':
                return 'secondary'; // Usará el color secondary del tema
            default:
                return undefined;
        }
    };

    // Configuración de tamaño
    const getSizeStyles = () => {
        switch (buttonSize) {
            case 'small':
                return styles.small;
            case 'medium':
                return styles.medium;
            case 'large':
                return styles.large;
            default:
                return styles.medium;
        }
    };

    return (
        <PaperButton
            mode={getButtonMode()}
            buttonColor={getButtonMode() === 'contained' ? getButtonColor() : undefined}
            textColor={getButtonMode() !== 'contained' ? getButtonColor() : undefined}
            loading={isLoading}
            disabled={isLoading || disabled}
            icon={icon}
            onPress={onPress}
            style={[getSizeStyles(), style]}
            contentStyle={[
                buttonSize === 'large' ? { height: 52 } : {},
                buttonSize === 'small' ? { height: 32 } : {},
                contentStyle
            ]}
            {...props}
        >
            {children}
        </PaperButton>
    );
};

const styles = StyleSheet.create({
    small: {
        borderRadius: 4,
    },
    medium: {
        borderRadius: 8,
    },
    large: {
        borderRadius: 8,
    },
});