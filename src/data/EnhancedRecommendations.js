/**
 * Recomendaciones Mejoradas basadas en el Manual HVC Jauja
 * Sistema avanzado de consulta rápida para agentes HVC
 * @module EnhancedRecommendations
 */

export const ENHANCED_RECOMMENDATIONS = {
    // Categorías principales organizadas por fases del viaje
    CATEGORIES: {
        pre_flight: {
            id: 'pre_flight',
            name: 'Pre-Vuelo',
            icon: '🛫',
            color: 'from-blue-500 to-cyan-500',
            description: 'Preparación y llegada del pasajero'
        },
        during_flight: {
            id: 'during_flight',
            name: 'Durante Vuelo',
            icon: '✈️',
            color: 'from-green-500 to-emerald-500',
            description: 'Atención durante el proceso aeroportuario'
        },
        post_flight: {
            id: 'post_flight',
            name: 'Post-Vuelo',
            icon: '🛬',
            color: 'from-purple-500 to-pink-500',
            description: 'Seguimiento y recuperación post-viaje'
        },
        crisis_management: {
            id: 'crisis_management',
            name: 'Gestión de Crisis',
            icon: '🚨',
            color: 'from-red-500 to-rose-500',
            description: 'Manejo de situaciones críticas y recuperación'
        }
    },

    // Recomendaciones específicas por situación
    RECOMMENDATIONS: {
        // PRE-VUELO
        arrival_recognition: {
            id: 'arrival_recognition',
            category: 'pre_flight',
            title: 'Reconocimiento Inmediato del Pasajero HVC',
            priority: 'critical',
            icon: '👁️',
            estimatedTime: '30-45 segundos',
            impact: 'Primera impresión determina percepción total del servicio',
            manualReference: 'Parte V: Touchpoint 2 - Llegada y Reconocimiento',

            quickActions: [
                'Posiciónate en zona de llegadas 5 minutos antes',
                'Identifica por equipaje premium, actitud ejecutiva o perfil conocido',
                'Acércate con energía positiva y contacto visual directo',
                'Usa nombre completo en primeros 10 segundos',
                'Ofrece asistencia inmediata con equipaje'
            ],

            detailedSteps: [
                {
                    phase: 'Preparación (T-30 min)',
                    actions: [
                        'Revisa lista HVC del día con fotos y características',
                        'Coordina con equipo de check-in sobre llegadas',
                        'Prepara información de vuelos y servicios disponibles',
                        'Prepara alternativas de servicio personalizado'
                    ]
                },
                {
                    phase: 'Identificación Visual',
                    actions: [
                        'Busca equipaje premium (maletas de marca, bolsos ejecutivos)',
                        'Identifica señales de VIP (reloj caro, maletín ejecutivo, actitud)',
                        'Observa nivel de urgencia en su caminar',
                        'Detecta si viene acompañado o solo'
                    ]
                },
                {
                    phase: 'Acercamiento Proactivo',
                    actions: [
                        'Camina con confianza hacia el pasajero',
                        'Mantén contacto visual 60-70% del tiempo',
                        'Sonrisa genuina y postura abierta',
                        'Distancia apropiada: 1.5-2 metros inicialmente'
                    ]
                },
                {
                    phase: 'Saludo Personalizado',
                    actions: [
                        'Usa nombre completo inmediatamente',
                        'Confirma destino y vuelo sutilmente',
                        'Ofrece ayuda con equipaje de inmediato',
                        'Explica próximos pasos claramente'
                    ]
                }
            ],

            examples: [
                {
                    scenario: 'Pasajero frecuente llegando tarde',
                    bad: '❌ Esperar a que pregunte por ayuda',
                    good: '✅ "Sr. García, bienvenido. Veo que el tiempo es ajustado, ya coordiné con check-in para agilizar su proceso"'
                },
                {
                    scenario: 'Pasajero con equipaje pesado',
                    bad: '❌ Saludar genérico sin ofrecer ayuda',
                    good: '✅ "Buenos días, Sra. López. ¿Me permite ayudarle con su equipaje?"'
                }
            ],

            checklist: [
                { item: 'Nombre usado en primeros 10 segundos', completed: false },
                { item: 'Contacto visual establecido', completed: false },
                { item: 'Asistencia con equipaje ofrecida', completed: false },
                { item: 'Próximos pasos explicados claramente', completed: false },
                { item: 'Coordinación con equipo completada', completed: false }
            ],

            keyPhrases: [
                '¡Buenos días, [NOMBRE]! Bienvenido al aeropuerto de Jauja',
                'Mi nombre es [TU NOMBRE], seré su agente HVC hoy',
                '¿Viaja a [DESTINO] en el vuelo de las [HORA]?',
                'Permítame acompañarle al proceso de check-in'
            ],

            commonPitfalls: [
                'Esperar a que el pasajero te busque',
                'Saludo genérico sin usar nombre',
                'Estar distraído con celular o conversación',
                'No ofrecer asistencia inmediata con equipaje'
            ],

            successMetrics: [
                'Tasa de reconocimiento >95%',
                'Tiempo de respuesta <45 segundos',
                'Calificación primera impresión >8.5/10'
            ]
        },

        proactive_communication: {
            id: 'proactive_communication',
            category: 'pre_flight',
            title: 'Comunicación Proactiva de Cambios',
            priority: 'high',
            icon: '💬',
            estimatedTime: '2-5 minutos',
            impact: 'Reduce ansiedad y genera confianza en el servicio',
            manualReference: 'Parte VI: Comunicación Proactiva',

            quickActions: [
                'Monitorea constantemente status de vuelos',
                'Identifica cambios antes que el pasajero',
                'Acércate proactivamente con información completa',
                'Usa estructura 4W: What, Why, What we do, What you can do',
                'Ofrece alternativas concretas y realistas'
            ],

            detailedSteps: [
                {
                    phase: 'Monitoreo Continuo',
                    actions: [
                        'Revisa pantallas de información cada 5-10 minutos',
                        'Mantén comunicación con torre de control',
                        'Coordina con aerolínea sobre posibles cambios',
                        'Anticípate a situaciones comunes (clima, tráfico aéreo)'
                    ]
                },
                {
                    phase: 'Detección de Cambios',
                    actions: [
                        'Identifica retrasos, cambios de puerta, cancelaciones',
                        'Evalúa impacto en pasajero HVC específicamente',
                        'Prepara información completa antes de comunicar',
                        'Coordina servicios alternativos disponibles'
                    ]
                },
                {
                    phase: 'Comunicación Proactiva',
                    actions: [
                        'Acércate al pasajero antes de que note el cambio',
                        'Usa lenguaje positivo y tranquilizador',
                        'Proporciona información completa y clara',
                        'Ofrece soluciones y alternativas realistas'
                    ]
                },
                {
                    phase: 'Seguimiento',
                    actions: [
                        'Actualizaciones cada 15-20 minutos',
                        'Confirma que el pasajero entendió la información',
                        'Documenta comunicación para registro',
                        'Coordina con otros puntos de contacto'
                    ]
                }
            ],

            examples: [
                {
                    scenario: 'Retraso de 30 minutos por clima',
                    bad: '❌ "Hay un retraso" (sin más contexto)',
                    good: '✅ "Sr. Mendoza, quiero informarle que tenemos un retraso de 30 minutos por condiciones climáticas en destino. Estamos priorizando el despegue apenas mejore. Mientras tanto, permíteme acompañarle a un área más cómoda y le traigo un café"'
                },
                {
                    scenario: 'Cambio de puerta de embarque',
                    bad: '❌ Dejar que el pasajero lo descubra solo',
                    good: '✅ "Dra. Silva, el vuelo mantiene horario pero cambió a puerta 12. Permítame acompañarla para evitar confusiones"'
                }
            ],

            checklist: [
                { item: 'Status de vuelo monitoreado constantemente', completed: false },
                { item: 'Información completa preparada', completed: false },
                { item: 'Comunicación proactiva iniciada', completed: false },
                { item: 'Alternativas ofrecidas claramente', completed: false },
                { item: 'Seguimiento programado', completed: false }
            ],

            keyPhrases: [
                'Quiero informarle primero que...',
                'La situación actual es...',
                'Esto es lo que estamos haciendo...',
                'Mientras tanto, le ofrezco...',
                'Le mantendré informado cada 15 minutos'
            ],

            commonPitfalls: [
                'Esperar a que el pasajero pregunte',
                'Dar información incompleta o confusa',
                'Usar lenguaje negativo ("lo siento mucho")',
                'No ofrecer alternativas concretas'
            ],

            successMetrics: [
                'Reducción de quejas por falta de información >70%',
                'Aumento de satisfacción en situaciones de cambio +25%',
                'Tasa de comunicación proactiva >90%'
            ]
        },

        service_without_infrastructure: {
            id: 'service_without_infrastructure',
            category: 'pre_flight',
            title: 'Servicio Humano de Excelencia en Aeropuertos Pequeños',
            priority: 'critical',
            icon: '🤝',
            estimatedTime: 'Continuo',
            impact: 'Basado en investigación: Los pasajeros PREFIEREN aeropuertos pequeños bien operados',
            manualReference: 'Manual HVC - Conclusiones de Voz del Cliente',

            quickActions: [
                'VELOCIDAD es el nuevo lujo: 5 minutos de check-in > lounge con champagne',
                'PERSONAL es make-or-break: Factor #1 en reviews negativas vs positivas',
                'TAMAÑO PEQUEÑO = VENTAJA: Pasajeros prefieren aeropuertos pequeños bien operados',
                'COMUNICACIÓN supera tecnología: Ausencia de pantallas no importa si hay comunicación humana',
                'EXPECTATIVAS BAJAS = FÁCIL superar: Esperan velocidad, amabilidad, claridad'
            ],

            detailedSteps: [
                {
                    phase: 'Filosofía del Agente HVC',
                    actions: [
                        'NO eres un "botón de lujo" - eres un embajador de experiencia',
                        'NO eres un simple asistente - eres un solucionador proactivo',
                        'NO eres un robot con scripts - eres un profesional empoderado',
                        'SÍ eres el rostro humano de un servicio excepcional',
                        'SÍ eres un creador de momentos memorables'
                    ]
                },
                {
                    phase: 'Las 3 Claves del Éxito (Según Investigación)',
                    actions: [
                        'VELOCIDAD: "5 minutos de check-in" genera más satisfacción que amenities físicos',
                        'AMABILIDAD: Personal cálido es factor #2 en reviews positivas',
                        'CLARIDAD: Comunicación humana proactiva supera pantallas digitales'
                    ]
                },
                {
                    phase: 'Competencias Esenciales',
                    actions: [
                        'Inteligencia Emocional: Leer emociones sin que te las digan',
                        'Proactividad: Anticipar necesidades ANTES de que las expresen',
                        'Comunicación Excepcional: 55% no verbal, 35% verbal, 10% paraverbal'
                    ]
                },
                {
                    phase: 'Técnicas Específicas para Jauja',
                    actions: [
                        'Usa el NOMBRE del pasajero al menos 3 veces en la interacción',
                        'Mantén contacto visual 60-70% del tiempo (no 100%, es intimidante)',
                        'Sonríe genuinamente (músculo orbicular del ojo activado)',
                        'Asiente mientras escuchas (valida que prestas atención)',
                        'Repite información crítica (gate, horario, documentación)'
                    ]
                }
            ],

            examples: [
                {
                    scenario: 'Pasajero HVC llegando (basado en investigación)',
                    bad: '❌ "Buenos días, ¿en qué puedo ayudarle?" (genérico)',
                    good: '✅ "¡Buenos días, Sr. Mendoza! Bienvenido de nuevo a Jauja. Veo que viene directo de una reunión importante - permíteme aliviarle el estrés del viaje"'
                },
                {
                    scenario: 'Retraso de vuelo (expectativas bajas = fácil superar)',
                    bad: '❌ "Hay un retraso" (sin más contexto)',
                    good: '✅ "Sr. García, quiero informarle primero que tenemos un retraso de 30 minutos por condiciones climáticas. Estamos priorizando su despegue apenas mejore. Mientras tanto, permíteme acompañarle y le traigo un café"'
                }
            ],

            checklist: [
                { item: 'Nombre usado 3+ veces en la interacción', completed: false },
                { item: 'Contacto visual 60-70% del tiempo', completed: false },
                { item: 'Sonrisa genuina (músculo orbicular activado)', completed: false },
                { item: 'Información crítica repetida', completed: false },
                { item: 'Velocidad + Amabilidad + Claridad aplicadas', completed: false }
            ],

            keyPhrases: [
                '¡Buenos días, [NOMBRE]! Bienvenido de nuevo a Jauja',
                'Veo que [contexto específico] - permíteme [solución anticipada]',
                'Quiero informarle primero que... (comunicación proactiva)',
                'Estamos priorizando [acción específica] para usted',
                'Mientras tanto, permíteme [servicio personal]'
            ],

            commonPitfalls: [
                'Ser reactivo en lugar de proactivo',
                'No usar el nombre del pasajero',
                'Comunicación genérica sin personalización',
                'No anticipar necesidades básicas',
                'Perder la ventaja del tamaño pequeño'
            ],

            successMetrics: [
                'Tiempo de check-in <5 minutos (velocidad)',
                'Uso de nombre >3 veces por interacción',
                'Comunicación proactiva >90%',
                'Satisfacción con servicio personal >9/10',
                'Referencias sobre "servicio humano excepcional"'
            ]
        },

        // DURANTE VUELO
        checkin_express: {
            id: 'checkin_express',
            category: 'during_flight',
            title: 'Check-in Express Premium',
            priority: 'high',
            icon: '⚡',
            estimatedTime: '2-4 minutos',
            impact: 'Velocidad percibida 3x mayor',
            manualReference: 'Parte V: Touchpoint 3 - Check-in Express',

            quickActions: [
                'Prepara documentos antes de que llegue',
                'Saludo personalizado inmediato',
                'Proceso eficiente pero no apresurado',
                'Confirma preferencias (ventana/pasillo)',
                'Explica próximos pasos claramente'
            ],

            detailedSteps: [
                {
                    phase: 'Preparación Previa',
                    actions: [
                        'Revisa reserva y documentos requeridos',
                        'Prepara equipaje de mano si aplica',
                        'Coordina con counter de check-in',
                        'Ten a mano información de vuelo actualizada'
                    ]
                },
                {
                    phase: 'Recepción de Documentos',
                    actions: [
                        'Recibe pasaporte/DNI con ambas manos',
                        'Agradece cortésmente',
                        'Verifica validez visual rápida',
                        'Confirma identidad del pasajero'
                    ]
                },
                {
                    phase: 'Procesamiento Eficiente',
                    actions: [
                        'Ingresa datos con precisión',
                        'Comunica progreso: "Todo en orden con su reserva"',
                        'Verifica restricciones y requisitos especiales',
                        'Confirma equipaje si aplica'
                    ]
                },
                {
                    phase: 'Confirmación y Entrega',
                    actions: [
                        'Resume información clave',
                        'Entrega documentos con ambas manos',
                        'Explica boarding pass claramente',
                        'Confirma puerta y horario de embarque'
                    ]
                }
            ],

            examples: [
                {
                    scenario: 'Pasajero con múltiples documentos',
                    bad: '❌ Procesar en silencio sin comunicación',
                    good: '✅ "Sr. Torres, veo que tiene visa y pasaporte. Todo está en orden, su check-in está completo"'
                },
                {
                    scenario: 'Preferencia de asiento especial',
                    bad: '❌ Asignar sin consultar',
                    good: '✅ "¿Prefiere ventana o pasillo? Tengo disponible el 12A ventana como solicitó anteriormente"'
                }
            ],

            checklist: [
                { item: 'Documentos preparados previamente', completed: false },
                { item: 'Proceso completado en <4 minutos', completed: false },
                { item: 'Preferencias de asiento confirmadas', completed: false },
                { item: 'Información de vuelo clara entregada', completed: false },
                { item: 'Próximos pasos explicados', completed: false }
            ],

            keyPhrases: [
                'Permítame su pasaporte y código de reserva',
                'Todo en orden con su documentación',
                'Su asiento confirmado es [NÚMERO]',
                'Embarque comienza en [TIEMPO] en puerta [NÚMERO]'
            ],

            commonPitfalls: [
                'No preparar documentos previamente',
                'Procesar en silencio sin comunicación',
                'No confirmar preferencias del pasajero',
                'Entregar documentos sin explicación'
            ],

            successMetrics: [
                'Tiempo promedio check-in <3 minutos',
                'Tasa de errores en procesamiento <1%',
                'Satisfacción check-in >9/10'
            ]
        },

        security_compensation: {
            id: 'security_compensation',
            category: 'during_flight',
            title: 'Compensación por Espera en Seguridad',
            priority: 'medium',
            icon: '🛡️',
            estimatedTime: 'Según tiempo de espera',
            impact: 'Convierte limitación en ventaja competitiva',
            manualReference: 'Parte V: Touchpoint 4 - Seguridad con Colas Compartidas',

            quickActions: [
                'Evalúa longitud de cola al llegar',
                'Ofrece alternativas de espera premium',
                'Proporciona actualizaciones cada 10 minutos',
                'Compensa con servicios adicionales',
                'Asegura experiencia fluida post-seguridad'
            ],

            detailedSteps: [
                {
                    phase: 'Evaluación Inicial',
                    actions: [
                        'Observa flujo de seguridad al aproximarte',
                        'Estima tiempo de espera realista',
                        'Identifica opciones de compensación disponibles',
                        'Prepara alternativas de servicio personalizado (bebidas, snacks, acompañamiento)'
                    ]
                },
                {
                    phase: 'Oferta de Alternativas',
                    actions: [
                        'Si cola >15 minutos: ofrece acompañamiento personal',
                        'Proporciona agua, snacks o bebidas',
                        'Ofrece asiento preferencial para esperar',
                        'Sugiere actividades durante espera'
                    ]
                },
                {
                    phase: 'Acompañamiento Activo',
                    actions: [
                        'Mantén presencia visible durante espera',
                        'Proporciona actualizaciones cada 10-15 minutos',
                        'Ayuda con preparación de bandejas',
                        'Recordatorios de objetos prohibidos'
                    ]
                },
                {
                    phase: 'Transición Fluida',
                    actions: [
                        'Recibe al pasajero del otro lado',
                        'Confirma que todo salió bien',
                        'Dirige a zona de embarque',
                        'Resume próximos pasos'
                    ]
                }
            ],

            examples: [
                {
                    scenario: 'Cola de 20 minutos en seguridad',
                    bad: '❌ "Tiene que esperar en la cola como todos"',
                    good: '✅ "Sr. Vargas, veo que hay una cola de aproximadamente 20 minutos. Le invito a esperar en nuestra zona VIP con agua fresca y WiFi. Le avisaré cuando sea el mejor momento para pasar"'
                },
                {
                    scenario: 'Pasajero ansioso por tiempo',
                    bad: '❌ Ignorar señales de estrés',
                    good: '✅ "Dra. Luna, entiendo que su tiempo es valioso. Estoy coordinando con seguridad para optimizar su paso. Mientras tanto, aquí tiene una bebida fresca"'
                }
            ],

            checklist: [
                { item: 'Tiempo de cola evaluado correctamente', completed: false },
                { item: 'Alternativas ofrecidas proactivamente', completed: false },
                { item: 'Actualizaciones proporcionadas regularmente', completed: false },
                { item: 'Compensación apropiada entregada', completed: false },
                { item: 'Transición post-seguridad fluida', completed: false }
            ],

            keyPhrases: [
                'Veo que hay una cola de aproximadamente [TIEMPO] minutos',
                'Le invito a esperar cómodamente en nuestra zona VIP',
                'Le mantendré informado del progreso',
                'Permítame ayudarle con la preparación de bandejas',
                'Todo listo, ahora le acompaño a la zona de embarque'
            ],

            commonPitfalls: [
                'No ofrecer alternativas de espera',
                'Subestimar el impacto psicológico de la espera',
                'No proporcionar actualizaciones regulares',
                'Olvidar la transición post-seguridad'
            ],

            successMetrics: [
                'Reducción de quejas por seguridad >60%',
                'Satisfacción durante esperas >7.5/10',
                'Tasa de uso de alternativas de espera >40%'
            ]
        },

        // POST-VUELO
        post_flight_followup: {
            id: 'post_flight_followup',
            category: 'post_flight',
            title: 'Seguimiento Post-Vuelo 48h',
            priority: 'high',
            icon: '📞',
            estimatedTime: '5-10 minutos',
            impact: '+25% recuperación de NPS negativo',
            manualReference: 'Parte VI: Seguimiento Post-Vuelo 48h',

            quickActions: [
                'Identifica detractores (calificación ≤6)',
                'Contacta dentro de ventana óptima (24-48h)',
                'Usa estructura de 7 pasos probada',
                'Documenta conversación completamente',
                'Implementa acciones de mejora identificadas'
            ],

            detailedSteps: [
                {
                    phase: 'Identificación de Casos',
                    actions: [
                        'Revisa calificaciones Medallia post-vuelo',
                        'Identifica detractores (≤6) y casos especiales',
                        'Prioriza según categoría HVC y severidad',
                        'Prepara información del vuelo e interacción previa'
                    ]
                },
                {
                    phase: 'Preparación del Contacto',
                    actions: [
                        'Elige canal preferido (llamada, WhatsApp, email)',
                        'Prepara script personalizado con datos específicos',
                        'Coordina con supervisor para casos complejos',
                        'Ten a mano opciones de compensación disponibles'
                    ]
                },
                {
                    phase: 'Estructura de 7 Pasos',
                    actions: [
                        '1. Saludo personalizado y contextual',
                        '2. Propósito claro: "Quiero asegurarme de que todo salió bien"',
                        '3. Pregunta abierta: "¿Cómo estuvo su experiencia?"',
                        '4. Escucha activa sin interrumpir',
                        '5. Disculpa genuina si aplica',
                        '6. Acción concreta: compensación o mejora',
                        '7. Cierre positivo con compromiso de mejora'
                    ]
                },
                {
                    phase: 'Documentación y Seguimiento',
                    actions: [
                        'Registra conversación en CRM',
                        'Actualiza perfil del pasajero',
                        'Implementa mejoras sistémicas identificadas',
                        'Programa seguimiento adicional si necesario'
                    ]
                }
            ],

            examples: [
                {
                    scenario: 'Detractor por retraso no comunicado',
                    bad: '❌ No contactar o esperar a que reclame',
                    good: '✅ "Sr. Castro, soy Ana del equipo HVC. Vi que su vuelo del martes tuvo un retraso. Quiero entender qué pasó y asegurarme de que su próximo viaje sea perfecto. ¿Tiene unos minutos?"'
                },
                {
                    scenario: 'Promotor para fidelización',
                    bad: '❌ Solo email genérico de agradecimiento',
                    good: '✅ "Sra. Morales, gracias por su calificación de 10/10. Nos alegra mucho que haya tenido una experiencia excelente. ¿Hay algo específico que le gustaría que mantengamos o mejoremos?"'
                }
            ],

            checklist: [
                { item: 'Casos prioritarios identificados correctamente', completed: false },
                { item: 'Contacto realizado en ventana óptima (24-48h)', completed: false },
                { item: 'Estructura de 7 pasos seguida completamente', completed: false },
                { item: 'Compensación apropiada ofrecida', completed: false },
                { item: 'Conversación documentada completamente', completed: false }
            ],

            keyPhrases: [
                'Soy [NOMBRE] del equipo HVC, atendí su vuelo del [FECHA]',
                'Vi que [tuvo una experiencia/retardo/incidente]',
                'Quiero asegurarme de que todo esté bien ahora',
                '¿Cómo estuvo su experiencia general?',
                'Permítame [solución concreta y personalizada] por las molestias',
                'Me comprometo a que su próximo vuelo sea perfecto'
            ],

            commonPitfalls: [
                'Contactar fuera de la ventana óptima',
                'No preparar información específica del caso',
                'Interrumpir al pasajero durante su explicación',
                'No documentar la conversación adecuadamente',
                'Olvidar implementar mejoras sistémicas'
            ],

            successMetrics: [
                'Tasa de contacto efectivo >80%',
                'Recuperación de detractores >60%',
                'Aumento de NPS post-contacto >2 puntos',
                'Satisfacción con proceso de seguimiento >8.5/10'
            ]
        },

        // GESTIÓN DE CRISIS
        service_recovery_paradox: {
            id: 'service_recovery_paradox',
            category: 'crisis_management',
            title: 'Recuperación de Servicio - Paradoja del Servicio',
            priority: 'critical',
            icon: '🔧',
            estimatedTime: '10-30 minutos',
            impact: '+150% satisfacción vs no actuar',
            manualReference: 'Parte I: Paradoja de la Recuperación del Servicio',

            quickActions: [
                'Reconoce el problema INMEDIATAMENTE sin excusas',
                'Toma OWNERSHIP total: "YO me encargo"',
                'Ofrece opciones para dar control al pasajero',
                'Supera expectativas con soluciones creativas y personalizadas',
                'Hace seguimiento para confirmar resolución'
            ],

            detailedSteps: [
                {
                    phase: 'Reconocimiento Inmediato',
                    actions: [
                        'Admite el problema sin justificaciones',
                        'Valida emociones del pasajero',
                        'Toma responsabilidad personal',
                        'Muestra urgencia genuina en resolver'
                    ]
                },
                {
                    phase: 'Evaluación Rápida',
                    actions: [
                        'Identifica causa raíz en 30 segundos',
                        'Evalúa opciones de solución disponibles',
                        'Considera impacto en experiencia general',
                        'Coordina con supervisor si supera autoridad'
                    ]
                },
                {
                    phase: 'Solución con Opciones',
                    actions: [
                        'Ofrece múltiples alternativas',
                        'Deja que el pasajero elija la mejor opción',
                        'Explica claramente cada alternativa',
                        'Asegura que la solución sea tangible y valiosa'
                    ]
                },
                {
                    phase: 'Compensación Generosa',
                    actions: [
                        'Supera expectativas del pasajero',
                        'Incluye soluciones simbólicas y prácticas que generen valor emocional',
                        'Hace visible el esfuerzo de recuperación',
                        'Personaliza según perfil del pasajero'
                    ]
                },
                {
                    phase: 'Seguimiento Activo',
                    actions: [
                        'Confirma que la solución funcionó',
                        'Pregunta si hay algo más que hacer',
                        'Documenta para aprendizaje futuro',
                        'Programa contacto adicional si necesario'
                    ]
                }
            ],

            examples: [
                {
                    scenario: 'Equipaje perdido en vuelo internacional',
                    bad: '❌ "Eso es responsabilidad de la aerolínea, no mía"',
                    good: '✅ "Sr. Mendoza, entiendo completamente su preocupación. Aunque el equipaje es responsabilidad de la aerolínea, YO personalmente me encargaré de que esto se resuelva hoy mismo. Le proporcionaré kit de emergencia premium, coordinaré entrega a domicilio cuando aparezca, y gestionaré una compensación apropiada según las políticas de la aerolínea. ¿Prefiere que lo contacte por teléfono o WhatsApp para actualizaciones?"'
                },
                {
                    scenario: 'Asiento equivocado asignado',
                    bad: '❌ "Debe esperar al embarque para cambiarlo"',
                    good: '✅ "Dra. Silva, veo el error en su asignación. Permítame corregirlo inmediatamente. [Hace llamada rápida] Listo, le asignaron el asiento 4A que prefiere. Además, le ofrezco embarque prioritario como compensación. ¿Hay algo más en lo que pueda ayudarle?"'
                }
            ],

            checklist: [
                { item: 'Problema reconocido sin excusas', completed: false },
                { item: 'Ownership total asumido', completed: false },
                { item: 'Opciones ofrecidas claramente', completed: false },
                { item: 'Compensación generosa proporcionada', completed: false },
                { item: 'Seguimiento programado', completed: false }
            ],

            keyPhrases: [
                'Entiendo completamente su frustración',
                'YO me encargo personalmente de resolver esto',
                '¿Qué opción prefiere: A, B o C?',
                'Para compensar las molestias, le ofrezco...',
                '¿Hay algo más en lo que pueda ayudarle?',
                'Me aseguraré de que esto no vuelva a pasar'
            ],

            commonPitfalls: [
                'Dar excusas o culpar a otros',
                'No asumir ownership completo',
                'Ofrecer solo una solución sin opciones',
                'Compensación insuficiente o invisible',
                'No hacer seguimiento posterior'
            ],

            successMetrics: [
                'Tasa de recuperación exitosa >85%',
                'Aumento de satisfacción post-recuperación +150%',
                'Reducción de escalamiento a supervisor >90%',
                'NPS post-recuperación >7.5'
            ]
        },

        crisis_empathy_first: {
            id: 'crisis_empathy_first',
            category: 'crisis_management',
            title: 'Empatía Primero en Situaciones de Crisis',
            priority: 'critical',
            icon: '💚',
            estimatedTime: '2-5 minutos iniciales',
            impact: 'Reduce escalamiento y genera confianza en el servicio',
            manualReference: 'Parte VI: Empatía y Escucha Activa',

            quickActions: [
                'ESCUCHA PRIMERO, SOLUCIONA DESPUÉS',
                'Valida emociones: "Entiendo su frustración"',
                'Usa técnica del espejo: repite con tus palabras',
                'Cambia "PERO" por "Y" en respuestas',
                'Ofrece control: "¿Qué prefiere que hagamos?"'
            ],

            detailedSteps: [
                {
                    phase: 'Escucha Activa Inicial',
                    actions: [
                        'Deja que el pasajero exprese TODO sin interrumpir',
                        'Lenguaje corporal: contacto visual, asentir, inclinarte',
                        'Silencio estratégico: espera 2-3 segundos después de terminar',
                        'Toma notas mentales de puntos clave'
                    ]
                },
                {
                    phase: 'Validación Emocional',
                    actions: [
                        'Reconoce emoción específica: frustración, preocupación, enojo',
                        'Normaliza: "Es completamente comprensible sentirse así"',
                        'Empatiza personalmente: "Si estuviera en su lugar..."',
                        'Evita frases vacías: "Cálmese" o "No se preocupe"'
                    ]
                },
                {
                    phase: 'Técnica del Espejo',
                    actions: [
                        'Repite lo que entendiste: "Si entendí bien..."',
                        'Confirma comprensión: "¿Es correcto?"',
                        'Ajusta si es necesario basado en respuesta',
                        'Demuestra que REALMENTE escuchaste'
                    ]
                },
                {
                    phase: 'Transición a Solución',
                    actions: [
                        'Una vez validada la emoción, ofrece ayudar',
                        'Da opciones para devolver control',
                        'Mantén tono calmado y confiado',
                        'Comunica cada paso que vas a dar'
                    ]
                }
            ],

            examples: [
                {
                    scenario: 'Pasajero furioso por vuelo cancelado',
                    bad: '❌ "Cálmese, le voy a ayudar"',
                    good: '✅ "Sr. López, entiendo perfectamente su frustración. Si yo estuviera esperando este vuelo importante y lo cancelaran, también estaría muy molesto. Cuénteme, ¿cuál es el impacto principal que esto tiene en sus planes?"'
                },
                {
                    scenario: 'Pasajero ansioso por conexión ajustada',
                    bad: '❌ "No se preocupe, todo estará bien"',
                    good: '✅ "Dra. Martínez, veo que está preocupado por su conexión. Es completamente normal sentirse ansioso con tiempos tan ajustados. Déjeme revisar el status actual y ver todas las opciones disponibles para usted"'
                }
            ],

            checklist: [
                { item: 'Escucha completa sin interrupciones', completed: false },
                { item: 'Emoción validada específicamente', completed: false },
                { item: 'Técnica del espejo utilizada', completed: false },
                { item: 'Control devuelto al pasajero', completed: false },
                { item: 'Transición calmada a solución', completed: false }
            ],

            keyPhrases: [
                'Entiendo perfectamente su [frustración/preocupación/molestia]',
                'Si estuviera en su lugar, yo también me sentiría [emoción]',
                'Si entendí bien, el problema principal es... ¿correcto?',
                '¿Qué opción prefiere que exploremos primero?',
                'Permítame ver qué puedo hacer para ayudarle'
            ],

            commonPitfalls: [
                'Interrumpir al pasajero antes de terminar',
                'Minimizar emociones: "No es para tanto"',
                'Dar soluciones antes de validar emociones',
                'Usar frases condescendientes',
                'No devolver control al pasajero'
            ],

            successMetrics: [
                'Reducción de escalamiento >70%',
                'Tiempo para calmar situación <5 minutos',
                'Satisfacción con manejo de crisis >8/10',
                'Pasajeros que reportan sentirse "escuchados" >90%'
            ]
        }
    },

    // Funciones de utilidad
    getRecommendationsByCategory: function(categoryId) {
        return Object.values(this.RECOMMENDATIONS).filter(rec => rec.category === categoryId);
    },

    getRecommendationById: function(id) {
        return this.RECOMMENDATIONS[id];
    },

    searchRecommendations: function(query) {
        const lowercaseQuery = query.toLowerCase();
        return Object.values(this.RECOMMENDATIONS).filter(rec =>
            rec.title.toLowerCase().includes(lowercaseQuery) ||
            rec.quickActions.some(action => action.toLowerCase().includes(lowercaseQuery)) ||
            rec.keyPhrases.some(phrase => phrase.toLowerCase().includes(lowercaseQuery))
        );
    },

    getPriorityColor: function(priority) {
        const colors = {
            critical: 'from-red-500 to-rose-500',
            high: 'from-orange-500 to-amber-500',
            medium: 'from-yellow-500 to-lime-500',
            low: 'from-green-500 to-emerald-500'
        };
        return colors[priority] || colors.medium;
    },

    getPriorityIcon: function(priority) {
        const icons = {
            critical: '🚨',
            high: '⚠️',
            medium: '📋',
            low: 'ℹ️'
        };
        return icons[priority] || icons.medium;
    }
};

