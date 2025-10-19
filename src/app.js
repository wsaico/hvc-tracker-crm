/**
 * @fileoverview Controlador principal de la aplicación
 * @module app
 */

import { CONSTANTS } from './config/constants.js';
import { initSupabase } from './config/supabase.js';
import * as StateManager from './modules/StateManager.js';
import { showNotification } from './utils/helpers.js';
import * as ApiService from './services/ApiService.js';

/**
 * Inicializa la aplicación
 */
export const init = async () => {
    initSupabase();
    await render();
};

/**
 * Cambia la vista actual
 * @param {string} view - Vista a mostrar
 */
export const changeView = (view) => {
    StateManager.setState({ currentView: view });
    render();
};

/**
 * Cierra sesión
 */
export const logout = () => {
    StateManager.resetState();
    render();
};

/**
 * Renderiza la aplicación
 * @private
 */
const render = async () => {
    const app = document.getElementById('app');
    const state = StateManager.getState();

    if (state.currentView === CONSTANTS.VIEWS.LOGIN) {
        // Renderizar login
        app.innerHTML = renderLoginView();
        await setupLoginHandlers();
    } else {
        // Renderizar vista principal con navegación
        app.innerHTML = `
            ${renderNavbar()}
            <div id="mainContent" class="min-h-screen bg-gray-50"></div>
        `;

        const mainContent = document.getElementById('mainContent');

        // Renderizar contenido según vista
        switch (state.currentView) {
            case CONSTANTS.VIEWS.MANIFEST:
                renderManifestView().then(html => mainContent.innerHTML = html);
                break;
            case CONSTANTS.VIEWS.PASSENGER_SEARCH:
                renderPassengerSearchView().then(html => mainContent.innerHTML = html);
                break;
            case CONSTANTS.VIEWS.DASHBOARD:
                renderDashboardView().then(html => mainContent.innerHTML = html);
                break;
        }
    }
};

/**
 * Renderiza la vista de login
 * @returns {string} HTML del login
 * @private
 */
const renderLoginView = () => {
    return `
        <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
            <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md fade-in">
                <div class="text-center mb-8">
                    <div class="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                        </svg>
                    </div>
                    <h1 class="text-3xl font-bold text-gray-800">HVC Tracker</h1>
                    <p class="text-gray-600 mt-2">Sistema de Gestión de Pasajeros de Alto Valor</p>
                </div>

                <form id="loginForm" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Aeropuerto</label>
                        <select id="airportSelect" required
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="">Seleccione un aeropuerto...</option>
                        </select>
                    </div>

                    <div id="newAirportSection" class="hidden space-y-3">
                        <input type="text" id="newAirportName" placeholder="Nombre del aeropuerto"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <input type="text" id="newAirportCode" placeholder="Código (ej: LIM)" maxlength="3"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <button type="button" id="createAirportBtn"
                                class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                            Crear Aeropuerto
                        </button>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                        <div class="grid grid-cols-2 gap-4">
                            <label class="cursor-pointer">
                                <input type="radio" name="role" value="${CONSTANTS.ROLES.SUPERVISOR}" required class="peer hidden">
                                <div class="border-2 border-gray-300 rounded-lg p-4 text-center peer-checked:border-blue-600 peer-checked:bg-blue-50 hover:border-blue-400 transition">
                                    <svg class="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                    <span class="font-medium">Supervisor</span>
                                </div>
                            </label>
                            <label class="cursor-pointer">
                                <input type="radio" name="role" value="${CONSTANTS.ROLES.AGENTE}" required class="peer hidden">
                                <div class="border-2 border-gray-300 rounded-lg p-4 text-center peer-checked:border-blue-600 peer-checked:bg-blue-50 hover:border-blue-400 transition">
                                    <svg class="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                    </svg>
                                    <span class="font-medium">Agente</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                        <input type="text" id="userName" required placeholder="Ingrese su nombre"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>

                    <button type="submit"
                            class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg">
                        Ingresar al Sistema
                    </button>
                </form>
            </div>
        </div>
    `;
};

/**
 * Renderiza la barra de navegación
 * @returns {string} HTML del navbar
 * @private
 */
