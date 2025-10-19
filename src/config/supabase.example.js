/**
 * @fileoverview Archivo de configuración de ejemplo para Supabase
 * @module config/supabase.example
 *
 * COPIA este archivo como supabase.js y configura tus credenciales reales
 */

export const SUPABASE_CONFIG = {
    url: 'https://tu-proyecto.supabase.co',
    anonKey: 'tu-anon-key-aqui'
};

/**
 * Cliente de Supabase (singleton)
 */
let supabaseClient = null;

/**
 * Inicializa el cliente de Supabase
 * @returns {Object} Cliente de Supabase
 */
export const initSupabase = () => {
    if (!supabaseClient) {
        try {
            const { createClient } = window.supabase;
            supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        } catch (error) {
            console.warn('Supabase no configurado correctamente. Usando configuración de desarrollo.');
            // Crear un cliente mock para desarrollo
            supabaseClient = {
                from: () => ({
                    select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
                    insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
                    update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) }),
                    delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) })
                })
            };
        }
    }
    return supabaseClient;
};

/**
 * Obtiene el cliente de Supabase
 * @returns {Object} Cliente de Supabase
 */
export const getSupabaseClient = () => {
    if (!supabaseClient) {
        return initSupabase();
    }
    return supabaseClient;
};