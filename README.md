# 🛫 HVC Tracker CRM - Sistema de Gestión de Pasajeros de Alto Valor

Sistema modular profesional para la gestión y fidelización de pasajeros HVC (High Value Customers) en aeropuertos.

## 📁 Estructura del Proyecto (MODULAR)

```
hvc-tracker/
├── index-modular.html          # Punto de entrada HTML
├── index.html                  # Versión monolítica (legacy)
├── styles/
│   └── main.css               # Estilos CSS separados
├── src/
│   ├── app.js                 # Controlador principal de la aplicación
│   ├── config/                # Configuración
│   │   ├── constants.js       # Constantes y enumeraciones
│   │   └── supabase.js        # Configuración de Supabase
│   ├── modules/               # Módulos de estado
│   │   └── StateManager.js    # Gestión centralizada del estado
│   ├── services/              # Servicios de negocio
│   │   ├── ApiService.js      # Comunicación con Supabase
│   │   └── BusinessLogic.js   # Lógica de negocio
│   ├── utils/                 # Utilidades
│   │   ├── validators.js      # Validaciones
│   │   └── helpers.js         # Funciones helper
│   └── components/            # Componentes UI (futuro)
│       ├── LoginComponent.js
│       ├── NavbarComponent.js
│       ├── ManifestComponent.js
│       ├── PassengerComponent.js
│       └── DashboardComponent.js
├── docs/
│   ├── ARQUITECTURA.md        # Documentación de arquitectura
│   └── SQL_SETUP.md           # Scripts SQL para Supabase
└── README.md                  # Este archivo
```

## 🎯 Características

### ✅ **Arquitectura Modular REAL**
- **Separación de archivos** por responsabilidad
- **Módulos ES6** con import/export
- **Código reutilizable** y mantenible
- **Estructura escalable**

### ✅ **Principios SOLID**
- **S**ingle Responsibility: Un archivo, una responsabilidad
- **O**pen/Closed: Extensible sin modificar código existente
- **L**iskov Substitution: Módulos intercambiables
- **I**nterface Segregation: APIs mínimas
- **D**ependency Inversion: Abstracción de dependencias

### ✅ **Funcionalidades**
- 🔐 Sistema de autenticación por roles (Supervisor/Agente)
- 🏢 Multi-aeropuerto con separación de datos
- ✈️ Carga de manifiestos de vuelo
- 👤 Perfil 360° del pasajero con historial completo
- 🤖 Recomendaciones inteligentes
- 📊 Dashboard analítico con métricas y gráficos
- 💾 Persistencia en Supabase
- 🎨 UI moderna con Tailwind CSS

## 🚀 Inicio Rápido

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/hvc-tracker.git
cd hvc-tracker
```

### 2. Configurar Supabase

1. Crea una cuenta en [https://supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a **Project Settings > API**
4. Copia `Project URL` y `anon key`
5. Copia el archivo de ejemplo y configura tus credenciales:

```bash
cp src/config/supabase.example.js src/config/supabase.js
```

Edita `src/config/supabase.js`:

```javascript
export const SUPABASE_CONFIG = {
    url: 'tu-supabase-url',
    anonKey: 'tu-supabase-anon-key'
};
```

6. Ejecuta el script SQL en `docs/SQL_SETUP.md` en el **SQL Editor** de Supabase

### 3. Servidor Local

Necesitas un servidor HTTP por los módulos ES6. Opciones:

**Opción A - Python:**
```bash
cd hvc-tracker
python -m http.server 8000
```

**Opción B - Node.js:**
```bash
npx http-server -p 8000
```

**Opción C - VS Code Live Server:**
- Instala extensión "Live Server"
- Click derecho en `index-modular.html` → "Open with Live Server"

### 4. Abrir Aplicación

Navega a: `http://localhost:8000/index-modular.html`

## 📦 Despliegue en GitHub Pages

### Opción 1: GitHub Pages Automático

1. Ve a tu repositorio en GitHub
2. Settings → Pages
3. Source: "Deploy from a branch"
4. Branch: "main" / "root"
5. Save

### Opción 2: GitHub Actions (Recomendado)

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm install
    - name: Build
      run: npm run build
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### Opción 3: Despliegue Manual

1. Construye la aplicación localmente
2. Sube la carpeta `dist` a la rama `gh-pages`
3. Habilita GitHub Pages desde esa rama

## 📦 Módulos