const renderNavbar = () => {
    const state = StateManager.getState();
    const airport = state.airports.find(a => a.id === state.currentAirport);
    const airportName = airport ? airport.nombre : '';

    const supervisorLinks = state.currentRole === CONSTANTS.ROLES.SUPERVISOR ? `
        <button onclick="App.changeView('${CONSTANTS.VIEWS.DASHBOARD}')"
                class="text-gray-700 hover:text-blue-600 font-medium ${state.currentView === CONSTANTS.VIEWS.DASHBOARD ? 'text-blue-600 border-b-2 border-blue-600' : ''}">
            Dashboard
        </button>
        <button onclick="App.changeView('${CONSTANTS.VIEWS.MANIFEST}')"
                class="text-gray-700 hover:text-blue-600 font-medium ${state.currentView === CONSTANTS.VIEWS.MANIFEST ? 'text-blue-600 border-b-2 border-blue-600' : ''}">
            Cargar Manifiesto
        </button>
    ` : `
        <button onclick="App.changeView('${CONSTANTS.VIEWS.PASSENGER_SEARCH}')"
                class="text-gray-700 hover:text-blue-600 font-medium ${state.currentView === CONSTANTS.VIEWS.PASSENGER_SEARCH ? 'text-blue-600 border-b-2 border-blue-600' : ''}">
            Atención al Pasajero
        </button>
        <button onclick="App.changeView('${CONSTANTS.VIEWS.DASHBOARD}')"
                class="text-gray-700 hover:text-blue-600 font-medium ${state.currentView === CONSTANTS.VIEWS.DASHBOARD ? 'text-blue-600 border-b-2 border-blue-600' : ''}">
            Dashboard
        </button>
    `;

    return `
        <nav class="bg-white shadow-lg no-print">
            <div class="max-w-7xl mx-auto px-4">
                <div class="flex justify-between items-center py-4">
                    <div class="flex items-center space-x-4">
                        <div class="bg-blue-600 w-10 h-10 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                            </svg>
                        </div>
                        <div>
                            <h1 class="text-xl font-bold text-gray-800">HVC Tracker</h1>
                            <p class="text-xs text-gray-600">${airportName}</p>
                        </div>
                    </div>

                    <div class="flex items-center space-x-6">
                        ${supervisorLinks}

                        <div class="flex items-center space-x-3 border-l pl-6">
                            <div class="text-right">
                                <p class="text-sm font-medium text-gray-800">${state.currentUser}</p>
                                <p class="text-xs text-gray-600 capitalize">${state.currentRole}</p>
                            </div>
                            <button onclick="App.logout()"
                                    class="text-red-600 hover:text-red-700">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    `;
};

/**
 * Configura los manejadores de eventos para el login
 * @private
 */
const setupLoginHandlers = async () => {
    // Cargar aeropuertos
    const airports = await ApiService.getAirports();
    StateManager.setState({ airports });

    const airportSelect = document.getElementById('airportSelect');
    airports.forEach(airport => {
        const option = document.createElement('option');
        option.value = airport.id;
        option.textContent = airport.nombre;
        airportSelect.appendChild(option);
    });

    const newOption = document.createElement('option');
    newOption.value = 'new';
    newOption.textContent = '+ Crear nuevo aeropuerto';
    airportSelect.appendChild(newOption);

    // Manejar selección de aeropuerto
    airportSelect.addEventListener('change', (e) => {
        const newAirportSection = document.getElementById('newAirportSection');
        if (e.target.value === 'new') {
            newAirportSection.classList.remove('hidden');
        } else {
            newAirportSection.classList.add('hidden');
        }
    });

    // Manejar creación de aeropuerto
    document.getElementById('createAirportBtn')?.addEventListener('click', async () => {
        const name = document.getElementById('newAirportName').value.trim();
        const code = document.getElementById('newAirportCode').value.trim().toUpperCase();

        if (!name || !code) {
            showNotification('Complete todos los campos', CONSTANTS.NOTIFICATION_TYPES.WARNING);
            return;
        }

        if (code.length !== 3) {
            showNotification('El código debe tener 3 caracteres', CONSTANTS.NOTIFICATION_TYPES.WARNING);
            return;
        }

        try {
            const airport = await ApiService.createAirport(name, code);
            showNotification('Aeropuerto creado exitosamente', CONSTANTS.NOTIFICATION_TYPES.SUCCESS);

            const updatedAirports = await ApiService.getAirports();
            StateManager.setState({ airports: updatedAirports });

            airportSelect.value = airport.id;
            document.getElementById('newAirportSection').classList.add('hidden');

            // Re-renderizar select
            airportSelect.innerHTML = '<option value="">Seleccione un aeropuerto...</option>';
            updatedAirports.forEach(a => {
                const option = document.createElement('option');
                option.value = a.id;
                option.textContent = a.nombre;
                if (a.id === airport.id) option.selected = true;
                airportSelect.appendChild(option);
            });
            const newOpt = document.createElement('option');
            newOpt.value = 'new';
            newOpt.textContent = '+ Crear nuevo aeropuerto';
            airportSelect.appendChild(newOpt);
        } catch (error) {
            showNotification('Error al crear aeropuerto', CONSTANTS.NOTIFICATION_TYPES.ERROR);
        }
    });

    // Manejar envío del formulario de login
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const airportId = document.getElementById('airportSelect').value;
        const role = document.querySelector('input[name="role"]:checked').value;
        const userName = document.getElementById('userName').value;

        if (airportId === 'new' || !airportId) {
            showNotification('Seleccione un aeropuerto válido', CONSTANTS.NOTIFICATION_TYPES.WARNING);
            return;
        }

        StateManager.setState({
            currentUser: userName,
            currentRole: role,
            currentAirport: airportId,
            currentView: role === CONSTANTS.ROLES.SUPERVISOR ? CONSTANTS.VIEWS.DASHBOARD : CONSTANTS.VIEWS.PASSENGER_SEARCH
        });

        render();
    });
};

