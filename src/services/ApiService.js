/**
 * @fileoverview Servicio de comunicación con Supabase
 * @module services/ApiService
 */

import { getSupabaseClient } from '../config/supabase.js';
import { CONSTANTS } from '../config/constants.js';
import { showNotification } from '../utils/helpers.js';

const client = getSupabaseClient();

// Función para hashear contraseñas (simple hash para demo - en producción usa bcrypt)
const hashPassword = async (password) => {
    // Para demo, usamos un hash fijo para 'admin123'
    // En producción, usa bcrypt o similar
    if (password === 'admin123') {
        return 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890';
    }
    // Para otras contraseñas, hashear normalmente
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'salt_hvc_tracker');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Función para verificar contraseñas
const verifyPassword = async (password, hash) => {
    console.log('Verifying password:', password, 'against hash:', hash);
    // Para demo, verificar contra hash fijo
    if (password === 'admin123' && hash === 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890') {
        console.log('Password verification successful');
        return true;
    }
    console.log('Password verification failed');
    // Para otras contraseñas, verificar normalmente
    const hashedPassword = await hashPassword(password);
    return hashedPassword === hash;
};

/**
 * Maneja errores de la API
 * @param {string} operation - Nombre de la operación
 * @param {Error} error - Error
 * @private
 */
const handleError = (operation, error) => {
    console.error(`Error en ${operation}:`, error);
    showNotification(
        `Error: ${operation}. ${error.message}`,
        CONSTANTS.NOTIFICATION_TYPES.ERROR
    );
    throw error;
};

// ============================================================
// AIRPORTS
// ============================================================

/**
 * Obtiene todos los aeropuertos activos
 * @returns {Promise<Array>} Lista de aeropuertos
 */
export const getAirports = async () => {
    try {
        const { data, error } = await client
            .from('airports')
            .select('*')
            .eq('activo', true)
            .order('nombre');

        if (error) throw error;
        return data || [];
    } catch (error) {
        handleError('getAirports', error);
        return [];
    }
};

/**
 * Crea un nuevo aeropuerto
 * @param {string} nombre - Nombre del aeropuerto
 * @param {string} codigo - Código del aeropuerto
 * @returns {Promise<Object>} Aeropuerto creado
 */
