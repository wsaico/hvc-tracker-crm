-- ================================================
-- SCRIPT SQL PARA VERIFICAR DATOS DE GRÁFICO DE TENDENCIA
-- Base de Datos: Supabase
-- ================================================

-- 1. VERIFICAR TOTAL DE INTERACCIONES
SELECT
    COUNT(*) as total_interacciones,
    COUNT(calificacion_medallia) as con_calificacion,
    COUNT(*) - COUNT(calificacion_medallia) as sin_calificacion
FROM interacciones;

-- 2. INTERACCIONES CON CALIFICACIÓN EN ÚLTIMOS 30 DÍAS
SELECT
    DATE(fecha) as fecha,
    COUNT(*) as total_interacciones,
    ROUND(AVG(calificacion_medallia), 1) as calificacion_promedio,
    MIN(calificacion_medallia) as calificacion_minima,
    MAX(calificacion_medallia) as calificacion_maxima
FROM interacciones
WHERE calificacion_medallia IS NOT NULL
  AND fecha >= NOW() - INTERVAL '30 days'
GROUP BY DATE(fecha)
ORDER BY fecha DESC;

-- 3. TODAS LAS INTERACCIONES CON CALIFICACIÓN (PARA DEBUGGING)
SELECT
    id,
    pasajero_id,
    fecha,
    calificacion_medallia,
    motivo_viaje,
    agente_nombre,
    aeropuerto
FROM interacciones
WHERE calificacion_medallia IS NOT NULL
ORDER BY fecha DESC
LIMIT 20;

-- 4. RESUMEN POR AEROPUERTO
SELECT
    aeropuerto,
    COUNT(*) as total_interacciones,
    COUNT(calificacion_medallia) as con_calificacion,
    ROUND(AVG(calificacion_medallia), 1) as promedio_calificacion
FROM interacciones
WHERE fecha >= NOW() - INTERVAL '30 days'
GROUP BY aeropuerto
ORDER BY total_interacciones DESC;

-- 5. DISTRIBUCIÓN DE CALIFICACIONES (NPS)
SELECT
    CASE
        WHEN calificacion_medallia <= 6 THEN 'Detractor (0-6)'
        WHEN calificacion_medallia <= 8 THEN 'Pasivo (7-8)'
        ELSE 'Promotor (9-10)'
    END as tipo_nps,
    COUNT(*) as cantidad,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as porcentaje
FROM interacciones
WHERE calificacion_medallia IS NOT NULL
  AND fecha >= NOW() - INTERVAL '30 days'
GROUP BY tipo_nps
ORDER BY tipo_nps;

-- 6. VERIFICAR SI HAY DATOS PARA EL GRÁFICO
-- Este query simula exactamente lo que hace BusinessLogic.calculateDashboardMetrics
WITH datos_30_dias AS (
    SELECT
        DATE(fecha) as fecha,
        calificacion_medallia
    FROM interacciones
    WHERE calificacion_medallia IS NOT NULL
      AND fecha >= NOW() - INTERVAL '30 days'
)
SELECT
    fecha,
    COUNT(*) as cantidad_interacciones,
    ROUND(AVG(calificacion_medallia), 1) as promedio
FROM datos_30_dias
GROUP BY fecha
ORDER BY fecha ASC;

-- 7. DATOS EN FORMATO PARA EL GRÁFICO (FORMATO JSON)
SELECT
    json_agg(
        json_build_object(
            'date', TO_CHAR(DATE(fecha), 'YYYY-MM-DD'),
            'avg', ROUND(AVG(calificacion_medallia), 1),
            'count', COUNT(*)
        ) ORDER BY DATE(fecha)
    ) as trend_data
FROM interacciones
WHERE calificacion_medallia IS NOT NULL
  AND fecha >= NOW() - INTERVAL '30 days'
GROUP BY DATE(fecha);

-- ================================================
-- INSTRUCCIONES:
-- 1. Copia y ejecuta estos queries uno por uno en Supabase SQL Editor
-- 2. Verifica que el query #6 retorne al menos 1 fila
-- 3. El query #7 muestra el formato exacto que necesita el gráfico
-- ================================================