/**
 * Renderiza la vista de manifiesto
 * @returns {Promise<string>} HTML de la vista de manifiesto
 * @private
 */
const renderManifestView = async () => {
    const state = StateManager.getState();
    const currentAirport = state.currentAirport;
    const airport = state.airports.find(a => a.id === currentAirport);
    const airportName = airport ? airport.nombre : '';

    return `
        <div class="max-w-4xl mx-auto p-6">
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Cargar Manifiesto de Vuelo</h2>

                <div class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha del Vuelo</label>
                            <input type="date" id="manifestDate"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Aeropuerto</label>
                            <div class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 flex items-center">
                                <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                ${airportName} (Seleccionado automáticamente)
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Manifiesto (Formato: VUELO,DESTINO,NOMBRE,CATEGORIA,ESTATUS,ASIENTO)</label>
                        <textarea id="manifestText" rows="10" placeholder="VUELO001,LIM,Juan Perez,BLACK,CONFIRMADO,1A
VUELO001,LIM,Maria Garcia,PLATINUM,CHECK-IN,1B
..."
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"></textarea>
                    </div>

                    <div class="flex space-x-4">
                        <button onclick="processManifest()"
                                class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            Procesar Manifiesto
                        </button>
                        <button onclick="clearManifest()"
                                class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-medium flex items-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                            Limpiar
                        </button>
                    </div>
                </div>

                <div id="manifestResults" class="mt-6 hidden">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Resultados del Procesamiento</h3>
                    <div id="manifestOutput" class="bg-gray-50 p-4 rounded-lg"></div>
                </div>
            </div>
        </div>
    `;
};

/**
 * Renderiza la vista de búsqueda de pasajeros
 * @returns {Promise<string>} HTML de la vista de búsqueda
 * @private
 */
const renderPassengerSearchView = async () => {
    return `
        <div class="max-w-4xl mx-auto p-6">
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Búsqueda de Pasajeros</h2>

                <div class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Buscar por DNI/Pasaporte o Nombre</label>
                        <div class="flex space-x-4">
                            <input type="text" id="searchQuery" placeholder="Ingrese DNI, pasaporte o nombre..."
                                   class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <button onclick="searchPassengers()"
                                    class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center">
                                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                                Buscar
                            </button>
                        </div>
                    </div>

                    <div id="searchResults" class="space-y-4">
                        <!-- Resultados de búsqueda aparecerán aquí -->
                    </div>
                </div>
            </div>
        </div>
    `;
};

/**
 * Renderiza la vista del dashboard
 * @returns {string} HTML del dashboard
 * @private
 */
const renderDashboardView = async () => {
    let metrics = {
        totalInteractions: 0,
        totalPassengers: 0,
        avgMedallia: 0,
        passengersAtRisk: 0
    };

    // Intentar cargar métricas reales si la BD está disponible
    if (window.DB_AVAILABLE) {
        try {
            const state = StateManager.getState();
            const interactions = await ApiService.getAirportInteractions(state.currentAirport);
            const passengers = await ApiService.getAllPassengers(state.currentAirport);
            const businessMetrics = await import('./services/BusinessLogic.js').then(module =>
                module.calculateDashboardMetrics(interactions, passengers)
            );
            metrics = businessMetrics;
        } catch (error) {
            console.warn('Could not load real metrics:', error);
        }
    }

    const statusColor = window.DB_AVAILABLE ? 'green' : 'yellow';
    const statusText = window.DB_AVAILABLE ? 'Sistema Conectado' : 'Modo Demo Activo';
    const statusMessage = window.DB_AVAILABLE
        ? 'Conectado a base de datos Supabase. Datos en tiempo real.'
        : 'Las métricas mostradas son datos de ejemplo. Configure Supabase para datos reales.';

    return `
        <div class="max-w-7xl mx-auto p-6">
            <div class="mb-8">
                <h2 class="text-3xl font-bold text-gray-800 mb-2">Dashboard HVC Tracker</h2>
                <p class="text-gray-600">Métricas y estadísticas del aeropuerto</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="bg-blue-100 p-3 rounded-lg">
                            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-lg font-semibold text-gray-800">Total Pasajeros</h3>
                            <p class="text-2xl font-bold text-blue-600">${metrics.totalPassengers || 0}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="bg-green-100 p-3 rounded-lg">
                            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-lg font-semibold text-gray-800">Calificación Promedio</h3>
                            <p class="text-2xl font-bold text-green-600">${metrics.avgMedallia || 0}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="bg-yellow-100 p-3 rounded-lg">
                            <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-lg font-semibold text-gray-800">Pasajeros en Riesgo</h3>
                            <p class="text-2xl font-bold text-yellow-600">${metrics.passengersAtRisk || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">Estado del Sistema</h3>
                <div class="bg-${statusColor}-50 border-l-4 border-${statusColor}-400 p-4">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-${statusColor}-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-${statusColor}-700">
                                <strong>${statusText}</strong>
                            </p>
                            <p class="text-sm text-${statusColor}-600 mt-1">
                                ${statusMessage}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};
