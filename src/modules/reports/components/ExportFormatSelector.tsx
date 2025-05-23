import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    SafeAreaView
} from 'react-native';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Button } from '@/src/shared/components/ui/Button';

interface ExportFormatSelectorProps {
    onFormatSelected: (format: 'pdf' | 'excel' | 'csv') => void;
    onCancel: () => void;
    isExporting?: boolean;
}

export const ExportFormatSelector: React.FC<ExportFormatSelectorProps> = ({
    onFormatSelected,
    onCancel,
    isExporting = false
}) => {
    const { theme } = useAppTheme();
    const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');

    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const bgColor = theme === 'dark' ? '#111111' : '#F5F5F5';
    const cardColor = theme === 'dark' ? '#222222' : '#FFFFFF';
    const accentColor = theme === 'dark' ? '#B27046' : '#9D7E68';
    const borderColor = theme === 'dark' ? '#444444' : '#DDDDDD';

    const formats = [
        {
            id: 'pdf' as const,
            name: 'PDF',
            description: 'Formato ideal para compartir y visualizar',
            icon: '📄'
        },
        {
            id: 'excel' as const,
            name: 'Excel',
            description: 'Para análisis y manipulación de datos',
            icon: '📊'
        },
        {
            id: 'csv' as const,
            name: 'CSV',
            description: 'Formato universal para datos tabulares',
            icon: '📋'
        }
    ];

    const handleConfirm = () => {
        onFormatSelected(selectedFormat);
    };

    return (
        <Modal
            visible={true}
            animationType="slide"
            transparent={true}
            onRequestClose={onCancel}
        >
            <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={[styles.container, { backgroundColor: cardColor }]}>
                        <View style={styles.header}>
                            <Text style={[styles.title, { color: textColor }]}>
                                Seleccionar Formato
                            </Text>
                            <TouchableOpacity
                                onPress={onCancel}
                                disabled={isExporting}
                            >
                                <Text style={[styles.cancelText, { color: accentColor }]}>
                                    Cancelar
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.subtitle, { color: textColor }]}>
                            Elige el formato para exportar tu reporte:
                        </Text>

                        <View style={styles.formatsContainer}>
                            {formats.map((format) => (
                                <TouchableOpacity
                                    key={format.id}
                                    style={[
                                        styles.formatOption,
                                        {
                                            borderColor: selectedFormat === format.id ? accentColor : borderColor,
                                            backgroundColor: selectedFormat === format.id ? `${accentColor}15` : 'transparent'
                                        }
                                    ]}
                                    onPress={() => setSelectedFormat(format.id)}
                                    disabled={isExporting}
                                >
                                    <View style={styles.formatIcon}>
                                        <Text style={styles.iconText}>{format.icon}</Text>
                                    </View>
                                    <View style={styles.formatInfo}>
                                        <Text style={[styles.formatName, { color: textColor }]}>
                                            {format.name}
                                        </Text>
                                        <Text style={[styles.formatDescription, { color: textColor }]}>
                                            {format.description}
                                        </Text>
                                    </View>
                                    {selectedFormat === format.id && (
                                        <View style={[styles.checkmark, { backgroundColor: accentColor }]}>
                                            <Text style={styles.checkmarkText}>✓</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.actions}>
                            <Button
                                buttonVariant="primary"
                                buttonSize="large"
                                onPress={handleConfirm}
                                isLoading={isExporting}
                                disabled={isExporting}
                                style={styles.confirmButton}
                            >
                                {isExporting ? 'Exportando...' : `Exportar como ${selectedFormat.toUpperCase()}`}
                            </Button>
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    safeArea: {
        flex: 0,
    },
    container: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '500',
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 20,
        opacity: 0.8,
    },
    formatsContainer: {
        marginBottom: 24,
    },
    formatOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        marginBottom: 12,
    },
    formatIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(157, 126, 104, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconText: {
        fontSize: 20,
    },
    formatInfo: {
        flex: 1,
    },
    formatName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    formatDescription: {
        fontSize: 13,
        opacity: 0.7,
    },
    checkmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    actions: {
        paddingTop: 8,
    },
    confirmButton: {
        marginBottom: 8,
    },
});