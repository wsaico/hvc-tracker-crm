/**
 * @fileoverview Servicio de comunicación con Supabase
 * @module services/ApiService
 */

import { getSupabaseClient } from '../config/supabase.js';
import { CONSTANTS } from '../config/constants.js';
import { showNotification } from '../utils/helpers.js';

const client = getSupabaseClient();

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
