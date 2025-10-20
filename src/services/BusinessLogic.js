/**
 * @fileoverview Lógica de negocio de la aplicación
 * @module services/BusinessLogic
 */

import { CONSTANTS } from '../config/constants.js';
import { isBirthday } from '../utils/helpers.js';
import { validateManifestLine } from '../utils/validators.js';
import * as ApiService from './ApiService.js';

/**
 * Genera recomendaciones inteligentes para un pasajero
 * @param {Object} passenger - Pasajero
 * @param {Array} interactions - Interacciones
 * @returns {Array} Lista de recomendaciones
 */
export const generateRecommendations = (passenger, interactions) => {
    const recommendations = [];
    const lastInteraction = interactions[0];

    // Pasajero en riesgo
    if (lastInteraction?.calificacion_medallia &&
        lastInteraction.calificacion_medallia < CONSTANTS.MEDALLIA_THRESHOLDS.GOOD) {
        recommendations.push({
            type: 'danger',
            icon: '⚠️',
            title: 'Pasajero en Riesgo',
            message: `Última calificación: ${lastInteraction.calificacion_medallia}/10. Se recomienda: Ofrecer upgrade de cortesía, acceso a sala VIP, o atención personalizada del supervisor.`
        });
    }

    // Cumpleaños
    if (isBirthday(passenger.fecha_nacimiento)) {
        recommendations.push({
            type: 'success',
            icon: '🎂',
            title: '¡Cumpleaños!',
            message: 'Ofrecer felicitación especial, postre de cortesía, o pequeño detalle. Registrar el momento en el sistema.'
        });
    }

    // Viajero frecuente sin incidentes
    if (interactions.length >= 5 &&
        interactions.slice(0, 5).every(i => !i.incidentes || i.incidentes.trim() === '')) {
        const recentWithScores = interactions.filter(i => i.calificacion_medallia).slice(0, 5);
        if (recentWithScores.length > 0) {
            const avgScore = recentWithScores.reduce((sum, i) => sum + i.calificacion_medallia, 0) / recentWithScores.length;
            if (avgScore >= CONSTANTS.MEDALLIA_THRESHOLDS.GOOD) {
                recommendations.push({
                    type: 'info',
                    icon: '⭐',
                    title: 'Cliente Leal',
                    message: `${interactions.length} viajes con excelente experiencia. Considera reconocimiento especial o programa de fidelización.`
                });
            }
        }
    }

    // Preferencias conocidas desde interacciones
    const preferencesFound = interactions.filter(i => i.preferencias && Object.keys(i.preferencias).length > 0);
    if (preferencesFound.length > 0) {
        const lastPref = preferencesFound[0].preferencias;
        const prefText = Object.entries(lastPref).map(([k, v]) => `${k}: ${v}`).join(', ');
        recommendations.push({
            type: 'info',
            icon: '📋',
            title: 'Preferencias Conocidas',
            message: `Últimas preferencias registradas: ${prefText}`
        });
    }

    // Gustos del pasajero
    if (passenger.gustos && Object.keys(passenger.gustos).length > 0) {
        const gustosText = Object.entries(passenger.gustos).map(([k, v]) => `${k}: ${v}`).join(', ');
        recommendations.push({
            type: 'info',
            icon: '🍽️',
            title: 'Gustos Registrados',
            message: `Preferencias culinarias y de confort: ${gustosText}`
        });
    }

    // Preferencias del pasajero
    if (passenger.preferencias && Object.keys(passenger.preferencias).length > 0) {
        const prefText = Object.entries(passenger.preferencias).map(([k, v]) => `${k}: ${v}`).join(', ');
        recommendations.push({
            type: 'info',
            icon: '⚙️',
            title: 'Preferencias Personales',
            message: `Configuraciones preferidas: ${prefText}`
        });
    }

    // Idiomas del pasajero
    if (passenger.idiomas && passenger.idiomas.length > 0) {
        recommendations.push({
            type: 'info',
            icon: '🗣️',
            title: 'Idiomas',
            message: `Habla: ${passenger.idiomas.join(', ')}. Considerar comunicación en estos idiomas.`
        });
    }

    // Información médica importante
    if (passenger.alergias || passenger.restricciones_medicas) {
        const medicalInfo = [];
        if (passenger.alergias) medicalInfo.push(`Alergias: ${passenger.alergias}`);
        if (passenger.restricciones_medicas) medicalInfo.push(`Restricciones: ${passenger.restricciones_medicas}`);

        recommendations.push({
            type: 'warning',
            icon: '🏥',
            title: 'Información Médica',
            message: medicalInfo.join('. ') + '. Coordinar con servicios médicos si es necesario.'
        });
    }

    // Contacto de emergencia disponible
    if (passenger.contacto_emergencia_nombre && passenger.contacto_emergencia_telefono) {
        recommendations.push({
            type: 'info',
            icon: '📞',
            title: 'Contacto de Emergencia',
            message: `Disponible: ${passenger.contacto_emergencia_nombre} (${passenger.contacto_emergencia_telefono})`
        });
    }

    // Pasaporte próximo a vencer
    if (passenger.fecha_vencimiento_pasaporte) {
        const today = new Date();
        const expiryDate = new Date(passenger.fecha_vencimiento_pasaporte);
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry <= 90 && daysUntilExpiry > 0) {
            recommendations.push({
                type: 'warning',
                icon: '🛂',
                title: 'Pasaporte Próximo a Vencer',
                message: `Vence en ${daysUntilExpiry} días. Recomendar renovación.`
            });
        } else if (daysUntilExpiry <= 0) {
            recommendations.push({
                type: 'danger',
                icon: '🚫',
                title: 'Pasaporte Vencido',
                message: 'El pasaporte está vencido. No permitir embarque.'
            });
        }
    }

    return recommendations;
};

