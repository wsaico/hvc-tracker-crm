/**
 * @fileoverview Controlador principal de la aplicación
 * @module app
 */

import { CONSTANTS } from './config/constants.js';
import { initSupabase } from './config/supabase.js';
import * as StateManager from './modules/StateManager.js';
import { showNotification } from './utils/helpers.js';
import * as Utils from './utils/helpers.js';
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
                if (state.selectedPassenger) {
                    // Si hay un pasajero seleccionado, mostrar vista de atención
                    mainContent.innerHTML = renderPassengerInteractionView();
                    setupInteractionFormHandlers();
                } else {
                    // Vista normal de búsqueda
                    renderPassengerSearchView().then(html => mainContent.innerHTML = html);
                }
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

// Funciones para manejar manifiestos
window.processManifest = async function() {
    const date = document.getElementById('manifestDate').value;
    const state = StateManager.getState();
    const airportId = state.currentAirport; // Usar aeropuerto del login
    const text = document.getElementById('manifestText').value.trim();

    if (!date || !text) {
        showNotification('Complete la fecha y el manifiesto', 'warning');
        return;
    }

    if (!airportId) {
        showNotification('No se pudo determinar el aeropuerto', 'error');
        return;
    }

    try {
        // Importar BusinessLogic dinámicamente
        const { parseManifest, processManifest } = await import('./services/BusinessLogic.js');

        // Parsear manifiesto
        const parseResult = parseManifest(text);

        if (!parseResult.success) {
            document.getElementById('manifestOutput').innerHTML = `
                <div class="text-red-600">
                    <h4 class="font-semibold mb-2">Errores encontrados:</h4>
                    <ul class="list-disc list-inside">
                        ${parseResult.errors.map(error => `<li>${error}</li>`).join('')}
                    </ul>
                </div>
            `;
            document.getElementById('manifestResults').classList.remove('hidden');
            return;
        }

        // Procesar manifiesto
        const processResult = await processManifest(parseResult.data, date, airportId);

        document.getElementById('manifestOutput').innerHTML = `
            <div class="text-green-600">
                <h4 class="font-semibold mb-2">✅ Manifiesto procesado exitosamente</h4>
                <p>${processResult.message}</p>
                <div class="mt-3 text-sm text-gray-600">
                    <p><strong>📊 Resumen:</strong></p>
                    <ul class="list-disc list-inside mt-1">
                        <li>Pasajeros procesados: ${processResult.processed}</li>
                        <li>Pasajeros nuevos creados: ${processResult.created}</li>
                        <li>Pasajeros existentes encontrados: ${processResult.found}</li>
                    </ul>
                </div>
            </div>
        `;
        document.getElementById('manifestResults').classList.remove('hidden');
        showNotification('Manifiesto procesado exitosamente', 'success');

    } catch (error) {
        console.error('Error processing manifest:', error);
        document.getElementById('manifestOutput').innerHTML = `
            <div class="text-red-600">
                <h4 class="font-semibold mb-2">Error al procesar manifiesto</h4>
                <p>${error.message}</p>
            </div>
        `;
        document.getElementById('manifestResults').classList.remove('hidden');
        showNotification('Error al procesar manifiesto', 'error');
    }
};

window.clearManifest = function() {
    document.getElementById('manifestText').value = '';
    document.getElementById('manifestResults').classList.add('hidden');
};

