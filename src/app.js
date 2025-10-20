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
    } else if (state.currentView === 'register') {
        // Renderizar registro
        app.innerHTML = renderRegisterView();
        await setupRegisterHandlers();
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
                    console.log('Rendering passenger interaction view for:', state.selectedPassenger.nombre);
                    mainContent.innerHTML = renderPassengerInteractionView();
                    // Pequeño delay para asegurar que el DOM esté listo
                    setTimeout(() => {
                        setupInteractionFormHandlers();
                    }, 100);
                } else {
                    // Vista normal de búsqueda
                    console.log('Rendering passenger search view');
                    renderPassengerSearchView().then(html => mainContent.innerHTML = html);
                }
                break;
            case CONSTANTS.VIEWS.DASHBOARD:
                renderDashboardView().then(html => mainContent.innerHTML = html);
                break;
            case 'passenger-tracking':
                renderPassengerTrackingView().then(html => mainContent.innerHTML = html);
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
            <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md fade-in" id="loginContainer">
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
                        <label class="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                        <input type="text" id="username" required placeholder="Ingrese su usuario"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                        <input type="password" id="password" required placeholder="Ingrese su contraseña"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>

                    <button type="submit"
                            class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg flex items-center justify-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        Iniciar Sesión
                    </button>
                </form>

                <div class="mt-6 text-center">
                    <button onclick="App.showRegisterForm()"
                            class="text-blue-600 hover:text-blue-700 font-medium">
                        ¿No tienes cuenta? Regístrate aquí
                    </button>
                </div>

                <!-- Información de usuarios de prueba -->
                <div class="mt-8 p-4 bg-gray-50 rounded-lg">
                    <h4 class="text-sm font-semibold text-gray-700 mb-3">👥 Usuarios de Prueba</h4>
                    <div class="text-xs text-gray-600 space-y-1">
                        <div><strong>Jauja (JAU):</strong> supervisor_jau / agente_jau</div>
                        <div><strong>Tacna (TCQ):</strong> supervisor_tcq / agente_tcq</div>
                        <div><strong>Talara (TYL):</strong> supervisor_tyl / agente_tyl</div>
                        <div class="mt-2 text-yellow-600"><em>Contraseña: admin123 (todos)</em></div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

/**
 * Renderiza la vista de registro
 * @returns {string} HTML del registro
 * @private
 */