/**
 * Parsea el manifiesto de vuelo
 * @param {string} manifestText - Texto del manifiesto
 * @returns {Object} { success: boolean, data: Array, errors: Array }
 */
export const parseManifest = (manifestText) => {
    const lines = manifestText.split('\n').filter(l => l.trim());
    const parsed = [];
    const errors = [];

    lines.forEach((line, index) => {
        const validation = validateManifestLine(line);

        if (!validation.valid) {
            errors.push(`Línea ${index + 1}: ${validation.error}`);
            return;
        }

        const parts = line.split(',').map(p => p.trim());
        const [vuelo, destino, nombre, categoria, estatus, asiento] = parts;

        parsed.push({
            vuelo,
            destino,
            nombre,
            categoria: categoria.toUpperCase(),
            estatus: estatus.toUpperCase(),
            asiento
        });
    });

    return {
        success: errors.length === 0,
        data: parsed,
        errors
    };
};

/**
 * Procesa y guarda el manifiesto
 * @param {Array} manifestData - Datos del manifiesto
 * @param {string} flightDate - Fecha del vuelo
 * @param {string} aeropuertoId - ID del aeropuerto
 * @returns {Promise<Object>} Resultado del procesamiento
 */
export const processManifest = async (manifestData, flightDate, aeropuertoId) => {
    let processed = 0;
    let created = 0;
    let found = 0;
    const flightGroups = {};

    // Agrupar por vuelo
    manifestData.forEach(p => {
        const key = `${p.vuelo}-${p.destino}`;
        if (!flightGroups[key]) {
            flightGroups[key] = {
                vuelo: p.vuelo,
                destino: p.destino,
                passengers: []
            };
        }
        flightGroups[key].passengers.push(p);
    });

    // Procesar cada grupo de vuelo
    for (const [key, group] of Object.entries(flightGroups)) {
        // Verificar si el vuelo ya existe
        let flight = null;
        try {
            // Buscar vuelo existente por número, fecha y aeropuerto
            const existingFlights = await ApiService.getFlightsByDate(flightDate, aeropuertoId);
            flight = existingFlights.find(f => f.numero_vuelo === group.vuelo && f.destino === group.destino);
        } catch (error) {
            console.warn('Error checking existing flights:', error);
        }

        // Crear vuelo si no existe
        if (!flight) {
            flight = await ApiService.createFlight({
                numero_vuelo: group.vuelo,
                destino: group.destino,
                fecha: flightDate,
                aeropuerto_id: aeropuertoId
            });
        }

        // Procesar pasajeros
        for (const p of group.passengers) {
            let passenger = null;

            // Intentar encontrar pasajero existente por nombre (búsqueda flexible)
            try {
                const searchResults = await ApiService.searchPassengers(p.nombre, aeropuertoId);
                // Buscar coincidencia exacta o muy similar
                passenger = searchResults.find(existing =>
                    existing.nombre.toLowerCase().trim() === p.nombre.toLowerCase().trim()
                );
            } catch (error) {
                console.warn('Error searching for existing passenger:', error);
            }

            if (!passenger) {
                // Crear nuevo pasajero con DNI generado (temporal)
                const dniPasaporte = `${p.nombre.replace(/\s+/g, '').toUpperCase()}${Date.now().toString().slice(-4)}`;
                passenger = await ApiService.createPassenger({
                    nombre: p.nombre,
                    dni_pasaporte: dniPasaporte,
                    categoria: p.categoria,
                    aeropuerto_id: aeropuertoId
                });
                created++;
            } else {
                found++;
            }

            // Verificar si el pasajero ya está en este vuelo
            const alreadyInFlight = flight.flight_passengers?.some(fp => fp.pasajero_id === passenger.id);

            if (!alreadyInFlight) {
                // Agregar al vuelo
                await ApiService.addPassengerToFlight(flight.id, passenger.id, p.asiento, p.estatus);
                processed++;
            }
        }
    }

    return {
        processed,
        created,
        found,
        message: `Procesados: ${processed} | Creados: ${created} | Encontrados: ${found}`
    };
};

