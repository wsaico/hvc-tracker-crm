/**
 * @fileoverview Utilidades y helpers generales
 * @module utils/helpers
 */

import { CONSTANTS } from '../config/constants.js';
import { sanitizeText } from './validators.js';

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD en zona horaria de Perú
 * @returns {string} Fecha actual en formato YYYY-MM-DD
 */
export const getTodayInPeru = () => {
    const now = new Date();
    const peruDate = new Date(now.toLocaleString("en-US", {timeZone: "America/Lima"}));
    const year = peruDate.getFullYear();
    const month = String(peruDate.getMonth() + 1).padStart(2, '0');
    const day = String(peruDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Formatea una fecha
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/Lima'
    });
};

/**
 * Formatea una fecha con hora
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha y hora formateadas
 */
export const formatDateTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('es-PE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Lima'
    });
};

/**
 * Obtiene la clase CSS para una categoría
 * @param {string} categoria - Categoría
 * @returns {string} Nombre de la clase CSS
 */
export const getCategoryClass = (categoria) => {
    const normalizedCat = categoria.toUpperCase().replace(/\s+/g, '-');
    return `categoria-${normalizedCat.toLowerCase()}`;
};

/**
 * Obtiene la clase CSS para un badge de categoría
 * @param {string} categoria - Categoría
 * @returns {string} Nombre de la clase CSS
 */
export const getBadgeClass = (categoria) => {
    const normalizedCat = categoria.toUpperCase().replace(/\s+/g, '-');
    return `badge-${normalizedCat.toLowerCase()}`;
};

/**
 * Obtiene el color para una calificación Medallia
 * @param {number} score - Calificación
 * @returns {string} Clase CSS de color
 */
export const getMedalliaColor = (score) => {
    if (score >= CONSTANTS.MEDALLIA_THRESHOLDS.EXCELLENT) return 'bg-green-500';
    if (score >= CONSTANTS.MEDALLIA_THRESHOLDS.GOOD) return 'bg-yellow-500';
    return 'bg-red-500';
};

/**
 * Obtiene el texto descriptivo para una calificación Medallia
 * @param {number} score - Calificación
 * @returns {string} Descripción
 */
export const getMedalliaText = (score) => {
    if (score >= CONSTANTS.MEDALLIA_THRESHOLDS.EXCELLENT) return 'Excelente';
    if (score >= CONSTANTS.MEDALLIA_THRESHOLDS.GOOD) return 'Bueno';
    if (score >= CONSTANTS.MEDALLIA_THRESHOLDS.REGULAR) return 'Regular';
    return 'Malo';
};

/**
 * Verifica si hoy es el cumpleaños
 * @param {string|Date} fechaNacimiento - Fecha de nacimiento
 * @returns {boolean} True si es cumpleaños
 */
export const isBirthday = (fechaNacimiento) => {
    if (!fechaNacimiento) return false;

    // Obtener fecha actual en zona horaria de Perú
    const today = new Date();
    const todayPeru = new Date(today.toLocaleString("en-US", {timeZone: "America/Lima"}));

    // Convertir fecha de nacimiento a zona horaria de Perú
    const birthday = new Date(fechaNacimiento);
    const birthdayPeru = new Date(birthday.toLocaleString("en-US", {timeZone: "America/Lima"}));

    // Comparar solo mes y día (ignorar año y hora)
    return todayPeru.getMonth() === birthdayPeru.getMonth() &&
           todayPeru.getDate() === birthdayPeru.getDate();
};

/**
 * Calcula la edad
 * @param {string|Date} fechaNacimiento - Fecha de nacimiento
 * @returns {number|null} Edad o null
 */
export const calculateAge = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;

    // Obtener fecha actual en zona horaria de Perú
    const today = new Date();
    const todayPeru = new Date(today.toLocaleString("en-US", {timeZone: "America/Lima"}));

    // Convertir fecha de nacimiento a zona horaria de Perú
    const birthday = new Date(fechaNacimiento);
    const birthdayPeru = new Date(birthday.toLocaleString("en-US", {timeZone: "America/Lima"}));

    let age = todayPeru.getFullYear() - birthdayPeru.getFullYear();
    const monthDiff = todayPeru.getMonth() - birthdayPeru.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && todayPeru.getDate() < birthdayPeru.getDate())) {
        age--;
    }
    return age;
};

/**
 * Muestra una notificación toast
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación
 */
export const showNotification = (message, type = CONSTANTS.NOTIFICATION_TYPES.INFO) => {
    const colors = {
        [CONSTANTS.NOTIFICATION_TYPES.SUCCESS]: 'bg-green-500',
        [CONSTANTS.NOTIFICATION_TYPES.ERROR]: 'bg-red-500',
        [CONSTANTS.NOTIFICATION_TYPES.WARNING]: 'bg-yellow-500',
        [CONSTANTS.NOTIFICATION_TYPES.INFO]: 'bg-blue-500'
    };

    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg z-50 fade-in`;
    notification.textContent = sanitizeText(message);
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('opacity-0');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

/**
 * Calcula rango de fechas según período
 * @param {string} period - Período
 * @returns {Object} { startDate, endDate }
 */
export const calculateDateRange = (period) => {
    const now = new Date();
    let startDate, endDate;

    endDate = now.toISOString();

    switch (period) {
        case CONSTANTS.DASHBOARD_PERIODS.TODAY:
            startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
            break;
        case CONSTANTS.DASHBOARD_PERIODS.WEEK:
            startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
            break;
        case CONSTANTS.DASHBOARD_PERIODS.MONTH:
            startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
            break;
        case CONSTANTS.DASHBOARD_PERIODS.YEAR:
            startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
            break;
        case CONSTANTS.DASHBOARD_PERIODS.ALL:
            startDate = null;
            endDate = null;
            break;
        default:
            startDate = null;
            endDate = null;
    }

    return { startDate, endDate };
};
