import { supabase } from './supabase';
import { logger } from './logger';

/**
 * API CLient Centralizado
 * Encapsula manejo de errores, logging y respuesta estándar.
 */

const handleRequest = async (requestFn, context = '') => {
    try {
        const { data, error } = await requestFn();

        if (error) {
            throw error;
        }

        return { data, error: null };
    } catch (err) {
        logger.error(`API Error: ${context}`, err);
        // Normalizamos el error para que la UI pueda manejarlo si es necesario
        // pero asegurando que ya fue logueado.
        throw err;
    }
};

export const apiClient = {
    /**
     * Ejecuta una consulta genérica a una tabla
     * @param {string} table - Nombre de la tabla
     * @param {Function} queryBuilder - Función opcional para construir la query (select, filter, etc.)
     */
    async get(table, queryBuilder) {
        return handleRequest(async () => {
            let query = supabase.from(table).select('*');
            if (queryBuilder) {
                query = queryBuilder(query);
            }
            return await query;
        }, `GET ${table}`);
    },

    /**
     * Ejecuta un RPC (Remote Procedure Call)
     * @param {string} functionName - Nombre de la función en DB
     * @param {Object} params - Parámetros de la función
     */
    async rpc(functionName, params = {}) {
        return handleRequest(async () => {
            return await supabase.rpc(functionName, params);
        }, `RPC ${functionName}`);
    },

    /**
     * Crea un registro
     */
    async create(table, payload) {
        return handleRequest(async () => {
            return await supabase.from(table).insert(payload).select().single();
        }, `CREATE ${table}`);
    },

    /**
     * Actualiza un registro
     */
    async update(table, id, payload) {
        return handleRequest(async () => {
            return await supabase.from(table).update(payload).eq('id', id).select().single();
        }, `UPDATE ${table} ${id}`);
    }
};
