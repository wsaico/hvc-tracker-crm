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
        // Asegurar que los campos JSONB sean objetos válidos
        const processedData = {
            ...passengerData,
            gustos: passengerData.gustos || {},
            preferencias: passengerData.preferencias || {},
            idiomas: Array.isArray(passengerData.idiomas) ? passengerData.idiomas : []
        };

        const { data, error } = await client
            .from('passengers')
            .insert([processedData])
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
        // Procesar campos JSONB y arrays
        const processedUpdates = {
            ...updates,
            updated_at: new Date().toISOString()
        };

        // Asegurar que gustos y preferencias sean objetos válidos
        if (processedUpdates.gustos !== undefined) {
            processedUpdates.gustos = processedUpdates.gustos || {};
        }
        if (processedUpdates.preferencias !== undefined) {
            processedUpdates.preferencias = processedUpdates.preferencias || {};
        }
        if (processedUpdates.idiomas !== undefined) {
            processedUpdates.idiomas = Array.isArray(processedUpdates.idiomas) ? processedUpdates.idiomas : [];
        }

        const { data, error } = await client
            .from('passengers')
            .update(processedUpdates)
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

/**
 * Obtiene información completa de un pasajero incluyendo cálculos
 * @param {string} passengerId - ID del pasajero
 * @returns {Promise<Object|null>} Información completa del pasajero
 */
export const getPassengerCompleteInfo = async (passengerId) => {
    try {
        const { data, error } = await client
            .from('passengers_complete')
            .select('*')
            .eq('id', passengerId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    } catch (error) {
        handleError('getPassengerCompleteInfo', error);
        return null;
    }
};

/**
 * Busca pasajeros con filtros avanzados
 * @param {Object} filters - Filtros de búsqueda
 * @param {string} aeropuertoId - ID del aeropuerto
 * @returns {Promise<Array>} Lista de pasajeros filtrados
 */
export const searchPassengersAdvanced = async (filters, aeropuertoId) => {
    try {
        let query = client
            .from('passengers_complete')
            .select('*')
            .eq('aeropuerto_id', aeropuertoId);

        // Filtros básicos
        if (filters.nombre) {
            query = query.ilike('nombre', `%${filters.nombre}%`);
        }
        if (filters.dni_pasaporte) {
            query = query.ilike('dni_pasaporte', `%${filters.dni_pasaporte}%`);
        }
        if (filters.categoria) {
            query = query.eq('categoria', filters.categoria);
        }
        if (filters.nacionalidad) {
            query = query.ilike('nacionalidad', `%${filters.nacionalidad}%`);
        }

        // Filtros especiales
        if (filters.es_cumpleanos_hoy === true) {
            query = query.eq('es_cumpleanos_hoy', true);
        }
        if (filters.pasaporte_por_vencer === true) {
            query = query.eq('pasaporte_por_vencer', true);
        }

        // Filtros por rango de edad
        if (filters.edad_min || filters.edad_max) {
            if (filters.edad_min) {
                query = query.gte('edad', filters.edad_min);
            }
            if (filters.edad_max) {
                query = query.lte('edad', filters.edad_max);
            }
        }

        const { data, error } = await query.order('nombre').limit(50);

        if (error) throw error;
        return data || [];
    } catch (error) {
        handleError('searchPassengersAdvanced', error);
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
            .select(`
                *,
                passengers!inner(aeropuerto_id, nombre, categoria, foto_url),
                flights(*)
            `)
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

/**
 * Calcula métricas del aeropuerto en tiempo real
 * @param {string} aeropuertoId - ID del aeropuerto
 * @returns {Promise<Object>} Métricas calculadas del aeropuerto
 */
export const getAirportMetrics = async (aeropuertoId) => {
    try {
        // Obtener datos en paralelo para mejor rendimiento
        const [interactions, passengers] = await Promise.all([
            getAirportInteractions(aeropuertoId),
            getAllPassengers(aeropuertoId)
        ]);

        // Calcular métricas básicas
        const totalInteractions = interactions.length;
        const totalPassengers = passengers.length;

        // Calcular calificación promedio
        const withMedallia = interactions.filter(i => i.calificacion_medallia);
        const avgMedallia = withMedallia.length > 0
            ? (withMedallia.reduce((sum, i) => sum + i.calificacion_medallia, 0) / withMedallia.length).toFixed(1)
            : 0;

        // Pasajeros en riesgo (última calificación baja)
        const passengersAtRisk = withMedallia.filter(i => i.calificacion_medallia < CONSTANTS.MEDALLIA_THRESHOLDS.GOOD).length;

        // Tasa de recuperación
        const recoveryActions = interactions.filter(i => i.acciones_recuperacion?.trim()).length;
        const recoveryRate = passengersAtRisk > 0
            ? ((recoveryActions / passengersAtRisk) * 100).toFixed(1)
            : 0;

        // Cumpleaños del día
        const today = new Date();
        const cumpleanosHoy = passengers.filter(p =>
            p.fecha_nacimiento &&
            new Date(p.fecha_nacimiento).getMonth() === today.getMonth() &&
            new Date(p.fecha_nacimiento).getDate() === today.getDate()
        ).length;

        // Pasaportes por vencer (próximos 30 días)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const pasaportesPorVencer = passengers.filter(p =>
            p.fecha_vencimiento_pasaporte &&
            new Date(p.fecha_vencimiento_pasaporte) <= thirtyDaysFromNow &&
            new Date(p.fecha_vencimiento_pasaporte) >= today
        ).length;

        // Distribución por categoría
        const categoryCount = {};
        passengers.forEach(p => {
            categoryCount[p.categoria] = (categoryCount[p.categoria] || 0) + 1;
        });

        // Tendencia de calificaciones (últimos 30 días)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentInteractions = interactions.filter(i =>
            i.calificacion_medallia && new Date(i.fecha) >= thirtyDaysAgo
        );

        const trendData = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dayInteractions = recentInteractions.filter(i =>
                i.fecha.startsWith(dateStr)
            );

            const avg = dayInteractions.length > 0
                ? (dayInteractions.reduce((sum, i) => sum + i.calificacion_medallia, 0) / dayInteractions.length).toFixed(1)
                : null;

            trendData.push({
                date: dateStr,
                avg: avg,
                count: dayInteractions.length
            });
        }

        // Métricas de servicios utilizados
        const serviciosCount = {};
        interactions.forEach(i => {
            if (i.servicios_utilizados) {
                i.servicios_utilizados.forEach(s => {
                    serviciosCount[s] = (serviciosCount[s] || 0) + 1;
                });
            }
        });

        // Motivos de viaje
        const motivoCount = {};
        interactions.forEach(i => {
            if (i.motivo_viaje) {
                motivoCount[i.motivo_viaje] = (motivoCount[i.motivo_viaje] || 0) + 1;
            }
        });

        return {
            id: aeropuertoId,
            total_interacciones: totalInteractions,
            total_pasajeros: totalPassengers,
            calificacion_promedio: parseFloat(avgMedallia),
            pasajeros_en_riesgo: passengersAtRisk,
            tasa_recuperacion: parseFloat(recoveryRate),
            cumpleanos_hoy: cumpleanosHoy,
            pasaportes_por_vencer: pasaportesPorVencer,
            distribucion_categoria: categoryCount,
            tendencia_calificaciones: trendData,
            servicios_utilizados: serviciosCount,
            motivos_viaje: motivoCount,
            ultima_actualizacion: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error calculating airport metrics:', error);
        handleError('getAirportMetrics', error);
        return null;
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