/**
 * Funciones de gestión de estado para recomendaciones
 */
export class RecommendationManager {
    constructor() {
        this.favorites = new Set(JSON.parse(localStorage.getItem('hvc_favorites') || '[]'));
        this.usageStats = JSON.parse(localStorage.getItem('hvc_usage_stats') || '{}');
        this.checklistStates = JSON.parse(localStorage.getItem('hvc_checklists') || '{}');
    }

    toggleFavorite(recommendationId) {
        if (this.favorites.has(recommendationId)) {
            this.favorites.delete(recommendationId);
        } else {
            this.favorites.add(recommendationId);
        }
        this.saveFavorites();
        return this.favorites.has(recommendationId);
    }

    isFavorite(recommendationId) {
        return this.favorites.has(recommendationId);
    }

    getFavorites() {
        return Array.from(this.favorites).map(id => ENHANCED_RECOMMENDATIONS.getRecommendationById(id)).filter(Boolean);
    }

    trackUsage(recommendationId) {
        this.usageStats[recommendationId] = (this.usageStats[recommendationId] || 0) + 1;
        localStorage.setItem('hvc_usage_stats', JSON.stringify(this.usageStats));
    }

    getUsageStats() {
        return this.usageStats;
    }

    getMostUsed(limit = 5) {
        return Object.entries(this.usageStats)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([id]) => ENHANCED_RECOMMENDATIONS.getRecommendationById(id))
            .filter(Boolean);
    }

    getTodayUsage() {
        const today = new Date().toISOString().split('T')[0];
        let todayCount = 0;

        Object.entries(this.usageStats).forEach(([id, stats]) => {
            if (typeof stats === 'object' && stats[today]) {
                todayCount += stats[today];
            } else if (typeof stats === 'number') {
                // Fallback para datos antiguos
                todayCount += stats;
            }
        });

        return todayCount;
    }

    updateChecklistState(recommendationId, checklistIndex, completed) {
        if (!this.checklistStates[recommendationId]) {
            this.checklistStates[recommendationId] = [];
        }
        if (!this.checklistStates[recommendationId][checklistIndex]) {
            this.checklistStates[recommendationId][checklistIndex] = { completed: false, timestamp: null };
        }
        this.checklistStates[recommendationId][checklistIndex].completed = completed;
        this.checklistStates[recommendationId][checklistIndex].timestamp = completed ? new Date().toISOString() : null;
        this.saveChecklistStates();
    }

    getChecklistState(recommendationId) {
        return this.checklistStates[recommendationId] || [];
    }

    getChecklistProgress(recommendationId) {
        const recommendation = ENHANCED_RECOMMENDATIONS.RECOMMENDATIONS[recommendationId];
        if (!recommendation || !recommendation.checklist || recommendation.checklist.length === 0) {
            return 0;
        }

        const totalItems = recommendation.checklist.length;
        const checklistState = this.getChecklistState(recommendationId);
        
        const completedItems = checklistState.filter(item => item && item.completed).length;

        if (totalItems === 0) {
            return 0;
        }

        return Math.round((completedItems / totalItems) * 100);
    }

    saveFavorites() {
        localStorage.setItem('hvc_favorites', JSON.stringify(Array.from(this.favorites)));
    }

    saveChecklistStates() {
        localStorage.setItem('hvc_checklists', JSON.stringify(this.checklistStates));
    }

    exportRecommendations(recommendationIds) {
        const recommendations = recommendationIds.map(id => ENHANCED_RECOMMENDATIONS.getRecommendationById(id)).filter(Boolean);
        const exportData = {
            exportedAt: new Date().toISOString(),
            recommendations: recommendations,
            favorites: Array.from(this.favorites),
            usageStats: this.usageStats
        };
        return JSON.stringify(exportData, null, 2);
    }

    importRecommendations(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.favorites) {
                this.favorites = new Set(data.favorites);
                this.saveFavorites();
            }
            if (data.usageStats) {
                this.usageStats = data.usageStats;
                localStorage.setItem('hvc_usage_stats', JSON.stringify(this.usageStats));
            }
            return true;
        } catch (error) {
            console.error('Error importing recommendations:', error);
            return false;
        }
    }
}

export const recommendationManager = new RecommendationManager();

