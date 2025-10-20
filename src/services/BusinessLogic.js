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

    // Pasajero en riesgo - Mostrar sugerencias personalizadas
    if (lastInteraction?.calificacion_medallia &&
        lastInteraction.calificacion_medallia < CONSTANTS.MEDALLIA_THRESHOLDS.GOOD) {

        // Importar y usar sugerencias personalizadas
        const recoverySuggestions = generateRecoverySuggestions(passenger, lastInteraction);

        if (recoverySuggestions.length > 0) {
            // Mostrar las 3 sugerencias más efectivas
            const topSuggestions = recoverySuggestions
                .filter(s => s.effectiveness === 'very-high' || s.effectiveness === 'high')
                .slice(0, 3);

            const suggestionText = topSuggestions
                .map(s => `${s.icon} <strong>${s.title}</strong>: ${s.action}`)
                .join('<br>');

            recommendations.push({
                type: 'danger',
                icon: '⚠️',
                title: `Pasajero en Riesgo - Calificación: ${lastInteraction.calificacion_medallia}/10`,
                message: `<div class="space-y-2"><p class="font-semibold mb-2">Acciones de Recuperación Recomendadas:</p>${suggestionText}</div>`
            });
        } else {
            recommendations.push({
                type: 'danger',
                icon: '⚠️',
                title: 'Pasajero en Riesgo',
                message: `Última calificación: ${lastInteraction.calificacion_medallia}/10. Se recomienda: Ofrecer upgrade de cortesía, acceso a sala VIP, o atención personalizada del supervisor.`
            });
        }
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
 * Calcula similitud entre dos nombres usando Levenshtein distance
 * @param {string} name1 - Primer nombre
 * @param {string} name2 - Segundo nombre
 * @returns {number} - Similitud entre 0 y 1 (1 = idénticos)
 */
const calculateNameSimilarity = (name1, name2) => {
    const s1 = name1.toLowerCase().trim();
    const s2 = name2.toLowerCase().trim();

    // Si uno contiene al otro, alta similitud
    if (s1.includes(s2) || s2.includes(s1)) {
        return 0.9;
    }

    // Calcular Levenshtein distance
    const matrix = [];
    for (let i = 0; i <= s1.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= s2.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= s1.length; i++) {
        for (let j = 1; j <= s2.length; j++) {
            if (s1.charAt(i - 1) === s2.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    const maxLen = Math.max(s1.length, s2.length);
    return 1 - (matrix[s1.length][s2.length] / maxLen);
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
    const duplicates = [];
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

            // Intentar encontrar pasajero existente con fuzzy matching
            try {
                // Buscar por primeras palabras del nombre
                const firstWords = p.nombre.split(' ').slice(0, 2).join(' ');
                const searchResults = await ApiService.searchPassengers(firstWords, aeropuertoId);

                if (searchResults && searchResults.length > 0) {
                    // Buscar mejor coincidencia usando similitud de nombres
                    let bestMatch = null;
                    let bestSimilarity = 0;

                    for (const existing of searchResults) {
                        const similarity = calculateNameSimilarity(p.nombre, existing.nombre);

                        // Coincidencia exacta
                        if (similarity === 1) {
                            passenger = existing;
                            break;
                        }

                        // Coincidencia similar (>=85%)
                        if (similarity >= 0.85 && similarity > bestSimilarity) {
                            bestMatch = existing;
                            bestSimilarity = similarity;
                        }
                    }

                    // Si no hay coincidencia exacta pero sí similar, usar la mejor
                    if (!passenger && bestMatch && bestSimilarity >= 0.85) {
                        passenger = bestMatch;

                        // Registrar duplicado detectado
                        duplicates.push({
                            manifestName: p.nombre,
                            existingName: passenger.nombre,
                            existingDNI: passenger.dni_pasaporte,
                            similarity: (bestSimilarity * 100).toFixed(0) + '%'
                        });

                        // Actualizar categoría si es superior en el manifiesto
                        const categoryRanks = {
                            'SIGNATURE': 7,
                            'TOP': 6,
                            'BLACK': 5,
                            'PLATINUM': 4,
                            'GOLD PLUS': 3,
                            'GOLD': 2
                        };

                        const manifestRank = categoryRanks[p.categoria] || 0;
                        const existingRank = categoryRanks[passenger.categoria] || 0;

                        if (manifestRank > existingRank) {
                            await ApiService.updatePassenger(passenger.id, { categoria: p.categoria });
                            console.log(`Updated category for ${passenger.nombre}: ${passenger.categoria} → ${p.categoria}`);
                        }
                    }
                }
            } catch (error) {
                console.warn('Error searching for existing passenger:', error);
            }

            if (!passenger) {
                // Crear nuevo pasajero con DNI generado (temporal)
                const dniPasaporte = `TEMP${p.nombre.replace(/\s+/g, '').toUpperCase().substring(0, 10)}${Date.now().toString().slice(-4)}`;
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
        duplicates,
        message: `Procesados: ${processed} | Nuevos: ${created} | Existentes: ${found}${duplicates.length > 0 ? ` | Duplicados detectados: ${duplicates.length}` : ''}`
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

    // Métricas de recuperación mejoradas
    const detractors = withMedallia.filter(i => i.calificacion_medallia <= CONSTANTS.MEDALLIA_THRESHOLDS.DETRACTOR);
    const passives = withMedallia.filter(i =>
        i.calificacion_medallia > CONSTANTS.MEDALLIA_THRESHOLDS.DETRACTOR &&
        i.calificacion_medallia < CONSTANTS.MEDALLIA_THRESHOLDS.GOOD
    );
    const promoters = withMedallia.filter(i => i.calificacion_medallia >= CONSTANTS.MEDALLIA_THRESHOLDS.GOOD);

    const passengersAtRisk = detractors.length + passives.length;
    const recoveryActions = interactions.filter(i => i.acciones_recuperacion?.trim()).length;

    // Tasa de recuperación mejorada
    const recoveryRate = passengersAtRisk > 0
        ? ((recoveryActions / passengersAtRisk) * 100).toFixed(1)
        : 0;

    // Calcular pasajeros recuperados (los que tenían baja calificación y luego mejoraron)
    const passengerHistory = {};
    interactions.forEach(i => {
        if (i.calificacion_medallia) {
            if (!passengerHistory[i.pasajero_id]) {
                passengerHistory[i.pasajero_id] = [];
            }
            passengerHistory[i.pasajero_id].push({
                date: i.fecha,
                score: i.calificacion_medallia,
                hasRecovery: i.acciones_recuperacion?.trim() ? true : false
            });
        }
    });

    let successfulRecoveries = 0;
    Object.values(passengerHistory).forEach(history => {
        if (history.length >= 2) {
            history.sort((a, b) => new Date(a.date) - new Date(b.date));
            for (let i = 0; i < history.length - 1; i++) {
                const prev = history[i];
                const next = history[i + 1];
                // Si tenía calificación baja, se aplicó acción de recuperación, y luego mejoró
                if (prev.score < CONSTANTS.MEDALLIA_THRESHOLDS.GOOD &&
                    prev.hasRecovery &&
                    next.score >= CONSTANTS.MEDALLIA_THRESHOLDS.GOOD) {
                    successfulRecoveries++;
                    break;
                }
            }
        }
    });

    const successfulRecoveryRate = recoveryActions > 0
        ? ((successfulRecoveries / recoveryActions) * 100).toFixed(1)
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
        expiringPassports,
        // Métricas de recuperación
        detractors: detractors.length,
        passives: passives.length,
        promoters: promoters.length,
        recoveryActions,
        successfulRecoveries,
        successfulRecoveryRate
    };
};

/**
 * Genera sugerencias de recuperación personalizadas según gustos y preferencias del pasajero
 * @param {Object} passenger - Pasajero
 * @param {Object} interaction - Última interacción
 * @returns {Array} Lista de sugerencias de recuperación
 */
export const generateRecoverySuggestions = (passenger, interaction) => {
    const suggestions = [];

    if (!interaction || !interaction.calificacion_medallia) {
        return suggestions;
    }

    const score = interaction.calificacion_medallia;
    const isDetractor = score <= CONSTANTS.MEDALLIA_THRESHOLDS.DETRACTOR;
    const isPassive = score > CONSTANTS.MEDALLIA_THRESHOLDS.DETRACTOR && score < CONSTANTS.MEDALLIA_THRESHOLDS.GOOD;

    if (!isDetractor && !isPassive) {
        return suggestions; // No necesita recuperación
    }

    // Categoría del pasajero determina nivel de compensación
    const category = passenger.categoria;
    const isTopTier = ['SIGNATURE', 'TOP', 'BLACK'].includes(category);
    const isMidTier = ['PLATINUM', 'GOLD PLUS'].includes(category);

    // Sugerencias basadas en gustos
    if (passenger.gustos && Object.keys(passenger.gustos).length > 0) {
        const gustos = passenger.gustos;

        if (gustos.bebida) {
            suggestions.push({
                type: 'personalized',
                icon: '🍷',
                title: 'Cortesía de Bebida Favorita',
                action: `Ofrecer ${gustos.bebida} de cortesía como disculpa`,
                category: 'immediate',
                effectiveness: 'high'
            });
        }

        if (gustos.comida) {
            suggestions.push({
                type: 'personalized',
                icon: '🍽️',
                title: 'Experiencia Gastronómica',
                action: `Voucher para ${gustos.comida} en ${isTopTier ? 'restaurante premium' : 'cafetería VIP'}`,
                category: 'medium-term',
                effectiveness: 'high'
            });
        }

        if (gustos.entretenimiento) {
            suggestions.push({
                type: 'personalized',
                icon: '🎬',
                title: 'Entretenimiento Premium',
                action: `Acceso a ${gustos.entretenimiento} durante la espera`,
                category: 'immediate',
                effectiveness: 'medium'
            });
        }
    }

    // Sugerencias basadas en preferencias
    if (passenger.preferencias && Object.keys(passenger.preferencias).length > 0) {
        const prefs = passenger.preferencias;

        if (prefs.asiento) {
            suggestions.push({
                type: 'personalized',
                icon: '💺',
                title: 'Upgrade de Asiento',
                action: `Garantizar asiento ${prefs.asiento} o upgrade a clase superior sin costo`,
                category: 'immediate',
                effectiveness: 'very-high'
            });
        }

        if (prefs.servicio) {
            suggestions.push({
                type: 'personalized',
                icon: '⚡',
                title: 'Servicio Prioritario',
                action: `Activar ${prefs.servicio} inmediatamente`,
                category: 'immediate',
                effectiveness: 'high'
            });
        }
    }

    // Sugerencias basadas en categoría
    if (isTopTier) {
        suggestions.push({
            type: 'category-based',
            icon: '👔',
            title: 'Atención Ejecutiva Personal',
            action: 'Asignar asistente personal durante todo el viaje',
            category: 'immediate',
            effectiveness: 'very-high'
        });

        suggestions.push({
            type: 'category-based',
            icon: '🏨',
            title: 'Cortesía Premium',
            action: 'Voucher de hotel 5 estrellas o upgrade de sala VIP',
            category: 'immediate',
            effectiveness: 'very-high'
        });
    } else if (isMidTier) {
        suggestions.push({
            type: 'category-based',
            icon: '🎁',
            title: 'Beneficio de Compensación',
            action: 'Millas adicionales (50% del vuelo) o acceso sala VIP',
            category: 'immediate',
            effectiveness: 'high'
        });
    } else {
        suggestions.push({
            type: 'category-based',
            icon: '🎫',
            title: 'Compensación Estándar',
            action: 'Voucher de descuento 20% o millas de bonificación',
            category: 'immediate',
            effectiveness: 'medium'
        });
    }

    // Sugerencias basadas en el incidente reportado
    if (interaction.incidentes) {
        const incidente = interaction.incidentes.toLowerCase();

        if (incidente.includes('retraso') || incidente.includes('demora')) {
            suggestions.push({
                type: 'incident-based',
                icon: '⏰',
                title: 'Compensación por Tiempo',
                action: 'Voucher de alimentación + acceso a sala de espera confortable',
                category: 'immediate',
                effectiveness: 'high'
            });
        }

        if (incidente.includes('equipaje') || incidente.includes('maleta')) {
            suggestions.push({
                type: 'incident-based',
                icon: '🧳',
                title: 'Asistencia con Equipaje',
                action: 'Kit de emergencia + seguimiento prioritario + compensación económica',
                category: 'immediate',
                effectiveness: 'very-high'
            });
        }

        if (incidente.includes('servicio') || incidente.includes('atención')) {
            suggestions.push({
                type: 'incident-based',
                icon: '🤝',
                title: 'Disculpa Personal',
                action: 'Carta de disculpa del supervisor + llamada de seguimiento',
                category: 'immediate',
                effectiveness: 'high'
            });
        }

        if (incidente.includes('comida') || incidente.includes('bebida')) {
            suggestions.push({
                type: 'incident-based',
                icon: '🍴',
                title: 'Compensación Gastronómica',
                action: 'Comida completa de cortesía en próximo vuelo',
                category: 'medium-term',
                effectiveness: 'medium'
            });
        }
    }

    // Sugerencia de contacto personalizado
    if (passenger.idiomas && passenger.idiomas.length > 0) {
        suggestions.push({
            type: 'communication',
            icon: '🗣️',
            title: 'Comunicación en su Idioma',
            action: `Contacto de seguimiento en ${passenger.idiomas.join(' o ')}`,
            category: 'immediate',
            effectiveness: 'medium'
        });
    }

    // Sugerencia de seguimiento
    suggestions.push({
        type: 'follow-up',
        icon: '📞',
        title: 'Seguimiento Post-Vuelo',
        action: 'Llamada de cortesía 48h después del vuelo para verificar satisfacción',
        category: 'follow-up',
        effectiveness: 'high'
    });

    return suggestions;
};

/**
 * Genera insights inteligentes del dashboard
 * @param {Object} metrics - Métricas calculadas
 * @param {Array} interactions - Interacciones
 * @param {Array} passengers - Pasajeros
 * @returns {Array} Lista de insights
 */
export const generateDashboardInsights = (metrics, interactions, passengers) => {
    const insights = [];

    // Insight: Tasa de recuperación
    if (metrics.recoveryActions > 0) {
        const effectiveness = metrics.successfulRecoveryRate;
        if (effectiveness >= 70) {
            insights.push({
                type: 'success',
                icon: '🎯',
                title: 'Excelente Tasa de Recuperación',
                message: `${effectiveness}% de las acciones de recuperación fueron exitosas. ¡El equipo está haciendo un gran trabajo!`,
                priority: 'high'
            });
        } else if (effectiveness >= 40) {
            insights.push({
                type: 'warning',
                icon: '📊',
                title: 'Oportunidad de Mejora en Recuperación',
                message: `Tasa de éxito: ${effectiveness}%. Considera personalizar más las acciones según preferencias del pasajero.`,
                priority: 'medium'
            });
        } else {
            insights.push({
                type: 'alert',
                icon: '⚠️',
                title: 'Revisar Estrategia de Recuperación',
                message: `Solo ${effectiveness}% de éxito. Es necesario revisar y mejorar las acciones de recuperación.`,
                priority: 'high'
            });
        }
    }

    // Insight: Detractores sin acción
    const detractorsWithoutAction = interactions.filter(i =>
        i.calificacion_medallia <= CONSTANTS.MEDALLIA_THRESHOLDS.DETRACTOR &&
        (!i.acciones_recuperacion || !i.acciones_recuperacion.trim())
    ).length;

    if (detractorsWithoutAction > 0) {
        insights.push({
            type: 'alert',
            icon: '🚨',
            title: 'Detractores sin Atender',
            message: `${detractorsWithoutAction} pasajero(s) con baja calificación no tienen acciones de recuperación registradas.`,
            priority: 'critical',
            action: 'Revisar y aplicar acciones inmediatamente'
        });
    }

    // Insight: Cumpleaños del día
    if (metrics.birthdayPassengers > 0) {
        insights.push({
            type: 'opportunity',
            icon: '🎂',
            title: '¡Cumpleaños Hoy!',
            message: `${metrics.birthdayPassengers} pasajero(s) HVC celebran su cumpleaños. Gran oportunidad para crear momentos memorables.`,
            priority: 'high',
            action: 'Preparar detalles especiales'
        });
    }

    // Insight: Pasaportes por vencer
    if (metrics.expiringPassports > 0) {
        insights.push({
            type: 'info',
            icon: '🛂',
            title: 'Pasaportes por Vencer',
            message: `${metrics.expiringPassports} pasajero(s) tienen pasaporte por vencer en 90 días.`,
            priority: 'medium',
            action: 'Notificar proactivamente'
        });
    }

    // Insight: Tendencia de satisfacción
    if (metrics.trendData && metrics.trendData.length >= 7) {
        const recent = metrics.trendData.slice(-7);
        const older = metrics.trendData.slice(-14, -7);

        if (older.length > 0 && recent.length > 0) {
            const recentAvg = recent.reduce((sum, d) => sum + parseFloat(d.avg), 0) / recent.length;
            const olderAvg = older.reduce((sum, d) => sum + parseFloat(d.avg), 0) / older.length;
            const trend = ((recentAvg - olderAvg) / olderAvg * 100).toFixed(1);

            if (trend > 5) {
                insights.push({
                    type: 'success',
                    icon: '📈',
                    title: 'Tendencia Positiva',
                    message: `La satisfacción ha mejorado ${trend}% en la última semana. ¡Excelente trabajo!`,
                    priority: 'medium'
                });
            } else if (trend < -5) {
                insights.push({
                    type: 'warning',
                    icon: '📉',
                    title: 'Tendencia Negativa',
                    message: `La satisfacción ha disminuido ${Math.abs(trend)}% en la última semana. Requiere atención.`,
                    priority: 'high',
                    action: 'Analizar causas y tomar medidas'
                });
            }
        }
    }

    // Insight: Perfiles incompletos
    const incompleteProfiles = passengers.filter(p =>
        !p.preferencias || Object.keys(p.preferencias).length === 0 ||
        !p.gustos || Object.keys(p.gustos).length === 0
    ).length;

    if (incompleteProfiles > passengers.length * 0.3) {
        insights.push({
            type: 'opportunity',
            icon: '📝',
            title: 'Oportunidad de Personalización',
            message: `${incompleteProfiles} pasajeros (${((incompleteProfiles/passengers.length)*100).toFixed(0)}%) no tienen preferencias completas.`,
            priority: 'low',
            action: 'Recopilar información en próximas interacciones'
        });
    }

    // Insight: NPS Score
    if (metrics.promoters > 0 || metrics.detractors > 0) {
        const nps = ((metrics.promoters - metrics.detractors) / (metrics.promoters + metrics.passives + metrics.detractors) * 100).toFixed(0);

        if (nps >= 50) {
            insights.push({
                type: 'success',
                icon: '⭐',
                title: 'NPS Excelente',
                message: `NPS de ${nps}. Los pasajeros son embajadores de la marca.`,
                priority: 'low'
            });
        } else if (nps >= 0) {
            insights.push({
                type: 'info',
                icon: '📊',
                title: 'NPS Positivo',
                message: `NPS de ${nps}. Hay espacio para mejorar y crear más promotores.`,
                priority: 'medium'
            });
        } else {
            insights.push({
                type: 'alert',
                icon: '🎯',
                title: 'NPS Requiere Atención',
                message: `NPS de ${nps}. Se necesita estrategia agresiva de recuperación.`,
                priority: 'critical',
                action: 'Plan de acción inmediato'
            });
        }
    }

    return insights.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
};