/**
 * Calcula métricas del dashboard
 * @param {Array} interactions - Interacciones
 * @param {Array} passengers - Pasajeros
 * @returns {Object} Métricas calculadas
 */
export const calculateDashboardMetrics = (interactions, passengers) => {
    const totalInteractions = interactions.length;
    const withMedallia = interactions.filter(i => i.calificacion_medallia);

    const avgMedallia = withMedallia.length > 0
        ? (withMedallia.reduce((sum, i) => sum + i.calificacion_medallia, 0) / withMedallia.length).toFixed(1)
        : 0;

    const passengersAtRisk = withMedallia.filter(i => i.calificacion_medallia < CONSTANTS.MEDALLIA_THRESHOLDS.GOOD).length;
    const recoveryActions = interactions.filter(i => i.acciones_recuperacion?.trim()).length;
    const recoveryRate = passengersAtRisk > 0
        ? ((recoveryActions / passengersAtRisk) * 100).toFixed(1)
        : 0;

    // Distribución por categoría
    const categoryCount = {};
    passengers.forEach(p => {
        categoryCount[p.categoria] = (categoryCount[p.categoria] || 0) + 1;
    });

    // Motivos de viaje
    const motivoCount = {};
    interactions.forEach(i => {
        if (i.motivo_viaje) {
            motivoCount[i.motivo_viaje] = (motivoCount[i.motivo_viaje] || 0) + 1;
        }
    });

    // Servicios utilizados
    const serviciosCount = {};
    interactions.forEach(i => {
        if (i.servicios_utilizados) {
            i.servicios_utilizados.forEach(s => {
                serviciosCount[s] = (serviciosCount[s] || 0) + 1;
            });
        }
    });

    // Tendencia últimos 30 días
    const last30Days = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    interactions
        .filter(i => i.calificacion_medallia && new Date(i.fecha) >= thirtyDaysAgo)
        .forEach(i => {
            const date = new Date(i.fecha).toISOString().split('T')[0];
            if (!last30Days[date]) {
                last30Days[date] = { sum: 0, count: 0 };
            }
            last30Days[date].sum += i.calificacion_medallia;
            last30Days[date].count++;
        });

    const trendData = Object.entries(last30Days)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => ({
            date,
            avg: (data.sum / data.count).toFixed(1)
        }));

    // Métricas adicionales con nuevos campos
    const passengersWithPhoto = passengers.filter(p => p.foto_url).length;
    const passengersWithPreferences = passengers.filter(p => p.preferencias && Object.keys(p.preferencias).length > 0).length;
    const passengersWithLanguages = passengers.filter(p => p.idiomas && p.idiomas.length > 0).length;
    const passengersWithMedicalInfo = passengers.filter(p => p.alergias || p.restricciones_medicas).length;

    // Cumpleaños del día
    const today = new Date();
    const birthdayPassengers = passengers.filter(p =>
        p.fecha_nacimiento &&
        new Date(p.fecha_nacimiento).getMonth() === today.getMonth() &&
        new Date(p.fecha_nacimiento).getDate() === today.getDate()
    ).length;

    // Pasaportes por vencer (próximos 90 días)
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    const expiringPassports = passengers.filter(p =>
        p.fecha_vencimiento_pasaporte &&
        new Date(p.fecha_vencimiento_pasaporte) <= ninetyDaysFromNow &&
        new Date(p.fecha_vencimiento_pasaporte) >= today
    ).length;

    return {
        totalInteractions,
        totalPassengers: passengers.length,
        avgMedallia,
        passengersAtRisk,
        recoveryRate,
        categoryCount,
        motivoCount,
        serviciosCount,
        trendData,
        // Nuevas métricas
        passengersWithPhoto,
        passengersWithPreferences,
        passengersWithLanguages,
        passengersWithMedicalInfo,
        birthdayPassengers,
        expiringPassports
    };
};
