// src/shared/components/ui/Input.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Text, useTheme } from 'react-native-paper';
import type { TextInputProps } from 'react-native-paper';

export interface CustomInputProps extends TextInputProps {
    label?: string;
    errorMessage?: string;
}

export const Input: React.FC<CustomInputProps> = ({
    label,
    errorMessage,
    mode = 'outlined',
    ...props
}) => {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            <TextInput
                label={label}
                mode={mode}
                error={!!errorMessage}
                style={styles.input}
                outlineColor={errorMessage ? theme.colors.error : theme.colors.outline}
                activeOutlineColor={errorMessage ? theme.colors.error : theme.colors.primary}
                {...props}
            />
            {errorMessage && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {errorMessage}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 4,
    },
    input: {
        width: '100%',
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 12,
    },
});