### 🔧 **config/** - Configuración

#### `constants.js`
Todas las constantes de la aplicación:
- Categorías HVC (SIGNATURE, TOP, BLACK, PLATINUM, GOLD PLUS, GOLD)
- Estatus de vuelos
- Roles de usuario
- Tipos de notificaciones
- Umbrales de Medallia

#### `supabase.js`
Configuración y cliente de Supabase (Singleton)

---

### 📊 **modules/** - Módulos de Estado

#### `StateManager.js`
Gestión centralizada del estado con patrón Observer:
- `getState()` - Obtiene copia del estado
- `setState(updates)` - Actualiza estado y notifica
- `resetState()` - Resetea a valores iniciales
- `subscribe(callback)` - Suscribe a cambios

---

### 🔌 **services/** - Servicios

#### `ApiService.js`
Capa de acceso a datos (Repository Pattern):

**Airports:**
- `getAirports()` - Lista de aeropuertos
- `createAirport(nombre, codigo)` - Crear aeropuerto

**Passengers:**
- `getPassenger(dni, aeropuertoId)` - Buscar por DNI
- `getPassengerById(id)` - Buscar por ID
- `createPassenger(data)` - Crear pasajero
- `updatePassenger(id, updates)` - Actualizar
- `searchPassengers(query, aeropuertoId)` - Búsqueda
- `getAllPassengers(aeropuertoId)` - Todos los pasajeros

**Flights:**
- `createFlight(data)` - Crear vuelo
- `getFlightsByDate(fecha, aeropuertoId)` - Vuelos por fecha
- `addPassengerToFlight(...)` - Agregar pasajero a vuelo
- `getPassengerCurrentFlight(pasajeroId)` - Vuelo actual

**Interactions:**
- `createInteraction(data)` - Crear interacción
- `getPassengerInteractions(pasajeroId)` - Historial
- `getAirportInteractions(aeropuertoId, start, end)` - Por aeropuerto

#### `BusinessLogic.js`
Lógica de negocio:
- `generateRecommendations(passenger, interactions)` - Motor de recomendaciones
- `parseManifest(text)` - Parser de manifiestos
- `processManifest(data, date, airportId)` - Procesar manifiesto
- `calculateDashboardMetrics(interactions, passengers)` - Métricas

---

### 🛠️ **utils/** - Utilidades

#### `validators.js`
Validaciones:
- `isValidCategory(category)` - Valida categoría
- `isValidFlightStatus(status)` - Valida estatus
- `validateManifestLine(line)` - Valida línea de manifiesto
- `isValidMedalliaScore(score)` - Valida calificación
- `sanitizeText(text)` - Prevención XSS

#### `helpers.js`
Funciones helper:
- `formatDate(date)` - Formato de fecha
- `formatDateTime(date)` - Formato fecha/hora
- `getCategoryClass(categoria)` - Clase CSS por categoría
- `getBadgeClass(categoria)` - Badge CSS
- `getMedalliaColor(score)` - Color por calificación
- `getMedalliaText(score)` - Texto descriptivo
- `isBirthday(fecha)` - Detecta cumpleaños
- `calculateAge(fecha)` - Calcula edad
- `showNotification(message, type)` - Toast notification
- `calculateDateRange(period)` - Rango de fechas

---

### 🎨 **components/** - Componentes UI

Los componentes están actualmente en `app.js` pero pueden extraerse a archivos separados:

**Futuro:**
- `LoginComponent.js`
- `NavbarComponent.js`
- `ManifestComponent.js`
- `PassengerSearchComponent.js`
- `PassengerProfileComponent.js`
- `DashboardComponent.js`

---

### 🎮 **app.js** - Controlador Principal

Orquesta toda la aplicación:
- `init()` - Inicializa la app
- `changeView(view)` - Cambia de vista
- `logout()` - Cierra sesión
- Gestión del routing
- Renderizado principal

## 🔐 Base de Datos (Supabase)

### Tablas

