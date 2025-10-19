/**
 * @fileoverview Constantes y enumeraciones de la aplicación
 * @module config/constants
 */

/**
 * Constantes globales de la aplicación
 * @constant
 */
export const CONSTANTS = Object.freeze({
    CATEGORIES: Object.freeze({
        SIGNATURE: 'SIGNATURE',
        TOP: 'TOP',
        BLACK: 'BLACK',
        PLATINUM: 'PLATINUM',
        GOLD_PLUS: 'GOLD PLUS',
        GOLD: 'GOLD'
    }),

    FLIGHT_STATUS: Object.freeze({
        CONFIRMADO: 'CONFIRMADO',
        CHECK_IN: 'CHECK-IN',
        ABORDADO: 'ABORDADO',
        NO_SHOW: 'NO SHOW',
        CANCELADO: 'CANCELADO'
    }),

    TRAVEL_REASONS: Object.freeze({
        NEGOCIOS: 'NEGOCIOS',
        TURISMO: 'TURISMO',
        PERSONAL: 'PERSONAL',
        MEDICO: 'MEDICO',
        OTRO: 'OTRO'
    }),

    SERVICES: Object.freeze({
        SALA_VIP: 'SALA_VIP',
        FAST_TRACK: 'FAST_TRACK',
        ASISTENCIA_ESPECIAL: 'ASISTENCIA_ESPECIAL',
        UPGRADE: 'UPGRADE'
    }),

    ROLES: Object.freeze({
        SUPERVISOR: 'supervisor',
        AGENTE: 'agente'
    }),

    VIEWS: Object.freeze({
        LOGIN: 'login',
        MANIFEST: 'manifest',
        PASSENGER_SEARCH: 'passenger-search',
        DASHBOARD: 'dashboard'
    }),

    NOTIFICATION_TYPES: Object.freeze({
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    }),

    MEDALLIA_THRESHOLDS: Object.freeze({
        EXCELLENT: 9,
        GOOD: 7,
        REGULAR: 5
    }),

    DASHBOARD_PERIODS: Object.freeze({
        TODAY: 'today',
        WEEK: 'week',
        MONTH: 'month',
        YEAR: 'year',
        ALL: 'all'
    })
});