// Función para buscar pasajeros
window.searchPassengers = async function() {
    const query = document.getElementById('searchQuery').value.trim();
    const state = StateManager.getState();

    if (!query) {
        showNotification('Ingrese un término de búsqueda', 'warning');
        return;
    }

    if (!state.currentAirport) {
        showNotification('No se ha seleccionado un aeropuerto', 'error');
        return;
    }

    try {
        console.log('Searching passengers with query:', query, 'airport:', state.currentAirport);
        const results = await ApiService.searchPassengers(query, state.currentAirport);
        console.log('Search results:', results);

        const resultsContainer = document.getElementById('searchResults');

        if (!results || results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <p>No se encontraron pasajeros con ese criterio</p>
                    <button onclick="createNewPassenger('${query.replace(/'/g, "\\'")}')"
                            class="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center mx-auto">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                        Crear Nuevo Pasajero: "${query}"
                    </button>
                </div>
            `;
            return;
        }

        // Obtener vuelos de hoy para sugerencias
        const today = new Date().toISOString().split('T')[0];
        let todayFlights = [];
        try {
            todayFlights = await ApiService.getFlightsByDate(today, state.currentAirport);
            console.log('Today flights:', todayFlights);
        } catch (error) {
            console.warn('Could not load today flights:', error);
            // Si no hay vuelos, mostrar mensaje alternativo
            showNotification('No se pudieron cargar los vuelos de hoy, pero la búsqueda funciona', 'warning');
        }

        resultsContainer.innerHTML = results.map(passenger => {
            // Verificar si el pasajero ya está en algún vuelo hoy
            const inFlightToday = todayFlights.some(flight =>
                flight.flight_passengers?.some(fp => fp.pasajero_id === passenger.id)
            );

            const flightInfo = inFlightToday ? `
                <div class="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                    <p class="text-blue-800 font-medium">✈️ Ya registrado en vuelo de hoy</p>
                    <p class="text-blue-600">Puede proceder con atención al pasajero</p>
                </div>
            ` : `
                <div class="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <p class="text-yellow-800 font-medium">📋 No registrado en vuelos de hoy</p>
                    <p class="text-yellow-600">Considere agregar al manifiesto si viaja hoy</p>
                </div>
            `;

            return `
                <div class="bg-gray-50 rounded-lg p-4 border-l-4 ${Utils.getCategoryClass(passenger.categoria)}">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h3 class="font-semibold text-gray-800">${passenger.nombre}</h3>
                            <p class="text-sm text-gray-600">DNI/Pasaporte: ${passenger.dni_pasaporte}</p>
                            <p class="text-sm text-gray-600">Categoría: ${passenger.categoria}</p>
                            ${passenger.fecha_nacimiento ? `<p class="text-sm text-gray-600">Edad: ${Utils.calculateAge(passenger.fecha_nacimiento)} años</p>` : ''}
                            ${flightInfo}
                        </div>
                        <div class="flex space-x-2 ml-4">
                            <button onclick="viewPassengerDetails('${passenger.id}')"
                                    class="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition text-sm flex items-center">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                </svg>
                                Ver Detalles
                            </button>
                            <button onclick="startPassengerInteraction('${passenger.id}')"
                                    class="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition text-sm flex items-center">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                                </svg>
                                Atención
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        showNotification(`Encontrados ${results.length} pasajeros`, 'success');

    } catch (error) {
        console.error('Error searching passengers:', error);
        showNotification('Error al buscar pasajeros', 'error');
    }
};

// Función para crear nuevo pasajero
window.createNewPassenger = async function(name) {
    const state = StateManager.getState();

    try {
        // Crear pasajero con DNI generado
        const dniPasaporte = `${name.replace(/\s+/g, '').toUpperCase()}${Date.now().toString().slice(-4)}`;

        const passenger = await ApiService.createPassenger({
            nombre: name,
            dni_pasaporte: dniPasaporte,
            categoria: CONSTANTS.CATEGORIES.GOLD, // Default category
            aeropuerto_id: state.currentAirport
        });

        showNotification(`Pasajero "${name}" creado exitosamente`, 'success');

        // Recargar búsqueda para mostrar el nuevo pasajero
        window.searchPassengers();

    } catch (error) {
        console.error('Error creating passenger:', error);
        showNotification('Error al crear pasajero', 'error');
    }
};

// Función para ver detalles del pasajero
window.viewPassengerDetails = async function(passengerId) {
    try {
        const passenger = await ApiService.getPassengerById(passengerId);
        const interactions = await ApiService.getPassengerInteractions(passengerId);

        // Mostrar modal con detalles
        showPassengerModal(passenger, interactions);

    } catch (error) {
        console.error('Error loading passenger details:', error);
        showNotification('Error al cargar detalles del pasajero', 'error');
    }
};

