/**
 * @fileoverview Validaciones de datos
 * @module utils/validators
 */

import { CONSTANTS } from '../config/constants.js';

/**
 * Valida si una categoría es válida
 * @param {string} category - Categoría a validar
 * @returns {boolean} True si es válida
 */
export const isValidCategory = (category) => {
    return Object.values(CONSTANTS.CATEGORIES).includes(category.toUpperCase());
};

/**
 * Valida si un estatus de vuelo es válido
 * @param {string} status - Estatus a validar
 * @returns {boolean} True si es válido
 */
export const isValidFlightStatus = (status) => {
    return Object.values(CONSTANTS.FLIGHT_STATUS).includes(status.toUpperCase());
};

/**
 * Valida formato de línea del manifiesto
 * @param {string} line - Línea a validar
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateManifestLine = (line) => {
    const parts = line.split(',').map(p => p.trim());

    if (parts.length !== 6) {
        return {
            valid: false,
            error: 'Formato incorrecto (se esperan 6 campos: VUELO, DEST, NOMBRE, CATEGORIA, ESTATUS, ASIENTO)'
        };
    }

    const [vuelo, destino, nombre, categoria, estatus, asiento] = parts;

    if (!vuelo || !destino || !nombre || !categoria || !estatus || !asiento) {
        return { valid: false, error: 'Todos los campos son obligatorios' };
    }

    if (!isValidCategory(categoria)) {
        return {
            valid: false,
            error: `Categoría inválida "${categoria}". Válidas: ${Object.values(CONSTANTS.CATEGORIES).join(', ')}`
        };
    }

    if (!isValidFlightStatus(estatus)) {
        return {
            valid: false,
            error: `Estatus inválido "${estatus}". Válidos: ${Object.values(CONSTANTS.FLIGHT_STATUS).join(', ')}`
        };
    }

    return { valid: true, error: null };
};

/**
 * Valida calificación Medallia
 * @param {number} score - Calificación
 * @returns {boolean} True si es válida
 */
export const isValidMedalliaScore = (score) => {
    return Number.isInteger(score) && score >= 1 && score <= 10;
};

/**
 * Valida si una URL es válida
 * @param {string} url - URL a validar
 * @returns {boolean} True si es válida
 */
export const isValidUrl = (url) => {
    if (!url) return true; // Permitir vacío
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Valida si un JSON es válido
 * @param {string} jsonString - String JSON a validar
 * @returns {boolean} True si es válido
 */
export const isValidJson = (jsonString) => {
    if (!jsonString || jsonString.trim() === '') return true; // Permitir vacío
    try {
        JSON.parse(jsonString);
        return true;
    } catch {
        return false;
    }
};

/**
 * Valida si una fecha es válida
 * @param {string} dateString - Fecha a validar
 * @returns {boolean} True si es válida
 */
export const isValidDate = (dateString) => {
    if (!dateString) return true; // Permitir vacío
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};

/**
 * Valida si un email es válido
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
export const isValidEmail = (email) => {
    if (!email) return true; // Permitir vacío
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Valida si un teléfono es válido (formato básico)
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} True si es válido
 */
export const isValidPhone = (phone) => {
    if (!phone) return true; // Permitir vacío
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,}$/;
    return phoneRegex.test(phone.trim());
};

/**
 * Valida datos de pasajero
 * @param {Object} passengerData - Datos del pasajero
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export const validatePassengerData = (passengerData) => {
    const errors = [];

    // Campos requeridos
    if (!passengerData.nombre || passengerData.nombre.trim() === '') {
        errors.push('El nombre es obligatorio');
    }
    if (!passengerData.dni_pasaporte || passengerData.dni_pasaporte.trim() === '') {
        errors.push('El DNI/Pasaporte es obligatorio');
    }
    if (!passengerData.categoria) {
        errors.push('La categoría HVC es obligatoria');
    }

    // Validaciones de formato
    if (passengerData.email && !isValidEmail(passengerData.email)) {
        errors.push('El email tiene un formato inválido');
    }
    if (passengerData.telefono && !isValidPhone(passengerData.telefono)) {
        errors.push('El teléfono tiene un formato inválido');
    }
    if (passengerData.foto_url && !isValidUrl(passengerData.foto_url)) {
        errors.push('La URL de la foto no es válida');
    }
    if (passengerData.fecha_nacimiento && !isValidDate(passengerData.fecha_nacimiento)) {
        errors.push('La fecha de nacimiento no es válida');
    }
    if (passengerData.fecha_emision_pasaporte && !isValidDate(passengerData.fecha_emision_pasaporte)) {
        errors.push('La fecha de emisión del pasaporte no es válida');
    }
    if (passengerData.fecha_vencimiento_pasaporte && !isValidDate(passengerData.fecha_vencimiento_pasaporte)) {
        errors.push('La fecha de vencimiento del pasaporte no es válida');
    }

    // Validaciones de JSON
    if (passengerData.gustos && typeof passengerData.gustos === 'string' && !isValidJson(passengerData.gustos)) {
        errors.push('El formato de gustos no es válido JSON');
    }
    if (passengerData.preferencias && typeof passengerData.preferencias === 'string' && !isValidJson(passengerData.preferencias)) {
        errors.push('El formato de preferencias no es válido JSON');
    }

    // Validaciones de lógica
    if (passengerData.fecha_emision_pasaporte && passengerData.fecha_vencimiento_pasaporte) {
        const emision = new Date(passengerData.fecha_emision_pasaporte);
        const vencimiento = new Date(passengerData.fecha_vencimiento_pasaporte);
        if (vencimiento <= emision) {
            errors.push('La fecha de vencimiento debe ser posterior a la fecha de emisión');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Sanitiza texto para prevenir XSS
 * @param {string} text - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
export const sanitizeText = (text) => {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};
