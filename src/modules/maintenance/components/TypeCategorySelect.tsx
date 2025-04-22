// src/modules/maintenance/components/TypeCategorySelect.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { MaintenanceCategory, MaintenanceType } from '../models/maintenance';
import { ChevronRight } from '@/src/shared/components/ui/Icons';
import { Button } from '@/src/shared/components/ui/Button';
import { Input } from '@/src/shared/components/ui/Input';

interface TypeCategorySelectProps {
    categories: MaintenanceCategory[];
    maintenanceTypes: MaintenanceType[];
    isLoading: boolean;
    selectedCategoryId: number | null;
    selectedTypeId: number | null;
    onSelectCategory: (categoryId: number) => void;
    onSelectType: (typeId: number) => void;
    onCreateCustomType: (data: { id_categoria: number, nombre: string, descripcion: string }) => Promise<void>;
    error?: string | null;
}

export const TypeCategorySelect: React.FC<TypeCategorySelectProps> = ({
    categories,
    maintenanceTypes,
    isLoading,
    selectedCategoryId,
    selectedTypeId,
    onSelectCategory,
    onSelectType,
    onCreateCustomType,
    error
}) => {
    const { theme } = useAppTheme();
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [showCustomTypeModal, setShowCustomTypeModal] = useState(false);
    const [customTypeName, setCustomTypeName] = useState('');
    const [customTypeDescription, setCustomTypeDescription] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Valores seleccionados
    const selectedCategory = categories.find(c => c.id_categoria === selectedCategoryId);
    const selectedType = maintenanceTypes.find(t => t.id_tipo === selectedTypeId);

    // Colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const bgColor = theme === 'dark' ? '#222222' : '#FFFFFF';
    const borderColor = theme === 'dark' ? '#444444' : '#DDDDDD';

    // Filtrar categorías por búsqueda
    const filteredCategories = searchQuery.trim() !== ''
        ? categories.filter(c => c.nombre.toLowerCase().includes(searchQuery.toLowerCase()))
        : categories;

    // Filtrar tipos por búsqueda y categoría seleccionada
    const filteredTypes = maintenanceTypes
        .filter(t => selectedCategoryId ? t.id_categoria === selectedCategoryId : true)
        .filter(t => searchQuery.trim() !== ''
            ? t.nombre.toLowerCase().includes(searchQuery.toLowerCase())
            : true);

    // Limpiar búsqueda al cerrar modales
    const clearSearch = () => {
        setSearchQuery('');
    };

    // Abrir modal de categorías
    const openCategoryModal = () => {
        clearSearch();
        setShowCategoryModal(true);
    };

    // Abrir modal de tipos
    const openTypeModal = () => {
        if (!selectedCategoryId) return;
        clearSearch();
        setShowTypeModal(true);
    };

    // Seleccionar una categoría
    const handleSelectCategory = (categoryId: number) => {
        onSelectCategory(categoryId);
        setShowCategoryModal(false);
        // Resetear tipo seleccionado
        onSelectType(0);
    };

    // Seleccionar un tipo
    const handleSelectType = (typeId: number) => {
        onSelectType(typeId);
        setShowTypeModal(false);
    };

    // Crear un tipo personalizado
    const handleCreateCustomType = async () => {
        if (customTypeName.trim() === '' || !selectedCategoryId) return;

        await onCreateCustomType({
            id_categoria: selectedCategoryId,
            nombre: customTypeName.trim(),
            descripcion: customTypeDescription.trim() || `${customTypeName.trim()} personalizado`
        });

        setCustomTypeName('');
        setCustomTypeDescription('');
        setShowCustomTypeModal(false);
    };

    // Renderizar cada categoría en la lista
    const renderCategoryItem = ({ item }: { item: MaintenanceCategory }) => (
        <TouchableOpacity
            style={[
                styles.itemContainer,
                selectedCategoryId === item.id_categoria && styles.selectedItem
            ]}
            onPress={() => handleSelectCategory(item.id_categoria)}
            activeOpacity={0.7}
        >
            <Text style={[styles.itemText, { color: textColor }]}>
                {item.nombre}
            </Text>
            {selectedCategoryId === item.id_categoria && (
                <View style={styles.checkmark} />
            )}
        </TouchableOpacity>
    );

    // Renderizar cada tipo en la lista
    const renderTypeItem = ({ item }: { item: MaintenanceType }) => (
        <TouchableOpacity
            style={[
                styles.itemContainer,
                selectedTypeId === item.id_tipo && styles.selectedItem
            ]}
            onPress={() => handleSelectType(item.id_tipo)}
            activeOpacity={0.7}
        >
            <Text style={[styles.itemText, { color: textColor }]}>
                {item.nombre}
            </Text>
            {selectedTypeId === item.id_tipo && (
                <View style={styles.checkmark} />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Selector de Categoría */}
            <Text style={[styles.label, { color: textColor }]}>Categoría de Mantenimiento *</Text>
            <TouchableOpacity
                style={[
                    styles.selectButton,
                    { borderColor: borderColor, backgroundColor: bgColor }
                ]}
                onPress={openCategoryModal}
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.selectText,
                    { color: selectedCategory ? textColor : '#AAAAAA' }
                ]}>
                    {selectedCategory ? selectedCategory.nombre : 'Seleccione una categoría'}
                </Text>
                <ChevronRight size={20} color={textColor} />
            </TouchableOpacity>

            {/* Selector de Tipo */}
            <Text style={[styles.label, { color: textColor, marginTop: 16 }]}>Tipo de Mantenimiento *</Text>
            <TouchableOpacity
                style={[
                    styles.selectButton,
                    { borderColor: borderColor, backgroundColor: bgColor },
                    !selectedCategoryId && styles.disabledButton
                ]}
                onPress={openTypeModal}
                activeOpacity={selectedCategoryId ? 0.7 : 1}
                disabled={!selectedCategoryId}
            >
                <Text style={[
                    styles.selectText,
                    { color: selectedType ? textColor : '#AAAAAA' }
                ]}>
                    {selectedType
                        ? selectedType.nombre
                        : !selectedCategoryId
                            ? 'Primero seleccione una categoría'
                            : 'Seleccione un tipo de mantenimiento'}
                </Text>
                <ChevronRight size={20} color={selectedCategoryId ? textColor : '#AAAAAA'} />
            </TouchableOpacity>

            {/* Error message */}
            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}

            {/* Modal de Categorías */}
            <Modal
                visible={showCategoryModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCategoryModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: bgColor }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: textColor }]}>
                                Seleccionar Categoría
                            </Text>
                            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                                <Text style={styles.closeButton}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={[styles.searchInput, { color: textColor, borderColor: borderColor }]}
                            placeholder="Buscar categoría..."
                            placeholderTextColor="#AAAAAA"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />

                        {isLoading ? (
                            <ActivityIndicator size="large" color="#9D7E68" style={styles.loader} />
                        ) : (
                            <FlatList
                                data={filteredCategories}
                                renderItem={renderCategoryItem}
                                keyExtractor={(item) => item.id_categoria.toString()}
                                contentContainerStyle={styles.listContent}
                                ListEmptyComponent={
                                    <Text style={[styles.emptyText, { color: textColor }]}>
                                        No se encontraron categorías
                                    </Text>
                                }
                            />
                        )}
                    </View>
                </View>
            </Modal>

            {/* Modal de Tipos */}
            <Modal
                visible={showTypeModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowTypeModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: bgColor }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: textColor }]}>
                                Seleccionar Tipo de Mantenimiento
                            </Text>
                            <TouchableOpacity onPress={() => setShowTypeModal(false)}>
                                <Text style={styles.closeButton}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={[styles.searchInput, { color: textColor, borderColor: borderColor }]}
                            placeholder="Buscar tipo de mantenimiento..."
                            placeholderTextColor="#AAAAAA"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />

                        {isLoading ? (
                            <ActivityIndicator size="large" color="#9D7E68" style={styles.loader} />
                        ) : (
                            <>
                                <FlatList
                                    data={filteredTypes}
                                    renderItem={renderTypeItem}
                                    keyExtractor={(item) => item.id_tipo.toString()}
                                    contentContainerStyle={styles.listContent}
                                    ListEmptyComponent={
                                        <Text style={[styles.emptyText, { color: textColor }]}>
                                            No se encontraron tipos de mantenimiento para esta categoría
                                        </Text>
                                    }
                                />

                                <Button
                                    buttonVariant="outline"
                                    buttonSize="medium"
                                    onPress={() => {
                                        setShowTypeModal(false);
                                        setShowCustomTypeModal(true);
                                    }}
                                    style={styles.customTypeButton}
                                >
                                    Crear tipo personalizado
                                </Button>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Modal de Tipo Personalizado */}
            <Modal
                visible={showCustomTypeModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCustomTypeModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: bgColor, height: 'auto' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: textColor }]}>
                                Crear Tipo de Mantenimiento
                            </Text>
                            <TouchableOpacity onPress={() => setShowCustomTypeModal(false)}>
                                <Text style={styles.closeButton}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.customTypeText, { color: textColor }]}>
                            Ingresa el nombre del tipo de mantenimiento que deseas crear para la categoría {selectedCategory?.nombre}
                        </Text>

                        <Input
                            label="Nombre del tipo"
                            value={customTypeName}
                            onChangeText={setCustomTypeName}
                            placeholder="Ej. Cambio de Aceite Premium"
                            error={customTypeName.trim() === '' ? 'El nombre es requerido' : ''}
                            style={styles.customTypeInput}
                        />

                        <Input
                            label="Descripción (opcional)"
                            value={customTypeDescription}
                            onChangeText={setCustomTypeDescription}
                            placeholder="Describe este tipo de mantenimiento"
                            multiline
                            numberOfLines={3}
                            style={styles.customTypeInput}
                        />

                        <View style={styles.customTypeActions}>
                            <Button
                                buttonVariant="outline"
                                buttonSize="medium"
                                onPress={() => setShowCustomTypeModal(false)}
                                style={styles.cancelButton}
                            >
                                Cancelar
                            </Button>

                            <Button
                                buttonVariant="primary"
                                buttonSize="medium"
                                onPress={handleCreateCustomType}
                                isLoading={isLoading}
                                disabled={customTypeName.trim() === ''}
                                style={styles.createButton}
                            >
                                Crear Tipo
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    selectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 48,
    },
    disabledButton: {
        opacity: 0.6,
    },
    selectText: {
        fontSize: 16,
    },
    errorText: {
        color: '#CF6679',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        height: '70%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#DDDDDD',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        color: '#9D7E68',
        fontSize: 16,
    },
    searchInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginBottom: 16,
        fontSize: 16,
    },
    listContent: {
        paddingBottom: 16,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    selectedItem: {
        backgroundColor: 'rgba(157, 126, 104, 0.1)',
    },
    itemText: {
        fontSize: 16,
    },
    checkmark: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#9D7E68',
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        marginTop: 24,
    },
    loader: {
        marginTop: 24,
    },
    customTypeButton: {
        marginTop: 16,
    },
    customTypeText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
    },
    customTypeInput: {
        marginBottom: 16,
    },
    customTypeActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
        marginRight: 8,
    },
    createButton: {
        flex: 1,
        marginLeft: 8,
    },
});

export default TypeCategorySelect;