// Función para iniciar atención al pasajero
window.startPassengerInteraction = async function(passengerId) {
    try {
        const passenger = await ApiService.getPassengerById(passengerId);
        const interactions = await ApiService.getPassengerInteractions(passengerId);

        // Cambiar a vista de atención al pasajero con el pasajero preseleccionado
        StateManager.setState({
            selectedPassenger: passenger,
            passengerInteractions: interactions
        });

        // Renderizar vista de atención
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = renderPassengerInteractionView();

        showNotification(`Iniciando atención para ${passenger.nombre}`, 'info');

    } catch (error) {
        console.error('Error starting passenger interaction:', error);
        showNotification('Error al iniciar atención', 'error');
    }
};

// Función para mostrar modal de detalles del pasajero
function showPassengerModal(passenger, interactions) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800">${passenger.nombre}</h2>
                        <p class="text-gray-600">DNI/Pasaporte: ${passenger.dni_pasaporte}</p>
                        <span class="inline-block px-3 py-1 rounded-full text-sm font-medium ${Utils.getBadgeClass(passenger.categoria)}">
                            ${passenger.categoria}
                        </span>
                    </div>
                    <button onclick="this.closest('.fixed').remove()"
                            class="text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-3">Información Personal</h3>
                        <div class="space-y-2">
                            <p><strong>Nombre:</strong> ${passenger.nombre}</p>
                            <p><strong>DNI/Pasaporte:</strong> ${passenger.dni_pasaporte}</p>
                            <p><strong>Categoría:</strong> ${passenger.categoria}</p>
                            ${passenger.fecha_nacimiento ? `<p><strong>Fecha Nacimiento:</strong> ${Utils.formatDate(passenger.fecha_nacimiento)}</p>` : ''}
                            ${passenger.fecha_nacimiento ? `<p><strong>Edad:</strong> ${Utils.calculateAge(passenger.fecha_nacimiento)} años</p>` : ''}
                            ${passenger.telefono ? `<p><strong>Teléfono:</strong> ${passenger.telefono}</p>` : ''}
                            ${passenger.email ? `<p><strong>Email:</strong> ${passenger.email}</p>` : ''}
                        </div>
                    </div>

                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-3">Estadísticas</h3>
                        <div class="space-y-2">
                            <p><strong>Total Interacciones:</strong> ${interactions.length}</p>
                            ${interactions.length > 0 ? `
                                <p><strong>Última Interacción:</strong> ${Utils.formatDateTime(interactions[0].fecha)}</p>
                                <p><strong>Calificación Promedio:</strong> ${interactions.length > 0 ? (interactions.reduce((sum, i) => sum + (i.calificacion_medallia || 0), 0) / interactions.length).toFixed(1) : 'N/A'}</p>
                            ` : ''}
                        </div>
                    </div>
                </div>

                ${interactions.length > 0 ? `
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-3">Últimas Interacciones</h3>
                        <div class="space-y-3 max-h-60 overflow-y-auto">
                            ${interactions.slice(0, 5).map(interaction => `
                                <div class="bg-gray-50 p-3 rounded-lg">
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <p class="font-medium">${Utils.formatDateTime(interaction.fecha)}</p>
                                            <p class="text-sm text-gray-600">Agente: ${interaction.agente_nombre}</p>
                                            ${interaction.motivo_viaje ? `<p class="text-sm text-gray-600">Motivo: ${interaction.motivo_viaje}</p>` : ''}
                                        </div>
                                        ${interaction.calificacion_medallia ? `
                                            <span class="px-2 py-1 rounded text-sm ${Utils.getMedalliaColor(interaction.calificacion_medallia)}">
                                                ${interaction.calificacion_medallia}/10
                                            </span>
                                        ` : ''}
                                    </div>
                                    ${interaction.feedback ? `<p class="text-sm mt-2 text-gray-700">${interaction.feedback}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : `
                    <div class="text-center py-8 text-gray-500">
                        <p>No hay interacciones registradas para este pasajero</p>
                    </div>
                `}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

/**
 * Renderiza la vista de atención al pasajero
 * @returns {string} HTML de la vista de atención
 * @private
 */
const renderPassengerInteractionView = () => {
    const state = StateManager.getState();
    const passenger = state.selectedPassenger;
    const interactions = state.passengerInteractions || [];

    if (!passenger) {
        return '<div class="text-center py-8 text-gray-500">No se ha seleccionado un pasajero</div>';
    }

    return `
        <div class="max-w-4xl mx-auto p-6">
            <div class="bg-white rounded-lg shadow p-6">
                <div class="mb-6">
                    <h2 class="text-2xl font-bold text-gray-800 mb-2">Atención al Pasajero</h2>
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-2">
                            <div class="w-12 h-12 ${Utils.getCategoryClass(passenger.categoria)} rounded-full flex items-center justify-center">
                                <span class="text-white font-bold text-lg">${passenger.nombre.charAt(0)}</span>
                            </div>
                            <div>
                                <h3 class="text-xl font-semibold text-gray-800">${passenger.nombre}</h3>
                                <p class="text-gray-600">${passenger.dni_pasaporte} • ${passenger.categoria}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <form id="interactionForm" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Motivo de Viaje</label>
                            <select id="motivoViaje" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="">Seleccione motivo...</option>
                                <option value="${CONSTANTS.TRAVEL_REASONS.NEGOCIOS}">Negocios</option>
                                <option value="${CONSTANTS.TRAVEL_REASONS.TURISMO}">Turismo</option>
                                <option value="${CONSTANTS.TRAVEL_REASONS.PERSONAL}">Personal</option>
                                <option value="${CONSTANTS.TRAVEL_REASONS.MEDICO}">Médico</option>
                                <option value="${CONSTANTS.TRAVEL_REASONS.OTRO}">Otro</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Calificación Medallia (1-10)</label>
                            <input type="number" id="calificacionMedallia" min="1" max="10"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Feedback del Pasajero</label>
                        <textarea id="feedback" rows="3" placeholder="Comentarios del pasajero sobre su experiencia..."
                                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Servicios Utilizados</label>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <label class="flex items-center space-x-2">
                                <input type="checkbox" value="${CONSTANTS.SERVICES.SALA_VIP}" class="servicio-checkbox rounded">
                                <span class="text-sm">Sala VIP</span>
                            </label>
                            <label class="flex items-center space-x-2">
                                <input type="checkbox" value="${CONSTANTS.SERVICES.FAST_TRACK}" class="servicio-checkbox rounded">
                                <span class="text-sm">Fast Track</span>
                            </label>
                            <label class="flex items-center space-x-2">
                                <input type="checkbox" value="${CONSTANTS.SERVICES.ASISTENCIA_ESPECIAL}" class="servicio-checkbox rounded">
                                <span class="text-sm">Asistencia Especial</span>
                            </label>
                            <label class="flex items-center space-x-2">
                                <input type="checkbox" value="${CONSTANTS.SERVICES.UPGRADE}" class="servicio-checkbox rounded">
                                <span class="text-sm">Upgrade</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Preferencias del Pasajero</label>
                        <textarea id="preferencias" rows="2" placeholder="Asiento ventana, comida vegetariana, bebida agua, etc..."
                                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Incidentes</label>
                        <textarea id="incidentes" rows="2" placeholder="Problemas reportados, quejas, etc..."
                                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Acciones de Recuperación</label>
                        <textarea id="accionesRecuperacion" rows="2" placeholder="Medidas tomadas para resolver problemas..."
                                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Notas Adicionales</label>
                        <textarea id="notas" rows="2" placeholder="Observaciones adicionales del agente..."
                                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                    </div>

                    <div class="flex space-x-4">
                        <button type="submit"
                                class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium flex items-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Guardar Interacción
                        </button>
                        <button type="button" onclick="cancelInteraction()"
                                class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-medium">
                            Cancelar
                        </button>
                    </div>
                </form>

                ${interactions.length > 0 ? `
                    <div class="mt-8 border-t pt-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">Interacciones Anteriores</h3>
                        <div class="space-y-3 max-h-60 overflow-y-auto">
                            ${interactions.slice(0, 3).map(interaction => `
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <div class="flex justify-between items-start mb-2">
                                        <div>
                                            <p class="font-medium">${Utils.formatDateTime(interaction.fecha)}</p>
                                            <p class="text-sm text-gray-600">Agente: ${interaction.agente_nombre}</p>
                                        </div>
                                        ${interaction.calificacion_medallia ? `
                                            <span class="px-2 py-1 rounded text-sm ${Utils.getMedalliaColor(interaction.calificacion_medallia)}">
                                                ${interaction.calificacion_medallia}/10
                                            </span>
                                        ` : ''}
                                    </div>
                                    ${interaction.feedback ? `<p class="text-sm text-gray-700">${interaction.feedback}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
};

// Función para cancelar interacción
window.cancelInteraction = function() {
    StateManager.setState({ selectedPassenger: null, passengerInteractions: null });
    render();
};

// Función para configurar handlers del formulario de interacción
const setupInteractionFormHandlers = () => {
    const form = document.getElementById('interactionForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const state = StateManager.getState();
        const passenger = state.selectedPassenger;

        if (!passenger) {
            showNotification('No se ha seleccionado un pasajero', 'error');
            return;
        }

        // Recopilar datos del formulario
        const serviciosUtilizados = Array.from(document.querySelectorAll('.servicio-checkbox:checked'))
            .map(cb => cb.value);

        const interactionData = {
            pasajero_id: passenger.id,
            agente_nombre: state.currentUser,
            fecha: new Date().toISOString(),
            motivo_viaje: document.getElementById('motivoViaje').value || null,
            feedback: document.getElementById('feedback').value.trim() || null,
            calificacion_medallia: parseInt(document.getElementById('calificacionMedallia').value) || null,
            servicios_utilizados: serviciosUtilizados.length > 0 ? serviciosUtilizados : null,
            preferencias: document.getElementById('preferencias').value.trim() || null,
            incidentes: document.getElementById('incidentes').value.trim() || null,
            acciones_recuperacion: document.getElementById('accionesRecuperacion').value.trim() || null,
            notas: document.getElementById('notas').value.trim() || null,
            es_cumpleanos: Utils.isBirthday(passenger.fecha_nacimiento)
        };

        try {
            await ApiService.createInteraction(interactionData);

            showNotification(`Interacción guardada exitosamente para ${passenger.nombre}`, 'success');

            // Limpiar formulario y volver a búsqueda
            StateManager.setState({ selectedPassenger: null, passengerInteractions: null });
            changeView(CONSTANTS.VIEWS.PASSENGER_SEARCH);

        } catch (error) {
            console.error('Error saving interaction:', error);
            showNotification('Error al guardar la interacción', 'error');
        }
    });
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
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const airportId = document.getElementById('airportSelect').value;
        const role = document.querySelector('input[name="role"]:checked').value;
        const userName = document.getElementById('userName').value.trim();

        if (airportId === 'new' || !airportId) {
            showNotification('Seleccione un aeropuerto válido', CONSTANTS.NOTIFICATION_TYPES.WARNING);
            return;
        }

        if (!userName) {
            showNotification('Ingrese su nombre', CONSTANTS.NOTIFICATION_TYPES.WARNING);
            return;
        }

        // Verificar si el usuario ya existe en el aeropuerto (mejor práctica)
        try {
            // Buscar si ya hay interacciones con este nombre de agente en el aeropuerto
            const existingInteractions = await ApiService.getAirportInteractions(airportId);
            const agentExists = existingInteractions.some(interaction =>
                interaction.agente_nombre &&
                interaction.agente_nombre.toLowerCase().trim() === userName.toLowerCase().trim()
            );

            if (agentExists) {
                showNotification(`Bienvenido de vuelta, ${userName}!`, CONSTANTS.NOTIFICATION_TYPES.SUCCESS);
            } else {
                showNotification(`Bienvenido, ${userName}! Primera vez en el sistema.`, CONSTANTS.NOTIFICATION_TYPES.INFO);
            }
        } catch (error) {
            console.warn('Could not check existing agents:', error);
            // Continuar normalmente si no se puede verificar
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
