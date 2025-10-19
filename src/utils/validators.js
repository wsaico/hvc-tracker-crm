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
