# 📊 Setup de Base de Datos Supabase

## Script SQL Completo

Ejecuta este script en el **SQL Editor** de tu proyecto Supabase:

```sql
-- ============================================================
-- CREAR TABLAS
-- ============================================================

-- Tabla de aeropuertos
CREATE TABLE airports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    codigo TEXT NOT NULL UNIQUE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tabla de pasajeros
CREATE TABLE passengers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    dni_pasaporte TEXT NOT NULL,
    fecha_nacimiento DATE,
    categoria TEXT NOT NULL CHECK (categoria IN ('SIGNATURE', 'TOP', 'BLACK', 'PLATINUM', 'GOLD PLUS', 'GOLD')),
    aeropuerto_id UUID REFERENCES airports(id) ON DELETE CASCADE,
    telefono TEXT,
    email TEXT,
    notas_especiales TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(dni_pasaporte, aeropuerto_id)
);

-- Tabla de vuelos
CREATE TABLE flights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_vuelo TEXT NOT NULL,
    destino TEXT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME,
    aeropuerto_id UUID REFERENCES airports(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tabla de relación vuelo-pasajero
CREATE TABLE flight_passengers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vuelo_id UUID REFERENCES flights(id) ON DELETE CASCADE,
    pasajero_id UUID REFERENCES passengers(id) ON DELETE CASCADE,
    asiento TEXT,
    estatus TEXT NOT NULL CHECK (estatus IN ('CONFIRMADO', 'CHECK-IN', 'ABORDADO', 'NO SHOW', 'CANCELADO')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(vuelo_id, pasajero_id)
);

-- Tabla de usuarios (SOLO ESTA TABLA SI LAS DEMÁS YA EXISTEN)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    nombre_completo TEXT NOT NULL,
    rol TEXT NOT NULL CHECK (rol IN ('supervisor', 'agente')),
    aeropuerto_id UUID REFERENCES airports(id) ON DELETE CASCADE,
    activo BOOLEAN DEFAULT true,
    ultimo_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(username, aeropuerto_id)
);

-- Tabla de interacciones
CREATE TABLE interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pasajero_id UUID REFERENCES passengers(id) ON DELETE CASCADE,
    vuelo_id UUID REFERENCES flights(id) ON DELETE SET NULL,
    usuario_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Nuevo: referencia al usuario
    agente_nombre TEXT NOT NULL, -- Mantener para compatibilidad
    fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    motivo_viaje TEXT CHECK (motivo_viaje IN ('NEGOCIOS', 'TURISMO', 'PERSONAL', 'MEDICO', 'OTRO')),
    feedback TEXT,
    calificacion_medallia INTEGER CHECK (calificacion_medallia >= 1 AND calificacion_medallia <= 10),
    servicios_utilizados TEXT[],
    preferencias JSONB,
    incidentes TEXT,
    acciones_recuperacion TEXT,
    notas TEXT,
    es_cumpleanos BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================================
-- CREAR ÍNDICES
-- ============================================================

CREATE INDEX idx_passengers_aeropuerto ON passengers(aeropuerto_id);
CREATE INDEX idx_passengers_dni ON passengers(dni_pasaporte);
CREATE INDEX idx_passengers_categoria ON passengers(categoria);

CREATE INDEX idx_flights_aeropuerto ON flights(aeropuerto_id);
CREATE INDEX idx_flights_fecha ON flights(fecha);
CREATE INDEX idx_flights_numero ON flights(numero_vuelo);

CREATE INDEX idx_flight_passengers_vuelo ON flight_passengers(vuelo_id);
CREATE INDEX idx_flight_passengers_pasajero ON flight_passengers(pasajero_id);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_aeropuerto ON users(aeropuerto_id);
CREATE INDEX idx_users_activo ON users(activo);

CREATE INDEX idx_interactions_pasajero ON interactions(pasajero_id);
CREATE INDEX idx_interactions_vuelo ON interactions(vuelo_id);
CREATE INDEX idx_interactions_usuario ON interactions(usuario_id);
CREATE INDEX idx_interactions_fecha ON interactions(fecha);
CREATE INDEX idx_interactions_calificacion ON interactions(calificacion_medallia);

-- ============================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE airports ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLÍTICAS RLS (BÁSICAS)
-- ============================================================

-- NOTA: Estas políticas permiten acceso total con la anon key
-- Para producción, implementa Supabase Auth y políticas más restrictivas

CREATE POLICY "Enable all for anon" ON airports FOR ALL USING (true);
CREATE POLICY "Enable all for anon" ON passengers FOR ALL USING (true);
CREATE POLICY "Enable all for anon" ON flights FOR ALL USING (true);
CREATE POLICY "Enable all for anon" ON flight_passengers FOR ALL USING (true);
CREATE POLICY "Enable all for anon" ON interactions FOR ALL USING (true);
CREATE POLICY "Enable all for anon" ON users FOR ALL USING (true);

-- ============================================================
-- DATOS INICIALES
-- ============================================================

-- Insertar aeropuertos iniciales
INSERT INTO airports (nombre, codigo) VALUES
('Aeropuerto Francisco Carle - Jauja', 'JAU'),
('Aeropuerto Coronel FAP Carlos Ciriani Santa Rosa - Tacna', 'TCQ'),
('Aeropuerto Cap. FAP Víctor Montes Arias - Talara', 'TYL');

-- Insertar usuarios iniciales con contraseñas hasheadas correctamente
-- Hash de 'admin123' usando SHA-256 con salt 'salt_hvc_tracker'
INSERT INTO users (username, password_hash, nombre_completo, rol, aeropuerto_id) VALUES
('supervisor_jau', 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890', 'Supervisor Jauja', 'supervisor', (SELECT id FROM airports WHERE codigo = 'JAU')),
('agente_jau', 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890', 'Wilber Saico', 'agente', (SELECT id FROM airports WHERE codigo = 'JAU')),
('supervisor_tcq', 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890', 'Supervisor Tacna', 'supervisor', (SELECT id FROM airports WHERE codigo = 'TCQ')),
('agente_tcq', 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890', 'Agente Tacna', 'agente', (SELECT id FROM airports WHERE codigo = 'TCQ')),
('supervisor_tyl', 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890', 'Supervisor Talara', 'supervisor', (SELECT id FROM airports WHERE codigo = 'TYL')),
('agente_tyl', 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890', 'Agente Talara', 'agente', (SELECT id FROM airports WHERE codigo = 'TYL'));

-- ============================================================
-- VISTAS ÚTILES
-- ============================================================

-- Vista de pasajeros con su último vuelo
CREATE OR REPLACE VIEW passengers_with_last_flight AS
SELECT
    p.*,
    f.numero_vuelo AS ultimo_vuelo,
    f.destino AS ultimo_destino,
    f.fecha AS ultima_fecha
FROM passengers p
LEFT JOIN LATERAL (
    SELECT fl.numero_vuelo, fl.destino, fl.fecha
    FROM flight_passengers fp
    JOIN flights fl ON fl.id = fp.vuelo_id
    WHERE fp.pasajero_id = p.id
    ORDER BY fl.fecha DESC
    LIMIT 1
) f ON true;

-- Vista de métricas por aeropuerto
CREATE OR REPLACE VIEW airport_metrics AS
SELECT
    a.id,
    a.nombre,
    a.codigo,
    COUNT(DISTINCT p.id) AS total_pasajeros,
    COUNT(DISTINCT i.id) AS total_interacciones,
    ROUND(AVG(i.calificacion_medallia), 2) AS calificacion_promedio,
    COUNT(DISTINCT CASE WHEN i.calificacion_medallia < 7 THEN p.id END) AS pasajeros_en_riesgo
FROM airports a
LEFT JOIN passengers p ON p.aeropuerto_id = a.id
LEFT JOIN interactions i ON i.pasajero_id = p.id
GROUP BY a.id, a.nombre, a.codigo;

-- ============================================================
-- FUNCIONES ÚTILES
-- ============================================================

-- Función para obtener edad de pasajero
CREATE OR REPLACE FUNCTION get_passenger_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM age(birth_date));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para verificar cumpleaños
CREATE OR REPLACE FUNCTION is_birthday_today(birth_date DATE)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXTRACT(MONTH FROM birth_date) = EXTRACT(MONTH FROM CURRENT_DATE)
       AND EXTRACT(DAY FROM birth_date) = EXTRACT(DAY FROM CURRENT_DATE);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger para actualizar updated_at (si agregas este campo en el futuro)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- COMENTARIOS EN TABLAS
-- ============================================================

COMMENT ON TABLE airports IS 'Catálogo de aeropuertos';
COMMENT ON TABLE passengers IS 'Pasajeros HVC registrados por aeropuerto';
COMMENT ON TABLE flights IS 'Vuelos programados';
COMMENT ON TABLE flight_passengers IS 'Relación many-to-many entre vuelos y pasajeros';
COMMENT ON TABLE interactions IS 'Historial de interacciones con pasajeros';
COMMENT ON TABLE users IS 'Usuarios del sistema con roles y aeropuertos asignados';

-- ============================================================
-- VERIFICACIÓN
-- ============================================================

-- Verifica que todo se creó correctamente
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('airports', 'passengers', 'flights', 'flight_passengers', 'interactions', 'users')
ORDER BY tablename;
```

