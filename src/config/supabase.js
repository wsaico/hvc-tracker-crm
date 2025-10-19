/**
 * @fileoverview Configuración de Supabase
 * @module config/supabase
 */

/**
 * INSTRUCCIONES DE CONFIGURACIÓN:
 *
 * 1. Crea una cuenta en https://supabase.com
 * 2. Crea un nuevo proyecto
 * 3. Ve a Project Settings > API
 * 4. Copia el Project URL y anon key
 * 5. Reemplaza los valores abajo
 */

export const SUPABASE_CONFIG = {
    url: 'https://lujzsozkykmfbqhzgkel.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1anpzb3preWttZmJxaHpna2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NjA0MjEsImV4cCI6MjA3NjQzNjQyMX0.a_-8nWKflLdFZxmC3uUcM75fcdTd3kWZaOmjB4adrko'
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
