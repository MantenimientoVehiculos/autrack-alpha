// src/shared/storage/index.ts
import * as SecureStore from 'expo-secure-store';

const storage = {
    async get(key: string): Promise<string | null> {
        try {
            return await SecureStore.getItemAsync(key);
        } catch (error) {
            console.warn(`Error al leer "${key}" desde SecureStore`, error);
            return null;
        }
    },

    async set(key: string, value: string): Promise<void> {
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (error) {
            console.warn(`Error al guardar "${key}" en SecureStore`, error);
        }
    },

    async delete(key: string): Promise<void> {
        try {
            await SecureStore.deleteItemAsync(key);
        } catch (error) {
            console.warn(`Error al eliminar "${key}" de SecureStore`, error);
        }
    },
};

export default storage;
