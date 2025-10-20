/**
 * Recomendaciones basadas en el Manual HVC Jauja
 * @module ManualRecommendations
 */

export const MANUAL_RECOMMENDATIONS = {
    // Categorías de pasajeros y sus protocolos
    PASSENGER_CATEGORIES: {
        SIGNATURE: {
            name: "SIGNATURE",
            description: "Nivel más alto - Atención premium personalizada",
            benefits: [
                "Transporte terrestre exclusivo",
                "Acceso prioritario a salas VIP",
                "Fast track en seguridad y migraciones",
                "Asistente personal dedicado",
                "Check-in prioritario",
                "Embarque preferencial"
            ],
            protocol: "Contacto inmediato, asistencia personalizada end-to-end"
        },
        TOP: {
            name: "TOP",
            description: "Segundo nivel - Servicios preferentes",
            benefits: [
                "Acceso a salas VIP",
                "Fast track disponible",
                "Asistencia prioritaria",
                "Check-in preferente"
            ],
            protocol: "Contacto proactivo, atención preferencial"
        },
        BLACK: {
            name: "BLACK",
            description: "Tercer nivel - Servicios premium",
            benefits: [
                "Acceso a salas VIP",
                "Atención preferencial",
                "Servicios especiales disponibles"
            ],
            protocol: "Atención cordial y eficiente"
        }
    },

    // Acciones de recuperación por tipo de incidente
    RECOVERY_ACTIONS: {
        RETRASO_VUELO: {
            title: "Retraso de Vuelo",
            priority: "high",
            actions: [
                {
                    category: "SIGNATURE",
                    steps: [
                        "Informar inmediatamente por llamada personal",
                        "Ofrecer sala VIP premium con comida y bebidas",
                        "Proporcionar compensación: voucher de $200 USD",
                        "Asignar asistente personal para seguimiento",
                        "Coordinar transporte alternativo si es necesario"
                    ]
                },
                {
                    category: "TOP/BLACK",
                    steps: [
                        "Notificar por SMS y correo electrónico",
                        "Ofrecer acceso a sala VIP",
                        "Proporcionar voucher de comida ($50 USD)",
                        "Mantener informado sobre estado del vuelo",
                        "Ofrecer alternativas de vuelo si disponible"
                    ]
                },
                {
                    category: "GENERAL",
                    steps: [
                        "Comunicar el retraso con transparencia",
                        "Ofrecer refrigerios básicos",
                        "Proporcionar actualizaciones cada 30 minutos",
                        "Asistencia en reprogramación si es necesario"
                    ]
                }
            ],
            manual_reference: "Sección 3.2 - Gestión de Retrasos"
        },

        EQUIPAJE_PERDIDO: {
            title: "Equipaje Perdido o Dañado",
            priority: "critical",
            actions: [
                {
                    category: "SIGNATURE",
                    steps: [
                        "Atención inmediata con gerente de servicio",
                        "Kit de emergencia premium (ropa, artículos de aseo)",
                        "Compensación inmediata: $300 USD",
                        "Servicio de entrega a domicilio cuando se localice",
                        "Seguimiento cada 4 horas hasta resolución"
                    ]
                },
                {
                    category: "TOP/BLACK",
                    steps: [
                        "Registro prioritario de reclamo",
                        "Kit de emergencia estándar",
                        "Compensación: $150 USD",
                        "Entrega a hotel o domicilio",
                        "Seguimiento cada 8 horas"
                    ]
                },
                {
                    category: "GENERAL",
                    steps: [
                        "Registro de reclamo según protocolo",
                        "Artículos básicos de emergencia",
                        "Compensación según política",
                        "Notificación cuando se localice"
                    ]
                }
            ],
            manual_reference: "Sección 4.1 - Manejo de Equipaje"
        },

        SERVICIO_DEFICIENTE: {
            title: "Servicio Deficiente a Bordo",
            priority: "high",
            actions: [
                {
                    category: "SIGNATURE",
                    steps: [
                        "Disculpa personal del gerente de servicio",
                        "Upgrade automático en próximo vuelo",
                        "Millas/puntos adicionales (10,000 puntos)",
                        "Voucher de cortesía $100 USD",
                        "Llamada de seguimiento en 24 horas"
                    ]
                },
                {
                    category: "TOP/BLACK",
                    steps: [
                        "Disculpa formal por escrito",
                        "Millas/puntos de compensación (5,000 puntos)",
                        "Voucher de descuento para próximo vuelo",
                        "Seguimiento por correo electrónico"
                    ]
                },
                {
                    category: "GENERAL",
                    steps: [
                        "Disculpa por el inconveniente",
                        "Registro del incidente",
                        "Compensación según política vigente",
                        "Mejora en capacitación del personal"
                    ]
                }
            ],
            manual_reference: "Sección 5.3 - Recuperación de Servicio"
        },

        CANCELACION_VUELO: {
            title: "Cancelación de Vuelo",
            priority: "critical",
            actions: [
                {
                    category: "SIGNATURE",
                    steps: [
                        "Notificación inmediata por llamada personal",
                        "Reprogramación prioritaria en siguiente vuelo",
                        "Hotel 5 estrellas si es necesario pernoctar",
                        "Transporte terrestre premium incluido",
                        "Compensación: $400 USD o upgrade clase superior",
                        "Comidas y servicios cubiertos completamente"
                    ]
                },
                {
                    category: "TOP/BLACK",
                    steps: [
                        "Notificación por múltiples canales",
                        "Reprogramación preferente",
                        "Hotel 4 estrellas si requiere pernoctar",
                        "Transporte incluido",
                        "Compensación: $200 USD",
                        "Vouchers de comida"
                    ]
                },
                {
                    category: "GENERAL",
                    steps: [
                        "Notificación según canales disponibles",
                        "Reprogramación en próximo vuelo disponible",
                        "Alojamiento básico si es necesario",
                        "Compensación según regulación aplicable"
                    ]
                }
            ],
            manual_reference: "Sección 3.1 - Cancelaciones"
        },

        OVERBOOKING: {
            title: "Sobreventa (Overbooking)",
            priority: "critical",
            actions: [
                {
                    category: "SIGNATURE",
                    steps: [
                        "Nunca negar embarque - buscar alternativas",
                        "Si inevitable: upgrade a clase superior garantizado",
                        "Compensación: $500 USD",
                        "Transporte alternativo inmediato",
                        "Servicios VIP mientras espera",
                        "Seguimiento personal hasta destino final"
                    ]
                },
                {
                    category: "TOP/BLACK",
                    steps: [
                        "Prioridad para mantener en vuelo",
                        "Si debe ceder asiento: compensación $300 USD",
                        "Vuelo alternativo en máximo 2 horas",
                        "Acceso a sala VIP",
                        "Comidas incluidas"
                    ]
                },
                {
                    category: "GENERAL",
                    steps: [
                        "Solicitar voluntarios primero",
                        "Compensación según regulación (hasta $200 USD)",
                        "Reprogramación en siguiente vuelo",
                        "Asistencia básica"
                    ]
                }
            ],
            manual_reference: "Sección 6.2 - Gestión de Sobreventa"
        }
    },

    // Protocolos de servicio por situación
    SERVICE_PROTOCOLS: {
        CUMPLEANOS: {
            title: "Celebración de Cumpleaños",
            actions: [
                "Felicitación personalizada al abordar",
                "Upgrade de cortesía (si disponible)",
                "Postre o bebida especial",
                "Tarjeta de felicitación firmada por tripulación",
                "Mención especial en vuelo (con autorización)",
                "Fotografía de recuerdo"
            ],
            applies_to: ["SIGNATURE", "TOP", "BLACK"]
        },

        PRIMERA_VEZ: {
            title: "Pasajero Primera Vez con Aerolínea",
            actions: [
                "Bienvenida especial y personalizada",
                "Tour guiado de servicios disponibles",
                "Explicación de programa de fidelización",
                "Kit de bienvenida",
                "Atención extra durante vuelo",
                "Encuesta de satisfacción post-vuelo"
            ],
            applies_to: ["Todos"]
        },

        VIAJERO_FRECUENTE: {
            title: "Viajero Frecuente (10+ vuelos/año)",
            actions: [
                "Reconocimiento personal",
                "Fast track automático",
                "Preferencia en selección de asientos",
                "Bebida de cortesía",
                "Agradecimiento por lealtad",
                "Beneficios adicionales sorpresa"
            ],
            applies_to: ["SIGNATURE", "TOP", "BLACK"]
        },

        NECESIDADES_ESPECIALES: {
            title: "Pasajeros con Necesidades Especiales",
            actions: [
                "Coordinar asistencia especial pre-vuelo",
                "Asegurar accesibilidad en todo momento",
                "Personal capacitado en atención inclusiva",
                "Embarque prioritario",
                "Seguimiento continuo durante viaje",
                "Verificar satisfacción post-vuelo"
            ],
            applies_to: ["Todos"],
            priority: "critical"
        }
    },

    // Estándares de tiempo de respuesta
    RESPONSE_TIMES: {
        SIGNATURE: {
            initial_contact: "Inmediato (< 5 min)",
            issue_resolution: "< 2 horas",
            follow_up: "Dentro de 24 horas"
        },
        TOP: {
            initial_contact: "< 15 minutos",
            issue_resolution: "< 4 horas",
            follow_up: "Dentro de 48 horas"
        },
        BLACK: {
            initial_contact: "< 30 minutos",
            issue_resolution: "< 8 horas",
            follow_up: "Dentro de 72 horas"
        }
    },

    // Comunicación y lenguaje
    COMMUNICATION_GUIDELINES: {
        tone: "Profesional, cálido y empático",
        language: "Adaptado a idioma preferido del pasajero",
        channel_preference: "Según preferencia del pasajero (llamada, email, SMS, WhatsApp)",
        key_phrases: [
            "Es un placer atenderle",
            "Entiendo su preocupación y estoy aquí para ayudarle",
            "Permítame resolver esto inmediatamente",
            "Su satisfacción es nuestra prioridad",
            "¿Hay algo más en lo que pueda asistirle?"
        ]
    }
};

/**
 * Obtiene recomendaciones específicas según el tipo de incidente y categoría del pasajero
 */
export function getRecoveryRecommendations(incidentType, passengerCategory) {
    const incident = MANUAL_RECOMMENDATIONS.RECOVERY_ACTIONS[incidentType];
    if (!incident) return null;

    // Buscar recomendaciones específicas para la categoría
    const categoryActions = incident.actions.find(a =>
        a.category === passengerCategory ||
        a.category.includes(passengerCategory) ||
        a.category === "GENERAL"
    );

    return {
        title: incident.title,
        priority: incident.priority,
        steps: categoryActions ? categoryActions.steps : [],
        manual_reference: incident.manual_reference
    };
}

/**
 * Obtiene protocolo de servicio
 */
export function getServiceProtocol(situation) {
    return MANUAL_RECOMMENDATIONS.SERVICE_PROTOCOLS[situation];
}

/**
 * Obtiene tiempos de respuesta esperados
 */
export function getResponseTimes(category) {
    return MANUAL_RECOMMENDATIONS.RESPONSE_TIMES[category] || MANUAL_RECOMMENDATIONS.RESPONSE_TIMES.BLACK;
}
