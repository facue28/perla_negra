import { supabase } from './supabase';
// import { logger } from './logger'; // Logger might still be JS, which is fine.

// Mock logger if not migrated, or import it. 
// Assuming logger.js exists and has an error method.
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { logger } from './logger';

type RequestFn<T> = () => Promise<{ data: T | null; error: any }>;

interface ApiResponse<T> {
    data: T | null;
    error: any;
}

/**
 * API CLient Centralizado
 * Encapsula manejo de errores, logging y respuesta estándar.
 */
const handleRequest = async <T>(requestFn: RequestFn<T>, context: string = ''): Promise<ApiResponse<T>> => {
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
     * @param table - Nombre de la tabla
     * @param queryBuilder - Función opcional para construir la query (select, filter, etc.)
     */
    async get<T = any>(table: string, queryBuilder?: (query: any) => any): Promise<ApiResponse<T[]>> {
        return handleRequest(async () => {
            let query = supabase.from(table).select('*');
            if (queryBuilder) {
                query = queryBuilder(query);
            }
            // Supabase generic typing is complex without generated types, keeping it loose for now
            return await query as any;
        }, `GET ${table}`);
    },

    /**
     * Ejecuta un RPC (Remote Procedure Call)
     * @param functionName - Nombre de la función en DB
     * @param params - Parámetros de la función
     */
    async rpc<T = any>(functionName: string, params: Record<string, any> = {}): Promise<ApiResponse<T>> {
        return handleRequest(async () => {
            return await supabase.rpc(functionName, params) as any;
        }, `RPC ${functionName}`);
    },

    /**
     * Crea un registro
     */
    async create<T = any>(table: string, payload: Record<string, any>): Promise<ApiResponse<T>> {
        return handleRequest(async () => {
            // @ts-ignore - Supabase types mismatch in transition
            return await supabase.from(table).insert(payload).select().single() as any;
        }, `CREATE ${table}`);
    },

    /**
     * Actualiza un registro
     */
    async update<T = any>(table: string, id: string | number, payload: Record<string, any>): Promise<ApiResponse<T>> {
        return handleRequest(async () => {
            // @ts-ignore
            return await supabase.from(table).update(payload).eq('id', id).select().single() as any;
        }, `UPDATE ${table} ${id}`);
    },

    /**
     * Elimina un registro por ID
     */
    async delete(table: string, id: string | number): Promise<ApiResponse<null>> {
        return handleRequest(async () => {
            return await supabase.from(table).delete().eq('id', id) as any;
        }, `DELETE ${table} ${id}`);
    }
};
