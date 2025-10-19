/**
 * @fileoverview Gestión centralizada del estado de la aplicación
 * @module modules/StateManager
 */

import { CONSTANTS } from '../config/constants.js';

/**
 * Estado de la aplicación
 * @private
 */
let state = {
    currentUser: null,
    currentRole: null,
    currentAirport: null,
    currentView: CONSTANTS.VIEWS.LOGIN,
    selectedPassenger: null,
    flights: [],
    passengers: [],
    interactions: [],
    airports: [],
    parsedManifest: null
};

/**
 * Listeners para cambios de estado
 * @private
 */
const listeners = [];

/**
 * Obtiene una copia del estado actual
 * @returns {Object} Estado actual
 */
export const getState = () => ({ ...state });

/**
 * Actualiza el estado y notifica a los listeners
 * @param {Object} updates - Actualizaciones a aplicar
 */
export const setState = (updates) => {
    state = { ...state, ...updates };
    notifyListeners();
};

/**
 * Resetea el estado a valores iniciales
 */
export const resetState = () => {
    state = {
        currentUser: null,
        currentRole: null,
        currentAirport: null,
        currentView: CONSTANTS.VIEWS.LOGIN,
        selectedPassenger: null,
        flights: [],
        passengers: [],
        interactions: [],
        airports: [],
        parsedManifest: null
    };
    notifyListeners();
};

/**
 * Suscribe un callback a cambios de estado
 * @param {Function} callback - Función a ejecutar cuando cambie el estado
 */
export const subscribe = (callback) => {
    listeners.push(callback);
};

/**
 * Notifica a todos los listeners sobre cambios de estado
 * @private
 */
const notifyListeners = () => {
    listeners.forEach(callback => callback(state));
};
