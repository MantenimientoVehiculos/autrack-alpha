// src/modules/vehicles/components/BrandModelSelect.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Brand, Model } from '../models/vehicle';
import { ChevronRight } from '@/src/shared/components/ui/Icons';
import { Button } from '@/src/shared/components/ui/Button';
import { Input } from '@/src/shared/components/ui/Input';

interface BrandModelSelectProps {
    brands: Brand[];
    models: Model[];
    isLoading: boolean;
    selectedBrandId: number | null;
    selectedModelId: number | null;
    onSelectBrand: (brandId: number) => Promise<void>;
    onSelectModel: (modelId: number) => void;
    onCreateCustomModel: (name: string) => Promise<void>;
    error?: string | null;
}

export const BrandModelSelect: React.FC<BrandModelSelectProps> = ({
    brands,
    models,
    isLoading,
    selectedBrandId,
    selectedModelId,
    onSelectBrand,
    onSelectModel,
    onCreateCustomModel,
    error
}) => {
    const { theme } = useAppTheme();
    const [showBrandModal, setShowBrandModal] = useState(false);
    const [showModelModal, setShowModelModal] = useState(false);
    const [showCustomModelModal, setShowCustomModelModal] = useState(false);
    const [customModelName, setCustomModelName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Valores seleccionados
    const selectedBrand = brands.find(b => b.id_marca === selectedBrandId);
    const selectedModel = models.find(m => m.id_modelo === selectedModelId);

    // Colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const bgColor = theme === 'dark' ? '#222222' : '#FFFFFF';
    const borderColor = theme === 'dark' ? '#444444' : '#DDDDDD';

    // Filtrar marcas por búsqueda
    const filteredBrands = searchQuery.trim() !== ''
        ? brands.filter(b => b.nombre.toLowerCase().includes(searchQuery.toLowerCase()))
        : brands;

    // Filtrar modelos por búsqueda
    const filteredModels = searchQuery.trim() !== ''
        ? models.filter(m => m.nombre.toLowerCase().includes(searchQuery.toLowerCase()))
        : models;

    // Limpiar búsqueda al cerrar modales
    const clearSearch = () => {
        setSearchQuery('');
    };

    // Abrir modal de marcas
    const openBrandModal = () => {
        clearSearch();
        setShowBrandModal(true);
    };

    // Abrir modal de modelos
    const openModelModal = () => {
        if (!selectedBrandId) return;
        clearSearch();
        setShowModelModal(true);
    };

    // Seleccionar una marca
    const handleSelectBrand = async (brandId: number) => {
        await onSelectBrand(brandId);
        setShowBrandModal(false);
        // Resetear modelo seleccionado
        onSelectModel(0);
    };

    // Seleccionar un modelo
    const handleSelectModel = (modelId: number) => {
        onSelectModel(modelId);
        setShowModelModal(false);
    };

    // Crear un modelo personalizado
    const handleCreateCustomModel = async () => {
        if (customModelName.trim() === '') return;

        await onCreateCustomModel(customModelName.trim());
        setCustomModelName('');
        setShowCustomModelModal(false);
    };

    // Renderizar cada marca en la lista
    const renderBrandItem = ({ item }: { item: Brand }) => (
        <TouchableOpacity
            style={[
                styles.itemContainer,
                selectedBrandId === item.id_marca && styles.selectedItem
            ]}
            onPress={() => handleSelectBrand(item.id_marca)}
            activeOpacity={0.7}
        >
            <Text style={[styles.itemText, { color: textColor }]}>
                {item.nombre}
            </Text>
            {selectedBrandId === item.id_marca && (
                <View style={styles.checkmark} />
            )}
        </TouchableOpacity>
    );

    // Renderizar cada modelo en la lista
    const renderModelItem = ({ item }: { item: Model }) => (
        <TouchableOpacity
            style={[
                styles.itemContainer,
                selectedModelId === item.id_modelo && styles.selectedItem
            ]}
            onPress={() => handleSelectModel(item.id_modelo)}
            activeOpacity={0.7}
        >
            <Text style={[styles.itemText, { color: textColor }]}>
                {item.nombre}
            </Text>
            {selectedModelId === item.id_modelo && (
                <View style={styles.checkmark} />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Selector de Marca */}
            <Text style={[styles.label, { color: textColor }]}>Marca *</Text>
            <TouchableOpacity
                style={[
                    styles.selectButton,
                    { borderColor: borderColor, backgroundColor: bgColor }
                ]}
                onPress={openBrandModal}
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.selectText,
                    { color: selectedBrand ? textColor : '#AAAAAA' }
                ]}>
                    {selectedBrand ? selectedBrand.nombre : 'Seleccione una marca'}
                </Text>
                <ChevronRight size={20} color={textColor} />
            </TouchableOpacity>

            {/* Selector de Modelo */}
            <Text style={[styles.label, { color: textColor, marginTop: 16 }]}>Modelo *</Text>
            <TouchableOpacity
                style={[
                    styles.selectButton,
                    { borderColor: borderColor, backgroundColor: bgColor },
                    !selectedBrandId && styles.disabledButton
                ]}
                onPress={openModelModal}
                activeOpacity={selectedBrandId ? 0.7 : 1}
                disabled={!selectedBrandId}
            >
                <Text style={[
                    styles.selectText,
                    { color: selectedModel ? textColor : '#AAAAAA' }
                ]}>
                    {selectedModel
                        ? selectedModel.nombre
                        : !selectedBrandId
                            ? 'Primero seleccione una marca'
                            : 'Seleccione un modelo'}
                </Text>
                <ChevronRight size={20} color={selectedBrandId ? textColor : '#AAAAAA'} />
            </TouchableOpacity>

            {/* Error message */}
            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}

            {/* Modal de Marcas */}
            <Modal
                visible={showBrandModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowBrandModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: bgColor }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: textColor }]}>
                                Seleccionar Marca
                            </Text>
                            <TouchableOpacity onPress={() => setShowBrandModal(false)}>
                                <Text style={styles.closeButton}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={[styles.searchInput, { color: textColor, borderColor: borderColor }]}
                            placeholder="Buscar marca..."
                            placeholderTextColor="#AAAAAA"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />

                        {isLoading ? (
                            <ActivityIndicator size="large" color="#9D7E68" style={styles.loader} />
                        ) : (
                            <FlatList
                                data={filteredBrands}
                                renderItem={renderBrandItem}
                                keyExtractor={(item) => item.id_marca.toString()}
                                contentContainerStyle={styles.listContent}
                                ListEmptyComponent={
                                    <Text style={[styles.emptyText, { color: textColor }]}>
                                        No se encontraron marcas
                                    </Text>
                                }
                            />
                        )}
                    </View>
                </View>
            </Modal>

            {/* Modal de Modelos */}
            <Modal
                visible={showModelModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowModelModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: bgColor }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: textColor }]}>
                                Seleccionar Modelo
                            </Text>
                            <TouchableOpacity onPress={() => setShowModelModal(false)}>
                                <Text style={styles.closeButton}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={[styles.searchInput, { color: textColor, borderColor: borderColor }]}
                            placeholder="Buscar modelo..."
                            placeholderTextColor="#AAAAAA"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />

                        {isLoading ? (
                            <ActivityIndicator size="large" color="#9D7E68" style={styles.loader} />
                        ) : (
                            <>
                                <FlatList
                                    data={filteredModels}
                                    renderItem={renderModelItem}
                                    keyExtractor={(item) => item.id_modelo.toString()}
                                    contentContainerStyle={styles.listContent}
                                    ListEmptyComponent={
                                        <Text style={[styles.emptyText, { color: textColor }]}>
                                            No se encontraron modelos para esta marca
                                        </Text>
                                    }
                                />

                                <Button
                                    buttonVariant="outline"
                                    buttonSize="medium"
                                    onPress={() => {
                                        setShowModelModal(false);
                                        setShowCustomModelModal(true);
                                    }}
                                    style={styles.customModelButton}
                                >
                                    Crear modelo personalizado
                                </Button>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Modal de Modelo Personalizado */}
            <Modal
                visible={showCustomModelModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCustomModelModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: bgColor, height: 'auto' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: textColor }]}>
                                Crear Modelo Personalizado
                            </Text>
                            <TouchableOpacity onPress={() => setShowCustomModelModal(false)}>
                                <Text style={styles.closeButton}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.customModelText, { color: textColor }]}>
                            Ingresa el nombre del modelo que deseas crear para {selectedBrand?.nombre}
                        </Text>

                        <Input
                            label="Nombre del modelo"
                            value={customModelName}
                            onChangeText={setCustomModelName}
                            placeholder="Ej. Corolla Cross"
                            error={customModelName.trim() === '' ? 'El nombre del modelo es requerido' : ''}
                            style={styles.customModelInput}
                        />

                        <View style={styles.customModelActions}>
                            <Button
                                buttonVariant="outline"
                                buttonSize="medium"
                                onPress={() => setShowCustomModelModal(false)}
                                style={styles.cancelButton}
                            >
                                Cancelar
                            </Button>

                            <Button
                                buttonVariant="primary"
                                buttonSize="medium"
                                onPress={handleCreateCustomModel}
                                isLoading={isLoading}
                                disabled={customModelName.trim() === ''}
                                style={styles.createButton}
                            >
                                Crear Modelo
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
    customModelButton: {
        marginTop: 16,
    },
    customModelText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
    },
    customModelInput: {
        marginBottom: 16,
    },
    customModelActions: {
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

export default BrandModelSelect;