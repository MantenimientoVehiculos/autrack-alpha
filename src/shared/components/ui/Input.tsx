// src/shared/components/ui/Input.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Text, useTheme } from 'react-native-paper';

export interface CustomInputProps {
    label?: string;
    error?: string;
    value: string;
    onChangeText?: (text: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoComplete?: string;
    keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
    disabled?: boolean;
    multiline?: boolean;
    numberOfLines?: number;
    style?: any;
}

export const Input: React.FC<CustomInputProps> = ({
    label,
    error,
    value,
    onChangeText,
    onBlur,
    placeholder,
    secureTextEntry,
    autoCapitalize,
    autoComplete,
    keyboardType,
    disabled,
    multiline,
    numberOfLines,
    style,
    ...props
}) => {
    const theme = useTheme();

    return (
        <View style={[styles.container, style]}>
            <TextInput
                label={label}
                value={value}
                onChangeText={onChangeText}
                onBlur={onBlur}
                error={!!error}
                secureTextEntry={secureTextEntry}
                placeholder={placeholder}
                autoCapitalize={autoCapitalize}
                keyboardType={keyboardType as any}
                disabled={disabled}
                multiline={multiline}
                numberOfLines={numberOfLines}
                mode="outlined"
                outlineColor={error ? theme.colors.error : theme.colors.outline}
                activeOutlineColor={error ? theme.colors.error : theme.colors.primary}
                style={styles.input}
                {...props}
            />
            {error && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {error}
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
        backgroundColor: 'transparent',
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 8,
    }
});