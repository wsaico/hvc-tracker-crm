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
                mainContent.innerHTML = '<div class="flex justify-center items-center h-64"><div class="spinner"></div><p class="ml-4 text-gray-600">Cargando vista de manifiesto...</p></div>';
                // El componente completo se cargará dinámicamente
                break;
            case CONSTANTS.VIEWS.PASSENGER_SEARCH:
                mainContent.innerHTML = '<div class="flex justify-center items-center h-64"><div class="spinner"></div><p class="ml-4 text-gray-600">Cargando búsqueda de pasajeros...</p></div>';
                // El componente completo se cargará dinámicamente
                break;
            case CONSTANTS.VIEWS.DASHBOARD:
                mainContent.innerHTML = '<div class="flex justify-center items-center h-64"><div class="spinner"></div><p class="ml-4 text-gray-600">Cargando dashboard...</p></div>';
                // El componente completo se cargará dinámicamente
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