const renderRegisterView = () => {
    return `
        <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-blue-600 p-4">
            <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md fade-in" id="registerContainer">
                <div class="text-center mb-8">
                    <div class="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                        </svg>
                    </div>
                    <h1 class="text-3xl font-bold text-gray-800">Crear Cuenta</h1>
                    <p class="text-gray-600 mt-2">Regístrate en HVC Tracker</p>
                </div>

                <form id="registerForm" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                        <input type="text" id="regNombreCompleto" required placeholder="Ej: Juan Pérez"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                        <input type="text" id="regUsername" required placeholder="Ej: jperez"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        <p class="text-xs text-gray-500 mt-1">Solo letras, números y guiones bajos</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                        <input type="password" id="regPassword" required placeholder="Mínimo 6 caracteres"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
                        <input type="password" id="regConfirmPassword" required placeholder="Repite tu contraseña"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Aeropuerto</label>
                        <select id="regAeropuerto" required
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                            <option value="">Seleccione un aeropuerto...</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                        <div class="grid grid-cols-2 gap-4">
                            <label class="cursor-pointer">
                                <input type="radio" name="regRol" value="supervisor" required class="peer hidden">
                                <div class="border-2 border-gray-300 rounded-lg p-4 text-center peer-checked:border-green-600 peer-checked:bg-green-50 hover:border-green-400 transition">
                                    <svg class="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                    <span class="font-medium">Supervisor</span>
                                </div>
                            </label>
                            <label class="cursor-pointer">
                                <input type="radio" name="regRol" value="agente" required class="peer hidden">
                                <div class="border-2 border-gray-300 rounded-lg p-4 text-center peer-checked:border-green-600 peer-checked:bg-green-50 hover:border-green-400 transition">
                                    <svg class="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                    </svg>
                                    <span class="font-medium">Agente</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <button type="submit"
                            class="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg flex items-center justify-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                        </svg>
                        Crear Cuenta
                    </button>
                </form>

                <div class="mt-6 text-center">
                    <button onclick="App.showLoginForm()"
                            class="text-green-600 hover:text-green-700 font-medium">
                        ¿Ya tienes cuenta? Inicia sesión
                    </button>
                </div>
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

    // Supervisores tienen acceso a todos los módulos
    const supervisorLinks = state.currentRole === CONSTANTS.ROLES.SUPERVISOR ? `
        <button onclick="App.changeView('${CONSTANTS.VIEWS.DASHBOARD}')"
                class="text-gray-700 hover:text-blue-600 font-medium ${state.currentView === CONSTANTS.VIEWS.DASHBOARD ? 'text-blue-600 border-b-2 border-blue-600' : ''}">
            Dashboard
        </button>
        <button onclick="App.changeView('${CONSTANTS.VIEWS.MANIFEST}')"
                class="text-gray-700 hover:text-blue-600 font-medium ${state.currentView === CONSTANTS.VIEWS.MANIFEST ? 'text-blue-600 border-b-2 border-blue-600' : ''}">
            Cargar Manifiesto
        </button>
        <button onclick="App.changeView('${CONSTANTS.VIEWS.PASSENGER_SEARCH}')"
                class="text-gray-700 hover:text-blue-600 font-medium ${state.currentView === CONSTANTS.VIEWS.PASSENGER_SEARCH ? 'text-blue-600 border-b-2 border-blue-600' : ''}">
            Atención al Pasajero
        </button>
        <button onclick="App.changeView('passenger-tracking')"
                class="text-gray-700 hover:text-blue-600 font-medium ${state.currentView === 'passenger-tracking' ? 'text-blue-600 border-b-2 border-blue-600' : ''}">
            Tracking de Pasajeros
        </button>
    ` : `
        <button onclick="App.changeView('${CONSTANTS.VIEWS.PASSENGER_SEARCH}')"
                class="text-gray-700 hover:text-blue-600 font-medium ${state.currentView === CONSTANTS.VIEWS.PASSENGER_SEARCH ? 'text-blue-600 border-b-2 border-blue-600' : ''}">
            Atención al Pasajero
        </button>
        <button onclick="App.changeView('passenger-tracking')"
                class="text-gray-700 hover:text-blue-600 font-medium ${state.currentView === 'passenger-tracking' ? 'text-blue-600 border-b-2 border-blue-600' : ''}">
            Tracking de Pasajeros
        </button>
        <button onclick="App.changeView('${CONSTANTS.VIEWS.DASHBOARD}')"
                class="text-gray-700 hover:text-blue-600 font-medium ${state.currentView === CONSTANTS.VIEWS.DASHBOARD ? 'text-blue-600 border-b-2 border-blue-600' : ''}">
            Dashboard
        </button>
    `;

    // Menú móvil tipo app nativa con navegación inferior
    const mobileMenu = `
        <!-- Bottom Navigation Mobile -->
        <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50 safe-area-bottom">
            <div class="grid grid-cols-${state.currentRole === CONSTANTS.ROLES.SUPERVISOR ? '4' : '3'} h-16">
                ${state.currentRole === CONSTANTS.ROLES.SUPERVISOR ? `
                    <button onclick="App.changeView('${CONSTANTS.VIEWS.DASHBOARD}')"
                            class="flex flex-col items-center justify-center space-y-1 ${state.currentView === CONSTANTS.VIEWS.DASHBOARD ? 'text-blue-600 bg-blue-50' : 'text-gray-600'} active:bg-gray-100 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                        <span class="text-xs font-medium">Dashboard</span>
                    </button>
                    <button onclick="App.changeView('${CONSTANTS.VIEWS.MANIFEST}')"
                            class="flex flex-col items-center justify-center space-y-1 ${state.currentView === CONSTANTS.VIEWS.MANIFEST ? 'text-blue-600 bg-blue-50' : 'text-gray-600'} active:bg-gray-100 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        <span class="text-xs font-medium">Manifiesto</span>
                    </button>
                ` : ''}
                <button onclick="App.changeView('${CONSTANTS.VIEWS.PASSENGER_SEARCH}')"
                        class="flex flex-col items-center justify-center space-y-1 ${state.currentView === CONSTANTS.VIEWS.PASSENGER_SEARCH ? 'text-blue-600 bg-blue-50' : 'text-gray-600'} active:bg-gray-100 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                    <span class="text-xs font-medium">Pasajeros</span>
                </button>
                <button onclick="App.changeView('passenger-tracking')"
                        class="flex flex-col items-center justify-center space-y-1 ${state.currentView === 'passenger-tracking' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'} active:bg-gray-100 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    <span class="text-xs font-medium">Tracking</span>
                </button>
                ${state.currentRole !== CONSTANTS.ROLES.SUPERVISOR ? `
                    <button onclick="App.changeView('${CONSTANTS.VIEWS.DASHBOARD}')"
                            class="flex flex-col items-center justify-center space-y-1 ${state.currentView === CONSTANTS.VIEWS.DASHBOARD ? 'text-blue-600 bg-blue-50' : 'text-gray-600'} active:bg-gray-100 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                        <span class="text-xs font-medium">Dashboard</span>
                    </button>
                ` : ''}
            </div>
        </nav>
    `;

    return `
        <!-- Top Header - Optimizado para móvil -->
        <nav class="bg-white shadow-md no-print sticky top-0 z-40">
            <div class="px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <!-- Logo y título -->
                    <div class="flex items-center space-x-3">
                        <div class="bg-gradient-to-br from-blue-600 to-blue-700 w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                            </svg>
                        </div>
                        <div>
                            <h1 class="text-lg sm:text-xl font-bold text-gray-800">HVC Tracker</h1>
                            <p class="text-xs text-gray-500 hidden sm:block">${airportName}</p>
                        </div>
                    </div>

                    <!-- Desktop Navigation - Hidden on mobile -->
                    <div class="hidden lg:flex items-center space-x-6">
                        ${supervisorLinks}
                    </div>

                    <!-- User menu -->
                    <div class="flex items-center space-x-3">
                        <div class="text-right hidden sm:block">
                            <p class="text-sm font-medium text-gray-800">${state.currentUser}</p>
                            <p class="text-xs text-gray-500 capitalize">${state.currentRole}</p>
                        </div>
                        <button onclick="App.logout()"
                                class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors active:bg-red-100">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        ${mobileMenu}

        <style>
            /* Safe area para notch de móviles */
            .safe-area-bottom {
                padding-bottom: env(safe-area-inset-bottom);
            }

            /* Espacio para el menú inferior en móvil */
            @media (max-width: 1023px) {
                body {
                    padding-bottom: calc(4rem + env(safe-area-inset-bottom));
                }
            }

            /* Mejorar touch targets en móvil */
            @media (max-width: 1023px) {
                button, a, input, select, textarea {
                    min-height: 44px;
                }
            }
        </style>
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
            <div class="space-y-4">
                <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-5 rounded-lg">
                    <div class="flex items-center mb-3">
                        <svg class="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <h4 class="text-xl font-bold text-green-800">Manifiesto Procesado Exitosamente</h4>
                    </div>
                    <p class="text-green-700">${processResult.message}</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-blue-600 font-medium">Total Procesados</p>
                                <p class="text-3xl font-bold text-blue-800">${processResult.processed}</p>
                            </div>
                            <svg class="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                            </svg>
                        </div>
                    </div>

                    <div class="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-green-600 font-medium">Nuevos Creados</p>
                                <p class="text-3xl font-bold text-green-800">${processResult.created}</p>
                            </div>
                            <svg class="w-12 h-12 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                            </svg>
                        </div>
                    </div>

                    <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-purple-600 font-medium">Ya Existentes</p>
                                <p class="text-3xl font-bold text-purple-800">${processResult.found}</p>
                            </div>
                            <svg class="w-12 h-12 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                            </svg>
                        </div>
                    </div>
                </div>

                ${processResult.duplicates && processResult.duplicates.length > 0 ? `
                    <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                        <div class="flex items-start">
                            <svg class="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                            </svg>
                            <div class="flex-1">
                                <h4 class="font-semibold text-yellow-800 mb-2">Duplicados Detectados</h4>
                                <p class="text-sm text-yellow-700 mb-2">Se detectaron ${processResult.duplicates.length} pasajero(s) que ya existían en la base de datos:</p>
                                <ul class="text-sm text-yellow-700 space-y-1">
                                    ${processResult.duplicates.map(d => `
                                        <li>• <strong>${d.manifestName}</strong> → Vinculado con: <em>${d.existingName}</em> (${d.existingDNI})</li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                ` : ''}
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
                            <button onclick="editPassenger('${passenger.id}')"
                                    class="bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 transition text-sm flex items-center">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                                Editar
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

// Función para cambiar entre pestañas de pasajeros
window.switchPassengerTab = function(tab) {
    const todayTab = document.getElementById('tab-today');
    const searchTab = document.getElementById('tab-search');
    const todayContent = document.getElementById('today-passengers-tab');
    const searchContent = document.getElementById('search-passengers-tab');

    if (tab === 'today') {
        // Activar pestaña "Pasajeros de Hoy"
        todayTab.className = 'tab-button border-b-2 border-blue-600 text-blue-600 whitespace-nowrap py-4 px-1 font-medium text-sm flex items-center';
        searchTab.className = 'tab-button border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 font-medium text-sm flex items-center';
        todayContent.classList.remove('hidden');
        searchContent.classList.add('hidden');
    } else {
        // Activar pestaña "Búsqueda Manual"
        searchTab.className = 'tab-button border-b-2 border-blue-600 text-blue-600 whitespace-nowrap py-4 px-1 font-medium text-sm flex items-center';
        todayTab.className = 'tab-button border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 font-medium text-sm flex items-center';
        searchContent.classList.remove('hidden');
        todayContent.classList.add('hidden');
    }
};

// Función para recargar pasajeros de hoy
window.loadTodayPassengers = async function() {
    showNotification('Actualizando lista de pasajeros...', 'info');
    render();
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

// Función para editar pasajero
window.editPassenger = async function(passengerId) {
    try {
        const passenger = await ApiService.getPassengerById(passengerId);
        showEditPassengerModal(passenger);
    } catch (error) {
        console.error('Error loading passenger for edit:', error);
        showNotification('Error al cargar datos del pasajero', 'error');
    }
};

// Función para mostrar modal de edición de pasajero
function showEditPassengerModal(passenger) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-2xl sm:text-3xl font-bold mb-2 flex items-center">
                            <svg class="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                            Editar Pasajero
                        </h2>
                        <p class="text-blue-100 text-sm sm:text-base">${passenger.nombre} • ${passenger.dni_pasaporte}</p>
                    </div>
                    <button onclick="this.closest('.fixed').remove()"
                            class="text-white hover:text-gray-200 transition">
                        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <!-- Tabs de navegación -->
                <div class="flex gap-2 mt-6 overflow-x-auto scrollbar-hide">
                    <button type="button" onclick="switchEditTab('basic')"
                            class="edit-tab-btn px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition active"
                            data-tab="basic">
                        <span class="flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                            Básico
                        </span>
                    </button>
                    <button type="button" onclick="switchEditTab('contact')"
                            class="edit-tab-btn px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition"
                            data-tab="contact">
                        <span class="flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                            </svg>
                            Contacto
                        </span>
                    </button>
                    <button type="button" onclick="switchEditTab('preferences')"
                            class="edit-tab-btn px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition"
                            data-tab="preferences">
                        <span class="flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                            </svg>
                            Preferencias
                        </span>
                    </button>
                    <button type="button" onclick="switchEditTab('medical')"
                            class="edit-tab-btn px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition"
                            data-tab="medical">
                        <span class="flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            Médico
                        </span>
                    </button>
                </div>
            </div>

            <form id="editPassengerForm" class="overflow-y-auto" style="max-height: calc(95vh - 250px);">
                <div class="p-6">
                    <!-- Tab: Básico -->
                    <div id="edit-tab-basic" class="edit-tab-content active space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo *</label>
                                <input type="text" id="editNombre" required value="${passenger.nombre || ''}"
                                        class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">DNI/Pasaporte *</label>
                                <input type="text" id="editDniPasaporte" required value="${passenger.dni_pasaporte || ''}"
                                        class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Categoría HVC *</label>
                                <select id="editCategoria" required class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                                    <option value="">Seleccione categoría...</option>
                                    <option value="SIGNATURE" ${passenger.categoria === 'SIGNATURE' ? 'selected' : ''}>🌟 SIGNATURE</option>
                                    <option value="TOP" ${passenger.categoria === 'TOP' ? 'selected' : ''}>⭐ TOP</option>
                                    <option value="BLACK" ${passenger.categoria === 'BLACK' ? 'selected' : ''}>⚫ BLACK</option>
                                    <option value="PLATINUM" ${passenger.categoria === 'PLATINUM' ? 'selected' : ''}>💎 PLATINUM</option>
                                    <option value="GOLD PLUS" ${passenger.categoria === 'GOLD PLUS' ? 'selected' : ''}>🥇 GOLD PLUS</option>
                                    <option value="GOLD" ${passenger.categoria === 'GOLD' ? 'selected' : ''}>🏅 GOLD</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Fecha de Nacimiento</label>
                                <input type="date" id="editFechaNacimiento" value="${passenger.fecha_nacimiento ? passenger.fecha_nacimiento.split('T')[0] : ''}"
                                        class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Número de Pasaporte</label>
                                <input type="text" id="editNumeroPasaporte" value="${passenger.numero_pasaporte || ''}"
                                        class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Nacionalidad</label>
                                <input type="text" id="editNacionalidad" value="${passenger.nacionalidad || ''}"
                                        placeholder="Ej: Peruana, Estadounidense"
                                        class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Emisión Pasaporte</label>
                                <input type="date" id="editFechaEmisionPasaporte" value="${passenger.fecha_emision_pasaporte ? passenger.fecha_emision_pasaporte.split('T')[0] : ''}"
                                        class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Vencimiento Pasaporte</label>
                                <input type="date" id="editFechaVencimientoPasaporte" value="${passenger.fecha_vencimiento_pasaporte ? passenger.fecha_vencimiento_pasaporte.split('T')[0] : ''}"
                                        class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">URL de Foto</label>
                            <input type="url" id="editFotoUrl" value="${passenger.foto_url || ''}"
                                    placeholder="https://ejemplo.com/foto.jpg"
                                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                        </div>
                    </div>

                    <!-- Tab: Contacto -->
                    <div id="edit-tab-contact" class="edit-tab-content space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">📱 Teléfono</label>
                                <input type="tel" id="editTelefono" value="${passenger.telefono || ''}"
                                        placeholder="+51 999 999 999"
                                        class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">📧 Email</label>
                                <input type="email" id="editEmail" value="${passenger.email || ''}"
                                        placeholder="pasajero@ejemplo.com"
                                        class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                            </div>
                        </div>
                        <div class="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                            <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                                <svg class="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L4.082 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                                Contacto de Emergencia
                            </h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre del Contacto</label>
                                    <input type="text" id="editContactoEmergenciaNombre" value="${passenger.contacto_emergencia_nombre || ''}"
                                            placeholder="Nombre completo"
                                            class="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Teléfono de Emergencia</label>
                                    <input type="tel" id="editContactoEmergenciaTelefono" value="${passenger.contacto_emergencia_telefono || ''}"
                                            placeholder="+51 999 999 999"
                                            class="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tab: Preferencias -->
                    <div id="edit-tab-preferences" class="edit-tab-content space-y-4">
                        <div class="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                            <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                                <svg class="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                                </svg>
                                Gustos del Pasajero
                            </h4>
                            <textarea id="editGustos" rows="4"
                                    placeholder='{"bebida": "vino tinto", "comida": "vegetariana", "entretenimiento": "películas"}'
                                    class="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition font-mono text-sm">${passenger.gustos ? JSON.stringify(passenger.gustos, null, 2) : ''}</textarea>
                            <p class="text-xs text-gray-500 mt-2">💡 Formato JSON. Ej: {"bebida": "agua mineral", "comida": "vegetariana"}</p>
                        </div>
                        <div class="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                            <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                                <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                                </svg>
                                Preferencias de Servicio
                            </h4>
                            <textarea id="editPreferencias" rows="4"
                                    placeholder='{"asiento": "ventana", "servicio": "fast track", "sala_vip": true}'
                                    class="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-mono text-sm">${passenger.preferencias ? JSON.stringify(passenger.preferencias, null, 2) : ''}</textarea>
                            <p class="text-xs text-gray-500 mt-2">💡 Formato JSON. Ej: {"asiento": "ventana", "servicio": "fast track"}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">🌐 Idiomas (separados por coma)</label>
                            <input type="text" id="editIdiomas" value="${passenger.idiomas ? passenger.idiomas.join(', ') : ''}"
                                    placeholder="Español, Inglés, Francés"
                                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">📝 Notas Especiales</label>
                            <textarea id="editNotasEspeciales" rows="3"
                                    placeholder="Información adicional relevante sobre el pasajero..."
                                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">${passenger.notas_especiales || ''}</textarea>
                        </div>
                    </div>

                    <!-- Tab: Médico -->
                    <div id="edit-tab-medical" class="edit-tab-content space-y-4">
                        <div class="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                            <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                                <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L4.082 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                                Información Médica Crítica
                            </h4>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">🚨 Alergias</label>
                                    <textarea id="editAlergias" rows="3"
                                            placeholder="Ej: Alergia al maní, intolerancia a la lactosa..."
                                            class="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition">${passenger.alergias || ''}</textarea>
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">⚕️ Restricciones Médicas</label>
                                    <textarea id="editRestriccionesMedicas" rows="3"
                                            placeholder="Ej: Requiere silla de ruedas, necesita oxígeno..."
                                            class="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition">${passenger.restricciones_medicas || ''}</textarea>
                                </div>
                            </div>
                            <div class="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                                <p class="text-xs text-yellow-800 flex items-start gap-2">
                                    <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <span>Esta información es confidencial y solo se usa para garantizar la seguridad del pasajero durante el viaje.</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Botones de acción -->
                    <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t-2 border-gray-200 mt-6">
                        <button type="submit"
                                class="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition font-bold text-lg flex items-center justify-center shadow-lg hover:shadow-xl">
                            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Guardar Cambios
                        </button>
                        <button type="button" onclick="this.closest('.fixed').remove()"
                                class="flex-1 sm:flex-initial bg-gray-500 text-white px-6 py-4 rounded-xl hover:bg-gray-600 transition font-bold">
                            Cancelar
                        </button>
                    </div>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Agregar estilos para tabs
    const style = document.createElement('style');
    style.textContent = `
        .edit-tab-btn {
            background-color: rgba(255, 255, 255, 0.2);
            color: rgba(255, 255, 255, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .edit-tab-btn.active {
            background-color: white;
            color: #2563eb;
            border-color: white;
        }
        .edit-tab-btn:hover:not(.active) {
            background-color: rgba(255, 255, 255, 0.3);
        }
        .edit-tab-content {
            display: none;
        }
        .edit-tab-content.active {
            display: block;
            animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    `;
    document.head.appendChild(style);

    // Función para cambiar tabs
    window.switchEditTab = function(tabName) {
        // Actualizar botones
        document.querySelectorAll('.edit-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Actualizar contenido
        document.querySelectorAll('.edit-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`edit-tab-${tabName}`).classList.add('active');
    };

    // Configurar el handler del formulario
    document.getElementById('editPassengerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await savePassengerChanges(passenger.id);
    });
}

// Función para guardar cambios del pasajero
async function savePassengerChanges(passengerId) {
    try {
        // Recopilar datos del formulario
        const formData = {
            nombre: document.getElementById('editNombre').value.trim(),
            dni_pasaporte: document.getElementById('editDniPasaporte').value.trim(),
            categoria: document.getElementById('editCategoria').value,
            fecha_nacimiento: document.getElementById('editFechaNacimiento').value || null,
            telefono: document.getElementById('editTelefono').value.trim() || null,
            email: document.getElementById('editEmail').value.trim() || null,
            numero_pasaporte: document.getElementById('editNumeroPasaporte').value.trim() || null,
            nacionalidad: document.getElementById('editNacionalidad').value.trim() || null,
            fecha_emision_pasaporte: document.getElementById('editFechaEmisionPasaporte').value || null,
            fecha_vencimiento_pasaporte: document.getElementById('editFechaVencimientoPasaporte').value || null,
            alergias: document.getElementById('editAlergias').value.trim() || null,
            restricciones_medicas: document.getElementById('editRestriccionesMedicas').value.trim() || null,
            contacto_emergencia_nombre: document.getElementById('editContactoEmergenciaNombre').value.trim() || null,
            contacto_emergencia_telefono: document.getElementById('editContactoEmergenciaTelefono').value.trim() || null,
            foto_url: document.getElementById('editFotoUrl').value.trim() || null,
            notas_especiales: document.getElementById('editNotasEspeciales').value.trim() || null
        };

        // Procesar JSON
        try {
            const gustosText = document.getElementById('editGustos').value.trim();
            formData.gustos = gustosText ? JSON.parse(gustosText) : {};
        } catch (error) {
            showNotification('Error en formato JSON de gustos', 'error');
            return;
        }

        try {
            const preferenciasText = document.getElementById('editPreferencias').value.trim();
            formData.preferencias = preferenciasText ? JSON.parse(preferenciasText) : {};
        } catch (error) {
            showNotification('Error en formato JSON de preferencias', 'error');
            return;
        }

        // Procesar idiomas
        const idiomasText = document.getElementById('editIdiomas').value.trim();
        formData.idiomas = idiomasText ? idiomasText.split(',').map(lang => lang.trim()).filter(lang => lang) : [];

        // Importar validaciones
        const { validatePassengerData } = await import('./utils/validators.js');

        // Validar datos
        const validation = validatePassengerData(formData);
        if (!validation.isValid) {
            showNotification(`Errores de validación: ${validation.errors.join(', ')}`, 'error');
            return;
        }

        // Actualizar pasajero
        await ApiService.updatePassenger(passengerId, formData);

        showNotification('Pasajero actualizado exitosamente', 'success');

        // Cerrar modal y refrescar vista
        document.querySelector('.fixed').remove();

        // Refrescar la vista actual
        const state = StateManager.getState();
        if (state.currentView === CONSTANTS.VIEWS.PASSENGER_SEARCH) {
            render();
        }

    } catch (error) {
        console.error('Error saving passenger changes:', error);
        showNotification('Error al guardar cambios', 'error');
    }
}

// Función para mostrar modal de detalles del pasajero
async function showPassengerModal(passenger, interactions) {
    // Calcular sugerencias de recuperación si es detractor
    let recoverySuggestions = [];
    const lastInteraction = interactions[0];

    if (lastInteraction && lastInteraction.calificacion_medallia && lastInteraction.calificacion_medallia <= 6) {
        try {
            const BusinessLogic = await import('./services/BusinessLogic.js');
            recoverySuggestions = BusinessLogic.generateRecoverySuggestions(passenger, lastInteraction);
        } catch (error) {
            console.warn('Could not generate recovery suggestions:', error);
        }
    }

    // Construir timeline de recuperación (todas las interacciones con calificación)
    const recoveryTimeline = interactions
        .filter(i => i.calificacion_medallia)
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        .map((interaction, index) => {
            const score = interaction.calificacion_medallia;
            const status = score <= 6 ? 'detractor' : score <= 8 ? 'passive' : 'promoter';
            const hasRecoveryAction = interaction.acciones_recuperacion && interaction.acciones_recuperacion.trim();

            return {
                fecha: interaction.fecha,
                score,
                status,
                hasRecoveryAction,
                incidente: interaction.incidentes,
                acciones: interaction.acciones_recuperacion,
                agente: interaction.agente_nombre,
                index
            };
        });

    // Determinar si hubo recuperación exitosa
    let hasSuccessfulRecovery = false;
    if (recoveryTimeline.length >= 2) {
        for (let i = 0; i < recoveryTimeline.length - 1; i++) {
            if (recoveryTimeline[i].status === 'detractor' &&
                recoveryTimeline[i].hasRecoveryAction &&
                recoveryTimeline[i + 1].status === 'promoter') {
                hasSuccessfulRecovery = true;
                break;
            }
        }
    }

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-start mb-6">
                    <div class="flex items-center space-x-4">
                        ${passenger.foto_url ? `
                            <img src="${passenger.foto_url}" alt="Foto de ${passenger.nombre}"
                                  class="w-16 h-16 rounded-full object-cover border-2 border-gray-200">
                        ` : `
                            <div class="w-16 h-16 ${Utils.getCategoryClass(passenger.categoria)} rounded-full flex items-center justify-center">
                                <span class="text-white font-bold text-xl">${passenger.nombre.charAt(0)}</span>
                            </div>
                        `}
                        <div>
                            <h2 class="text-2xl font-bold text-gray-800">${passenger.nombre}</h2>
                            <p class="text-gray-600">DNI/Pasaporte: ${passenger.dni_pasaporte}</p>
                            <div class="flex items-center space-x-2 mt-1">
                                <span class="inline-block px-3 py-1 rounded-full text-sm font-medium ${Utils.getBadgeClass(passenger.categoria)}">
                                    ${passenger.categoria}
                                </span>
                                ${passenger.fecha_nacimiento && Utils.isBirthday(passenger.fecha_nacimiento) ? `
                                    <span class="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        🎂 ¡Cumpleaños!
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="editPassenger('${passenger.id}')"
                                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                            Editar Información
                        </button>
                        <button onclick="startPassengerInteraction('${passenger.id}')"
                                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                            </svg>
                            Atención
                        </button>
                        <button onclick="this.closest('.fixed').remove()"
                                class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
                            ${passenger.nacionalidad ? `<p><strong>Nacionalidad:</strong> ${passenger.nacionalidad}</p>` : ''}
                            ${passenger.numero_pasaporte ? `<p><strong>Número Pasaporte:</strong> ${passenger.numero_pasaporte}</p>` : ''}
                            ${passenger.fecha_emision_pasaporte ? `<p><strong>Emisión Pasaporte:</strong> ${Utils.formatDate(passenger.fecha_emision_pasaporte)}</p>` : ''}
                            ${passenger.fecha_vencimiento_pasaporte ? `<p><strong>Vencimiento Pasaporte:</strong> ${Utils.formatDate(passenger.fecha_vencimiento_pasaporte)}</p>` : ''}
                            ${passenger.alergias ? `<p><strong>Alergias:</strong> ${passenger.alergias}</p>` : ''}
                            ${passenger.restricciones_medicas ? `<p><strong>Restricciones Médicas:</strong> ${passenger.restricciones_medicas}</p>` : ''}
                            ${passenger.contacto_emergencia_nombre ? `<p><strong>Contacto Emergencia:</strong> ${passenger.contacto_emergencia_nombre}</p>` : ''}
                            ${passenger.contacto_emergencia_telefono ? `<p><strong>Teléfono Emergencia:</strong> ${passenger.contacto_emergencia_telefono}</p>` : ''}
                        </div>
                    </div>

                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-3">Preferencias y Gustos</h3>
                        <div class="space-y-3">
                            ${passenger.gustos && Object.keys(passenger.gustos).length > 0 ? `
                                <div>
                                    <p class="font-medium text-gray-700">Gustos:</p>
                                    <div class="flex flex-wrap gap-1 mt-1">
                                        ${Object.entries(passenger.gustos).map(([key, value]) => `
                                            <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                ${key}: ${value}
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : '<p class="text-gray-500 text-sm">No hay gustos registrados</p>'}

                            ${passenger.preferencias && Object.keys(passenger.preferencias).length > 0 ? `
                                <div>
                                    <p class="font-medium text-gray-700">Preferencias:</p>
                                    <div class="flex flex-wrap gap-1 mt-1">
                                        ${Object.entries(passenger.preferencias).map(([key, value]) => `
                                            <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                ${key}: ${value}
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : '<p class="text-gray-500 text-sm">No hay preferencias registradas</p>'}

                            ${passenger.idiomas && passenger.idiomas.length > 0 ? `
                                <div>
                                    <p class="font-medium text-gray-700">Idiomas:</p>
                                    <div class="flex flex-wrap gap-1 mt-1">
                                        ${passenger.idiomas.map(lang => `
                                            <span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                                ${lang}
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : '<p class="text-gray-500 text-sm">No hay idiomas registrados</p>'}
                        </div>

                        <h3 class="text-lg font-semibold text-gray-800 mb-3 mt-6">Estadísticas</h3>
                        <div class="space-y-2">
                            <p><strong>Total Interacciones:</strong> ${interactions.length}</p>
                            ${interactions.length > 0 ? `
                                <p><strong>Última Interacción:</strong> ${Utils.formatDateTime(interactions[0].fecha)}</p>
                                <p><strong>Calificación Promedio:</strong> ${interactions.length > 0 ? (interactions.reduce((sum, i) => sum + (i.calificacion_medallia || 0), 0) / interactions.length).toFixed(1) : 'N/A'}</p>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <!-- Sugerencias de Recuperación para Detractores -->
                ${recoverySuggestions.length > 0 ? `
                    <div class="mb-6 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-6 shadow-lg">
                        <div class="flex items-center mb-4">
                            <div class="bg-red-100 p-3 rounded-full mr-3">
                                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L4.082 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-red-800">⚠️ Pasajero Detractor - Requiere Atención Inmediata</h3>
                                <p class="text-sm text-red-600">Última calificación: ${lastInteraction?.calificacion_medallia}/10</p>
                            </div>
                        </div>

                        <h4 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                            </svg>
                            Acciones de Recuperación Personalizadas
                        </h4>

                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            ${recoverySuggestions.map((suggestion, index) => {
                                const effectivenessColors = {
                                    'very-high': { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-700', badge: 'bg-green-500 text-white' },
                                    'high': { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-700', badge: 'bg-blue-500 text-white' },
                                    'medium': { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-700', badge: 'bg-yellow-500 text-white' },
                                    'low': { bg: 'bg-gray-50', border: 'border-gray-400', text: 'text-gray-700', badge: 'bg-gray-500 text-white' }
                                };
                                const colors = effectivenessColors[suggestion.effectiveness] || effectivenessColors.medium;

                                return `
                                    <div class="${colors.bg} border-l-4 ${colors.border} rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                                        <div class="flex items-start justify-between mb-2">
                                            <div class="flex items-center">
                                                <span class="text-2xl mr-2">${suggestion.icon}</span>
                                                <h5 class="font-bold ${colors.text}">${suggestion.title}</h5>
                                            </div>
                                            <span class="text-xs font-bold ${colors.badge} px-2 py-1 rounded-full uppercase">
                                                ${suggestion.effectiveness === 'very-high' ? 'Muy Efectivo' :
                                                  suggestion.effectiveness === 'high' ? 'Efectivo' :
                                                  suggestion.effectiveness === 'medium' ? 'Moderado' : 'Bajo'}
                                            </span>
                                        </div>
                                        <p class="text-sm text-gray-700 mb-2">${suggestion.action}</p>
                                        <div class="flex items-center justify-between mt-3 pt-3 border-t ${colors.border}">
                                            <span class="text-xs font-medium text-gray-600">
                                                ${suggestion.type === 'personalized' ? '👤 Basado en Gustos' :
                                                  suggestion.type === 'category-based' ? '⭐ Basado en Categoría' :
                                                  suggestion.type === 'incident-based' ? '🚨 Basado en Incidente' : 'General'}
                                            </span>
                                            <span class="text-xs font-medium text-gray-600">
                                                ${suggestion.category === 'immediate' ? '⚡ Inmediato' :
                                                  suggestion.category === 'medium-term' ? '📅 Mediano Plazo' : '🔄 Seguimiento'}
                                            </span>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>

                        ${lastInteraction?.incidentes ? `
                            <div class="mt-4 bg-white rounded-lg p-4 border border-red-200">
                                <p class="text-sm font-semibold text-gray-700 mb-1">📋 Incidente Reportado:</p>
                                <p class="text-sm text-gray-600">${lastInteraction.incidentes}</p>
                            </div>
                        ` : ''}

                        <div class="mt-4 bg-white rounded-lg p-4 border border-blue-200">
                            <p class="text-sm font-semibold text-blue-700 mb-2">💡 Recomendación del Sistema:</p>
                            <p class="text-sm text-gray-700">
                                Aplicar al menos <strong class="text-blue-600">${Math.min(3, recoverySuggestions.filter(s => s.effectiveness === 'very-high' || s.effectiveness === 'high').length)}</strong> acciones de alta efectividad de forma inmediata.
                                ${passenger.idiomas && passenger.idiomas.length > 0 ? `Comunicar en <strong class="text-blue-600">${passenger.idiomas[0]}</strong>.` : ''}
                                ${['SIGNATURE', 'TOP', 'BLACK'].includes(passenger.categoria) ?
                                    '<br><strong class="text-purple-600">⚠️ Cliente VIP:</strong> Notificar a supervisor para seguimiento personalizado.' : ''}
                            </p>
                        </div>
                    </div>
                ` : ''}

                <!-- Timeline de Recuperación -->
                ${recoveryTimeline.length > 0 ? `
                    <div class="mb-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-bold text-gray-800 flex items-center">
                                <svg class="w-6 h-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                Historial de Recuperación
                            </h3>
                            ${hasSuccessfulRecovery ? `
                                <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold flex items-center gap-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    Recuperación Exitosa
                                </span>
                            ` : ''}
                        </div>

                        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-indigo-200">
                            <div class="relative">
                                <!-- Timeline vertical -->
                                <div class="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-red-300 via-yellow-300 to-green-300"></div>

                                <div class="space-y-6">
                                    ${recoveryTimeline.map((item, index) => {
                                        const statusConfig = {
                                            'detractor': {
                                                color: 'red',
                                                icon: '😞',
                                                label: 'Detractor',
                                                bg: 'bg-red-100',
                                                border: 'border-red-400',
                                                text: 'text-red-800'
                                            },
                                            'passive': {
                                                color: 'yellow',
                                                icon: '😐',
                                                label: 'Pasivo',
                                                bg: 'bg-yellow-100',
                                                border: 'border-yellow-400',
                                                text: 'text-yellow-800'
                                            },
                                            'promoter': {
                                                color: 'green',
                                                icon: '😊',
                                                label: 'Promotor',
                                                bg: 'bg-green-100',
                                                border: 'border-green-400',
                                                text: 'text-green-800'
                                            }
                                        };

                                        const config = statusConfig[item.status];
                                        const isFirst = index === 0;
                                        const isLast = index === recoveryTimeline.length - 1;

                                        return `
                                            <div class="relative pl-16">
                                                <!-- Punto del timeline -->
                                                <div class="absolute left-0 top-0 w-12 h-12 bg-white rounded-full border-4 border-${config.color}-500 flex items-center justify-center shadow-lg z-10">
                                                    <span class="text-2xl">${config.icon}</span>
                                                </div>

                                                <!-- Contenido -->
                                                <div class="bg-white rounded-xl p-4 shadow-md border-l-4 border-${config.color}-500 ${isLast ? 'ring-2 ring-indigo-300' : ''}">
                                                    <div class="flex items-center justify-between mb-2">
                                                        <div class="flex items-center gap-2">
                                                            <span class="px-3 py-1 ${config.bg} ${config.text} rounded-full text-sm font-bold">
                                                                ${config.label}
                                                            </span>
                                                            <span class="text-2xl font-bold ${config.text}">${item.score}/10</span>
                                                        </div>
                                                        <span class="text-xs text-gray-500 font-medium">
                                                            ${new Date(item.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>

                                                    ${item.incidente ? `
                                                        <div class="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                                                            <p class="text-xs font-semibold text-orange-800 mb-1">📋 Incidente:</p>
                                                            <p class="text-sm text-gray-700">${item.incidente}</p>
                                                        </div>
                                                    ` : ''}

                                                    ${item.hasRecoveryAction ? `
                                                        <div class="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                                            <p class="text-xs font-semibold text-blue-800 mb-1">🎯 Acciones de Recuperación:</p>
                                                            <p class="text-sm text-gray-700">${item.acciones}</p>
                                                        </div>
                                                    ` : item.status === 'detractor' ? `
                                                        <div class="mt-2 p-2 bg-yellow-50 border border-yellow-300 rounded-lg">
                                                            <p class="text-xs font-semibold text-yellow-800">⚠️ No se registraron acciones de recuperación</p>
                                                        </div>
                                                    ` : ''}

                                                    ${item.agente ? `
                                                        <p class="text-xs text-gray-500 mt-2">👤 Atendido por: <span class="font-medium">${item.agente}</span></p>
                                                    ` : ''}

                                                    ${isLast && item.status === 'promoter' && index > 0 && recoveryTimeline[index - 1].status === 'detractor' ? `
                                                        <div class="mt-3 pt-3 border-t border-green-200">
                                                            <p class="text-sm font-bold text-green-700 flex items-center gap-2">
                                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                                </svg>
                                                                ¡Recuperación exitosa! El pasajero pasó de detractor a promotor
                                                            </p>
                                                        </div>
                                                    ` : ''}

                                                    ${isFirst && item.status === 'detractor' ? `
                                                        <div class="mt-3 pt-3 border-t border-red-200">
                                                            <p class="text-sm font-bold text-red-700 flex items-center gap-2">
                                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L4.082 16c-.77 1.333.192 3 1.732 3z"/>
                                                                </svg>
                                                                Inicio del proceso de recuperación
                                                            </p>
                                                        </div>
                                                    ` : ''}
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>

                            <!-- Resumen del timeline -->
                            <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div class="bg-white rounded-lg p-3 border border-gray-200">
                                    <p class="text-xs text-gray-600 mb-1">Total de Interacciones</p>
                                    <p class="text-2xl font-bold text-gray-800">${recoveryTimeline.length}</p>
                                </div>
                                <div class="bg-white rounded-lg p-3 border border-gray-200">
                                    <p class="text-xs text-gray-600 mb-1">Acciones de Recuperación</p>
                                    <p class="text-2xl font-bold text-blue-600">${recoveryTimeline.filter(i => i.hasRecoveryAction).length}</p>
                                </div>
                                <div class="bg-white rounded-lg p-3 border border-gray-200">
                                    <p class="text-xs text-gray-600 mb-1">Estado Actual</p>
                                    <p class="text-lg font-bold ${recoveryTimeline[recoveryTimeline.length - 1].status === 'promoter' ? 'text-green-600' : recoveryTimeline[recoveryTimeline.length - 1].status === 'detractor' ? 'text-red-600' : 'text-yellow-600'}">
                                        ${recoveryTimeline[recoveryTimeline.length - 1].status === 'promoter' ? '😊 Promotor' :
                                          recoveryTimeline[recoveryTimeline.length - 1].status === 'detractor' ? '😞 Detractor' : '😐 Pasivo'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : ''}

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
        <div class="max-w-6xl mx-auto p-4 sm:p-6">
            <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <!-- Header Mejorado -->
                <div class="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div class="flex items-center gap-4">
                            ${passenger.foto_url ? `
                                <img src="${passenger.foto_url}" alt="${passenger.nombre}"
                                     class="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white shadow-lg object-cover">
                            ` : `
                                <div class="w-16 h-16 sm:w-20 sm:h-20 ${Utils.getCategoryClass(passenger.categoria)} rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                                    <span class="text-white font-bold text-2xl sm:text-3xl">${passenger.nombre.charAt(0)}</span>
                                </div>
                            `}
                            <div>
                                <h2 class="text-2xl sm:text-3xl font-bold mb-1">Atención al Pasajero</h2>
                                <h3 class="text-lg sm:text-xl font-semibold opacity-90">${passenger.nombre}</h3>
                                <p class="text-sm sm:text-base opacity-75">${passenger.dni_pasaporte} • ${passenger.categoria}</p>
                            </div>
                        </div>
                        <button type="button" onclick="cancelInteraction()"
                                class="self-end sm:self-auto bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition font-medium text-sm flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                            </svg>
                            Volver
                        </button>
                    </div>

                    <!-- Tabs de navegación -->
                    <div class="flex gap-2 mt-6 overflow-x-auto scrollbar-hide">
                        <button type="button" onclick="switchInteractionTab('general')"
                                class="interaction-tab-btn px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition active"
                                data-tab="general">
                            <span class="flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                                General
                            </span>
                        </button>
                        <button type="button" onclick="switchInteractionTab('services')"
                                class="interaction-tab-btn px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition"
                                data-tab="services">
                            <span class="flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                </svg>
                                Servicios
                            </span>
                        </button>
                        <button type="button" onclick="switchInteractionTab('feedback')"
                                class="interaction-tab-btn px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition"
                                data-tab="feedback">
                            <span class="flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                                </svg>
                                Feedback
                            </span>
                        </button>
                        <button type="button" onclick="switchInteractionTab('issues')"
                                class="interaction-tab-btn px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition"
                                data-tab="issues">
                            <span class="flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L4.082 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                                Incidentes
                            </span>
                        </button>
                    </div>
                </div>

                <form id="interactionForm" class="p-6">
                    <div class="space-y-6">
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
                        <button type="button" onclick="saveInteraction(event)"
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
    console.log('Cancel interaction called');
    StateManager.setState({ selectedPassenger: null, passengerInteractions: null });
    changeView(CONSTANTS.VIEWS.PASSENGER_SEARCH);
};

// Función para cancelar interacción
window.cancelInteraction = function() {
    StateManager.setState({ selectedPassenger: null, passengerInteractions: null });
    render();
};

// Función para guardar interacción (llamada desde el botón)
window.saveInteraction = async function(event) {
    event.preventDefault();
    console.log('Save interaction triggered');

    const state = StateManager.getState();
    const passenger = state.selectedPassenger;

    console.log('Current state:', state);
    console.log('Selected passenger:', passenger);

    if (!passenger) {
        showNotification('No se ha seleccionado un pasajero', 'error');
        return;
    }

    if (!state.currentUser) {
        showNotification('Sesión expirada. Vuelva a iniciar sesión.', 'error');
        logout();
        return;
    }

    // Recopilar datos del formulario
    const serviciosUtilizados = Array.from(document.querySelectorAll('.servicio-checkbox:checked'))
        .map(cb => cb.value);

    const interactionData = {
        pasajero_id: passenger.id,
        usuario_id: state.currentUserId, // Nuevo: ID del usuario autenticado
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

    console.log('Interaction data to save:', interactionData);

    try {
        console.log('Calling ApiService.createInteraction...');
        const result = await ApiService.createInteraction(interactionData);
        console.log('Interaction saved successfully:', result);

        showNotification(`Interacción guardada exitosamente para ${passenger.nombre}`, 'success');

        // Limpiar formulario y volver a búsqueda
        console.log('Clearing state and changing view...');
        StateManager.setState({ selectedPassenger: null, passengerInteractions: null });
        changeView(CONSTANTS.VIEWS.PASSENGER_SEARCH);

    } catch (error) {
        console.error('Error saving interaction:', error);
        showNotification('Error al guardar la interacción', 'error');
    }
};

// Función para configurar handlers del formulario de interacción (ya no usada)
const setupInteractionFormHandlers = () => {
    console.log('Setup interaction form handlers - using button click instead');
};

/**
 * Muestra el formulario de registro
 */
export const showRegisterForm = () => {
    StateManager.setState({ currentView: 'register' });
    render();
};

/**
 * Muestra el formulario de login
 */
export const showLoginForm = () => {
    StateManager.setState({ currentView: CONSTANTS.VIEWS.LOGIN });
    render();
};

/**
 * Configura los manejadores de eventos para el login
 * @private
 */
const setupLoginHandlers = async () => {
    // No necesitamos cargar aeropuertos para login - los usuarios están asociados a aeropuertos

    // Manejar envío del formulario de login
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            showNotification('Complete todos los campos', CONSTANTS.NOTIFICATION_TYPES.WARNING);
            return;
        }

        try {
            // Autenticar usuario
            const user = await ApiService.authenticateUser(username, password);

            if (!user) {
                showNotification('Usuario o contraseña incorrectos', CONSTANTS.NOTIFICATION_TYPES.ERROR);
                return;
            }

            // Login exitoso
            showNotification(`Bienvenido, ${user.nombreCompleto}!`, CONSTANTS.NOTIFICATION_TYPES.SUCCESS);

            StateManager.setState({
                currentUser: user.nombreCompleto,
                currentUserId: user.id,
                currentRole: user.rol,
                currentAirport: user.aeropuerto.id,
                currentAirportData: user.aeropuerto,
                currentView: user.rol === CONSTANTS.ROLES.SUPERVISOR ? CONSTANTS.VIEWS.DASHBOARD : CONSTANTS.VIEWS.PASSENGER_SEARCH
            });

            render();

        } catch (error) {
            console.error('Login error:', error);
            showNotification('Error al iniciar sesión', CONSTANTS.NOTIFICATION_TYPES.ERROR);
        }
    });
};

/**
 * Configura los manejadores de eventos para el registro
 * @private
 */
const setupRegisterHandlers = async () => {
    // Cargar aeropuertos
    const airports = await ApiService.getAirports();
    const aeropuertoSelect = document.getElementById('regAeropuerto');
    airports.forEach(airport => {
        const option = document.createElement('option');
        option.value = airport.id;
        option.textContent = airport.nombre;
        aeropuertoSelect.appendChild(option);
    });

    // Manejar envío del formulario de registro
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombreCompleto = document.getElementById('regNombreCompleto').value.trim();
        const username = document.getElementById('regUsername').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const aeropuertoId = document.getElementById('regAeropuerto').value;
        const rol = document.querySelector('input[name="regRol"]:checked')?.value;

        // Validaciones
        if (!nombreCompleto || !username || !password || !confirmPassword || !aeropuertoId || !rol) {
            showNotification('Complete todos los campos', CONSTANTS.NOTIFICATION_TYPES.WARNING);
            return;
        }

        if (password !== confirmPassword) {
            showNotification('Las contraseñas no coinciden', CONSTANTS.NOTIFICATION_TYPES.ERROR);
            return;
        }

        if (password.length < 6) {
            showNotification('La contraseña debe tener al menos 6 caracteres', CONSTANTS.NOTIFICATION_TYPES.WARNING);
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            showNotification('El usuario solo puede contener letras, números y guiones bajos', CONSTANTS.NOTIFICATION_TYPES.WARNING);
            return;
        }

        try {
            // Crear usuario
            const userData = {
                nombreCompleto,
                username,
                password,
                rol,
                aeropuertoId
            };

            const newUser = await ApiService.createUser(userData);
            showNotification('Usuario creado exitosamente. Ahora puedes iniciar sesión.', CONSTANTS.NOTIFICATION_TYPES.SUCCESS);

            // Cambiar a vista de login
            showLoginForm();

        } catch (error) {
            console.error('Registration error:', error);
            if (error.message.includes('duplicate key')) {
                showNotification('El nombre de usuario ya existe', CONSTANTS.NOTIFICATION_TYPES.ERROR);
            } else {
                showNotification('Error al crear usuario', CONSTANTS.NOTIFICATION_TYPES.ERROR);
            }
        }
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

    // Establecer fecha de hoy por defecto
    const today = new Date().toISOString().split('T')[0];

    return `
        <div class="max-w-6xl mx-auto p-6">
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-8">
                <!-- Header -->
                <div class="flex items-center justify-between mb-8">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-800 flex items-center">
                            <svg class="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            Cargar Manifiesto de Vuelo
                        </h2>
                        <p class="text-gray-600 mt-2">Gestión inteligente de pasajeros con detección automática de duplicados</p>
                    </div>
                    <div class="bg-white rounded-lg p-4 shadow-md">
                        <div class="flex items-center">
                            <svg class="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                            <div>
                                <p class="text-xs text-gray-500">Aeropuerto</p>
                                <p class="font-semibold text-gray-800">${airportName}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Guía rápida -->
                <div class="bg-blue-100 border-l-4 border-blue-600 p-4 mb-6 rounded-lg">
                    <div class="flex items-start">
                        <svg class="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <div class="flex-1">
                            <h4 class="font-semibold text-blue-900 mb-2">Guía de Formato del Manifiesto</h4>
                            <p class="text-sm text-blue-800 mb-2">
                                Formato: <code class="bg-white px-2 py-1 rounded font-mono text-xs">VUELO,DESTINO,NOMBRE,CATEGORIA,ESTATUS,ASIENTO</code>
                            </p>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
                                <div>
                                    <strong>Categorías válidas:</strong> SIGNATURE, TOP, BLACK, PLATINUM, GOLD PLUS, GOLD
                                </div>
                                <div>
                                    <strong>Estatus válidos:</strong> CONFIRMADO, CHECK-IN, BOARDING, EMBARKED
                                </div>
                            </div>
                            <p class="text-xs text-blue-700 mt-2">
                                💡 El sistema detectará automáticamente pasajeros existentes para evitar duplicados
                            </p>
                        </div>
                    </div>
                </div>

                <div class="space-y-6">
                    <!-- Fecha del vuelo -->
                    <div class="bg-white rounded-xl p-6 shadow-md">
                        <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            Fecha del Vuelo
                        </label>
                        <input type="date" id="manifestDate" value="${today}"
                               class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                    </div>

                    <!-- Área de texto del manifiesto -->
                    <div class="bg-white rounded-xl p-6 shadow-md">
                        <div class="flex justify-between items-center mb-3">
                            <label class="block text-sm font-semibold text-gray-700 flex items-center">
                                <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                                Datos del Manifiesto
                            </label>
                            <button onclick="loadSampleManifest()" class="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                </svg>
                                Cargar ejemplo
                            </button>
                        </div>
                        <textarea id="manifestText" rows="12" placeholder="VUELO001,LIM,Juan Perez Rodriguez,BLACK,CONFIRMADO,1A
VUELO001,LIM,Maria Garcia Lopez,PLATINUM,CHECK-IN,1B
VUELO002,CUZ,Pedro Ramos Quispe,GOLD,CONFIRMADO,2A
..."
                                class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm transition resize-none"
                                oninput="updateManifestPreview()"></textarea>
                        <div class="mt-2 flex justify-between items-center text-xs text-gray-500">
                            <span id="lineCount">0 líneas</span>
                            <span>Una línea por pasajero</span>
                        </div>
                    </div>

                    <!-- Botones de acción -->
                    <div class="flex flex-wrap gap-4">
                        <button onclick="processManifest()"
                                class="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            Procesar Manifiesto
                        </button>
                        <button onclick="clearManifest()"
                                class="bg-gray-100 text-gray-700 px-6 py-4 rounded-xl hover:bg-gray-200 transition font-semibold flex items-center shadow-md">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                            Limpiar
                        </button>
                    </div>
                </div>

                <!-- Resultados del procesamiento -->
                <div id="manifestResults" class="mt-8 hidden">
                    <div class="bg-white rounded-xl p-6 shadow-lg">
                        <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <svg class="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                            </svg>
                            Resultados del Procesamiento
                        </h3>
                        <div id="manifestOutput"></div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            function updateManifestPreview() {
                const text = document.getElementById('manifestText').value;
                const lines = text.split('\\n').filter(l => l.trim()).length;
                document.getElementById('lineCount').textContent = lines + ' línea' + (lines !== 1 ? 's' : '');
            }

            function loadSampleManifest() {
                const sample = \`LA2001,LIM,Carlos Martinez,BLACK,CONFIRMADO,1A
LA2001,LIM,Ana Torres,PLATINUM,CHECK-IN,1B
LA2001,LIM,Roberto Silva,GOLD PLUS,CONFIRMADO,2A
LA2002,CUZ,Patricia Gomez,SIGNATURE,CONFIRMADO,1C
LA2002,CUZ,Miguel Ramos,TOP,BOARDING,2B\`;
                document.getElementById('manifestText').value = sample;
                updateManifestPreview();
            }
        </script>
    `;
};

/**
 * Renderiza la vista de búsqueda de pasajeros
 * @returns {Promise<string>} HTML de la vista de búsqueda
 * @private
 */
const renderPassengerSearchView = async () => {
    const state = StateManager.getState();
    const today = new Date().toISOString().split('T')[0];

    // Cargar pasajeros del día automáticamente
    let todayPassengers = [];
    let totalFlights = 0;

    try {
        const flights = await ApiService.getFlightsByDate(today, state.currentAirport);
        totalFlights = flights.length;

        // Extraer todos los pasajeros únicos de los vuelos de hoy
        const passengerIds = new Set();
        flights.forEach(flight => {
            if (flight.flight_passengers) {
                flight.flight_passengers.forEach(fp => passengerIds.add(fp.pasajero_id));
            }
        });

        // Obtener detalles de cada pasajero
        if (passengerIds.size > 0) {
            const passengerPromises = Array.from(passengerIds).map(id =>
                ApiService.getPassengerById(id).catch(err => {
                    console.warn(`Could not load passenger ${id}:`, err);
                    return null;
                })
            );
            const passengers = await Promise.all(passengerPromises);
            todayPassengers = passengers.filter(p => p !== null);
        }
    } catch (error) {
        console.warn('Could not load today passengers:', error);
    }

    // Generar HTML para pasajeros de hoy con diseño mejorado
    const todayPassengersHTML = todayPassengers.length > 0 ? todayPassengers.map(passenger => {
        // Definir colores suaves según categoría
        const categoryColors = {
            'SIGNATURE': { bg: 'bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50', border: 'border-purple-300', badge: 'bg-purple-100 text-purple-800 border border-purple-300' },
            'TOP': { bg: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50', border: 'border-amber-300', badge: 'bg-amber-100 text-amber-800 border border-amber-300' },
            'BLACK': { bg: 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-50', border: 'border-gray-400', badge: 'bg-gray-100 text-gray-800 border border-gray-400' },
            'PLATINUM': { bg: 'bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-50', border: 'border-cyan-300', badge: 'bg-cyan-100 text-cyan-800 border border-cyan-300' },
            'GOLD PLUS': { bg: 'bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50', border: 'border-orange-300', badge: 'bg-orange-100 text-orange-800 border border-orange-300' },
            'GOLD': { bg: 'bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-50', border: 'border-yellow-400', badge: 'bg-yellow-100 text-yellow-800 border border-yellow-400' }
        };

        const colors = categoryColors[passenger.categoria] || categoryColors['GOLD'];

        return `
        <div class="${colors.bg} rounded-2xl p-4 sm:p-6 border-2 ${colors.border} hover:shadow-2xl transition-all duration-300 active:scale-[0.98] sm:hover:-translate-y-1 sm:hover:scale-[1.02]">
            <div class="flex flex-col gap-4">
                <!-- Avatar y info principal - Optimizado para móvil -->
                <div class="flex items-center gap-3 sm:gap-4">
                    ${passenger.foto_url ? `
                        <div class="relative flex-shrink-0">
                            <img src="${passenger.foto_url}" alt="${passenger.nombre}"
                                 class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-3 border-white shadow-lg">
                            <div class="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 ${colors.badge} rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-bold shadow">
                                ${passenger.categoria.substring(0, 3)}
                            </div>
                        </div>
                    ` : `
                        <div class="relative flex-shrink-0">
                            <div class="w-16 h-16 sm:w-20 sm:h-20 ${Utils.getCategoryClass(passenger.categoria)} rounded-2xl flex items-center justify-center shadow-lg border-3 border-white">
                                <span class="text-white font-bold text-2xl sm:text-3xl">${passenger.nombre.charAt(0)}</span>
                            </div>
                            <div class="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 ${colors.badge} rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-bold shadow">
                                ${passenger.categoria.substring(0, 3)}
                            </div>
                        </div>
                    `}

                    <div class="flex-1 min-w-0">
                        <h3 class="font-bold text-gray-900 text-base sm:text-xl mb-1 sm:mb-2 truncate">${passenger.nombre}</h3>
                        <div class="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2">
                            <span class="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white border border-gray-200 text-xs sm:text-sm text-gray-700 shadow-sm">
                                <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/>
                                </svg>
                                <span class="font-medium truncate">${passenger.dni_pasaporte}</span>
                            </span>
                            <span class="${colors.badge} inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold shadow-sm">
                                <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                </svg>
                                <span class="truncate">${passenger.categoria}</span>
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Botones de acción - Stack en móvil -->
                <div class="grid grid-cols-3 gap-2">
                    <button onclick="viewPassengerDetails('${passenger.id}')"
                            class="bg-white border-2 border-blue-300 text-blue-700 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl hover:bg-blue-50 active:bg-blue-100 hover:border-blue-400 transition-all text-xs sm:text-sm font-semibold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 shadow-sm hover:shadow-md">
                        <svg class="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        <span>Ver</span>
                    </button>
                    <button onclick="editPassenger('${passenger.id}')"
                            class="bg-white border-2 border-amber-300 text-amber-700 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl hover:bg-amber-50 active:bg-amber-100 hover:border-amber-400 transition-all text-xs sm:text-sm font-semibold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 shadow-sm hover:shadow-md">
                        <svg class="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                        <span>Editar</span>
                    </button>
                    <button onclick="startPassengerInteraction('${passenger.id}')"
                            class="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl hover:from-emerald-600 hover:to-green-600 active:scale-95 transition-all text-xs sm:text-sm font-semibold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 shadow-md hover:shadow-lg">
                        <svg class="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                        <span>Atender</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    }).join('') : `
        <div class="text-center py-12">
            <svg class="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <p class="text-gray-500 text-lg font-medium">No hay pasajeros en el manifiesto de hoy</p>
            <p class="text-gray-400 text-sm mt-2">El supervisor aún no ha cargado el manifiesto, o no hay vuelos programados</p>
        </div>
    `;

    return `
        <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
            <!-- Tabs -->
            <div class="mb-4 sm:mb-6">
                <div class="border-b border-gray-200">
                    <nav class="flex space-x-8" aria-label="Tabs">
                        <button onclick="switchPassengerTab('today')" id="tab-today"
                                class="tab-button border-b-2 border-blue-600 text-blue-600 whitespace-nowrap py-4 px-1 font-medium text-sm flex items-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            Pasajeros de Hoy
                            ${todayPassengers.length > 0 ? `<span class="ml-2 bg-blue-100 text-blue-800 py-1 px-2 rounded-full text-xs font-bold">${todayPassengers.length}</span>` : ''}
                        </button>
                        <button onclick="switchPassengerTab('search')" id="tab-search"
                                class="tab-button border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 font-medium text-sm flex items-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                            Búsqueda Manual
                        </button>
                    </nav>
                </div>
            </div>

            <!-- Tab: Pasajeros de Hoy -->
            <div id="today-passengers-tab" class="tab-content">
                <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div class="flex justify-between items-center mb-6">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                                <svg class="w-7 h-7 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                                </svg>
                                Pasajeros HVC del Día
                            </h2>
                            <p class="text-gray-600 mt-1">
                                ${todayPassengers.length > 0
                                    ? `${todayPassengers.length} pasajero${todayPassengers.length !== 1 ? 's' : ''} en ${totalFlights} vuelo${totalFlights !== 1 ? 's' : ''} programado${totalFlights !== 1 ? 's' : ''}`
                                    : 'Esperando carga de manifiesto'}
                            </p>
                        </div>
                        <div class="flex items-center space-x-3">
                            <button onclick="loadTodayPassengers()"
                                    class="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition flex items-center text-sm font-medium">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                </svg>
                                Actualizar
                            </button>
                        </div>
                    </div>

                    <div class="space-y-4">
                        ${todayPassengersHTML}
                    </div>
                </div>
            </div>

            <!-- Tab: Búsqueda Manual -->
            <div id="search-passengers-tab" class="tab-content hidden">
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <svg class="w-7 h-7 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        Búsqueda Manual de Pasajeros
                    </h2>

                    <div class="space-y-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Buscar por DNI/Pasaporte o Nombre</label>
                            <div class="flex space-x-4">
                                <input type="text" id="searchQuery" placeholder="Ingrese DNI, pasaporte o nombre..."
                                       class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                       onkeypress="if(event.key==='Enter') searchPassengers()">
                                <button onclick="searchPassengers()"
                                        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center shadow-md hover:shadow-lg">
                                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                    </svg>
                                    Buscar
                                </button>
                            </div>
                            <p class="text-sm text-gray-500 mt-2">
                                💡 Use esta búsqueda para pasajeros que no están en el manifiesto del día
                            </p>
                        </div>

                        <div id="searchResults" class="space-y-4">
                            <!-- Resultados de búsqueda aparecerán aquí -->
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <style>
            .tab-content { display: none; }
            .tab-content:not(.hidden) { display: block; }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .fade-in { animation: fadeIn 0.3s ease-out; }
        </style>
    `;
};

/**
 * Renderiza la vista de tracking de pasajeros
 * @returns {Promise<string>} HTML de la vista de tracking
 * @private
 */
const renderPassengerTrackingView = async () => {
    const state = StateManager.getState();

    try {
        // Obtener todas las interacciones del aeropuerto (ya filtradas por aeropuerto)
        const interactions = await ApiService.getAirportInteractions(state.currentAirport);
        const passengers = await ApiService.getAllPassengers(state.currentAirport);

        // Crear mapa de pasajeros para lookup rápido
        const passengerMap = {};
        passengers.forEach(p => passengerMap[p.id] = p);

        // Calcular métricas inteligentes
        const passengersAtRisk = [];
        const recentInteractions = [];
        const birthdayPassengers = [];

        interactions.forEach(interaction => {
            const passenger = passengerMap[interaction.pasajero_id];
            if (!passenger) return;

            // Pasajeros en riesgo (última calificación baja)
            if (interaction.calificacion_medallia && interaction.calificacion_medallia < CONSTANTS.MEDALLIA_THRESHOLDS.GOOD) {
                const existing = passengersAtRisk.find(p => p.id === passenger.id);
                if (!existing) {
                    passengersAtRisk.push({
                        ...passenger,
                        lastRating: interaction.calificacion_medallia,
                        lastInteraction: interaction.fecha
                    });
                }
            }

            // Interacciones recientes (últimas 24 horas)
            const interactionDate = new Date(interaction.fecha);
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);

            if (interactionDate >= oneDayAgo) {
                recentInteractions.push({
                    ...interaction,
                    passenger: passenger
                });
            }

            // Cumpleaños próximos
            if (Utils.isBirthday(passenger.fecha_nacimiento)) {
                const existing = birthdayPassengers.find(p => p.id === passenger.id);
                if (!existing) {
                    birthdayPassengers.push(passenger);
                }
            }
        });

        return `
            <div class="max-w-7xl mx-auto p-6">
                <div class="mb-8">
                    <h2 class="text-3xl font-bold text-gray-800 mb-2">Tracking de Pasajeros HVC</h2>
                    <p class="text-gray-600">Monitoreo inteligente y sugerencias automáticas</p>
                </div>

                <!-- Métricas rápidas -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                        <div class="flex items-center">
                            <div class="bg-red-100 p-3 rounded-lg">
                                <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                                </svg>
                            </div>
                            <div class="ml-4">
                                <h3 class="text-lg font-semibold text-red-800">En Riesgo</h3>
                                <p class="text-2xl font-bold text-red-600">${passengersAtRisk.length}</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <div class="flex items-center">
                            <div class="bg-yellow-100 p-3 rounded-lg">
                                <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div class="ml-4">
                                <h3 class="text-lg font-semibold text-yellow-800">Hoy</h3>
                                <p class="text-2xl font-bold text-yellow-600">${recentInteractions.length}</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div class="flex items-center">
                            <div class="bg-green-100 p-3 rounded-lg">
                                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18z"/>
                                </svg>
                            </div>
                            <div class="ml-4">
                                <h3 class="text-lg font-semibold text-green-800">Cumpleaños</h3>
                                <p class="text-2xl font-bold text-green-600">${birthdayPassengers.length}</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div class="flex items-center">
                            <div class="bg-blue-100 p-3 rounded-lg">
                                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                                </svg>
                            </div>
                            <div class="ml-4">
                                <h3 class="text-lg font-semibold text-blue-800">Total</h3>
                                <p class="text-2xl font-bold text-blue-600">${interactions.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pasajeros que requieren atención inmediata -->
                ${passengersAtRisk.length > 0 ? `
                    <div class="bg-white rounded-lg shadow mb-8">
                        <div class="p-6 border-b border-gray-200">
                            <h3 class="text-xl font-semibold text-gray-800 flex items-center">
                                <svg class="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                                </svg>
                                Pasajeros en Riesgo (Requieren Atención Inmediata)
                            </h3>
                            <p class="text-gray-600 mt-1">Última calificación baja - necesitan acciones de recuperación</p>
                        </div>
                        <div class="p-6">
                            <div class="space-y-4">
                                ${passengersAtRisk.map(passenger => `
                                    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div class="flex justify-between items-start">
                                            <div class="flex-1">
                                                <div class="flex items-center space-x-3 mb-2">
                                                    <div class="w-10 h-10 ${Utils.getCategoryClass(passenger.categoria)} rounded-full flex items-center justify-center">
                                                        <span class="text-white font-bold">${passenger.nombre.charAt(0)}</span>
                                                    </div>
                                                    <div>
                                                        <h4 class="font-semibold text-gray-800">${passenger.nombre}</h4>
                                                        <p class="text-sm text-gray-600">${passenger.dni_pasaporte} • ${passenger.categoria}</p>
                                                    </div>
                                                </div>
                                                <div class="flex items-center space-x-4 text-sm">
                                                    <span class="text-red-600 font-medium">Última calificación: ${passenger.lastRating}/10</span>
                                                    <span class="text-gray-500">${Utils.formatDateTime(passenger.lastInteraction)}</span>
                                                </div>
                                            </div>
                                            <button onclick="startPassengerInteraction('${passenger.id}')"
                                                    class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm flex items-center">
                                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                                                </svg>
                                                Atender Ahora
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- Cumpleaños del día -->
                ${birthdayPassengers.length > 0 ? `
                    <div class="bg-white rounded-lg shadow mb-8">
                        <div class="p-6 border-b border-gray-200">
                            <h3 class="text-xl font-semibold text-gray-800 flex items-center">
                                <svg class="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18z"/>
                                </svg>
                                ¡Cumpleaños del Día!
                            </h3>
                            <p class="text-gray-600 mt-1">Felicita a estos pasajeros especiales</p>
                        </div>
                        <div class="p-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                ${birthdayPassengers.map(passenger => `
                                    <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                        <div class="w-16 h-16 ${Utils.getCategoryClass(passenger.categoria)} rounded-full flex items-center justify-center mx-auto mb-3">
                                            <span class="text-white font-bold text-xl">${passenger.nombre.charAt(0)}</span>
                                        </div>
                                        <h4 class="font-semibold text-gray-800">${passenger.nombre}</h4>
                                        <p class="text-sm text-gray-600">${passenger.categoria}</p>
                                        <button onclick="startPassengerInteraction('${passenger.id}')"
                                                class="mt-3 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition">
                                            Felicitar
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- Interacciones recientes -->
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b border-gray-200">
                        <h3 class="text-xl font-semibold text-gray-800 flex items-center">
                            <svg class="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Interacciones Recientes (Últimas 24 horas)
                        </h3>
                        <p class="text-gray-600 mt-1">Historial de atención al pasajero</p>
                    </div>
                    <div class="p-6">
                        ${recentInteractions.length > 0 ? `
                            <div class="space-y-4">
                                ${recentInteractions.slice(0, 10).map(interaction => `
                                    <div class="bg-gray-50 rounded-lg p-4">
                                        <div class="flex justify-between items-start mb-3">
                                            <div class="flex items-center space-x-3">
                                                <div class="w-8 h-8 ${Utils.getCategoryClass(interaction.passenger.categoria)} rounded-full flex items-center justify-center">
                                                    <span class="text-white font-bold text-sm">${interaction.passenger.nombre.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <h4 class="font-semibold text-gray-800">${interaction.passenger.nombre}</h4>
                                                    <p class="text-sm text-gray-600">Agente: ${interaction.agente_nombre}</p>
                                                </div>
                                            </div>
                                            <div class="text-right">
                                                <div class="flex items-center space-x-2">
                                                    ${interaction.calificacion_medallia ? `
                                                        <span class="px-2 py-1 rounded text-sm ${Utils.getMedalliaColor(interaction.calificacion_medallia)}">
                                                            ${interaction.calificacion_medallia}/10
                                                        </span>
                                                    ` : ''}
                                                    <span class="text-sm text-gray-500">${Utils.formatDateTime(interaction.fecha)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        ${interaction.feedback ? `
                                            <div class="bg-white p-3 rounded border-l-4 border-blue-400">
                                                <p class="text-sm text-gray-700 italic">"${interaction.feedback}"</p>
                                            </div>
                                        ` : ''}
                                        ${interaction.servicios_utilizados && interaction.servicios_utilizados.length > 0 ? `
                                            <div class="mt-2 flex flex-wrap gap-1">
                                                ${interaction.servicios_utilizados.map(servicio => `
                                                    <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                        ${servicio}
                                                    </span>
                                                `).join('')}
                                            </div>
                                        ` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="text-center py-8 text-gray-500">
                                <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <p>No hay interacciones recientes</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading passenger tracking:', error);
        return `
            <div class="max-w-4xl mx-auto p-6">
                <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <svg class="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <h3 class="text-lg font-semibold text-red-800 mb-2">Error al cargar tracking</h3>
                    <p class="text-red-600">${error.message}</p>
                </div>
            </div>
        `;
    }
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
        passengersAtRisk: 0,
        recoveryRate: 0,
        categoryCount: {},
        motivoCount: {},
        serviciosCount: {},
        trendData: []
    };

    let airportMetrics = null;
    let performanceInsights = [];

    // Variables para métricas de recuperación
    let recoveryMetrics = null;
    let dashboardInsights = [];
    let interactions = [];
    let passengers = [];

    // Intentar cargar métricas reales si la BD está disponible
    if (window.DB_AVAILABLE) {
        try {
            const state = StateManager.getState();

            // Cargar datos brutos para cálculos avanzados
            interactions = await ApiService.getAirportInteractions(state.currentAirport);
            passengers = await ApiService.getAllPassengers(state.currentAirport);

            // Usar la nueva función getAirportMetrics para obtener métricas calculadas en tiempo real
            airportMetrics = await ApiService.getAirportMetrics(state.currentAirport);

            if (airportMetrics) {
                metrics = {
                    totalInteractions: airportMetrics.total_interacciones || 0,
                    totalPassengers: airportMetrics.total_pasajeros || 0,
                    avgMedallia: airportMetrics.calificacion_promedio || 0,
                    passengersAtRisk: airportMetrics.pasajeros_en_riesgo || 0,
                    recoveryRate: airportMetrics.tasa_recuperacion || 0,
                    categoryCount: airportMetrics.distribucion_categoria || {},
                    motivoCount: airportMetrics.motivos_viaje || {},
                    serviciosCount: airportMetrics.servicios_utilizados || {},
                    trendData: airportMetrics.tendencia_calificaciones || []
                };

                // Generar insights de rendimiento
                performanceInsights = generatePerformanceInsights(metrics);
            } else {
                // Fallback a cálculo manual si falla
                const BusinessLogic = await import('./services/BusinessLogic.js');
                const businessMetrics = BusinessLogic.calculateDashboardMetrics(interactions, passengers);
                metrics = businessMetrics;
            }

            // Calcular métricas de recuperación avanzadas usando BusinessLogic
            const BusinessLogic = await import('./services/BusinessLogic.js');
            const fullMetrics = BusinessLogic.calculateDashboardMetrics(interactions, passengers);

            // Extraer métricas de recuperación específicas
            recoveryMetrics = {
                detractors: fullMetrics.detractors || 0,
                passives: fullMetrics.passives || 0,
                promoters: fullMetrics.promoters || 0,
                recoveryActions: fullMetrics.recoveryActions || 0,
                successfulRecoveries: fullMetrics.successfulRecoveries || 0,
                successfulRecoveryRate: fullMetrics.successfulRecoveryRate || 0
            };

            // Generar insights inteligentes
            dashboardInsights = BusinessLogic.generateDashboardInsights(fullMetrics, interactions, passengers);

        } catch (error) {
            console.warn('Could not load real metrics:', error);
        }
    }

    const statusColor = window.DB_AVAILABLE ? 'green' : 'yellow';
    const statusText = window.DB_AVAILABLE ? 'Sistema Conectado' : 'Modo Demo Activo';
    const statusMessage = window.DB_AVAILABLE
        ? 'Conectado a base de datos Supabase. Datos filtrados por aeropuerto.'
        : 'Las métricas mostradas son datos de ejemplo. Configure Supabase para datos reales.';

    // Función para generar insights de rendimiento
    function generatePerformanceInsights(metrics) {
        const insights = [];

        // Análisis de calificación promedio
        if (metrics.avgMedallia >= 9) {
            insights.push({
                type: 'success',
                icon: '🎉',
                title: 'Excelente Rendimiento',
                message: `Calificación promedio de ${metrics.avgMedallia}/10. ¡El aeropuerto está superando las expectativas!`,
                action: 'Mantener los estándares actuales'
            });
        } else if (metrics.avgMedallia >= 7) {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Rendimiento Aceptable',
                message: `Calificación promedio de ${metrics.avgMedallia}/10. Hay oportunidad de mejora.`,
                action: 'Implementar programa de capacitación'
            });
        } else {
            insights.push({
                type: 'danger',
                icon: '🚨',
                title: 'Atención Urgente Requerida',
                message: `Calificación promedio de ${metrics.avgMedallia}/10. Es necesario intervenir inmediatamente.`,
                action: 'Revisar protocolos de atención al cliente'
            });
        }

        // Análisis de pasajeros en riesgo
        if (metrics.passengersAtRisk > 10) {
            insights.push({
                type: 'danger',
                icon: '🔴',
                title: 'Alto Número de Pasajeros en Riesgo',
                message: `${metrics.passengersAtRisk} pasajeros con calificaciones bajas requieren atención inmediata.`,
                action: 'Priorizar acciones de recuperación'
            });
        } else if (metrics.passengersAtRisk > 0) {
            insights.push({
                type: 'warning',
                icon: '🟡',
                title: 'Pasajeros en Riesgo',
                message: `${metrics.passengersAtRisk} pasajeros necesitan seguimiento especial.`,
                action: 'Implementar plan de recuperación'
            });
        }

        // Análisis de tasa de recuperación
        if (metrics.recoveryRate >= 80) {
            insights.push({
                type: 'success',
                icon: '💪',
                title: 'Excelente Tasa de Recuperación',
                message: `${metrics.recoveryRate}% de casos de riesgo fueron recuperados exitosamente.`,
                action: 'Documentar mejores prácticas'
            });
        } else if (metrics.recoveryRate < 50) {
            insights.push({
                type: 'warning',
                icon: '📈',
                title: 'Oportunidad de Mejora',
                message: `Tasa de recuperación del ${metrics.recoveryRate}%. Se puede mejorar.`,
                action: 'Revisar estrategias de recuperación'
            });
        }

        // Análisis de volumen de interacciones
        const avgInteractionsPerDay = metrics.totalInteractions / 30;
        if (avgInteractionsPerDay < 5) {
            insights.push({
                type: 'info',
                icon: '📊',
                title: 'Bajo Volumen de Atención',
                message: `Solo ${avgInteractionsPerDay.toFixed(1)} interacciones promedio por día.`,
                action: 'Considerar estrategias para aumentar engagement'
            });
        } else if (avgInteractionsPerDay > 20) {
            insights.push({
                type: 'success',
                icon: '🚀',
                title: 'Alto Volumen de Atención',
                message: `${avgInteractionsPerDay.toFixed(1)} interacciones promedio por día.`,
                action: 'Excelente nivel de servicio al cliente'
            });
        }

        return insights.slice(0, 4); // Máximo 4 insights
    }

    // Calcular NPS
    const npsScore = recoveryMetrics ?
        ((recoveryMetrics.promoters - recoveryMetrics.detractors) / Math.max(1, (recoveryMetrics.promoters + recoveryMetrics.passives + recoveryMetrics.detractors)) * 100).toFixed(0) : 0;

    return `
        <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <!-- Header con Resumen Ejecutivo -->
            <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-2xl p-6 sm:p-8 mb-6 text-white">
                <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h1 class="text-3xl sm:text-4xl font-bold mb-2 flex items-center">
                            <svg class="w-8 h-8 sm:w-10 sm:h-10 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                            </svg>
                            Dashboard HVC
                        </h1>
                        <p class="text-blue-100 text-base sm:text-lg">Monitoreo en tiempo real de pasajeros de alto valor</p>
                    </div>
                    <div class="flex items-center gap-4">
                        ${window.DB_AVAILABLE ? `
                            <div class="bg-green-500/20 backdrop-blur-sm border border-green-300 rounded-lg px-4 py-2">
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                                    <span class="text-sm font-medium">Sistema Activo</span>
                                </div>
                                <p class="text-xs text-green-200 mt-1">Datos en tiempo real</p>
                            </div>
                        ` : `
                            <div class="bg-yellow-500/20 backdrop-blur-sm border border-yellow-300 rounded-lg px-4 py-2">
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 bg-yellow-300 rounded-full"></div>
                                    <span class="text-sm font-medium">Modo Demo</span>
                                </div>
                                <p class="text-xs text-yellow-200 mt-1">Datos de ejemplo</p>
                            </div>
                        `}
                    </div>
                </div>

                <!-- Resumen rápido en header -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
                    <div class="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <p class="text-blue-100 text-xs sm:text-sm mb-1">Pasajeros HVC</p>
                        <p class="text-2xl sm:text-3xl font-bold">${metrics.totalPassengers || 0}</p>
                    </div>
                    <div class="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <p class="text-blue-100 text-xs sm:text-sm mb-1">Satisfacción</p>
                        <p class="text-2xl sm:text-3xl font-bold">${metrics.avgMedallia || 0}<span class="text-lg">/10</span></p>
                    </div>
                    <div class="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <p class="text-blue-100 text-xs sm:text-sm mb-1">NPS Score</p>
                        <p class="text-2xl sm:text-3xl font-bold">${npsScore}</p>
                    </div>
                    <div class="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <p class="text-blue-100 text-xs sm:text-sm mb-1">En Riesgo</p>
                        <p class="text-2xl sm:text-3xl font-bold ${metrics.passengersAtRisk > 0 ? 'text-yellow-300' : 'text-green-300'}">${metrics.passengersAtRisk || 0}</p>
                    </div>
                </div>
            </div>

            <!-- Insights Prioritarios (Combinados) -->
            ${(dashboardInsights && dashboardInsights.length > 0) || (performanceInsights && performanceInsights.length > 0) ? `
                <div class="mb-6">
                    <h2 class="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <svg class="w-6 h-6 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L4.082 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                        Alertas e Insights Prioritarios
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${dashboardInsights && dashboardInsights.length > 0 ? dashboardInsights.map(insight => {
                            const priorityColors = {
                                'critical': { bg: 'bg-red-50', border: 'border-red-400', icon: 'text-red-600', title: 'text-red-800', badge: 'bg-red-600' },
                                'high': { bg: 'bg-orange-50', border: 'border-orange-400', icon: 'text-orange-600', title: 'text-orange-800', badge: 'bg-orange-600' },
                                'medium': { bg: 'bg-yellow-50', border: 'border-yellow-400', icon: 'text-yellow-600', title: 'text-yellow-800', badge: 'bg-yellow-600' },
                                'low': { bg: 'bg-blue-50', border: 'border-blue-400', icon: 'text-blue-600', title: 'text-blue-800', badge: 'bg-blue-600' }
                            };
                            const colors = priorityColors[insight.priority] || priorityColors.low;

                            return `
                                <div class="${colors.bg} ${colors.border} border-l-4 rounded-xl p-4 shadow-md hover:shadow-lg transition-all">
                                    <div class="flex items-start justify-between mb-2">
                                        <div class="flex items-center gap-2">
                                            <span class="text-2xl">${insight.icon}</span>
                                            <h3 class="font-bold ${colors.title} text-sm sm:text-base">${insight.title}</h3>
                                        </div>
                                        <span class="text-xs font-bold text-white ${colors.badge} px-2 py-1 rounded-full uppercase whitespace-nowrap">
                                            ${insight.priority === 'critical' ? 'Crítico' :
                                              insight.priority === 'high' ? 'Alto' :
                                              insight.priority === 'medium' ? 'Medio' : 'Bajo'}
                                        </span>
                                    </div>
                                    <p class="text-sm text-gray-700 mb-2">${insight.message}</p>
                                    ${insight.action ? `
                                        <div class="mt-3 pt-3 border-t ${colors.border}">
                                            <p class="text-xs sm:text-sm font-semibold ${colors.icon}">
                                                💡 ${insight.action}
                                            </p>
                                        </div>
                                    ` : ''}
                                </div>
                            `;
                        }).join('') : ''}

                        ${performanceInsights && performanceInsights.length > 0 ? performanceInsights.map(insight => `
                            <div class="p-4 rounded-xl shadow-md hover:shadow-lg transition-all ${
                                insight.type === 'success' ? 'bg-green-50 border-l-4 border-green-400' :
                                insight.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-400' :
                                insight.type === 'danger' ? 'bg-red-50 border-l-4 border-red-400' :
                                'bg-blue-50 border-l-4 border-blue-400'}">
                                <div class="flex items-start gap-3">
                                    <div class="text-2xl flex-shrink-0">${insight.icon}</div>
                                    <div class="flex-1">
                                        <h3 class="font-bold text-gray-800 text-sm sm:text-base mb-1">${insight.title}</h3>
                                        <p class="text-sm text-gray-600 mb-2">${insight.message}</p>
                                        ${insight.action ? `<p class="text-xs sm:text-sm font-medium text-blue-600 mt-2">→ ${insight.action}</p>` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('') : ''}
                    </div>
                </div>
            ` : ''}

            <!-- KPIs Principales -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                            <p class="text-sm text-gray-500">Registrados en el aeropuerto</p>
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
                            <p class="text-sm text-gray-500">Escala Medallia (1-10)</p>
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
                            <p class="text-sm text-gray-500">Calificación < 7</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="bg-purple-100 p-3 rounded-lg">
                            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11M9 11h6"/>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-lg font-semibold text-gray-800">Total Interacciones</h3>
                            <p class="text-2xl font-bold text-purple-600">${metrics.totalInteractions || 0}</p>
                            <p class="text-sm text-gray-500">Atenciones realizadas</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sistema de Recuperación NPS -->
            ${recoveryMetrics && window.DB_AVAILABLE ? `
                <div class="mb-6">
                    <h2 class="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <svg class="w-6 h-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                        Sistema de Recuperación de Pasajeros
                    </h2>

                    <!-- Grid combinado de NPS y Recuperación -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                        <!-- NPS Score (destacado) -->
                        <div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 shadow-lg text-white xl:col-span-1">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs font-medium opacity-90">NPS Score</span>
                                <svg class="w-4 h-4 opacity-90" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                </svg>
                            </div>
                            <p class="text-4xl font-bold mb-1">${npsScore}</p>
                            <p class="text-xs opacity-80">
                                ${parseFloat(npsScore) >= 50 ? '🎉 Excelente' :
                                  parseFloat(npsScore) >= 0 ? '👍 Bueno' : '⚠️ Crítico'}
                            </p>
                        </div>

                        <!-- Detractores -->
                        <div class="bg-white rounded-xl p-5 shadow-md border-l-4 border-red-500 hover:shadow-lg transition-shadow">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs font-medium text-gray-600">Detractores</span>
                                <span class="text-xl">😞</span>
                            </div>
                            <p class="text-3xl font-bold text-red-600 mb-1">${recoveryMetrics.detractors}</p>
                            <p class="text-xs text-gray-500">Cal. ≤ 6</p>
                        </div>

                        <!-- Pasivos -->
                        <div class="bg-white rounded-xl p-5 shadow-md border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs font-medium text-gray-600">Pasivos</span>
                                <span class="text-xl">😐</span>
                            </div>
                            <p class="text-3xl font-bold text-yellow-600 mb-1">${recoveryMetrics.passives}</p>
                            <p class="text-xs text-gray-500">Cal. 7-8</p>
                        </div>

                        <!-- Promotores -->
                        <div class="bg-white rounded-xl p-5 shadow-md border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs font-medium text-gray-600">Promotores</span>
                                <span class="text-xl">😊</span>
                            </div>
                            <p class="text-3xl font-bold text-green-600 mb-1">${recoveryMetrics.promoters}</p>
                            <p class="text-xs text-gray-500">Cal. ≥ 9</p>
                        </div>

                        <!-- Acciones de Recuperación -->
                        <div class="bg-white rounded-xl p-5 shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs font-medium text-gray-600">Acciones</span>
                                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <p class="text-3xl font-bold text-blue-600 mb-1">${recoveryMetrics.recoveryActions}</p>
                            <p class="text-xs text-gray-500">Intentos</p>
                        </div>

                        <!-- Recuperaciones Exitosas -->
                        <div class="bg-white rounded-xl p-5 shadow-md border-l-4 border-emerald-500 hover:shadow-lg transition-shadow">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs font-medium text-gray-600">Exitosas</span>
                                <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                </svg>
                            </div>
                            <p class="text-3xl font-bold text-emerald-600 mb-1">${recoveryMetrics.successfulRecoveries}</p>
                            <p class="text-xs text-gray-500">Logradas</p>
                        </div>

                        <!-- Tasa de Efectividad -->
                        <div class="bg-gradient-to-br ${parseFloat(recoveryMetrics.successfulRecoveryRate) >= 70 ? 'from-green-500 to-emerald-600' : parseFloat(recoveryMetrics.successfulRecoveryRate) >= 40 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-pink-600'} rounded-xl p-5 shadow-lg text-white">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs font-medium opacity-90">Efectividad</span>
                                <svg class="w-4 h-4 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                                </svg>
                            </div>
                            <p class="text-4xl font-bold mb-1">${recoveryMetrics.successfulRecoveryRate}%</p>
                            <p class="text-xs opacity-80">
                                ${parseFloat(recoveryMetrics.successfulRecoveryRate) >= 70 ? '🎯 Excelente' :
                                  parseFloat(recoveryMetrics.successfulRecoveryRate) >= 40 ? '📊 Mejorable' : '⚠️ Revisar'}
                            </p>
                        </div>
                    </div>
                </div>
            ` : ''}

            <!-- Análisis de Datos -->
            <div class="mb-6">
                <h2 class="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <svg class="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                    Análisis de Datos
                </h2>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <!-- Distribución por Categoría HVC -->
                    <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                        <h3 class="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                            </svg>
                            Categorías HVC
                        </h3>
                        <div class="space-y-3">
                            ${Object.entries(metrics.categoryCount || {}).length > 0 ?
                                Object.entries(metrics.categoryCount).sort((a, b) => b[1] - a[1]).map(([categoria, count]) => {
                                    const categoryColors = {
                                        'SIGNATURE': 'bg-gradient-to-r from-purple-500 to-pink-500',
                                        'TOP': 'bg-gradient-to-r from-amber-500 to-orange-500',
                                        'BLACK': 'bg-gradient-to-r from-gray-700 to-gray-900',
                                        'PLATINUM': 'bg-gradient-to-r from-cyan-500 to-blue-500',
                                        'GOLD PLUS': 'bg-gradient-to-r from-orange-400 to-yellow-400',
                                        'GOLD': 'bg-gradient-to-r from-yellow-500 to-amber-500'
                                    };
                                    const percentage = ((count / metrics.totalPassengers) * 100).toFixed(1);
                                    return `
                                        <div class="group">
                                            <div class="flex justify-between items-center mb-2">
                                                <span class="text-sm font-medium text-gray-700">${categoria}</span>
                                                <span class="text-sm font-bold text-gray-900">${count} <span class="text-xs text-gray-500">(${percentage}%)</span></span>
                                            </div>
                                            <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                                                <div class="${categoryColors[categoria] || 'bg-blue-600'} h-3 rounded-full transition-all duration-500 group-hover:opacity-90"
                                                     style="width: ${percentage}%"></div>
                                            </div>
                                        </div>
                                    `;
                                }).join('') :
                                '<div class="text-center py-8 text-gray-400"><svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg><p class="text-sm">No hay datos de categorías disponibles</p></div>'
                            }
                        </div>
                    </div>

                    <!-- Servicios Más Solicitados -->
                    <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                        <h3 class="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                            </svg>
                            Servicios Solicitados
                        </h3>
                        <div class="space-y-3">
                            ${Object.entries(metrics.serviciosCount || {}).length > 0 ?
                                Object.entries(metrics.serviciosCount).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([servicio, count]) => {
                                    const maxCount = Math.max(...Object.values(metrics.serviciosCount));
                                    const percentage = ((count / maxCount) * 100).toFixed(1);
                                    const serviceIcons = {
                                        'sala_vip': '🏆',
                                        'fast_track': '⚡',
                                        'asistencia_especial': '🤝',
                                        'upgrade': '⬆️',
                                        'transporte': '🚗',
                                        'concierge': '🔔'
                                    };
                                    return `
                                        <div class="group">
                                            <div class="flex justify-between items-center mb-2">
                                                <span class="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                    <span>${serviceIcons[servicio] || '📋'}</span>
                                                    ${servicio.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </span>
                                                <span class="text-sm font-bold text-gray-900">${count}</span>
                                            </div>
                                            <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                                                <div class="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500 group-hover:opacity-90"
                                                     style="width: ${percentage}%"></div>
                                            </div>
                                        </div>
                                    `;
                                }).join('') :
                                '<div class="text-center py-8 text-gray-400"><svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg><p class="text-sm">No hay datos de servicios disponibles</p></div>'
                            }
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tendencia de Calificaciones (últimos 30 días) -->
            ${metrics.trendData && metrics.trendData.length > 0 ? `
                <div class="bg-white rounded-lg shadow p-6 mb-8">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Tendencia de Satisfacción (30 días)</h3>
                    <div class="h-64">
                        <canvas id="trendChart"></canvas>
                    </div>
                    <script>
                        const ctx = document.getElementById('trendChart').getContext('2d');
                        new Chart(ctx, {
                            type: 'line',
                            data: {
                                labels: ${JSON.stringify(metrics.trendData.map(d => d.date))},
                                datasets: [{
                                    label: 'Calificación Promedio',
                                    data: ${JSON.stringify(metrics.trendData.map(d => d.avg))},
                                    borderColor: 'rgb(59, 130, 246)',
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    tension: 0.4,
                                    fill: true
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: false,
                                        min: 1,
                                        max: 10,
                                        ticks: {
                                            stepSize: 1
                                        }
                                    }
                                },
                                plugins: {
                                    legend: {
                                        display: false
                                    }
                                }
                            }
                        });
                    </script>
                </div>
            ` : ''}

            <!-- Alertas y Recomendaciones -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                        Acciones Prioritarias
                    </h3>
                    <div class="space-y-3">
                        ${metrics.passengersAtRisk > 0 ? `
                            <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div class="flex items-center justify-between">
                                    <span class="text-red-800 font-medium">Atender ${metrics.passengersAtRisk} pasajeros en riesgo</span>
                                    <button onclick="changeView('passenger-tracking')" class="text-red-600 hover:text-red-700 text-sm font-medium">
                                        Ver lista →
                                    </button>
                                </div>
                            </div>
                        ` : `
                            <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <span class="text-green-800 font-medium">¡Excelente! No hay pasajeros en riesgo</span>
                            </div>
                        `}

                        ${airportMetrics && airportMetrics.cumpleanos_hoy > 0 ? `
                            <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div class="flex items-center justify-between">
                                    <span class="text-blue-800 font-medium">${airportMetrics.cumpleanos_hoy} cumpleaños(s) hoy</span>
                                    <button onclick="changeView('passenger-tracking')" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                        Felicitar →
                                    </button>
                                </div>
                            </div>
                        ` : ''}

                        ${metrics.avgMedallia < 7 ? `
                            <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <span class="text-yellow-800 font-medium">Mejorar calificación promedio (${metrics.avgMedallia})</span>
                            </div>
                        ` : metrics.avgMedallia >= 9 ? `
                            <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <span class="text-green-800 font-medium">¡Excelente calificación! (${metrics.avgMedallia})</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                        Estadísticas del Mes
                    </h3>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Tasa de recuperación:</span>
                            <span class="font-bold ${metrics.recoveryRate >= 70 ? 'text-green-600' : metrics.recoveryRate >= 50 ? 'text-yellow-600' : 'text-red-600'}">
                                ${metrics.recoveryRate}%
                            </span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Interacciones promedio/día:</span>
                            <span class="font-bold text-blue-600">
                                ${metrics.totalInteractions ? (metrics.totalInteractions / 30).toFixed(1) : 0}
                            </span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Categoría más frecuente:</span>
                            <span class="font-bold text-purple-600">
                                ${Object.entries(metrics.categoryCount || {}).length > 0 ?
                                    Object.entries(metrics.categoryCount).reduce((a, b) => metrics.categoryCount[a[0]] > metrics.categoryCount[b[0]] ? a : b)[0] :
                                    'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Estado del Sistema -->
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
                            ${window.DB_AVAILABLE ? `
                                <div class="mt-3 grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <span class="text-gray-500">Última actualización:</span>
                                        <br><span class="font-medium">${airportMetrics ? new Date(airportMetrics.ultima_actualizacion).toLocaleString('es-PE') : 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-500">Datos en tiempo real:</span>
                                        <br><span class="font-medium text-green-600">✓ Activos</span>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};