```sql
airports
├── id (UUID)
├── nombre (TEXT)
├── codigo (TEXT)
├── activo (BOOLEAN)
└── created_at (TIMESTAMP)

passengers
├── id (UUID)
├── nombre (TEXT)
├── dni_pasaporte (TEXT)
├── fecha_nacimiento (DATE)
├── categoria (TEXT)
├── aeropuerto_id (UUID FK)
├── telefono (TEXT)
├── email (TEXT)
└── created_at (TIMESTAMP)

flights
├── id (UUID)
├── numero_vuelo (TEXT)
├── destino (TEXT)
├── fecha (DATE)
├── hora (TIME)
├── aeropuerto_id (UUID FK)
└── created_at (TIMESTAMP)

flight_passengers
├── id (UUID)
├── vuelo_id (UUID FK)
├── pasajero_id (UUID FK)
├── asiento (TEXT)
├── estatus (TEXT)
└── created_at (TIMESTAMP)

interactions
├── id (UUID)
├── pasajero_id (UUID FK)
├── vuelo_id (UUID FK)
├── agente_nombre (TEXT)
├── fecha (TIMESTAMP)
├── motivo_viaje (TEXT)
├── feedback (TEXT)
├── calificacion_medallia (INTEGER)
├── servicios_utilizados (TEXT[])
├── preferencias (JSONB)
├── incidentes (TEXT)
├── acciones_recuperacion (TEXT)
├── notas (TEXT)
├── es_cumpleanos (BOOLEAN)
└── created_at (TIMESTAMP)
```

## 🧪 Testing (Futuro)

```javascript
// tests/validators.test.js
import { isValidCategory } from '../src/utils/validators.js';

describe('Validators', () => {
    test('should validate category', () => {
        expect(isValidCategory('BLACK')).toBe(true);
        expect(isValidCategory('INVALID')).toBe(false);
    });
});
```

## 📝 Flujo de Datos

```
Usuario Interactúa → UI Event
                      ↓
                  app.js (Controller)
                      ↓
             BusinessLogic (Procesa)
                      ↓
              Validators (Valida)
                      ↓
              ApiService (API)
                      ↓
             Supabase Database
                      ↓
             StateManager (Actualiza)
                      ↓
                app.js (Renderiza)
                      ↓
              Usuario Ve Resultado
```

## 🔄 Ciclo de Vida

1. **Inicialización** (`app.init()`)
   - Inicializa Supabase
   - Renderiza vista de login

2. **Login**
   - Carga aeropuertos desde API
   - Usuario selecciona aeropuerto y rol
   - `StateManager` almacena sesión

3. **Vista Principal**
   - Renderiza navbar
   - Carga vista según rol (Manifest/Passenger/Dashboard)

4. **Operaciones**
   - Usuario interactúa con UI
   - Validaciones en cliente
   - Llamadas a ApiService
   - Actualización de StateManager
   - Re-renderizado

5. **Logout**
   - `StateManager.resetState()`
   - Vuelta a login

## 🎨 Estilos

Todos los estilos CSS están en `styles/main.css`:
- Color coding por categoría HVC
- Animaciones (fade-in, pulse)
- Scrollbar personalizado
- Loading spinner
- Print styles

## 📚 Documentación Adicional

- [ARQUITECTURA.md](docs/ARQUITECTURA.md) - Arquitectura detallada
- [SQL_SETUP.md](docs/SQL_SETUP.md) - Setup de base de datos

## 🚀 Roadmap

### v1.1
- [ ] Extraer componentes UI a archivos separados
- [ ] Implementar componentes reutilizables
- [ ] Agregar tests unitarios (Jest)

### v1.2
- [ ] TypeScript migration
- [ ] Web Components
- [ ] Service Workers (PWA)

### v1.3
- [ ] Build process (Vite/Webpack)
- [ ] Code splitting
- [ ] Bundle optimization

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código

- **ESLint** para linting
- **JSDoc** para documentación
- **Conventional Commits** para mensajes de commit
- **SOLID** principles
- **DRY** (Don't Repeat Yourself)

## 📦 Build y Despliegue

### Desarrollo Local

```bash
# Instalar dependencias (futuro)
npm install

# Servidor de desarrollo
npm run dev

# Build para producción
npm run build
```

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu-supabase-url
VITE_SUPABASE_ANON_KEY=tu-supabase-anon-key
```

### GitHub Actions

El proyecto incluye configuración automática para:
- ✅ **Linting** con ESLint
- ✅ **Testing** (futuro)
- ✅ **Build** y despliegue automático
- ✅ **GitHub Pages** deployment

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados.

## 👨‍💻 Autor

Desarrollado para el Aeropuerto de Jauja

---

**Arquitectura Modular Profesional** 🏗️ | **SOLID Principles** ✅ | **ES6 Modules** 📦
