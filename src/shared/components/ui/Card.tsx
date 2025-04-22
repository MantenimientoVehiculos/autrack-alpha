// src/shared/components/ui/Card.tsx
import { Card as TamaguiCard, styled, CardProps } from 'tamagui';

export interface CustomCardProps extends CardProps {
    variant?: 'elevated' | 'outlined' | 'filled';
}

export const Card: React.FC<CustomCardProps> = ({
    variant = 'elevated',
    children,
    ...props
}) => {
    // Estilos basados en la variante
    const getCardStyles = () => {
        switch (variant) {
            case 'elevated':
                return {
                    backgroundColor: '$background',
                    shadowColor: '$shadowColor',
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    elevation: 3,
                    borderWidth: 0,
                };
            case 'outlined':
                return {
                    backgroundColor: '$background',
                    borderWidth: 1,
                    borderColor: '$borderColor',
                };
            case 'filled':
                return {
                    backgroundColor: '$surface',
                    borderWidth: 0,
                };
            default:
                return {};
        }
    };

    const cardStyles = getCardStyles();

    return (
        <TamaguiCard padding="$3" borderRadius="$2" {...cardStyles} {...props}>
            {children}
        </TamaguiCard>
    );
};