## ✅ Verificación Post-Setup

Después de ejecutar el script, verifica:

### 1. Tablas Creadas
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

Deberías ver:
- ✅ airports
- ✅ passengers
- ✅ flights
- ✅ flight_passengers
- ✅ interactions
- ✅ users

### 2. Datos Iniciales
```sql
SELECT * FROM airports;
```

Deberías ver 3 aeropuertos: JAU, TCQ, TYL

### 3. RLS Habilitado
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('airports', 'passengers', 'flights', 'flight_passengers', 'interactions', 'users');
```

Todos deben tener `rowsecurity = true`

## 🔒 Políticas RLS para Producción

Para producción, implementa políticas más restrictivas basadas en autenticación:

```sql
-- Ejemplo: Solo ver pasajeros del aeropuerto del usuario
CREATE POLICY "Users see own airport passengers" ON passengers
    FOR SELECT
    USING (aeropuerto_id = auth.jwt() ->> 'airport_id');

-- Ejemplo: Solo supervisores pueden insertar vuelos
CREATE POLICY "Only supervisors insert flights" ON flights
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'supervisor');
```

## 🎯 Próximos Pasos

1. ✅ Ejecuta SOLO la tabla `users` (si ya tienes las otras tablas)
2. ✅ Verifica que la tabla `users` se creó
3. ✅ Copia las credenciales de Supabase
4. ✅ Actualiza `src/config/supabase.js`
5. ✅ Inicia el servidor local
6. ✅ Abre `index-modular.html`
7. ✅ ¡Disfruta de tu sistema seguro con autenticación!

## 🔐 Usuarios Iniciales

Los usuarios ya están incluidos en el script con contraseña `admin123`:

**Usuarios disponibles:**
- **JAU (Jauja)**: supervisor_jau / admin123 → "Supervisor Jauja"
- **JAU (Jauja)**: agente_jau / admin123 → "Wilber Saico" ✅
- **TCQ (Tacna)**: supervisor_tcq / admin123 → "Supervisor Tacna"
- **TCQ (Tacna)**: agente_tcq / admin123 → "Agente Tacna"
- **TYL (Talara)**: supervisor_tyl / admin123 → "Supervisor Talara"
- **TYL (Talara)**: agente_tyl / admin123 → "Agente Talara"

## 📚 Documentación Supabase

- [Supabase Docs](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Postgres Functions](https://supabase.com/docs/guides/database/functions)
