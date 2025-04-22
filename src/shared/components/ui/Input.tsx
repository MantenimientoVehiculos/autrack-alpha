// src/shared/components/ui/Input.tsx
import { Input as TamaguiInput, styled, InputProps, XStack, YStack, Label, Text } from 'tamagui';

export interface CustomInputProps extends InputProps {
    label?: string;
    error?: string;
}

export const Input: React.FC<CustomInputProps> = ({
    label,
    error,
    ...props
}) => {
    return (
        <YStack space="$1" width="100%">
            {label && <Label>{label}</Label>}
            <TamaguiInput
                borderColor={error ? 'red' : '$borderColor'}
                focusStyle={{ borderColor: error ? 'red' : '$primary' }}
                {...props}
            />
            {error && (
                <Text color="red" fontSize="$1">
                    {error}
                </Text>
            )}
        </YStack>
    );
};