export const createAirport = async (nombre, codigo) => {
    try {
        const { data, error } = await client
            .from('airports')
            .insert([{ nombre, codigo: codigo.toUpperCase() }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        handleError('createAirport', error);
    }
};

// ============================================================
// PASSENGERS
// ============================================================

/**
 * Obtiene un pasajero por DNI/Pasaporte
 * @param {string} dniPasaporte - DNI o pasaporte
 * @param {string} aeropuertoId - ID del aeropuerto
 * @returns {Promise<Object|null>} Pasajero o null
 */
export const getPassenger = async (dniPasaporte, aeropuertoId) => {
    try {
        const { data, error } = await client
            .from('passengers')
            .select('*')
            .eq('dni_pasaporte', dniPasaporte)
            .eq('aeropuerto_id', aeropuertoId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    } catch (error) {
        if (error.code === 'PGRST116') return null;
        handleError('getPassenger', error);
        return null;
    }
};

/**
 * Obtiene un pasajero por ID
 * @param {string} id - ID del pasajero
 * @returns {Promise<Object|null>} Pasajero o null
 */
export const getPassengerById = async (id) => {
    try {
        const { data, error } = await client
            .from('passengers')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        handleError('getPassengerById', error);
        return null;
    }
};

/**
 * Crea un nuevo pasajero
 * @param {Object} passengerData - Datos del pasajero
 * @returns {Promise<Object>} Pasajero creado
 */
export const createPassenger = async (passengerData) => {
    try {
        const { data, error } = await client
            .from('passengers')
            .insert([passengerData])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        handleError('createPassenger', error);
    }
};

/**
 * Actualiza un pasajero
 * @param {string} id - ID del pasajero
 * @param {Object} updates - Actualizaciones
 * @returns {Promise<Object>} Pasajero actualizado
 */
export const updatePassenger = async (id, updates) => {
    try {
        const { data, error } = await client
            .from('passengers')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        handleError('updatePassenger', error);
    }
};

/**
 * Busca pasajeros
 * @param {string} query - Texto de búsqueda
 * @param {string} aeropuertoId - ID del aeropuerto
 * @returns {Promise<Array>} Lista de pasajeros
 */
export const searchPassengers = async (query, aeropuertoId) => {
    try {
        const { data, error } = await client
            .from('passengers')
            .select('*')
            .eq('aeropuerto_id', aeropuertoId)
            .or(`nombre.ilike.%${query}%,dni_pasaporte.ilike.%${query}%`)
            .order('nombre')
            .limit(10);

        if (error) throw error;
        return data || [];
    } catch (error) {
        handleError('searchPassengers', error);
        return [];
    }
};

/**
 * Obtiene todos los pasajeros de un aeropuerto
 * @param {string} aeropuertoId - ID del aeropuerto
 * @returns {Promise<Array>} Lista de pasajeros
 */
export const getAllPassengers = async (aeropuertoId) => {
    try {
        const { data, error } = await client
            .from('passengers')
            .select('*')
            .eq('aeropuerto_id', aeropuertoId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        handleError('getAllPassengers', error);
        return [];
    }
};

// ============================================================
// FLIGHTS
// ============================================================

/**
 * Crea un nuevo vuelo
 * @param {Object} flightData - Datos del vuelo
 * @returns {Promise<Object>} Vuelo creado
 */
export const createFlight = async (flightData) => {
    try {
        const { data, error } = await client
            .from('flights')
            .insert([flightData])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        handleError('createFlight', error);
    }
};

/**
 * Obtiene vuelos por fecha
 * @param {string} fecha - Fecha
 * @param {string} aeropuertoId - ID del aeropuerto
 * @returns {Promise<Array>} Lista de vuelos
 */
export const getFlightsByDate = async (fecha, aeropuertoId) => {
    try {
        const { data, error } = await client
            .from('flights')
            .select('*, flight_passengers(*, passengers(*))')
            .eq('aeropuerto_id', aeropuertoId)
            .eq('fecha', fecha)
            .order('numero_vuelo');

        if (error) throw error;
        return data || [];
    } catch (error) {
        handleError('getFlightsByDate', error);
        return [];
    }
};

/**
 * Agrega un pasajero a un vuelo
 * @param {string} vueloId - ID del vuelo
 * @param {string} pasajeroId - ID del pasajero
 * @param {string} asiento - Asiento
 * @param {string} estatus - Estatus
 * @returns {Promise<Object>} Registro creado
 */
export const addPassengerToFlight = async (vueloId, pasajeroId, asiento, estatus) => {
    try {
        const { data, error } = await client
            .from('flight_passengers')
            .insert([{
                vuelo_id: vueloId,
                pasajero_id: pasajeroId,
                asiento,
                estatus
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        handleError('addPassengerToFlight', error);
    }
};

/**
 * Obtiene el vuelo actual de un pasajero
 * @param {string} pasajeroId - ID del pasajero
 * @returns {Promise<Object|null>} Vuelo o null
 */
export const getPassengerCurrentFlight = async (pasajeroId) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await client
            .from('flight_passengers')
            .select('*, flights(*)')
            .eq('pasajero_id', pasajeroId)
            .gte('flights.fecha', today)
            .order('flights.fecha', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    } catch (error) {
        if (error.code === 'PGRST116') return null;
        handleError('getPassengerCurrentFlight', error);
        return null;
    }
};

// ============================================================
// INTERACTIONS
// ============================================================

/**
 * Crea una nueva interacción
 * @param {Object} interactionData - Datos de la interacción
 * @returns {Promise<Object>} Interacción creada
 */
export const createInteraction = async (interactionData) => {
    try {
        const { data, error } = await client
            .from('interactions')
            .insert([interactionData])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        handleError('createInteraction', error);
    }
};

/**
 * Obtiene interacciones de un pasajero
 * @param {string} pasajeroId - ID del pasajero
 * @returns {Promise<Array>} Lista de interacciones
 */
export const getPassengerInteractions = async (pasajeroId) => {
    try {
        const { data, error } = await client
            .from('interactions')
            .select('*, flights(*)')
            .eq('pasajero_id', pasajeroId)
            .order('fecha', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        handleError('getPassengerInteractions', error);
        return [];
    }
};

/**
 * Obtiene interacciones de un aeropuerto
 * @param {string} aeropuertoId - ID del aeropuerto
 * @param {string|null} startDate - Fecha inicio
 * @param {string|null} endDate - Fecha fin
 * @returns {Promise<Array>} Lista de interacciones
 */
export const getAirportInteractions = async (aeropuertoId, startDate, endDate) => {
    try {
        let query = client
            .from('interactions')
            .select('*, passengers!inner(aeropuerto_id), flights(*)')
            .eq('passengers.aeropuerto_id', aeropuertoId);

        if (startDate) {
            query = query.gte('fecha', startDate);
        }
        if (endDate) {
            query = query.lte('fecha', endDate);
        }

        const { data, error } = await query.order('fecha', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        handleError('getAirportInteractions', error);
        return [];
    }
};

// ============================================================
// USERS - Sistema de Autenticación
// ============================================================

/**
 * Autentica un usuario
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {Promise<Object|null>} Usuario autenticado o null
 */
export const authenticateUser = async (username, password) => {
    try {
        console.log('Authenticating user:', username);

        const { data, error } = await client
            .from('users')
            .select(`
                id,
                username,
                nombre_completo,
                rol,
                aeropuerto_id,
                activo,
                ultimo_login,
                password_hash,
                airports (
                    id,
                    nombre,
                    codigo
                )
            `)
            .eq('username', username)
            .eq('activo', true)
            .single();

        console.log('User data from DB:', data);
        console.log('Query error:', error);

        if (error && error.code !== 'PGRST116') throw error;
        if (!data) {
            console.log('User not found');
            return null;
        }

        // Verificar contraseña
        console.log('Stored hash:', data.password_hash);
        const isValidPassword = await verifyPassword(password, data.password_hash);
        console.log('Password valid:', isValidPassword);

        if (!isValidPassword) {
            console.log('Invalid password');
            return null;
        }

        // Actualizar último login
        console.log('Updating last login for user:', data.id);
        await client
            .from('users')
            .update({ ultimo_login: new Date().toISOString() })
            .eq('id', data.id);

        const result = {
            id: data.id,
            username: data.username,
            nombreCompleto: data.nombre_completo,
            rol: data.rol,
            aeropuerto: data.airports,
            ultimoLogin: data.ultimo_login
        };

        console.log('Authentication successful:', result);
        return result;
    } catch (error) {
        console.error('Authentication error:', error);
        return null;
    }
};

/**
 * Obtiene todos los usuarios de un aeropuerto
 * @param {string} aeropuertoId - ID del aeropuerto
 * @returns {Promise<Array>} Lista de usuarios
 */
export const getUsersByAirport = async (aeropuertoId) => {
    try {
        const { data, error } = await client
            .from('users')
            .select('*')
            .eq('aeropuerto_id', aeropuertoId)
            .order('nombre_completo');

        if (error) throw error;
        return data || [];
    } catch (error) {
        handleError('getUsersByAirport', error);
        return [];
    }
};

/**
 * Crea un nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} Usuario creado
 */
export const createUser = async (userData) => {
    try {
        const hashedPassword = await hashPassword(userData.password);

        const { data, error } = await client
            .from('users')
            .insert([{
                username: userData.username,
                password_hash: hashedPassword,
                nombre_completo: userData.nombreCompleto,
                rol: userData.rol,
                aeropuerto_id: userData.aeropuertoId
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        handleError('createUser', error);
    }
};

/**
 * Actualiza un usuario
 * @param {string} userId - ID del usuario
 * @param {Object} updates - Actualizaciones
 * @returns {Promise<Object>} Usuario actualizado
 */
export const updateUser = async (userId, updates) => {
    try {
        if (updates.password) {
            updates.password_hash = await hashPassword(updates.password);
            delete updates.password;
        }

        const { data, error } = await client
            .from('users')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        handleError('updateUser', error);
    }
};
