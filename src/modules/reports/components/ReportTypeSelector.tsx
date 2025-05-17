// src/modules/reports/components/ReportTypeSelector.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    SafeAreaView
} from 'react-native';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Button } from '@/src/shared/components/ui/Button';

interface ReportTypeSelectorProps {
    types: { id: number, nombre: string }[];
    selectedIds: number[];
    onConfirm: (selectedIds: number[]) => void;
    onCancel: () => void;
}

export const ReportTypeSelector: React.FC<ReportTypeSelectorProps> = ({
    types,
    selectedIds,
    onConfirm,
    onCancel
}) => {
    const { theme } = useAppTheme();
    const [localSelectedIds, setLocalSelectedIds] = useState<number[]>([...selectedIds]);
    const [searchQuery, setSearchQuery] = useState('');

    // Restablecer selecciones locales cuando cambian las props
    useEffect(() => {
        setLocalSelectedIds([...selectedIds]);
    }, [selectedIds]);

    // Filtrar tipos por búsqueda
    const filteredTypes = searchQuery.trim() !== ''
        ? types.filter(type => type.nombre.toLowerCase().includes(searchQuery.toLowerCase()))
        : types;

    // Alternar selección
    const toggleSelection = (id: number) => {
        setLocalSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    // Seleccionar todo
    const selectAll = () => {
        setLocalSelectedIds(types.map(type => type.id));
    };

    // Deseleccionar todo
    const deselectAll = () => {
        setLocalSelectedIds([]);
    };

    // Obtener colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const bgColor = theme === 'dark' ? '#222222' : '#FFFFFF';
    const modalBgColor = theme === 'dark' ? '#111111' : '#F5F5F5';
    const borderColor = theme === 'dark' ? '#444444' : '#DDDDDD';
    const primaryColor = theme === 'dark' ? '#B27046' : '#9D7E68';

    // Renderizar cada elemento de tipo
    const renderTypeItem = ({ item }: { item: { id: number, nombre: string } }) => {
        const isSelected = localSelectedIds.includes(item.id);

        return (
            <TouchableOpacity
                style={[
                    styles.typeItem,
                    { borderBottomColor: borderColor },
                    isSelected && { backgroundColor: `${primaryColor}20` }
                ]}
                onPress={() => toggleSelection(item.id)}
            >
                <Text style={{ color: textColor }}>
                    {item.nombre}
                </Text>
                <View style={[
                    styles.checkbox,
                    { borderColor: primaryColor },
                    isSelected && { backgroundColor: primaryColor }
                ]}>
                    {isSelected && (
                        <Text style={{ color: '#FFFFFF', fontSize: 12 }}>✓</Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={true}
            animationType="slide"
            transparent={true}
            onRequestClose={onCancel}
        >
            <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <SafeAreaView style={[styles.modalContainer, { backgroundColor: modalBgColor }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: textColor }]}>
                            Seleccionar Tipos de Mantenimiento
                        </Text>
                        <TouchableOpacity onPress={onCancel}>
                            <Text style={{ color: primaryColor }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={[
                            styles.searchInput,
                            {
                                backgroundColor: bgColor,
                                color: textColor,
                                borderColor: borderColor
                            }
                        ]}
                        placeholder="Buscar tipo de mantenimiento..."
                        placeholderTextColor={theme === 'dark' ? '#BBBBBB' : '#999999'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />

                    <View style={styles.selectionControls}>
                        <Text style={[styles.selectionInfo, { color: textColor }]}>
                            {localSelectedIds.length} de {types.length} seleccionados
                        </Text>
                        <View style={styles.selectionButtons}>
                            <TouchableOpacity
                                style={styles.selectionButton}
                                onPress={selectAll}
                            >
                                <Text style={{ color: primaryColor }}>Seleccionar todo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.selectionButton}
                                onPress={deselectAll}
                            >
                                <Text style={{ color: primaryColor }}>Deseleccionar todo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <FlatList
                        data={filteredTypes}
                        renderItem={renderTypeItem}
                        keyExtractor={item => item.id.toString()}
                        style={[styles.list, { backgroundColor: bgColor }]}
                        contentContainerStyle={styles.listContent}
                        initialNumToRender={10}
                        maxToRenderPerBatch={20}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={{ color: textColor }}>
                                    {searchQuery ? 'No se encontraron resultados' : 'No hay tipos disponibles'}
                                </Text>
                            </View>
                        }
                    />

                    <View style={styles.buttonContainer}>
                        <Button
                            buttonVariant="primary"
                            buttonSize="large"
                            onPress={() => onConfirm(localSelectedIds)}
                            style={{ marginBottom: 8 }}
                        >
                            Confirmar ({localSelectedIds.length})
                        </Button>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        height: '90%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    searchInput: {
        margin: 16,
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
        fontSize: 16,
    },
    selectionControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    selectionInfo: {
        fontSize: 14,
    },
    selectionButtons: {
        flexDirection: 'row',
    },
    selectionButton: {
        marginLeft: 16,
    },
    list: {
        flex: 1,
        borderRadius: 8,
        margin: 16,
        marginTop: 8,
    },
    listContent: {
        paddingTop: 4,
    },
    typeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        padding: 24,
        alignItems: 'center',
    },
    buttonContainer: {
        padding: 16,
    },
});

export default ReportTypeSelector;