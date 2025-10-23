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
import { ENHANCED_RECOMMENDATIONS, recommendationManager } from './data/EnhancedRecommendations.js';

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
                    mainContent.innerHTML = renderPassengerInteractionView();
                    // Pequeño delay para asegurar que el DOM esté listo
                    setTimeout(() => {
                        setupInteractionFormHandlers();
                    }, 100);
                } else {
                    // Vista normal de búsqueda
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

            /* Sistema de etiquetas tipo WordPress */
            .tag-input-container {
                position: relative;
            }

            .tag-display {
                min-height: 2.5rem;
            }

            .tag {
                display: inline-flex;
                align-items: center;
                padding: 0.25rem 0.5rem;
                border-radius: 1rem;
                font-size: 0.875rem;
                font-weight: 500;
                cursor: default;
                border: 1px solid;
                transition: all 0.2s ease;
            }

            .tag-purple {
                background-color: rgb(243 232 255);
                color: rgb(107 33 168);
                border-color: rgb(196 181 253);
            }

            .tag-green {
                background-color: rgb(220 252 231);
                color: rgb(20 83 45);
                border-color: rgb(187 247 208);
            }

            .tag-blue {
                background-color: rgb(219 234 254);
                color: rgb(30 64 175);
                border-color: rgb(191 219 254);
            }

            .tag-orange {
                background-color: rgb(255 237 213);
                color: rgb(154 52 18);
                border-color: rgb(254 215 170);
            }

            .tag-remove {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                font-size: 1rem;
                line-height: 1;
                padding: 0;
                margin-left: 0.25rem;
                opacity: 0.7;
                transition: opacity 0.2s ease;
            }

            .tag-remove:hover {
                opacity: 1;
            }

            .tag-input {
                width: 100%;
                padding: 0.5rem 0.75rem;
                border: 2px solid rgb(229 231 235);
                border-radius: 0.5rem;
                font-size: 0.875rem;
                transition: border-color 0.2s ease, box-shadow 0.2s ease;
                background-color: white;
            }

            .tag-input:focus {
                outline: none;
                border-color: rgb(59 130 246);
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            /* Sugerencias de autocompletado */
            .tag-suggestions {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid rgb(229 231 235);
                border-radius: 0.5rem;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                z-index: 50;
                max-height: 200px;
                overflow-y: auto;
                display: none;
            }

            .tag-suggestion {
                padding: 0.5rem 0.75rem;
                cursor: pointer;
                border-bottom: 1px solid rgb(243 244 246);
                font-size: 0.875rem;
                transition: background-color 0.2s ease;
            }

            .tag-suggestion:hover {
                background-color: rgb(243 244 246);
            }

            .tag-suggestion:last-child {
                border-bottom: none;
            }

            /* Nuevos estilos para etiquetas mejoradas */
            .tag-input-container {
                position: relative;
            }

            .tag-display {
                min-height: 2.5rem;
                position: relative;
            }

            .tag {
                display: inline-flex;
                align-items: center;
                padding: 0.5rem 0.75rem;
                border-radius: 1.5rem;
                font-size: 0.875rem;
                font-weight: 500;
                cursor: default;
                border: 1px solid;
                transition: all 0.2s ease;
                margin: 0.125rem;
            }

            .tag:hover {
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .tag-purple {
                background-color: rgb(243 232 255);
                color: rgb(107 33 168);
                border-color: rgb(196 181 253);
            }

            .tag-green {
                background-color: rgb(220 252 231);
                color: rgb(20 83 45);
                border-color: rgb(187 247 208);
            }

            .tag-blue {
                background-color: rgb(219 234 254);
                color: rgb(30 64 175);
                border-color: rgb(191 219 254);
            }

            .tag-orange {
                background-color: rgb(255 237 213);
                color: rgb(154 52 18);
                border-color: rgb(254 215 170);
            }

            .tag-red {
                background-color: rgb(254 226 226);
                color: rgb(153 27 27);
                border-color: rgb(252 165 165);
            }

            .tag-gray {
                background-color: rgb(243 244 246);
                color: rgb(31 41 55);
                border-color: rgb(209 213 219);
            }

            .tag-red {
                background-color: rgb(254 226 226);
                color: rgb(153 27 27);
                border-color: rgb(252 165 165);
            }

            .tag-gray {
                background-color: rgb(243 244 246);
                color: rgb(31 41 55);
                border-color: rgb(209 213 219);
            }

            .tag-remove {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                font-size: 1rem;
                line-height: 1;
                padding: 0;
                margin-left: 0.25rem;
                opacity: 0.7;
                transition: all 0.2s ease;
                border-radius: 50%;
                width: 1.25rem;
                height: 1.25rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .tag-remove:hover {
                opacity: 1;
                background-color: rgba(0, 0, 0, 0.1);
            }

            .tag-input {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid rgb(229 231 235);
                border-radius: 0.5rem;
                font-size: 0.875rem;
                transition: border-color 0.2s ease, box-shadow 0.2s ease;
                background-color: white;
            }

            .tag-input:focus {
                outline: none;
                border-color: rgb(59 130 246);
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            /* Sugerencias mejoradas */
            .tag-suggestions {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid rgb(229 231 235);
                border-radius: 0.5rem;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                z-index: 50;
                max-height: 200px;
                overflow-y: auto;
                display: none;
            }

            .tag-suggestion {
                padding: 0.75rem;
                cursor: pointer;
                border-bottom: 1px solid rgb(243 244 246);
                font-size: 0.875rem;
                transition: background-color 0.2s ease;
            }

            .tag-suggestion:hover {
                background-color: rgb(243 244 246);
            }

            .tag-suggestion:last-child {
                border-bottom: none;
            }

            /* Hacer que las sugerencias sean más clickeables */
            .tag-suggestion {
                padding: 0.75rem;
                cursor: pointer;
                border-bottom: 1px solid rgb(243 244 246);
                font-size: 0.875rem;
                transition: background-color 0.2s ease;
                user-select: none;
            }

            .tag-suggestion:hover {
                background-color: rgb(243 244 246);
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

        // Refrescar automáticamente la lista de pasajeros del día
        setTimeout(() => {
            const state = StateManager.getState();
            if (state.currentView === CONSTANTS.VIEWS.PASSENGER_SEARCH) {
                render();
            }
        }, 1000);

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
        const results = await ApiService.searchPassengers(query, state.currentAirport);

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

        // Obtener vuelos de hoy para sugerencias - Fecha actual del sistema
        const today = new Date().toISOString().split('T')[0];
        let todayFlights = [];
        try {
            todayFlights = await ApiService.getFlightsByDate(today, state.currentAirport);
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

// Función para ver timeline completo de un pasajero
window.viewPassengerTimeline = async function(passengerId) {
    try {
        showNotification('Cargando historial completo...', 'info');

        const passenger = await ApiService.getPassengerById(passengerId);
        const interactions = await ApiService.getPassengerInteractions(passengerId);

        // Mostrar el modal directamente con el timeline completo
        await showPassengerModal(passenger, interactions);

    } catch (error) {
        console.error('Error loading passenger timeline:', error);
        showNotification('Error al cargar historial del pasajero', 'error');
    }
};

// Función para filtrar tracking de pasajeros
window.filterTracking = function() {
    const searchInput = document.getElementById('trackingSearchInput');
    const filterStatus = document.getElementById('trackingFilterStatus');
    const filterCategory = document.getElementById('trackingFilterCategory');

    if (!searchInput || !filterStatus || !filterCategory) return;

    const searchTerm = searchInput.value.toLowerCase();
    const statusFilter = filterStatus.value;
    const categoryFilter = filterCategory.value;

    // Obtener todas las secciones
    const riskSection = document.querySelector('[data-section="risk"]');
    const recoveredSection = document.querySelector('[data-section="recovered"]');
    const birthdaySection = document.querySelector('[data-section="birthday"]');
    const recentSection = document.querySelector('[data-section="recent"]');

    // Mostrar/ocultar secciones según filtro de estado
    if (statusFilter === 'all') {
        if (riskSection) riskSection.style.display = 'block';
        if (recoveredSection) recoveredSection.style.display = 'block';
        if (birthdaySection) birthdaySection.style.display = 'block';
        if (recentSection) recentSection.style.display = 'block';
    } else {
        if (riskSection) riskSection.style.display = statusFilter === 'risk' ? 'block' : 'none';
        if (recoveredSection) recoveredSection.style.display = statusFilter === 'recovered' ? 'block' : 'none';
        if (birthdaySection) birthdaySection.style.display = statusFilter === 'birthday' ? 'block' : 'none';
        if (recentSection) recentSection.style.display = statusFilter === 'recent' ? 'block' : 'none';
    }

    // Filtrar tarjetas individuales por búsqueda y categoría con selector más específico
    const allCards = document.querySelectorAll('[data-passenger-card]');
    let visibleCount = 0;

    allCards.forEach(card => {
        const cardText = card.textContent.toLowerCase();
        const cardCategory = card.getAttribute('data-category') || '';

        const matchesSearch = searchTerm === '' || cardText.includes(searchTerm);
        const matchesCategory = categoryFilter === 'all' || cardCategory === categoryFilter;

        if (matchesSearch && matchesCategory) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Filtros aplicados exitosamente
};

// Funciones para el Dashboard

// Función para limpiar modales duplicados
function cleanupDuplicateModals() {
    // Eliminar cualquier modal de recomendaciones existente
    const existingModals = document.querySelectorAll('#enhancedRecommendationsModal');
    existingModals.forEach(modal => modal.remove());
    
    // Limpiar event listeners duplicados
    const searchInput = document.getElementById('recommendationsSearch');
    if (searchInput) {
        searchInput.removeEventListener('input', filterRecommendations);
    }
    
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.removeEventListener('change', filterRecommendations);
    }
}

// Mostrar recomendaciones HVC - SIEMPRE en página estándar
window.showManualRecommendations = function() {
    // Limpiar cualquier modal existente
    cleanupDuplicateModals();
    
    // SIEMPRE abrir en nueva pestaña/página (no más popup)
    window.open('/recommendations.html', '_blank');
};

// Función para renderizar el modal principal
function renderModal() {
    return `
        <div id="enhancedRecommendationsModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div class="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
                <!-- Header Mejorado -->
                <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 sm:p-6 text-white">
                    <div class="flex justify-between items-start gap-4">
                        <div class="flex-1 min-w-0">
                            <h2 class="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-2">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                                </svg>
                                <span class="truncate" id="modal-title">Herramienta de Recomendaciones HVC</span>
                            </h2>
                            <p class="text-indigo-100 text-sm sm:text-base">Basado en el Manual de Excelencia HVC - Aeropuerto de Jauja</p>
                        </div>
                        <button onclick="closeModal('enhancedRecommendationsModal')" class="text-white hover:bg-white/20 rounded-lg p-2 transition flex-shrink-0">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Barra de búsqueda y filtros -->
                    <div class="mt-4 space-y-3">
                        <div class="flex flex-col sm:flex-row gap-3">
                            <div class="flex-1">
                                <div class="relative">
                                    <input type="text" id="recommendationsSearch" placeholder="Buscar recomendaciones..."
                                           class="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/70 focus:ring-2 focus:ring-white/30 focus:border-white/50 transition">
                                    <svg class="w-5 h-5 absolute left-3 top-2.5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                    </svg>
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <select id="categoryFilter" class="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-white/30 focus:border-white/50 transition">
                                    <option value="all" class="text-gray-800">Todas las categorías</option>
                                    ${Object.values(ENHANCED_RECOMMENDATIONS.CATEGORIES).map(cat => `
                                        <option value="${cat.id}" class="text-gray-800">${cat.icon} ${cat.name}</option>
                                    `).join('')}
                                </select>
                                <button id="favoritesBtn" class="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition flex items-center gap-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                                    </svg>
                                    <span class="hidden sm:inline">Favoritos</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Contenido del modal -->
                <div class="flex flex-col lg:flex-row max-h-[calc(95vh-200px)]">
                    <!-- Panel lateral de navegación -->
                    <div class="lg:w-80 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
                        <div class="space-y-2">
                            <h3 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                                </svg>
                                Categorías
                            </h3>
                            ${Object.values(ENHANCED_RECOMMENDATIONS.CATEGORIES).map(cat => `
                                <button onclick="filterByCategory('${cat.id}')" class="category-btn w-full text-left p-3 rounded-lg hover:bg-white transition border border-transparent hover:border-gray-200" data-category="${cat.id}">
                                    <div class="flex items-center gap-3">
                                        <span class="text-2xl">${cat.icon}</span>
                                        <div class="flex-1 min-w-0">
                                            <h4 class="font-semibold text-gray-800 truncate">${cat.name}</h4>
                                            <p class="text-sm text-gray-600 truncate">${cat.description}</p>
                                        </div>
                                    </div>
                                </button>
                            `).join('')}
                        </div>

                        <!-- Estadísticas rápidas -->
                        <div class="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                            <h4 class="font-semibold text-gray-800 mb-3">📊 Tu Progreso</h4>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Favoritos:</span>
                                    <span class="font-semibold text-indigo-600">${recommendationManager.getFavorites().length}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Usadas hoy:</span>
                                    <span class="font-semibold text-green-600">${recommendationManager.getTodayUsage()}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Más útil:</span>
                                    <span class="font-semibold text-purple-600 truncate text-xs">${recommendationManager.getMostUsed()[0]?.title || 'Ninguna'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Panel principal de contenido -->
                    <div class="flex-1 p-4 overflow-y-auto">
                        <div id="recommendationsContent">
                            ${renderContent()}
                        </div>
                    </div>
                </div>

                <!-- Footer con acciones -->
                <div class="border-t border-gray-200 p-4 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div class="text-sm text-gray-600">
                        📚 <strong>${Object.keys(ENHANCED_RECOMMENDATIONS.RECOMMENDATIONS).length}</strong> recomendaciones disponibles
                        • Basado en investigación científica y mejores prácticas
                    </div>
                    <div class="flex gap-2">
                        <button onclick="exportRecommendations()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            Exportar
                        </button>
                        <button onclick="showTutorial()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Tutorial
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Función para renderizar el contenido principal
function renderContent() {
    return `
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold text-gray-800">Todas las Recomendaciones</h3>
                <div class="text-sm text-gray-500">
                    <span id="resultsCount">${Object.keys(ENHANCED_RECOMMENDATIONS.RECOMMENDATIONS).length}</span> resultados
                </div>
            </div>
            ${renderRecommendationsList()}
        </div>
    `;
}

// Función para renderizar la lista de recomendaciones
function renderRecommendationsList(filteredRecs = null) {
    const recommendations = filteredRecs || Object.values(ENHANCED_RECOMMENDATIONS.RECOMMENDATIONS);
    const favorites = recommendationManager.getFavorites();

    return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${recommendations.map(rec => {
                const category = ENHANCED_RECOMMENDATIONS.CATEGORIES[rec.category];
                const isFavorite = favorites.includes(rec.id);
                const priorityColors = {
                    'critical': 'border-red-300 bg-red-50',
                    'high': 'border-orange-300 bg-orange-50',
                    'medium': 'border-yellow-300 bg-yellow-50',
                    'low': 'border-gray-300 bg-gray-50'
                };

                return `
                    <div class="bg-white border-2 ${priorityColors[rec.priority]} rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer group"
                         onclick="showDetailedRecommendation('${rec.id}')">
                        <div class="flex items-start justify-between mb-3">
                            <div class="flex items-center gap-3">
                                <span class="text-2xl">${rec.icon}</span>
                                <div class="flex-1 min-w-0">
                                    <h4 class="font-bold text-gray-900 text-sm sm:text-base truncate break-words">${rec.title}</h4>
                                    <div class="flex items-center gap-2 mt-1">
                                        <span class="text-xs px-2 py-1 ${category.color} text-white rounded-full">${category.icon} ${category.name}</span>
                                        <span class="text-xs text-gray-500">${rec.estimatedTime}</span>
                                    </div>
                                </div>
                            </div>
                            <button onclick="event.stopPropagation(); toggleFavorite('${rec.id}')"
                                    class="text-gray-400 hover:text-red-500 transition p-1">
                                <svg class="w-5 h-5 ${isFavorite ? 'fill-current text-red-500' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                                </svg>
                            </button>
                        </div>

                        <p class="text-sm text-gray-600 mb-3 line-clamp-2">${rec.description}</p>

                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-medium text-green-600">${rec.impact}</span>
                                ${rec.priority === 'critical' ? '<span class="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">🔴 Crítico</span>' : ''}
                            </div>
                            <div class="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition">
                                Ver detalles →
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Función para renderizar recomendación detallada
function renderDetailedRecommendation(recId) {
    const rec = ENHANCED_RECOMMENDATIONS.RECOMMENDATIONS[recId];
    if (!rec) return '';

    const category = ENHANCED_RECOMMENDATIONS.CATEGORIES[rec.category];
    const isFavorite = recommendationManager.getFavorites().includes(recId);

    return `
        <div class="max-w-4xl mx-auto" data-recommendation-id="${recId}">
            <!-- Header de la recomendación -->
            <div class="bg-gradient-to-r ${category.color} rounded-xl p-6 text-white mb-6">
                <div class="flex items-start justify-between">
                    <div class="flex items-center gap-4 min-w-0">
                        <span class="text-4xl">${rec.icon}</span>
                        <div class="min-w-0">
                            <h2 class="text-2xl font-bold mb-1 truncate">${rec.title}</h2>
                            <div class="flex items-center gap-2">
                                <span class="px-3 py-1 bg-white/20 rounded-full text-sm">${category.icon} ${category.name}</span>
                                <span class="text-sm opacity-90">${rec.estimatedTime}</span>
                            </div>
                        </div>
                    </div>
                    <button onclick="toggleFavorite('${recId}')"
                            class="text-white hover:text-red-300 transition p-2">
                        <svg class="w-6 h-6 ${isFavorite ? 'fill-current text-red-300' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                    </button>
                </div>
                <p class="text-white/90 mt-3">${rec.description}</p>
            </div>

            <!-- Métricas y acciones rápidas -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-2">
                        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                        </svg>
                        <span class="font-semibold text-green-800">Impacto</span>
                    </div>
                    <p class="text-green-700 font-bold">${rec.impact}</p>
                </div>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-2">
                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span class="font-semibold text-blue-800">Prioridad</span>
                    </div>
                    <p class="text-blue-700 font-bold capitalize">${rec.priority}</p>
                </div>
                <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-2">
                        <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                        </svg>
                        <span class="font-semibold text-purple-800">Referencia</span>
                    </div>
                    <p class="text-purple-700 text-sm">${rec.manualReference}</p>
                </div>
            </div>

            <!-- Acciones rápidas -->
            <div class="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    Acciones Rápidas
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    ${rec.quickActions.map((action, index) => `
                        <div class="flex items-start gap-2 p-2 bg-white rounded-lg border border-gray-200">
                            <span class="text-green-600 font-bold flex-shrink-0">${index + 1}.</span>
                            <p class="text-sm text-gray-700">${action}</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Pasos detallados -->
            <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    Guía Paso a Paso
                </h3>
                <div class="space-y-4">
                    ${rec.detailedSteps.map((step, index) => `
                        <div class="border-l-4 border-blue-400 pl-4 py-2">
                            <h4 class="font-semibold text-gray-800 mb-2">${step.phase}</h4>
                            <ul class="text-gray-600 text-sm mb-2 list-disc list-inside space-y-1">
                                ${step.actions.map(action => `<li>${action}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Checklist interactivo -->
            <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    Checklist de Ejecución
                </h3>
                <div class="space-y-3">
                    ${rec.checklist.map((item, index) => `
                        <label class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                            <input type="checkbox"
                                   onchange="updateChecklist('${recId}', ${index}, this.checked)"
                                   class="mt-1 w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                                   ${recommendationManager.getChecklistState(recId)[index]?.completed ? 'checked' : ''}>
                            <div class="flex-1">
                                <p class="text-sm font-medium text-gray-800">${item.item}</p>
                            </div>
                        </label>
                    `).join('')}
                </div>
                <div class="mt-4 pt-4 border-t border-gray-200">
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-600">Progreso:</span>
                        <span class="font-semibold text-green-600 checklist-progress-text">
                            ${recommendationManager.getChecklistProgress(recId)}% completado
                        </span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div class="bg-green-600 h-2 rounded-full transition-all duration-300 checklist-progress-bar"
                             style="width: ${recommendationManager.getChecklistProgress(recId)}%"></div>
                    </div>
                </div>
            </div>

            <!-- Ejemplos prácticos -->
            ${rec.examples && rec.examples.length > 0 ? `
                <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                    <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                        </svg>
                        Ejemplos Prácticos
                    </h3>
                    <div class="space-y-4">
                        ${rec.examples.map(example => `
                            <div class="border-l-4 border-gray-300 pl-4 py-2">
                                <h4 class="font-semibold text-gray-800 mb-2">Escenario: ${example.scenario}</h4>
                                <div class="bg-red-50 p-2 rounded-lg mb-2">
                                    <p class="text-sm text-red-800">${example.bad}</p>
                                </div>
                                <div class="bg-green-50 p-2 rounded-lg">
                                    <p class="text-sm text-green-800">${example.good}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- Frases clave y errores comunes -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                ${rec.keyPhrases ? `
                    <div class="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                            </svg>
                            Frases Clave
                        </h3>
                        <div class="space-y-2">
                            ${rec.keyPhrases.map(phrase => `
                                <div class="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                    <p class="text-sm text-blue-800 italic">"${phrase}"</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${rec.commonPitfalls ? `
                    <div class="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L4.082 16c-.77 1.333.192 3 1.732 3z"/>
                            </svg>
                            Errores Comunes
                        </h3>
                        <div class="space-y-2">
                            ${rec.commonPitfalls.map(pitfall => `
                                <div class="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                                    <p class="text-sm text-red-800">❌ ${pitfall}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>

            <!-- Acciones finales -->
            <div class="flex flex-col sm:flex-row gap-3">
                <button onclick="shareRecommendation('${recId}')" class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                    </svg>
                    Compartir con colegas
                </button>
                <button onclick="closeDetailedView()" class="flex-1 sm:flex-initial bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition font-medium">
                    Cerrar
                </button>
            </div>
        </div>
    `;
}

// Función para configurar los handlers del modal mejorado
function setupEnhancedRecommendationsHandlers() {
    // Handler de búsqueda con debounce para mejor rendimiento
    const searchInput = document.getElementById('recommendationsSearch');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(filterRecommendations, 300);
        });
    }

    // Handler de filtro de categoría
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterRecommendations);
    }

    // Handler de botón favoritos
    const favoritesBtn = document.getElementById('favoritesBtn');
    if (favoritesBtn) {
        favoritesBtn.addEventListener('click', () => {
            const isActive = favoritesBtn.classList.contains('active');
            if (isActive) {
                favoritesBtn.classList.remove('active', 'bg-white/30');
                favoritesBtn.classList.add('bg-white/10');
                filterRecommendations();
            } else {
                favoritesBtn.classList.add('active', 'bg-white/30');
                favoritesBtn.classList.remove('bg-white/10');
                showFavoritesOnly();
            }
        });
    }

    // Agregar navegación por teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('enhancedRecommendationsModal');
        }
    });
}

// Función para filtrar recomendaciones con optimizaciones de rendimiento
function filterRecommendations() {
    const searchTerm = document.getElementById('recommendationsSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const isFavoritesOnly = document.getElementById('favoritesBtn').classList.contains('active');

    // Usar requestAnimationFrame para optimizar el rendimiento
    requestAnimationFrame(() => {
        let filteredRecs = Object.values(ENHANCED_RECOMMENDATIONS.RECOMMENDATIONS);

        // Filtrar por favoritos si está activo
        if (isFavoritesOnly) {
            const favorites = recommendationManager.getFavorites();
            filteredRecs = filteredRecs.filter(rec => favorites.includes(rec.id));
        }

        // Filtrar por categoría
        if (categoryFilter !== 'all') {
            filteredRecs = filteredRecs.filter(rec => rec.category === categoryFilter);
        }

        // Filtrar por búsqueda
        if (searchTerm) {
            filteredRecs = filteredRecs.filter(rec =>
                rec.title.toLowerCase().includes(searchTerm) ||
                rec.description.toLowerCase().includes(searchTerm) ||
                rec.quickActions.some(action => action.toLowerCase().includes(searchTerm))
            );
        }

        // Actualizar contador
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            resultsCount.textContent = filteredRecs.length;
        }

        // Renderizar lista filtrada
        const content = document.getElementById('recommendationsContent');
        if (content) {
            content.innerHTML = `
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <h3 class="text-xl font-bold text-gray-800">
                            ${isFavoritesOnly ? 'Recomendaciones Favoritas' : 'Recomendaciones Filtradas'}
                        </h3>
                        <div class="text-sm text-gray-500">
                            <span id="resultsCount">${filteredRecs.length}</span> resultados
                        </div>
                    </div>
                    ${renderRecommendationsList(filteredRecs)}
                </div>
            `;
        }
    });
}

// Función para mostrar solo favoritos
function showFavoritesOnly() {
    const favorites = recommendationManager.getFavorites();
    const favoriteRecs = Object.values(ENHANCED_RECOMMENDATIONS.RECOMMENDATIONS)
        .filter(rec => favorites.includes(rec.id));

    document.getElementById('recommendationsContent').innerHTML = `
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold text-gray-800">Recomendaciones Favoritas</h3>
                <div class="text-sm text-gray-500">
                    <span id="resultsCount">${favoriteRecs.length}</span> favoritos
                </div>
            </div>
            ${renderRecommendationsList(favoriteRecs)}
        </div>
    `;
}

// Función para filtrar por categoría
function filterByCategory(categoryId) {
    // Actualizar botón activo
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('bg-blue-50', 'border-blue-300');
        btn.classList.add('border-transparent');
    });

    const activeBtn = document.querySelector(`[data-category="${categoryId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('bg-blue-50', 'border-blue-300');
        activeBtn.classList.remove('border-transparent');
    }

    // Filtrar recomendaciones
    const categoryRecs = Object.values(ENHANCED_RECOMMENDATIONS.RECOMMENDATIONS)
        .filter(rec => rec.category === categoryId);

    document.getElementById('recommendationsContent').innerHTML = `
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold text-gray-800">
                    ${ENHANCED_RECOMMENDATIONS.CATEGORIES[categoryId]?.icon || '📋'} ${ENHANCED_RECOMMENDATIONS.CATEGORIES[categoryId]?.name || 'General'}
                </h3>
                <div class="text-sm text-gray-500">
                    <span id="resultsCount">${categoryRecs.length}</span> recomendaciones
                </div>
            </div>
            ${renderRecommendationsList(categoryRecs)}
        </div>
    `;
}

// Función para mostrar recomendación detallada
function showDetailedRecommendation(recId) {
    const content = renderDetailedRecommendation(recId);
    document.getElementById('recommendationsContent').innerHTML = content;

    // Track usage
    recommendationManager.trackUsage(recId);
}

// Función para cerrar vista detallada
function closeDetailedView() {
    document.getElementById('recommendationsContent').innerHTML = renderContent();
}

// Función para alternar favoritos
function toggleFavorite(recId) {
    recommendationManager.toggleFavorite(recId);
    // Re-renderizar si estamos en vista detallada
    const detailedView = document.querySelector('[data-recommendation-id]');
    if (detailedView) {
        showDetailedRecommendation(recId);
    } else {
        filterRecommendations();
    }
}


// Función para compartir recomendación
function shareRecommendation(recId) {
    const rec = ENHANCED_RECOMMENDATIONS.RECOMMENDATIONS[recId];
    if (navigator.share) {
        navigator.share({
            title: rec.title,
            text: rec.description,
            url: window.location.href
        });
    } else {
        // Fallback: copiar al portapapeles
        navigator.clipboard.writeText(`${rec.title}\n${rec.description}\n${window.location.href}`);
        showNotification('Recomendación copiada al portapapeles', 'success');
    }
}

// Función para exportar recomendaciones
function exportRecommendations() {
    const data = {
        recommendations: ENHANCED_RECOMMENDATIONS,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recomendaciones-hvc-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Recomendaciones exportadas exitosamente', 'success');
}

// Funciones globales para el modal de recomendaciones mejorado

// Función para mostrar recomendación detallada
window.showDetailedRecommendation = function(recId) {
    const content = renderDetailedRecommendation(recId);
    document.getElementById('recommendationsContent').innerHTML = content;

    // Track usage
    recommendationManager.trackUsage(recId);
};

// Función para cerrar vista detallada
window.closeDetailedView = function() {
    document.getElementById('recommendationsContent').innerHTML = renderContent();
};

// Función para alternar favoritos
window.toggleFavorite = function(recId) {
    recommendationManager.toggleFavorite(recId);
    // Re-renderizar si estamos en vista detallada
    const detailedView = document.querySelector('[data-recommendation-id]');
    if (detailedView) {
        showDetailedRecommendation(recId);
    } else {
        filterRecommendations();
    }
};

// Función para actualizar checklist
window.updateChecklist = function(recId, index, checked) {
    recommendationManager.updateChecklistState(recId, index, checked);
    
    // Actualizar progreso en vista detallada
    const progressText = document.querySelector(`[data-recommendation-id="${recId}"] .checklist-progress-text`);
    const progressBar = document.querySelector(`[data-recommendation-id="${recId}"] .checklist-progress-bar`);
    
    if (progressText && progressBar) {
        const progress = recommendationManager.getChecklistProgress(recId);
        progressText.textContent = `${progress}% completado`;
        progressBar.style.width = `${progress}%`;
    }
};

// Función para compartir recomendación
window.shareRecommendation = function(recId) {
    const rec = ENHANCED_RECOMMENDATIONS.RECOMMENDATIONS[recId];
    if (navigator.share) {
        navigator.share({
            title: rec.title,
            text: rec.description,
            url: window.location.href
        });
    } else {
        // Fallback: copiar al portapapeles
        navigator.clipboard.writeText(`${rec.title}\n${rec.description}\n${window.location.href}`);
        showNotification('Recomendación copiada al portapapeles', 'success');
    }
};

// Función para exportar recomendaciones
window.exportRecommendations = function() {
    const data = {
        recommendations: ENHANCED_RECOMMENDATIONS,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recomendaciones-hvc-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Recomendaciones exportadas exitosamente', 'success');
};

// Función para mostrar tutorial
window.showTutorial = function() {
    showNotification('Tutorial próximamente disponible', 'info');
};

// Función para filtrar por categoría
window.filterByCategory = function(categoryId) {
    // Actualizar botón activo
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('bg-blue-50', 'border-blue-300');
        btn.classList.add('border-transparent');
    });

    const activeBtn = document.querySelector(`[data-category="${categoryId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('bg-blue-50', 'border-blue-300');
        activeBtn.classList.remove('border-transparent');
    }

    // Filtrar recomendaciones
    const categoryRecs = Object.values(ENHANCED_RECOMMENDATIONS.RECOMMENDATIONS)
        .filter(rec => rec.category === categoryId);

    document.getElementById('recommendationsContent').innerHTML = `
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold text-gray-800">
                    ${ENHANCED_RECOMMENDATIONS.CATEGORIES[categoryId]?.icon} ${ENHANCED_RECOMMENDATIONS.CATEGORIES[categoryId]?.name}
                </h3>
                <div class="text-sm text-gray-500">
                    <span id="resultsCount">${categoryRecs.length}</span> recomendaciones
                </div>
            </div>
            ${renderRecommendationsList(categoryRecs)}
        </div>
    `;
};

// Función para mostrar solo favoritos
window.showFavoritesOnly = function() {
    const favorites = recommendationManager.getFavorites();
    const favoriteRecs = Object.values(ENHANCED_RECOMMENDATIONS.RECOMMENDATIONS)
        .filter(rec => favorites.includes(rec.id));

    document.getElementById('recommendationsContent').innerHTML = `
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold text-gray-800">Recomendaciones Favoritas</h3>
                <div class="text-sm text-gray-500">
                    <span id="resultsCount">${favoriteRecs.length}</span> favoritos
                </div>
            </div>
            ${renderRecommendationsList(favoriteRecs)}
        </div>
    `;
};

// Función para filtrar recomendaciones con optimizaciones de rendimiento
window.filterRecommendations = function() {
    const searchTerm = document.getElementById('recommendationsSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const isFavoritesOnly = document.getElementById('favoritesBtn').classList.contains('active');

    // Usar requestAnimationFrame para optimizar el rendimiento
    requestAnimationFrame(() => {
        let filteredRecs = Object.values(ENHANCED_RECOMMENDATIONS.RECOMMENDATIONS);

        // Filtrar por favoritos si está activo
        if (isFavoritesOnly) {
            const favorites = recommendationManager.getFavorites();
            filteredRecs = filteredRecs.filter(rec => favorites.includes(rec.id));
        }

        // Filtrar por categoría
        if (categoryFilter !== 'all') {
            filteredRecs = filteredRecs.filter(rec => rec.category === categoryFilter);
        }

        // Filtrar por búsqueda
        if (searchTerm) {
            filteredRecs = filteredRecs.filter(rec =>
                rec.title.toLowerCase().includes(searchTerm) ||
                rec.description.toLowerCase().includes(searchTerm) ||
                rec.quickActions.some(action => action.toLowerCase().includes(searchTerm))
            );
        }

        // Actualizar contador
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            resultsCount.textContent = filteredRecs.length;
        }

        // Renderizar lista filtrada
        const content = document.getElementById('recommendationsContent');
        if (content) {
            content.innerHTML = `
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <h3 class="text-xl font-bold text-gray-800">
                            ${isFavoritesOnly ? 'Recomendaciones Favoritas' : 'Recomendaciones Filtradas'}
                        </h3>
                        <div class="text-sm text-gray-500">
                            <span id="resultsCount">${filteredRecs.length}</span> resultados
                        </div>
                    </div>
                    ${renderRecommendationsList(filteredRecs)}
                </div>
            `;
        }
    });
};

// Mostrar detalle científico completo de cada recomendación
window.showScientificDetail = function(detailId) {
    const detailedGuides = {
        science_proactive: {
            title: '💬 Comunicación Proactiva',
            gradient: 'from-blue-600 to-cyan-600',
            impact: '+40% mejora en percepción del servicio',
            principle: 'La incertidumbre genera más estrés que el problema mismo',
            scientificBasis: 'Estudios de psicología del estrés demuestran que cuando las personas no tienen información, su cerebro asume el peor escenario posible. Informar proactivamente reduce la ansiedad y genera confianza, incluso cuando las noticias no son positivas.',
            steps: [
                {
                    subtitle: '1️⃣ Antes de que Pregunten',
                    content: 'Monitorea constantemente cambios (retrasos, puertas, cancelaciones). Si detectas algo, acércate AL PASAJERO antes de que lo descubra. Usa: "Quiero informarle primero que..." - esto genera sentimiento VIP.'
                },
                {
                    subtitle: '2️⃣ Estructura 4W (What, Why, What we do, What you can do)',
                    content: '• QUÉ está pasando: "Retraso de 30 minutos"\n• POR QUÉ: "Condiciones climáticas en destino"\n• QUÉ hacemos: "Priorizamos su despegue apenas mejore"\n• QUÉ puede hacer: "Permíteme acompañarle y traerle un café"'
                },
                {
                    subtitle: '3️⃣ Actualizaciones Regulares',
                    content: 'Cada 15-20 min en esperas. Aunque no haya novedades: "Sigo monitoreando, le aviso apenas sepa algo". Esto evita que busquen info por su cuenta y se frustren.'
                },
                {
                    subtitle: '🧠 Base Científica',
                    content: 'Neurociencia: Cuando TÚ informas primero, el pasajero activa su corteza prefrontal (área de control), no su amígdala (área de pánico). Reduce quejas en 40% (Harvard Business Review, 2022).'
                }
            ],
            examples: [
                { bad: '❌ Esperar a que el pasajero pregunte por el retraso', good: '✅ Acercarse proactivamente: "Sr. López, quiero informarle que tenemos 20 min de retraso por tráfico aéreo"' },
                { bad: '❌ "Hay un retraso" (sin más contexto)', good: '✅ "Retraso de 30 min por clima. Estamos priorizando despegue. Permíteme acompañarle y traerle un café"' }
            ]
        },
        science_personalization: {
            title: '✨ Personalización de Experiencia',
            gradient: 'from-purple-600 to-pink-600',
            impact: '+60% aumento en lealtad del cliente',
            principle: 'Las personas recuerdan cómo las hiciste sentir',
            scientificBasis: 'Efecto "Cheers" (como el bar donde todos saben tu nombre): Cuando reconoces a alguien personalmente, activas los centros de recompensa social en su cerebro. Esto crea conexión emocional y lealtad.',
            steps: [
                {
                    subtitle: '1️⃣ Revisar Perfil ANTES de Atender',
                    content: '30 segundos antes: Gustos (bebida favorita), preferencias (ventana/pasillo), historial (vuelos previos, incidentes). Esta preparación hace ENORME diferencia.'
                },
                {
                    subtitle: '2️⃣ Usar Info Sutilmente',
                    content: '❌ MAL: "Veo en el sistema que te gusta café"\n✅ BIEN: "¿Le gustaría un café mientras espera?"\n\nActúa como si lo recordaras naturalmente, no como robot leyendo pantalla.'
                },
                {
                    subtitle: '3️⃣ Sorpresas Basadas en Datos',
                    content: '• Si prefiere ventana → Ofrecerla proactivamente\n• Cumpleaños cercano → Detalle especial\n• Viajero frecuente → "Bienvenido de nuevo, Sr. García"\n• Problema anterior → "Hoy me aseguraré que todo sea perfecto"'
                },
                {
                    subtitle: '4️⃣ Registrar Nueva Info',
                    content: 'En CADA interacción, pregunta sutilmente y REGISTRA:\n"¿Cómo prefiere contacto?" → Actualizar\n"¿Restricciones alimentarias?" → Agregar\n\nEsto mejora la PRÓXIMA experiencia.'
                },
                {
                    subtitle: '🧠 Base Científica',
                    content: 'Clientes con experiencias personalizadas tienen 60% más lealtad y pagan hasta 20% más por el servicio (McKinsey, 2021). NPS aumenta en promedio +18 puntos.'
                }
            ],
            examples: [
                { bad: '❌ Tratar a todos igual sin revisar perfil', good: '✅ "Sr. García, bienvenido de nuevo. ¿Le gustaría su asiento habitual en ventana?"' },
                { bad: '❌ "El sistema dice que es tu cumpleaños"', good: '✅ "¡Qué coincidencia volar en su día especial! ¿Le gustaría una foto con la tripulación?"' }
            ]
        },
        science_empathy: {
            title: '💚 Empatía y Escucha Activa',
            gradient: 'from-green-600 to-emerald-600',
            impact: '-70% en escalamiento de conflictos',
            principle: 'Las personas primero quieren sentirse ESCUCHADAS, después quieren soluciones',
            scientificBasis: 'Neurociencia: La validación emocional activa el "sistema de recompensa social" en el cerebro (mismo que se activa con comida o dinero). Esto reduce cortisol (hormona de estrés) y hace al pasajero más receptivo.',
            steps: [
                {
                    subtitle: '1️⃣ Escucha PRIMERO, Soluciona DESPUÉS',
                    content: '❌ MAL: Interrumpir con soluciones\n✅ BIEN: Dejar que expresen TODO\n\nLenguaje corporal: contacto visual, asentir, inclinarte. Silencio estratégico: espera 2-3 seg después de que terminen.'
                },
                {
                    subtitle: '2️⃣ Validar Emociones (NO el problema)',
                    content: 'Frases mágicas:\n• "Entiendo su frustración, es totalmente comprensible"\n• "Si estuviera en su lugar, también estaría molesto"\n• "Tiene razón en sentirse así"\n\nIMPORTANTE: Validas EMOCIÓN, no el reclamo.'
                },
                {
                    subtitle: '3️⃣ Técnica del Espejo',
                    content: 'Repite con tus palabras:\n"Si entendí bien, el problema es que... ¿correcto?"\n\nEsto demuestra que REALMENTE escuchaste. 80% de quejas se reducen SOLO con esto.'
                },
                {
                    subtitle: '4️⃣ Cambiar "PERO" por "Y"',
                    content: '❌ MAL: "Entiendo, PERO nuestras políticas..."\n✅ BIEN: "Entiendo, Y permítame ver qué puedo hacer..."\n\n"Pero" invalida todo. "Y" mantiene conexión.'
                },
                {
                    subtitle: '5️⃣ Ofrecer Control',
                    content: '• "¿Prefiere resolver X o Y primero?"\n• "¿Le llamo o prefiere WhatsApp?"\n\nDar opciones devuelve control. Reduce agresividad.'
                },
                {
                    subtitle: '🧠 Base Científica',
                    content: '90% de quejas NO llegan a supervisor si aplicas empatía primero (Journal of Service Research, 2023). Harvard: Empatía es habilidad #1 en servicio.'
                }
            ],
            examples: [
                { bad: '❌ "Cálmese, voy a ayudarle"', good: '✅ "Entiendo perfectamente su frustración. Si estuviera en su lugar, yo también estaría molesto. Cuénteme qué pasó"' },
                { bad: '❌ "Entiendo, pero no podemos hacer eso"', good: '✅ "Entiendo su situación, y permítame ver todas las opciones disponibles para usted"' }
            ]
        },
        science_memorable: {
            title: '🎂 Momentos Memorables',
            gradient: 'from-orange-600 to-red-600',
            impact: '+300% viralidad en redes sociales',
            principle: 'Los momentos excepcionales generan lealtad emocional y marketing gratuito',
            scientificBasis: 'Peak-End Rule (Daniel Kahneman, Nobel de Economía): Las personas NO recuerdan el promedio de una experiencia, sino los MOMENTOS PICO y el FINAL. Un momento memorable vale más que 100 interacciones correctas.',
            steps: [
                {
                    subtitle: '1️⃣ Detectar Oportunidades',
                    content: '• Cumpleaños (el sistema alerta)\n• Aniversarios/bodas\n• Primera vez volando\n• Luna de miel, graduación\n• Ocasiones mencionadas casualmente'
                },
                {
                    subtitle: '2️⃣ Sorpresas Simples pero Impactantes',
                    content: 'NO necesitas grandes gestos:\n• Tarjeta escrita a mano > Regalo caro\n• Felicitación pública (con permiso)\n• Foto con tripulación\n• Mención especial en vuelo'
                },
                {
                    subtitle: '3️⃣ Hacerlo Personal',
                    content: '• Usa NOMBRE: "Feliz cumpleaños, María"\n• Involucra equipo: que otros feliciten\n• Documenta: foto para perfil\n• Follow-up: mensaje post-vuelo'
                },
                {
                    subtitle: '4️⃣ Invita a Compartir',
                    content: '"¿Le gustaría foto para recordar?"\n"Puede etiquetarnos si gusta compartir"\n\nNO obligues, FACILITA. La mayoría compartirá orgullosamente.'
                },
                {
                    subtitle: '🧠 Base Científica',
                    content: 'Momentos memorables generan 300% más shares en redes (Wharton School). Un video viral de buen servicio vale millones en publicidad. ROI promedio: 15:1'
                }
            ],
            examples: [
                { bad: '❌ Ignorar que es cumpleaños del pasajero', good: '✅ Coordinar con tripulación para felicitación especial + foto + tarjeta firmada por equipo' },
                { bad: '❌ "Feliz cumpleaños" genérico sin personalización', good: '✅ "María, en nombre de todo el equipo, queremos que este vuelo en su día especial sea inolvidable. ¿Le gustaría foto con nosotros?"' }
            ]
        },
        science_followup: {
            title: '📞 Seguimiento Post-Vuelo 48h',
            gradient: 'from-indigo-600 to-blue-600',
            impact: '+25% recuperación de NPS negativo',
            principle: 'Un seguimiento oportuno convierte detractores en promotores',
            scientificBasis: 'ROI: Retener un cliente cuesta 5x MENOS que conseguir uno nuevo (Bain & Company). El 70% de clientes insatisfechos que reciben seguimiento dentro de 48h cambian su percepción a positiva.',
            steps: [
                {
                    subtitle: '1️⃣ Cuándo Hacer Seguimiento',
                    content: 'SIEMPRE para:\n• Detractores (NPS 0-6)\n• Incidentes mayores\n• Pasajeros TOP/SIGNATURE\n• Promesas específicas hechas'
                },
                {
                    subtitle: '2️⃣ Timing Perfecto',
                    content: '24-48h después del vuelo (sweet spot):\n• Antes de 24h: muy pronto, aún molestos\n• Después de 72h: ya se olvidaron o resignaron\n• 24-48h: momento ideal para reconexión'
                },
                {
                    subtitle: '3️⃣ Estructura de 7 Pasos',
                    content: '1. Saludo personalizado\n2. Pregunta abierta: "¿Cómo estuvo su experiencia?"\n3. Escucha activa SIN interrumpir\n4. Disculpa genuina (si aplica)\n5. Acción concreta: "Aquí está lo que haré..."\n6. Compromiso: "Le confirmo el [fecha]"\n7. Cierre cálido: "Gracias por darnos la oportunidad"'
                },
                {
                    subtitle: '4️⃣ Qué Hacer con la Info',
                    content: 'REGISTRAR inmediatamente:\n• En CRM: notas del caso\n• Actualizar perfil pasajero\n• Si prometes algo, crear tarea con alarma\n• Compartir insights con equipo'
                },
                {
                    subtitle: '5️⃣ Script para Detractores',
                    content: '"Sr. García, soy [nombre] del equipo HVC. Vi que su vuelo de ayer tuvo inconvenientes. Quiero entender qué pasó y cómo podemos mejorar. ¿Tiene unos minutos para contarme?"'
                },
                {
                    subtitle: '🧠 Base Científica',
                    content: 'Clientes que reciben seguimiento tienen 25% más probabilidad de volver vs los que no (Forrester). NPS recovery rate: 70% cuando se hace bien.'
                }
            ],
            examples: [
                { bad: '❌ No contactar detractores o hacerlo después de 1 semana', good: '✅ Llamar 36h después: "Sr. López, vi que tuvo problemas. Quiero entender qué pasó y compensarlo"' },
                { bad: '❌ Email genérico automático', good: '✅ Llamada personal: "Soy Ana, quiero disculparme y asegurarme que su próximo vuelo sea perfecto"' }
            ]
        },
        science_recovery: {
            title: '🔧 Recuperación de Servicio',
            gradient: 'from-yellow-600 to-amber-600',
            impact: '+150% satisfacción vs no actuar',
            principle: 'Un problema bien resuelto crea MÁS lealtad que no tener problemas',
            scientificBasis: 'Paradoja de Recuperación de Servicio: Cuando resuelves un problema excepcionalmente bien, el cliente queda MÁS satisfecho que si nunca hubiera habido problema. Esto se debe al "efecto contraste" - la recuperación supera sus bajas expectativas.',
            steps: [
                {
                    subtitle: '1️⃣ Reconocer INMEDIATAMENTE',
                    content: 'Sin excusas, sin justificaciones:\n"Tiene toda la razón, esto no debió pasar"\n"Me hago responsable de solucionarlo"\n\nVelocidad de respuesta = muestra de que te importa.'
                },
                {
                    subtitle: '2️⃣ Ofrecer Opciones (dar control)',
                    content: 'En vez de imponer solución:\n"Puedo ofrecerle A, B o C. ¿Cuál prefiere?"\n\nDar opciones reduce agresividad y aumenta satisfacción con la solución.'
                },
                {
                    subtitle: '3️⃣ Superar Expectativas',
                    content: 'Regla: Da MÁS de lo esperado\n• Si prometiste llamar en 1h, llama en 45 min\n• Si podías dar X, da X + extra\n• Sorprende positivamente en la recuperación'
                },
                {
                    subtitle: '4️⃣ Hacer Seguimiento',
                    content: 'Después de resolver:\n"¿La solución funcionó para usted?"\n"¿Hay algo más que pueda hacer?"\n\nEsto demuestra que te importó MÁS ALLÁ de cerrar el caso.'
                },
                {
                    subtitle: '5️⃣ Convertir en Aprendizaje',
                    content: '• Documentar qué pasó\n• Compartir con equipo\n• Implementar mejora para evitar repetición\n• Informar al pasajero de los cambios hechos'
                },
                {
                    subtitle: '🧠 Base Científica',
                    content: 'Service Recovery Paradox (Journal of Marketing): 95% de clientes con problemas bien resueltos vuelven vs 70% sin problemas. La clave: EXCEPCIONAL recuperación.'
                }
            ],
            examples: [
                { bad: '❌ "Lo siento, son las políticas" (sin ofrecer alternativas)', good: '✅ "Entiendo completamente. Aunque la política es X, permítame ofrecerle Y o Z como alternativa. ¿Cuál funciona mejor?"' },
                { bad: '❌ Resolver y desaparecer', good: '✅ Resolver + llamar 24h después: "¿Todo bien con la solución? ¿Algo más que pueda hacer?"' }
            ]
        }
    };

    const guide = detailedGuides[detailId];
    if (!guide) return;

    const modalHTML = `
        <div id="scientificDetailModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fadeIn">
            <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div class="bg-gradient-to-r ${guide.gradient} p-6 text-white sticky top-0 z-10">
                    <div class="flex justify-between items-start">
                        <div>
                            <h2 class="text-3xl font-bold mb-2">${guide.title}</h2>
                            <p class="text-white/90 text-sm mb-2">${guide.impact}</p>
                            <p class="text-white/80 text-sm italic">"${guide.principle}"</p>
                        </div>
                        <button onclick="closeModal('scientificDetailModal')" class="text-white hover:bg-white/20 rounded-lg p-2 transition">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="p-6">
                    <!-- Base Científica Principal -->
                    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-5 mb-6">
                        <h3 class="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
                            <span class="text-2xl">🧠</span>
                            Base Científica
                        </h3>
                        <p class="text-gray-700 leading-relaxed">${guide.scientificBasis}</p>
                    </div>

                    <!-- Pasos Detallados -->
                    <h3 class="font-bold text-xl text-gray-800 mb-4">Guía Paso a Paso</h3>
                    <div class="space-y-4 mb-6">
                        ${guide.steps.map(step => `
                            <div class="bg-gray-50 rounded-xl p-5 border-2 border-gray-200 hover:border-gray-300 transition">
                                <h4 class="font-bold text-lg text-gray-800 mb-3">${step.subtitle}</h4>
                                <p class="text-gray-700 whitespace-pre-line leading-relaxed">${step.content}</p>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Ejemplos Prácticos -->
                    ${guide.examples ? `
                        <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                            <h3 class="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                                <span class="text-2xl">💡</span>
                                Ejemplos Prácticos
                            </h3>
                            <div class="space-y-3">
                                ${guide.examples.map(ex => `
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div class="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                                            <p class="text-sm text-gray-700">${ex.bad}</p>
                                        </div>
                                        <div class="bg-green-50 border-l-4 border-green-400 p-3 rounded">
                                            <p class="text-sm text-gray-700">${ex.good}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Footer -->
                    <div class="mt-6 p-4 bg-gray-100 rounded-lg">
                        <p class="text-sm text-gray-600 text-center">
                            💡 <strong>Recuerda:</strong> Para compensaciones específicas y políticas particulares de tu aerolínea, consulta siempre el manual oficial de tu compañía.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

// Mostrar sección específica del manual con recomendaciones prácticas
window.showManualSection = function(sectionKey) {
    // Contenido didáctico y práctico para cada sección
    const practicalGuides = {
        COMUNICACION_PROACTIVA: {
            title: '💬 Comunicación Proactiva',
            color: 'from-blue-600 to-indigo-600',
            impact: 'Mejora la percepción del servicio en +40%',
            principle: 'Los pasajeros valoran más la transparencia que la perfección. Informar proactivamente reduce la ansiedad y genera confianza.',
            steps: [
                {
                    subtitle: '1️⃣ Antes de que Pregunten',
                    actions: [
                        'Monitorear constantemente el estatus del vuelo',
                        'Si hay un cambio (retraso, puerta, etc.), acércate AL PASAJERO antes de que lo descubra',
                        'Usa frases como: "Quiero informarle primero que..." - esto genera sentimiento de cuidado VIP'
                    ]
                },
                {
                    subtitle: '2️⃣ Comunicación Clara y Completa',
                    actions: [
                        'QUÉ está pasando (ej: retraso de 30 min)',
                        'POR QUÉ está pasando (ej: condiciones climáticas)',
                        'QUÉ estamos haciendo al respecto (ej: priorizando despegue)',
                        'QUÉ pueden hacer ellos (ej: acompañamiento personal mientras esperan)'
                    ]
                },
                {
                    subtitle: '3️⃣ Actualizaciones Regulares',
                    actions: [
                        'Cada 15-20 minutos en situaciones de espera',
                        'Aunque no haya novedades, confirmar "Sigo monitoreando, le aviso apenas sepa algo"',
                        'Esto evita que el pasajero busque información por su cuenta y se frustre'
                    ]
                },
                {
                    subtitle: '💡 Por Qué Funciona',
                    actions: [
                        'Psicología: La incertidumbre genera más estrés que el problema en sí',
                        'Cuando TÚ informas primero, el pasajero siente que TIENE EL CONTROL',
                        'Reduce quejas en un 40% según estudios de servicio al cliente'
                    ]
                }
            ]
        },
        PERSONALIZACION: {
            title: '✨ Personalización de la Experiencia',
            color: 'from-purple-600 to-pink-600',
            impact: 'Aumenta la lealtad del cliente en +60%',
            principle: 'Las personas recuerdan cómo las hiciste sentir. Usar información personal crea una conexión emocional poderosa.',
            steps: [
                {
                    subtitle: '1️⃣ Revisar el Perfil ANTES de Atender',
                    actions: [
                        'Gustos: bebida favorita, preferencias alimentarias',
                        'Preferencias: asiento ventana/pasillo, necesidades especiales',
                        'Historial: vuelos anteriores, incidentes previos',
                        'Toma 30 segundos y hace una ENORME diferencia'
                    ]
                },
                {
                    subtitle: '2️⃣ Usar la Información Sutilmente',
                    actions: [
                        '❌ MAL: "Veo en el sistema que te gusta el café"',
                        '✅ BIEN: "¿Le gustaría un café mientras espera? Tenemos variedad"',
                        'Actúa como si lo recordaras naturalmente, no como si leyeras una pantalla'
                    ]
                },
                {
                    subtitle: '3️⃣ Sorpresas Basadas en Datos',
                    actions: [
                        'Si prefiere ventana → Ofrecerle ventana proactivamente',
                        'Si cumpleaños cercano → Pequeño detalle o mención especial',
                        'Si viajero frecuente → "Bienvenido de nuevo, Sr. García"',
                        'Si tuvo problema anterior → "Hoy me aseguraré personalmente de que todo esté perfecto"'
                    ]
                },
                {
                    subtitle: '4️⃣ Registrar Nueva Información',
                    actions: [
                        'En cada interacción, pregunta sutilmente y REGISTRA:',
                        '"¿Cómo prefiere que lo contactemos?" → Actualizar preferencias',
                        '"¿Tiene alguna restricción alimentaria?" → Agregar a gustos',
                        'Esto mejora la PRÓXIMA experiencia'
                    ]
                },
                {
                    subtitle: '💡 Por Qué Funciona',
                    actions: [
                        'Efecto "Cheers": Como el bar donde todos saben tu nombre',
                        'Crea sentimiento de "Este lugar me conoce y valora"',
                        'Aumenta Net Promoter Score (NPS) en promedio 60%',
                        'Los clientes están dispuestos a pagar MÁS por servicio personalizado'
                    ]
                }
            ]
        },
        EMPATIA: {
            title: '💚 Empatía y Escucha Activa',
            color: 'from-green-600 to-emerald-600',
            impact: 'Reduce escalamiento de quejas en -70%',
            principle: 'La gente no quiere que resuelvas el problema inmediatamente. Primero quieren sentirse ESCUCHADOS y VALIDADOS.',
            steps: [
                {
                    subtitle: '1️⃣ Escucha Primero, Soluciona Después',
                    actions: [
                        '❌ MAL: Interrumpir con soluciones antes de que terminen',
                        '✅ BIEN: Dejar que expresen TODO sin interrumpir',
                        'Usa lenguaje corporal: contacto visual, asentir, inclinarte ligeramente',
                        'Silencio estratégico: Espera 2-3 segundos después de que terminen antes de responder'
                    ]
                },
                {
                    subtitle: '2️⃣ Validar Emociones (NO el problema)',
                    actions: [
                        'Frases mágicas:',
                        '"Entiendo perfectamente su frustración, es totalmente comprensible"',
                        '"Si estuviera en su lugar, yo también estaría molesto"',
                        '"Tiene toda la razón en sentirse así"',
                        'IMPORTANTE: Validas la EMOCIÓN, no necesariamente estás de acuerdo con todo'
                    ]
                },
                {
                    subtitle: '3️⃣ Técnica del Espejo',
                    actions: [
                        'Repite lo que dijeron con tus palabras:',
                        '"Si entendí bien, el problema es que... ¿es correcto?"',
                        'Esto demuestra que REALMENTE escuchaste',
                        'El 80% de las quejas se reducen solo con esta técnica'
                    ]
                },
                {
                    subtitle: '4️⃣ Cambiar de "Pero" a "Y"',
                    actions: [
                        '❌ MAL: "Entiendo, PERO nuestras políticas..."',
                        '✅ BIEN: "Entiendo, Y permítame ver qué puedo hacer..."',
                        '"Pero" invalida todo lo anterior',
                        '"Y" mantiene la conexión y abre posibilidades'
                    ]
                },
                {
                    subtitle: '5️⃣ Ofrecer Control',
                    actions: [
                        '"¿Prefiere que solucionemos X o Y primero?"',
                        '"¿Le gustaría que lo llame yo o prefiere WhatsApp?"',
                        'Dar opciones devuelve sensación de control',
                        'Reduce comportamiento agresivo en situaciones tensas'
                    ]
                },
                {
                    subtitle: '💡 Por Qué Funciona',
                    actions: [
                        'Neurociencia: Validación activa la "recompensa social" en el cerebro',
                        'Reduce cortisol (hormona del estrés) del pasajero',
                        'El 90% de quejas NO llegan a supervisor si aplicas empatía primero',
                        'Harvard Business Review: Empatía es la habilidad #1 en servicio al cliente'
                    ]
                }
            ]
        },
        CUMPLEANOS: {
            title: '🎂 Momentos Memorables',
            color: 'from-pink-600 to-rose-600',
            impact: 'Aumenta viralidad en redes sociales en +300%',
            principle: 'Los momentos memorables generan lealtad emocional y marketing gratuito (fotos en redes sociales).',
            steps: [
                {
                    subtitle: '1️⃣ Detectar Oportunidades',
                    actions: [
                        'Cumpleaños (el sistema te alertará)',
                        'Aniversarios de bodas (si está en el perfil)',
                        'Primera vez volando',
                        'Vuelos especiales (luna de miel, graduación)',
                        'Ocasiones mencionadas en conversación casual'
                    ]
                },
                {
                    subtitle: '2️⃣ Sorpresas Simples pero Impactantes',
                    actions: [
                        'NO necesitas grandes gestos, lo importante es la INTENCIÓN',
                        'Tarjeta escrita a mano > Regalo caro',
                        'Felicitación pública (con permiso) en el vuelo',
                        'Foto con la tripulación',
                        'Mención especial durante el vuelo'
                    ]
                },
                {
                    subtitle: '3️⃣ Hazlo Personal',
                    actions: [
                        'Usa el NOMBRE: "Feliz cumpleaños, María"',
                        'Involucra al equipo: Que otros también feliciten',
                        'Documenta: Toma foto para el perfil del pasajero',
                        'Follow-up: Mensaje post-vuelo agradeciendo que eligió volar en su día especial'
                    ]
                },
                {
                    subtitle: '4️⃣ Invita a Compartir',
                    actions: [
                        '"¿Le gustaría una foto para recordar este momento?"',
                        '"Puede etiquetarnos en redes si gusta compartir"',
                        'NO lo pidas directamente, pero facilita que lo hagan',
                        'Una foto viral vale más que 1000 anuncios pagados'
                    ]
                },
                {
                    subtitle: '💡 Por Qué Funciona',
                    actions: [
                        'Psicología del "Peak-End Rule": Recordamos los MOMENTOS PICOS',
                        'Un cumpleaños especial = recuerdo permanente de tu marca',
                        'Las emociones fuertes (positivas) crean lealtad irracional',
                        'Generación de contenido orgánico: Los pasajeros comparten en RRSS espontáneamente',
                        'Efecto multiplicador: 1 pasajero feliz = 100-1000 personas ven su publicación'
                    ]
                }
            ]
        },
        SEGUIMIENTO: {
            title: '📞 Seguimiento Post-Vuelo 48h',
            color: 'from-orange-600 to-amber-600',
            impact: 'Mejora recuperación de NPS en +25%',
            principle: 'El servicio no termina cuando el pasajero baja del avión. El seguimiento cierra el ciclo y recupera pasajeros insatisfechos.',
            steps: [
                {
                    subtitle: '1️⃣ Cuándo Hacer Seguimiento',
                    actions: [
                        'SIEMPRE: Pasajeros con calificación ≤6 (detractores)',
                        'SIEMPRE: Si hubo incidente (equipaje, retraso, etc.)',
                        'RECOMENDADO: Pasajeros TOP/SIGNATURE (fidelización)',
                        'OPCIONAL: Primera vez volando (crear impresión duradera)'
                    ]
                },
                {
                    subtitle: '2️⃣ Timing Perfecto: 24-48 horas',
                    actions: [
                        'Antes de 24h: Demasiado pronto, aún están cansados',
                        'Después de 72h: Ya se olvidaron de los detalles',
                        'Sweet spot: 24-48h después del vuelo',
                        'Ya procesaron la experiencia pero aún la recuerdan claramente'
                    ]
                },
                {
                    subtitle: '3️⃣ Estructura del Mensaje/Llamada',
                    actions: [
                        '1. Saludo personalizado: "Hola Sr. García, soy Juan del equipo HVC"',
                        '2. Contexto: "Lo atendí en su vuelo del martes a Lima"',
                        '3. Propósito: "Quiero asegurarme de que todo salió bien"',
                        '4. Pregunta abierta: "¿Cómo estuvo su experiencia?"',
                        '5. Escucha activa (usar técnicas de empatía)',
                        '6. Acción (si aplica): "Permítame hacer esto por usted..."',
                        '7. Cierre: "¿Hay algo más en lo que pueda ayudarle?"'
                    ]
                },
                {
                    subtitle: '4️⃣ Qué Hacer con la Información',
                    actions: [
                        'Registrar INMEDIATAMENTE en el sistema',
                        'Si mencionan algo positivo → Reconocer al equipo involucrado',
                        'Si mencionan algo negativo → Crear plan de acción',
                        'Actualizar preferencias del pasajero basado en comentarios',
                        'Si no contestan: Dejar mensaje de voz + WhatsApp + Email'
                    ]
                },
                {
                    subtitle: '5️⃣ Script para Detractores',
                    actions: [
                        '"Veo que tuvo una experiencia por debajo de nuestro estándar"',
                        '"Quiero que sepa que esto NO es normal en nuestro servicio"',
                        '"¿Puede contarme qué falló desde su perspectiva?"',
                        '[ESCUCHAR SIN INTERRUMPIR]',
                        '"Tiene razón. Esto es lo que voy a hacer..."',
                        '[ACCIÓN CONCRETA Y TIMELINE]',
                        '"¿Me permite llamarle en X días para confirmar que se solucionó?"'
                    ]
                },
                {
                    subtitle: '💡 Por Qué Funciona',
                    actions: [
                        'Efecto sorpresa: Solo el 5% de empresas hace seguimiento',
                        'Demuestra que el pasajero NO es un número',
                        'Segunda oportunidad: 70% de detractores cambian a promotores con buen seguimiento',
                        'Recolección de datos: Obtienes feedback real para mejorar',
                        'Diferenciación: Tus competidores NO hacen esto',
                        'ROI: Retener un cliente cuesta 5x menos que conseguir uno nuevo'
                    ]
                }
            ]
        }
    };

    const guide = practicalGuides[sectionKey];

    if (!guide) {
        showNotification('Sección no encontrada', 'error');
        return;
    }

    const modalHTML = `
        <div id="sectionModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div class="bg-gradient-to-r ${guide.color} p-6 text-white sticky top-0 z-10">
                    <div class="flex justify-between items-start">
                        <div>
                            <h2 class="text-2xl font-bold mb-2">${guide.title}</h2>
                            <p class="text-sm opacity-90">📊 ${guide.impact}</p>
                        </div>
                        <button onclick="closeModal('sectionModal')" class="text-white hover:bg-white/20 rounded-lg p-2 transition">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="p-6 space-y-6">
                    <!-- Principio fundamental -->
                    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                        <p class="text-sm font-semibold text-blue-900 mb-1">🧠 Principio Fundamental</p>
                        <p class="text-sm text-gray-700">${guide.principle}</p>
                    </div>

                    <!-- Steps -->
                    ${guide.steps.map(step => `
                        <div class="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 transition">
                            <h3 class="font-bold text-lg text-gray-900 mb-3">${step.subtitle}</h3>
                            <div class="space-y-2">
                                ${step.actions.map((action, idx) => `
                                    <div class="flex items-start gap-3 ${action.startsWith('❌') || action.startsWith('✅') ? 'ml-0' : 'ml-4'}">
                                        ${!action.startsWith('❌') && !action.startsWith('✅') && !action.startsWith('"') && !action.startsWith('[') && !action.startsWith('1.') && !action.startsWith('2.') && !action.startsWith('3.') && !action.startsWith('4.') && !action.startsWith('5.') && !action.startsWith('6.') && !action.startsWith('7.') && !action.startsWith('QUÉ') && !action.startsWith('POR') && !action.startsWith('Frases') && !action.startsWith('IMPORTANTE') && !action.startsWith('Psicología') && !action.startsWith('Neurociencia') && !action.startsWith('Harvard') && !action.startsWith('NO') && !action.startsWith('Efecto') && !action.startsWith('Demuestra') && !action.startsWith('Segunda') && !action.startsWith('Recolección') && !action.startsWith('Diferenciación') && !action.startsWith('ROI') && !action.startsWith('Generación') ?
                                            '<span class="text-blue-600 text-lg flex-shrink-0">→</span>' :
                                            '<span class="w-1 flex-shrink-0"></span>'
                                        }
                                        <p class="text-sm text-gray-700 leading-relaxed ${action.startsWith('❌') ? 'text-red-600' : action.startsWith('✅') ? 'text-green-600 font-medium' : ''}">${action}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}

                    <!-- Footer con call to action -->
                    <div class="bg-gradient-to-r ${guide.color} rounded-xl p-4 text-white text-center">
                        <p class="font-semibold">💪 Recuerda: La excelencia en servicio se construye con pequeñas acciones constantes</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

// Mostrar detalles de un insight
window.showInsightDetails = function(title, message, action) {
    const modalHTML = `
        <div id="insightModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
                <div class="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white">
                    <div class="flex justify-between items-start">
                        <h2 class="text-xl font-bold">${title}</h2>
                        <button onclick="closeModal('insightModal')" class="text-white hover:bg-white/20 rounded-lg p-2 transition">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <p class="text-gray-700 mb-4">${message}</p>
                    ${action ? `
                        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                            <p class="text-sm font-semibold text-blue-800 flex items-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                                </svg>
                                Acción Recomendada:
                            </p>
                            <p class="text-sm text-blue-700 mt-2">${action}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

// Filtrar por NPS
window.filterByNPS = function(type) {
    // Cambiar a vista de tracking con filtro aplicado
    changeView('passenger-tracking');
    setTimeout(() => {
        const filterStatus = document.getElementById('trackingFilterStatus');
        if (filterStatus) {
            if (type === 'detractors') filterStatus.value = 'risk';
            else if (type === 'promoters') filterStatus.value = 'recovered';
            filterTracking();
        }
    }, 500);
};

// Cerrar modal
window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('animate-fadeOut');
        setTimeout(() => modal.remove(), 300);
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
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Foto del Pasajero</label>
                            <div class="space-y-3">
                                <!-- Área de preview de imagen -->
                                <div id="fotoPreview" class="relative">
                                    ${passenger.foto_url ? `
                                        <img src="${passenger.foto_url}" alt="Foto actual de ${passenger.nombre}"
                                             class="w-32 h-32 object-cover rounded-xl border-2 border-gray-300 shadow-md mx-auto">
                                        <button type="button" onclick="removeCurrentPhoto()"
                                                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition">
                                            ×
                                        </button>
                                    ` : `
                                        <div class="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center mx-auto">
                                            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                            </svg>
                                        </div>
                                    `}
                                </div>

                                <!-- Input de URL (mantenido por compatibilidad) -->
                                <div>
                                    <label class="block text-xs text-gray-600 mb-1">O pegar URL de imagen:</label>
                                    <input type="url" id="editFotoUrl" value="${passenger.foto_url || ''}"
                                            placeholder="https://ejemplo.com/foto.jpg"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm">
                                </div>

                                <!-- Botón para subir archivo -->
                                <div>
                                    <label class="block text-xs text-gray-600 mb-1">O subir nueva imagen:</label>
                                    <input type="file" id="fotoFile" accept="image/*"
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                                </div>

                                <!-- Información de ayuda -->
                                <p class="text-xs text-gray-500">
                                    💡 Formatos admitidos: JPG, PNG, GIF. Tamaño máximo: 5MB
                                </p>
                            </div>
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
                        <!-- Gustos del Pasajero -->
                        <div class="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                            <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                                <svg class="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                                </svg>
                                Gustos del Pasajero
                            </h4>

                            <!-- Sistema de etiquetas para gustos mejorado -->
                            <div class="space-y-6">
                                ${renderTagField('bebida', 'Bebidas Preferidas', ['agua', 'café', 'té', 'jugo', 'vino', 'cerveza', 'refresco', 'agua mineral', 'zumo'], passenger.gustos?.bebida || [], '🥤')}

                                ${renderTagField('comida', 'Preferencias Alimentarias', ['vegetariana', 'vegana', 'sin gluten', 'sin lactosa', 'halal', 'kosher', 'baja en sodio', 'diabética', 'hipocalórica'], passenger.gustos?.comida || [], '🍽️')}

                                ${renderTagField('entretenimiento', 'Entretenimiento', ['películas', 'música', 'libros', 'revistas', 'juegos', 'periódicos', 'podcasts', 'series'], passenger.gustos?.entretenimiento || [], '🎬')}

                                <!-- Otros gustos -->
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">📝 Otros Gustos</label>
                                    <textarea id="editOtrosGustos" rows="2"
                                            placeholder="Ej: Prefiere silencio, necesita espacio extra, etc."
                                            class="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition">${passenger.gustos?.otros || ''}</textarea>
                                </div>
                            </div>
                        </div>

                        <!-- Preferencias de Servicio -->
                        <div class="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                            <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                                <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                                </svg>
                                Preferencias de Servicio
                            </h4>

                            <!-- Preferencias de Servicio mejoradas -->
                            <div class="space-y-6">
                                ${renderTagField('asiento', 'Preferencia de Asiento', ['ventana', 'pasillo', 'indiferente'], passenger.preferencias?.asiento ? [passenger.preferencias.asiento] : [], '💺')}

                                ${renderTagField('servicios', 'Servicios Preferidos', ['sala vip', 'fast track', 'upgrade', 'transporte', 'concierge', 'wifi premium', 'comida especial'], passenger.preferencias?.servicios || [], '⭐')}

                                ${renderTagField('contacto', 'Método de Contacto Preferido', ['email', 'teléfono', 'whatsapp', 'sms'], passenger.preferencias?.contacto ? [passenger.preferencias.contacto] : [], '📱')}
                            </div>

                            <!-- Notificación de cambios -->
                            <div class="mb-4">
                                <label class="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition"
                                       onclick="toggleNotificationPreference()">
                                    <input type="checkbox" id="editNotificarCambios" class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" ${passenger.preferencias?.notificar_cambios !== false ? 'checked' : ''}>
                                    <span class="text-sm font-medium text-blue-800">🔔 Notificarme sobre cambios de vuelo</span>
                                </label>
                            </div>
                        </div>

                        <!-- Idiomas -->
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">🌐 Idiomas (separados por coma)</label>
                            <input type="text" id="editIdiomas" value="${passenger.idiomas ? passenger.idiomas.join(', ') : ''}"
                                    placeholder="Español, Inglés, Francés"
                                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                        </div>

                        <!-- Notas Especiales -->
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

        // Manejar subida de nueva foto si existe
        const fileInput = document.getElementById('fotoFile');
        if (fileInput && fileInput.files[0]) {
            try {
                showNotification('Subiendo imagen...', 'info');

                // Crear FormData para subir el archivo
                const uploadData = new FormData();
                uploadData.append('foto', fileInput.files[0]);
                uploadData.append('pasajero_id', passengerId);

                // Aquí iría la lógica para subir a Supabase Storage
                // Por ahora, usar la URL de preview como placeholder
                const reader = new FileReader();
                reader.onload = function(e) {
                    formData.foto_url = e.target.result;
                    proceedWithSave();
                };
                reader.readAsDataURL(fileInput.files[0]);

                return; // Salir y esperar la subida
            } catch (error) {
                console.error('Error uploading photo:', error);
                showNotification('Error al subir la imagen', 'error');
                return;
            }
        } else {
            proceedWithSave();
        }

        async function proceedWithSave() {
            try {
                // Procesar gustos desde etiquetas
                const bebidasTags = Array.from(document.querySelectorAll('[data-type="bebida"]')).map(tag => tag.getAttribute('data-value'));
                const comidasTags = Array.from(document.querySelectorAll('[data-type="comida"]')).map(tag => tag.getAttribute('data-value'));
                const entretenimientoTags = Array.from(document.querySelectorAll('[data-type="entretenimiento"]')).map(tag => tag.getAttribute('data-value'));
                const otrosGustos = document.getElementById('editOtrosGustos').value.trim();

                formData.gustos = {
                    bebida: bebidasTags.length > 0 ? bebidasTags : undefined,
                    comida: comidasTags.length > 0 ? comidasTags : undefined,
                    entretenimiento: entretenimientoTags.length > 0 ? entretenimientoTags : undefined,
                    otros: otrosGustos || undefined
                };

                // Procesar preferencias desde etiquetas
                const asientoTag = document.querySelector('[data-type="asiento"]')?.getAttribute('data-value');
                const serviciosTags = Array.from(document.querySelectorAll('[data-type="servicios"]')).map(tag => tag.getAttribute('data-value'));
                const contactoTag = document.querySelector('[data-type="contacto"]')?.getAttribute('data-value');
                const notificarCambios = document.getElementById('editNotificarCambios').checked;

                formData.preferencias = {
                    asiento: asientoTag || undefined,
                    servicios: serviciosTags.length > 0 ? serviciosTags : undefined,
                    contacto: contactoTag || undefined,
                    notificar_cambios: notificarCambios
                };

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
                            ${passenger.gustos && (passenger.gustos.bebida?.length > 0 || passenger.gustos.comida?.length > 0 || passenger.gustos.entretenimiento?.length > 0 || passenger.gustos.otros) ? `
                                <div>
                                    <p class="font-medium text-gray-700">Gustos:</p>
                                    <div class="flex flex-wrap gap-1 mt-1">
                                        ${passenger.gustos.bebida?.length > 0 ? passenger.gustos.bebida.map(bebida => `
                                            <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                🥤 ${bebida.charAt(0).toUpperCase() + bebida.slice(1)}
                                            </span>
                                        `).join('') : ''}
                                        ${passenger.gustos.comida?.length > 0 ? passenger.gustos.comida.map(comida => `
                                            <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                🍽️ ${comida.charAt(0).toUpperCase() + comida.slice(1).replace('_', ' ')}
                                            </span>
                                        `).join('') : ''}
                                        ${passenger.gustos.entretenimiento?.length > 0 ? passenger.gustos.entretenimiento.map(ent => `
                                            <span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                                🎬 ${ent.charAt(0).toUpperCase() + ent.slice(1)}
                                            </span>
                                        `).join('') : ''}
                                        ${passenger.gustos.otros ? `
                                            <span class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                                📝 ${passenger.gustos.otros}
                                            </span>
                                        ` : ''}
                                    </div>
                                </div>
                            ` : '<p class="text-gray-500 text-sm">No hay gustos registrados</p>'}

                            ${passenger.preferencias && (passenger.preferencias.asiento || passenger.preferencias.servicios?.length > 0 || passenger.preferencias.contacto || passenger.preferencias.notificar_cambios !== undefined) ? `
                                <div>
                                    <p class="font-medium text-gray-700">Preferencias:</p>
                                    <div class="flex flex-wrap gap-1 mt-1">
                                        ${passenger.preferencias.asiento ? `
                                            <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                💺 ${passenger.preferencias.asiento.charAt(0).toUpperCase() + passenger.preferencias.asiento.slice(1)}
                                            </span>
                                        ` : ''}
                                        ${passenger.preferencias.servicios?.length > 0 ? passenger.preferencias.servicios.map(servicio => `
                                            <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                ⭐ ${servicio.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </span>
                                        `).join('') : ''}
                                        ${passenger.preferencias.contacto ? `
                                            <span class="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                                📱 ${passenger.preferencias.contacto.charAt(0).toUpperCase() + passenger.preferencias.contacto.slice(1)}
                                            </span>
                                        ` : ''}
                                        ${passenger.preferencias.notificar_cambios !== undefined ? `
                                            <span class="px-2 py-1 ${passenger.preferencias.notificar_cambios ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-xs rounded-full">
                                                🔔 ${passenger.preferencias.notificar_cambios ? 'Notificaciones ON' : 'Notificaciones OFF'}
                                            </span>
                                        ` : ''}
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
                                                            ${new Date(item.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Lima' })}
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
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                Historial de Interacciones
                            </h3>
                            <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                                ${interactions.length} total
                            </span>
                        </div>
                        <div class="space-y-4 max-h-96 overflow-y-auto pr-2">
                            ${interactions.slice(0, 10).map((interaction, index) => {
                                const score = interaction.calificacion_medallia;
                                const hasScore = score !== null && score !== undefined;
                                const scoreStatus = hasScore ? (score <= 6 ? 'detractor' : score <= 8 ? 'passive' : 'promoter') : null;
                                const scoreConfig = {
                                    'detractor': { bg: 'bg-red-100', text: 'text-red-800', icon: '😞', label: 'Detractor', border: 'border-red-300' },
                                    'passive': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '😐', label: 'Pasivo', border: 'border-yellow-300' },
                                    'promoter': { bg: 'bg-green-100', text: 'text-green-800', icon: '😊', label: 'Promotor', border: 'border-green-300' }
                                };
                                const config = scoreStatus ? scoreConfig[scoreStatus] : null;

                                return `
                                <div class="relative bg-gradient-to-br from-white to-gray-50 border-2 ${config ? config.border : 'border-gray-200'} rounded-xl p-5 hover:shadow-lg transition-all duration-300 group">
                                    <!-- Número de interacción -->
                                    <div class="absolute top-3 left-3 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                        ${index + 1}
                                    </div>

                                    <!-- Header con fecha y calificación -->
                                    <div class="flex justify-between items-start mb-4 pl-10">
                                        <div>
                                            <div class="flex items-center gap-2 mb-2">
                                                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                                </svg>
                                                <p class="text-sm font-bold text-gray-800">${Utils.formatDateTime(interaction.fecha)}</p>
                                            </div>
                                            ${interaction.motivo_viaje ? `
                                                <div class="flex items-center gap-2 mb-1">
                                                    <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                                                    </svg>
                                                    <span class="text-xs text-gray-600">Motivo: <span class="font-semibold text-gray-800">${interaction.motivo_viaje}</span></span>
                                                </div>
                                            ` : ''}
                                        </div>
                                        ${hasScore ? `
                                            <div class="flex flex-col items-end gap-1">
                                                <div class="flex items-center gap-2 px-3 py-2 ${config.bg} rounded-lg border-2 ${config.border}">
                                                    <span class="text-2xl">${config.icon}</span>
                                                    <div class="text-right">
                                                        <p class="text-2xl font-bold ${config.text}">${score}<span class="text-sm">/10</span></p>
                                                        <p class="text-xs font-medium ${config.text}">${config.label}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ` : `
                                            <div class="px-3 py-2 bg-gray-100 text-gray-500 rounded-lg border-2 border-gray-300">
                                                <p class="text-xs font-medium">Sin calificación</p>
                                            </div>
                                        `}
                                    </div>

                                    <!-- Información del agente -->
                                    <div class="flex items-center gap-2 mb-3 pl-10 pb-3 border-b border-gray-200">
                                        <div class="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow">
                                            ${interaction.agente_nombre ? interaction.agente_nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AG'}
                                        </div>
                                        <div>
                                            <p class="text-xs text-gray-500">Atendido por</p>
                                            <p class="text-sm font-bold text-gray-800">${interaction.agente_nombre || 'No registrado'}</p>
                                        </div>
                                    </div>

                                    <!-- Feedback del pasajero -->
                                    ${interaction.feedback ? `
                                        <div class="pl-10 mb-3">
                                            <div class="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-3">
                                                <div class="flex items-start gap-2">
                                                    <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                                                    </svg>
                                                    <div>
                                                        <p class="text-xs font-bold text-blue-800 mb-1">Comentario del pasajero:</p>
                                                        <p class="text-sm text-gray-700 leading-relaxed">${interaction.feedback}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ` : ''}

                                    <!-- Incidentes -->
                                    ${interaction.incidentes ? `
                                        <div class="pl-10 mb-3">
                                            <div class="bg-orange-50 border-l-4 border-orange-400 rounded-r-lg p-3">
                                                <div class="flex items-start gap-2">
                                                    <svg class="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.964-1.333-3.732 0L3.082 16c-.77 1.333.192 3 1.732 3z"/>
                                                    </svg>
                                                    <div>
                                                        <p class="text-xs font-bold text-orange-800 mb-1">Incidente reportado:</p>
                                                        <p class="text-sm text-gray-700 leading-relaxed">${interaction.incidentes}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ` : ''}

                                    <!-- Acciones de recuperación -->
                                    ${interaction.acciones_recuperacion ? `
                                        <div class="pl-10">
                                            <div class="bg-green-50 border-l-4 border-green-400 rounded-r-lg p-3">
                                                <div class="flex items-start gap-2">
                                                    <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                    </svg>
                                                    <div>
                                                        <p class="text-xs font-bold text-green-800 mb-1">Acciones de recuperación:</p>
                                                        <p class="text-sm text-gray-700 leading-relaxed">${interaction.acciones_recuperacion}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ` : ''}

                                    <!-- Badge de antigüedad -->
                                    <div class="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span class="text-xs text-gray-400 font-medium bg-white px-2 py-1 rounded shadow">
                                            Hace ${Math.ceil((new Date() - new Date(interaction.fecha)) / (1000 * 60 * 60 * 24))} días
                                        </span>
                                    </div>
                                </div>
                            `}).join('')}
                        </div>
                        ${interactions.length > 10 ? `
                            <div class="mt-4 text-center">
                                <p class="text-sm text-gray-500">Mostrando las 10 interacciones más recientes de ${interactions.length} totales</p>
                            </div>
                        ` : ''}
                    </div>
                ` : `
                    <div class="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                        <p class="text-gray-500 font-medium">No hay interacciones registradas para este pasajero</p>
                        <p class="text-sm text-gray-400 mt-2">Las interacciones aparecerán aquí una vez que se registren atenciones</p>
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
                                class="interaction-tab-btn px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition bg-white/30 shadow-lg"
                                data-tab="general">
                            <span class="flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                                General
                            </span>
                        </button>
                        <button type="button" onclick="switchInteractionTab('services')"
                                class="interaction-tab-btn px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition bg-white/10 hover:bg-white/20"
                                data-tab="services">
                            <span class="flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                </svg>
                                Servicios
                            </span>
                        </button>
                        <button type="button" onclick="switchInteractionTab('feedback')"
                                class="interaction-tab-btn px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition bg-white/10 hover:bg-white/20"
                                data-tab="feedback">
                            <span class="flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                                </svg>
                                Feedback
                            </span>
                        </button>
                        <button type="button" onclick="switchInteractionTab('issues')"
                                class="interaction-tab-btn px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition bg-white/10 hover:bg-white/20"
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
                    <!-- Tab: General -->
                    <div id="interaction-tab-general" class="interaction-tab-content" style="display: block;">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    Motivo de Viaje *
                                </label>
                                <select id="motivoViaje" required class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition">
                                    <option value="">Seleccione motivo...</option>
                                    <option value="${CONSTANTS.TRAVEL_REASONS.NEGOCIOS}">💼 Negocios</option>
                                    <option value="${CONSTANTS.TRAVEL_REASONS.TURISMO}">✈️ Turismo</option>
                                    <option value="${CONSTANTS.TRAVEL_REASONS.PERSONAL}">👨‍👩‍👧‍👦 Personal</option>
                                    <option value="${CONSTANTS.TRAVEL_REASONS.MEDICO}">⚕️ Médico</option>
                                    <option value="${CONSTANTS.TRAVEL_REASONS.OTRO}">📋 Otro</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-sm font-bold text-gray-700 mb-2">📝 Preferencias Observadas</label>
                                <div class="space-y-3">
                                    <!-- Sistema de etiquetas para preferencias rápidas mejorado -->
                                    <div class="tag-input-container">
                                        <div class="tag-display mb-2 flex flex-wrap gap-2 min-h-[2.5rem] p-2 border-2 border-gray-200 rounded-lg bg-gray-50">
                                            <!-- Las etiquetas se agregarán aquí dinámicamente -->
                                        </div>
                                        <div class="relative">
                                            <input type="text" id="preferencias" class="tag-input w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                                   placeholder="Escribe para buscar o crear preferencias (bebidas, comida, asiento, etc.)..."
                                                   list="preferencias-rapidas-list"
                                                   oninput="showTagSuggestions(this, 'preferencias-rapidas')"
                                                   onkeydown="handleTagInput(event, 'preferencias-rapidas')">
                                            <datalist id="preferencias-rapidas-list">
                                                <option value="agua">
                                                <option value="café">
                                                <option value="té">
                                                <option value="jugo">
                                                <option value="vino">
                                                <option value="cerveza">
                                                <option value="refresco">
                                                <option value="vegetariana">
                                                <option value="vegana">
                                                <option value="sin gluten">
                                                <option value="sin lactosa">
                                                <option value="ventana">
                                                <option value="pasillo">
                                                <option value="indiferente">
                                                <option value="sala vip">
                                                <option value="fast track">
                                                <option value="upgrade">
                                                <option value="transporte">
                                                <option value="concierge">
                                                <option value="wifi premium">
                                                <option value="comida especial">
                                            </datalist>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-4">
                            <label class="block text-sm font-bold text-gray-700 mb-2">📝 Notas Generales de la Atención</label>
                            <textarea id="notas" rows="3"
                                    placeholder="Observaciones adicionales del agente sobre la interacción..."
                                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"></textarea>
                        </div>
                    </div>

                    <!-- Tab: Servicios -->
                    <div id="interaction-tab-services" class="interaction-tab-content" style="display: none;">
                        <div class="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                            <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                Servicios Utilizados
                            </h3>
                            <p class="text-sm text-gray-600 mb-4">Seleccione todos los servicios que el pasajero utilizó durante su experiencia</p>

                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <label class="flex items-center gap-3 p-4 bg-white border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition">
                                    <input type="checkbox" value="${CONSTANTS.SERVICES.SALA_VIP}" class="servicio-checkbox w-5 h-5 rounded text-blue-600 focus:ring-blue-500">
                                    <span class="font-medium text-gray-700">🏆 Sala VIP</span>
                                </label>
                                <label class="flex items-center gap-3 p-4 bg-white border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition">
                                    <input type="checkbox" value="${CONSTANTS.SERVICES.FAST_TRACK}" class="servicio-checkbox w-5 h-5 rounded text-blue-600 focus:ring-blue-500">
                                    <span class="font-medium text-gray-700">⚡ Fast Track</span>
                                </label>
                                <label class="flex items-center gap-3 p-4 bg-white border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition">
                                    <input type="checkbox" value="${CONSTANTS.SERVICES.ASISTENCIA_ESPECIAL}" class="servicio-checkbox w-5 h-5 rounded text-blue-600 focus:ring-blue-500">
                                    <span class="font-medium text-gray-700">🤝 Asistencia Especial</span>
                                </label>
                                <label class="flex items-center gap-3 p-4 bg-white border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition">
                                    <input type="checkbox" value="${CONSTANTS.SERVICES.UPGRADE}" class="servicio-checkbox w-5 h-5 rounded text-blue-600 focus:ring-blue-500">
                                    <span class="font-medium text-gray-700">⬆️ Upgrade</span>
                                </label>
                                <label class="flex items-center gap-3 p-4 bg-white border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition">
                                    <input type="checkbox" value="transporte" class="servicio-checkbox w-5 h-5 rounded text-blue-600 focus:ring-blue-500">
                                    <span class="font-medium text-gray-700">🚗 Transporte</span>
                                </label>
                                <label class="flex items-center gap-3 p-4 bg-white border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition">
                                    <input type="checkbox" value="concierge" class="servicio-checkbox w-5 h-5 rounded text-blue-600 focus:ring-blue-500">
                                    <span class="font-medium text-gray-700">🔔 Concierge</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Tab: Feedback -->
                    <div id="interaction-tab-feedback" class="interaction-tab-content" style="display: none;">
                        <div class="space-y-6">
                            <div class="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-orange-200 rounded-xl p-6">
                                <label class="block text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                                    </svg>
                                    Calificación Medallia (1-10) *
                                </label>
                                <div class="flex items-center gap-4">
                                    <input type="number" id="calificacionMedallia" min="1" max="10" required
                                           class="flex-1 px-6 py-4 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-2xl font-bold text-center"
                                           placeholder="0">
                                    <div class="flex flex-col gap-2">
                                        <span class="text-sm font-medium text-gray-600">Escala:</span>
                                        <div class="flex gap-1">
                                            <span class="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">1-6 Detractor</span>
                                            <span class="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">7-8 Pasivo</span>
                                            <span class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">9-10 Promotor</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-bold text-gray-700 mb-2">💬 Feedback del Pasajero</label>
                                <textarea id="feedback" rows="5"
                                        placeholder="Comentarios del pasajero sobre su experiencia, qué le gustó, qué no le gustó, sugerencias..."
                                        class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Tab: Incidentes -->
                    <div id="interaction-tab-issues" class="interaction-tab-content" style="display: none;">
                        <div class="space-y-6">
                            <div class="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                                <label class="block text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L4.082 16c-.77 1.333.192 3 1.732 3z"/>
                                    </svg>
                                    Incidentes Reportados
                                </label>
                                <textarea id="incidentes" rows="4"
                                        placeholder="Describa cualquier problema, queja o situación negativa reportada por el pasajero..."
                                        class="w-full px-4 py-3 border-2 border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"></textarea>
                                <p class="text-xs text-red-600 mt-2">⚠️ Si hay incidentes, es importante registrar acciones de recuperación</p>
                            </div>

                            <div class="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                                <label class="block text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    Acciones de Recuperación
                                </label>
                                <textarea id="accionesRecuperacion" rows="4"
                                        placeholder="Describa las medidas tomadas para resolver problemas, compensaciones ofrecidas, etc..."
                                        class="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"></textarea>
                                <p class="text-xs text-green-600 mt-2">💡 Ejemplo: "Upgrade a business class", "Voucher de $100", "Acceso VIP lounge gratuito"</p>
                            </div>
                        </div>
                    </div>

                    <!-- Botones de acción -->
                    <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t-2 border-gray-200 mt-6">
                        <button type="button" onclick="saveInteraction(event)"
                                class="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition font-bold text-lg flex items-center justify-center shadow-lg hover:shadow-xl">
                            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Guardar Interacción
                        </button>
                        <button type="button" onclick="cancelInteraction()"
                                class="flex-1 sm:flex-initial bg-gray-500 text-white px-6 py-4 rounded-xl hover:bg-gray-600 transition font-bold">
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
    changeView(CONSTANTS.VIEWS.PASSENGER_SEARCH);
};

// Función para cancelar interacción
window.cancelInteraction = function() {
    StateManager.setState({ selectedPassenger: null, passengerInteractions: null });
    render();
};

// Función para alternar preferencias rápidas en el formulario de interacción
window.togglePreferenciaRapida = function(preferencia) {
    const textarea = document.getElementById('preferencias');
    if (!textarea) return;

    const textoActual = textarea.value.trim();
    const palabras = textoActual ? textoActual.split(', ') : [];

    // Mapeo de preferencias a texto legible
    const preferenciasMap = {
        'agua': 'agua',
        'cafe': 'café',
        'te': 'té',
        'jugo': 'jugo',
        'vegetariana': 'comida vegetariana',
        'vegana': 'comida vegana',
        'sin_gluten': 'sin gluten',
        'ventana': 'asiento ventana',
        'pasillo': 'asiento pasillo'
    };

    const textoPreferencia = preferenciasMap[preferencia] || preferencia;
    const index = palabras.indexOf(textoPreferencia);

    if (index === -1) {
        // Agregar preferencia
        palabras.push(textoPreferencia);
    } else {
        // Remover preferencia
        palabras.splice(index, 1);
    }

    // Actualizar textarea
    textarea.value = palabras.join(', ');

    // Agregar efecto visual al botón clickeado
    const buttons = document.querySelectorAll('button[onclick*="togglePreferenciaRapida"]');
    buttons.forEach(btn => {
        if (btn.onclick.toString().includes(`'${preferencia}'`)) {
            btn.classList.toggle('ring-2');
            btn.classList.toggle('ring-green-500');
            btn.classList.toggle('bg-green-200');
        }
    });

    // Remover efecto después de 1 segundo
    setTimeout(() => {
        buttons.forEach(btn => {
            if (btn.onclick.toString().includes(`'${preferencia}'`)) {
                btn.classList.remove('ring-2', 'ring-green-500', 'bg-green-200');
            }
        });
    }, 1000);
};

// Sistema de etiquetas mejorado con UI moderna
let currentSuggestions = null;

// Función genérica para renderizar un campo de etiquetas
function renderTagField(type, label, options, existingTags = [], icon = '🏷️') {
    const tagDisplay = existingTags.map(tag => `
        <span class="tag tag-${getTagColor(type)}" data-type="${type}" data-value="${tag}">
            ${icon} ${tag.charAt(0).toUpperCase() + tag.slice(1).replace(/_/g, ' ')}
            <button type="button" class="tag-remove ml-1" onclick="removeTag('${type}', '${tag.replace(/'/g, "\\'")}')">×</button>
        </span>
    `).join('');

    return `
        <div class="tag-input-container">
            <label class="block text-sm font-semibold text-gray-700 mb-2">${icon} ${label}</label>
            <div class="tag-display mb-2 flex flex-wrap gap-2 min-h-[2.5rem] p-2 border-2 border-gray-200 rounded-lg bg-gray-50">
                ${tagDisplay}
            </div>
            <div class="relative">
                <input type="text" class="tag-input w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                       placeholder="Escribe para buscar o crear nueva etiqueta..."
                       list="${type}-list"
                       oninput="showTagSuggestions(this, '${type}')"
                       onkeydown="handleTagInput(event, '${type}')">
                <datalist id="${type}-list">
                    ${options.map(option => `<option value="${option}">`).join('')}
                </datalist>
            </div>
        </div>
    `;
}

// Mostrar sugerencias de etiquetas mejoradas
window.showTagSuggestions = function(input, type) {
    const value = input.value.toLowerCase().trim();
    if (value.length < 1) {
        hideTagSuggestions();
        return;
    }

    const datalist = document.getElementById(`${type}-list`);
    if (!datalist) return;

    const suggestions = Array.from(datalist.options)
        .map(option => option.value)
        .filter(option => option.toLowerCase().includes(value));

    if (suggestions.length === 0) {
        hideTagSuggestions();
        return;
    }

    // Crear o actualizar contenedor de sugerencias con mejor diseño
    let suggestionsContainer = input.parentNode.querySelector('.tag-suggestions');
    if (!suggestionsContainer) {
        suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'tag-suggestions absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto';
        input.parentNode.appendChild(suggestionsContainer);
    }

    suggestionsContainer.innerHTML = suggestions.map(suggestion => `
        <div class="tag-suggestion" data-suggestion="${suggestion}" onclick="handleSuggestionClick(event, '${type}', '${suggestion.replace(/'/g, "\\'")}')">
            ${suggestion}
        </div>
    `).join('');

    suggestionsContainer.style.display = 'block';
    currentSuggestions = { input, type, container: suggestionsContainer };
};

// Ocultar sugerencias
function hideTagSuggestions() {
    if (currentSuggestions) {
        currentSuggestions.container.style.display = 'none';
        currentSuggestions = null;
    }
}

// Manejar click en sugerencia
window.handleSuggestionClick = function(event, type, value) {
    event.preventDefault();
    event.stopPropagation();

    // Buscar el input activo más cercano
    const suggestionsContainer = event.target.closest('.tag-suggestions');
    const inputContainer = suggestionsContainer?.parentNode;
    const input = inputContainer?.querySelector('.tag-input');

    if (input) {
        // Verificar si la etiqueta ya existe
        const tagDisplay = input.closest('.tag-input-container').querySelector('.tag-display');
        const existingTags = Array.from(tagDisplay.querySelectorAll('.tag'))
            .filter(tag => tag.getAttribute('data-type') === type)
            .map(tag => tag.getAttribute('data-value'));

        if (!existingTags.includes(value)) {
            addTag(type, value);
        }

        input.value = '';
        hideTagSuggestions();
    }
};

// Seleccionar sugerencia de etiqueta (mantenida por compatibilidad)
window.selectTagSuggestion = function(type, value) {
    if (currentSuggestions && currentSuggestions.input) {
        const input = currentSuggestions.input;

        // Verificar si la etiqueta ya existe
        const tagDisplay = input.parentNode.parentNode.querySelector('.tag-display');
        const existingTags = Array.from(tagDisplay.querySelectorAll('.tag'))
            .filter(tag => tag.getAttribute('data-type') === type)
            .map(tag => tag.getAttribute('data-value'));

        if (!existingTags.includes(value)) {
            addTag(type, value);
        }

        input.value = '';
        hideTagSuggestions();
    }
};

// Manejar input de etiquetas mejorado
window.handleTagInput = function(event, type) {
    const input = event.target;

    if (event.key === 'Enter' || event.key === ',') {
        event.preventDefault();
        const value = input.value.trim();
        if (value) {
            addTag(type, value);
            input.value = '';
            hideTagSuggestions();
        }
    } else if (event.key === 'Backspace' && input.value === '') {
        // Remover última etiqueta con backspace
        const tagDisplay = input.parentNode.parentNode.querySelector('.tag-display');
        if (tagDisplay) {
            const lastTag = tagDisplay.lastElementChild;
            if (lastTag && lastTag.classList.contains('tag')) {
                const tagValue = lastTag.getAttribute('data-value');
                const tagType = lastTag.getAttribute('data-type');
                removeTag(tagType, tagValue);
            }
        }
    }
};

// Agregar etiqueta mejorada
function addTag(type, value) {
    // Para preferencias rápidas, determinar automáticamente el tipo real
    let actualType = type;
    let actualValue = value.toLowerCase().trim();

    if (type === 'preferencias-rapidas') {
        // Categorizar automáticamente según el valor
        if (['agua', 'café', 'té', 'jugo', 'vino', 'cerveza', 'refresco', 'agua mineral', 'zumo'].includes(actualValue)) {
            actualType = 'bebida';
        } else if (['vegetariana', 'vegana', 'sin gluten', 'sin lactosa', 'halal', 'kosher', 'baja en sodio', 'diabética', 'hipocalórica'].includes(actualValue)) {
            actualType = 'comida';
        } else if (['ventana', 'pasillo', 'indiferente'].includes(actualValue)) {
            actualType = 'asiento';
        } else if (['sala vip', 'fast track', 'upgrade', 'transporte', 'concierge', 'wifi premium', 'comida especial'].includes(actualValue)) {
            actualType = 'servicios';
        } else if (['email', 'teléfono', 'whatsapp', 'sms'].includes(actualValue)) {
            actualType = 'contacto';
        } else if (['películas', 'música', 'libros', 'revistas', 'juegos', 'periódicos', 'podcasts', 'series'].includes(actualValue)) {
            actualType = 'entretenimiento';
        } else {
            actualType = 'otros';
        }
    }

    // Buscar todos los tag-display en la página
    const tagDisplays = document.querySelectorAll('.tag-display');
    let tagDisplay = null;

    // Encontrar el tag-display correcto basado en el contexto
    for (let display of tagDisplays) {
        const container = display.closest('.tag-input-container');
        const input = container?.querySelector('.tag-input');
        if (input && input.getAttribute('list') === `${type}-list`) {
            tagDisplay = display;
            break;
        }
    }

    if (!tagDisplay) {
        console.error('Tag display not found for type:', type);
        return;
    }

    const existingTags = tagDisplay.querySelectorAll(`[data-type="${actualType}"][data-value="${actualValue}"]`);
    if (existingTags.length > 0) return; // Evitar duplicados

    const tagElement = document.createElement('span');
    tagElement.className = `tag tag-${getTagColor(actualType)} px-3 py-1 rounded-full text-sm font-medium cursor-default border`;
    tagElement.setAttribute('data-type', actualType);
    tagElement.setAttribute('data-value', actualValue);
    tagElement.innerHTML = `
        ${getTagIcon(actualType)} ${actualValue.charAt(0).toUpperCase() + actualValue.slice(1).replace(/_/g, ' ')}
        <button type="button" class="tag-remove ml-1 hover:bg-red-200 rounded-full w-4 h-4 flex items-center justify-center text-xs" onclick="removeTag('${actualType}', '${actualValue.replace(/'/g, "\\'")}')">×</button>
    `;

    tagDisplay.appendChild(tagElement);
}

// Obtener icono según tipo de etiqueta
function getTagIcon(type) {
    const icons = {
        'bebida': '🥤',
        'comida': '🍽️',
        'entretenimiento': '🎬',
        'asiento': '💺',
        'servicios': '⭐',
        'contacto': '📱',
        'otros': '📝'
    };
    return icons[type] || '🏷️';
}

// Remover etiqueta
window.removeTag = function(type, value) {
    const tag = document.querySelector(`[data-type="${type}"][data-value="${value}"]`);
    if (tag) {
        tag.remove();
    }
};

// Obtener color de etiqueta según tipo
function getTagColor(type) {
    const colors = {
        'bebida': 'purple',
        'comida': 'green',
        'entretenimiento': 'purple',
        'asiento': 'green',
        'servicios': 'blue',
        'contacto': 'orange',
        'otros': 'gray'
    };
    return colors[type] || 'blue';
}

// Alternar preferencia de notificaciones
window.toggleNotificationPreference = function() {
    const checkbox = document.getElementById('editNotificarCambios');
    if (checkbox) {
        checkbox.checked = !checkbox.checked;
    }
};

// Manejar subida de foto
window.handlePhotoUpload = function(input) {
    const file = input.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
        showNotification('Por favor selecciona un archivo de imagen válido', 'error');
        return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('La imagen es demasiado grande. Máximo 5MB permitido', 'error');
        return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('fotoPreview');
        preview.innerHTML = `
            <img src="${e.target.result}" alt="Preview de nueva foto"
                 class="w-32 h-32 object-cover rounded-xl border-2 border-gray-300 shadow-md mx-auto">
            <button type="button" onclick="removeNewPhoto()"
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition">
                ×
            </button>
        `;

        // Limpiar el input de URL
        const urlInput = document.getElementById('editFotoUrl');
        if (urlInput) {
            urlInput.value = '';
        }

        showNotification('Foto cargada correctamente. Se subirá cuando guardes los cambios.', 'success');
    };

    reader.onerror = function() {
        showNotification('Error al leer el archivo de imagen', 'error');
    };

    reader.readAsDataURL(file);
};

// Remover foto actual
window.removeCurrentPhoto = function() {
    const preview = document.getElementById('fotoPreview');
    const urlInput = document.getElementById('editFotoUrl');

    preview.innerHTML = `
        <div class="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
        </div>
    `;

    if (urlInput) {
        urlInput.value = '';
    }
};

// Remover nueva foto subida
window.removeNewPhoto = function() {
    const fileInput = document.getElementById('fotoFile');
    if (fileInput) {
        fileInput.value = '';
    }
    removeCurrentPhoto();
};

// Ocultar sugerencias al hacer clic fuera
document.addEventListener('click', function(event) {
    if (!event.target.closest('.tag-input-container')) {
        hideTagSuggestions();
    }
});

// Función para cambiar entre tabs del formulario de interacción
window.switchInteractionTab = function(tabName) {
    // Remover clase active de todos los botones de tabs
    document.querySelectorAll('.interaction-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.classList.remove('bg-white/30', 'shadow-lg');
        btn.classList.add('bg-white/10', 'hover:bg-white/20');
    });

    // Agregar clase active al botón clickeado
    const activeBtn = document.querySelector(`.interaction-tab-btn[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.classList.add('bg-white/30', 'shadow-lg');
        activeBtn.classList.remove('bg-white/10', 'hover:bg-white/20');
    }

    // Ocultar todos los contenidos de tabs
    document.querySelectorAll('.interaction-tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });

    // Mostrar el contenido del tab seleccionado
    const activeContent = document.getElementById(`interaction-tab-${tabName}`);
    if (activeContent) {
        activeContent.classList.add('active');
        activeContent.style.display = 'block';
    }
};

// Función para guardar interacción (llamada desde el botón)
window.saveInteraction = async function(event) {
    event.preventDefault();

    const state = StateManager.getState();
    const passenger = state.selectedPassenger;

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

    // Procesar preferencias desde etiquetas
    const allTags = document.querySelectorAll('.tag-display .tag');
    const preferenciasTags = [];

    for (let i = 0; i < allTags.length; i++) {
        const tag = allTags[i];
        preferenciasTags.push({
            type: tag.getAttribute('data-type'),
            value: tag.getAttribute('data-value')
        });
    }

    // Organizar preferencias por tipo
    const preferenciasData = {
        bebida: preferenciasTags.filter(function(t) { return t.type === 'bebida'; }).map(function(t) { return t.value; }),
        comida: preferenciasTags.filter(function(t) { return t.type === 'comida'; }).map(function(t) { return t.value; }),
        asiento: preferenciasTags.filter(function(t) { return t.type === 'asiento'; }).map(function(t) { return t.value; }),
        servicios: preferenciasTags.filter(function(t) { return t.type === 'servicios'; }).map(function(t) { return t.value; }),
        otros: preferenciasTags.filter(function(t) { return t.type === 'otros'; }).map(function(t) { return t.value; })
    };

    // Aplanar arrays de un solo elemento
    Object.keys(preferenciasData).forEach(function(key) {
        if (preferenciasData[key].length === 0) {
            delete preferenciasData[key];
        } else if (preferenciasData[key].length === 1) {
            preferenciasData[key] = preferenciasData[key][0];
        }
    });

    const interactionData = {
        pasajero_id: passenger.id,
        agente_nombre: state.currentUser,
        fecha: new Date().toISOString(),
        motivo_viaje: document.getElementById('motivoViaje').value || null,
        feedback: document.getElementById('feedback').value.trim() || null,
        calificacion_medallia: parseInt(document.getElementById('calificacionMedallia').value) || null,
        servicios_utilizados: serviciosUtilizados.length > 0 ? serviciosUtilizados : null,
        preferencias: Object.keys(preferenciasData).length > 0 ? preferenciasData : null,
        incidentes: document.getElementById('incidentes').value.trim() || null,
        acciones_recuperacion: document.getElementById('accionesRecuperacion').value.trim() || null,
        notas: document.getElementById('notas').value.trim() || null,
        es_cumpleanos: Utils.isBirthday(passenger.fecha_nacimiento)
    };

    try {
        const result = await ApiService.createInteraction(interactionData);

        showNotification(`Interacción guardada exitosamente para ${passenger.nombre}`, 'success');

        // Limpiar formulario y volver a búsqueda
        StateManager.setState({ selectedPassenger: null, passengerInteractions: null });
        changeView(CONSTANTS.VIEWS.PASSENGER_SEARCH);

    } catch (error) {
        console.error('Error saving interaction:', error);
        showNotification('Error al guardar la interacción', 'error');
    }
};

// Función para configurar handlers del formulario de interacción (ya no usada)
const setupInteractionFormHandlers = () => {
    // Handlers configurados directamente en el HTML
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

    // Establecer fecha de hoy por defecto - Fecha actual del sistema
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
                                Formato: <code class="bg-white px-2 py-1 rounded font-mono text-xs break-all">VUELO,DESTINO,NOMBRE,CATEGORIA,ESTATUS,ASIENTO</code>
                            </p>
                            <div class="grid grid-cols-1 gap-3 text-sm text-blue-800">
                                <div>
                                    <strong>Categorías válidas:</strong>
                                    <span class="break-words">SIGNATURE, TOP, BLACK, PLATINUM, GOLD PLUS, GOLD</span>
                                </div>
                                <div>
                                    <strong>Estatus válidos:</strong>
                                    <span class="break-words">CONFIRMADO, CHECK-IN, BOARDING, EMBARKED</span>
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
                const sample = \`LA2191,LIM,LUIS PALACIOS,SIGNATURE,CONFIRMADO,2B
LA2001,LIM,Carlos Martinez,BLACK,CONFIRMADO,1A
LA2001,LIM,Ana Torres,PLATINUM,CHECK-IN,1B
LA2001,LIM,Roberto Silva,GOLD PLUS,CONFIRMADO,2A
LA2002,CUZ,Patricia Gomez,TOP,BOARDING,2C\`;
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

        // Agrupar interacciones por pasajero para timeline
        const passengerInteractions = {};
        interactions.forEach(interaction => {
            const passengerId = interaction.pasajero_id;
            if (!passengerInteractions[passengerId]) {
                passengerInteractions[passengerId] = [];
            }
            passengerInteractions[passengerId].push(interaction);
        });

        // Ordenar interacciones de cada pasajero por fecha (más reciente primero)
        Object.keys(passengerInteractions).forEach(passengerId => {
            passengerInteractions[passengerId].sort((a, b) =>
                new Date(b.fecha) - new Date(a.fecha)
            );
        });

        // Calcular métricas inteligentes
        const passengersAtRisk = [];
        const passengersRecovered = [];
        const recentInteractions = [];
        const birthdayPassengers = [];


        Object.keys(passengerInteractions).forEach(passengerId => {
            const passenger = passengerMap[passengerId];
            if (!passenger) return;

            const interactions = passengerInteractions[passengerId];
            const latestInteraction = interactions[0];

            // Determinar el estado del pasajero basado en su historial
            const hasMultipleInteractions = interactions.length >= 2;
            const latestRating = latestInteraction.calificacion_medallia;


            if (hasMultipleInteractions && latestRating) {
                // Buscar la interacción anterior que tenga calificación (puede no ser la inmediata anterior)
                let previousRating = null;
                for (let i = 1; i < interactions.length; i++) {
                    if (interactions[i].calificacion_medallia !== null && interactions[i].calificacion_medallia !== undefined) {
                        previousRating = interactions[i].calificacion_medallia;
                        break; // Encontramos la primera anterior con rating
                    }
                }

                // RECUPERADO: tenía calificación baja (≤6) y ahora mejoró (>6)
                if (previousRating !== null && previousRating <= 6 && latestRating > 6) {
                    passengersRecovered.push({
                        ...passenger,
                        previousRating: previousRating,
                        currentRating: latestRating,
                        recoveryDate: latestInteraction.fecha,
                        interactionCount: interactions.length
                    });
                }
                // EN RIESGO: su última calificación es baja (≤6) - NO recuperado
                else if (latestRating <= 6) {
                    passengersAtRisk.push({
                        ...passenger,
                        lastRating: latestRating,
                        lastInteraction: latestInteraction.fecha,
                        interactionCount: interactions.length,
                        hasRecoveryActions: latestInteraction.acciones_recuperacion && latestInteraction.acciones_recuperacion.trim() !== ''
                    });
                }
            }
            // Si solo tiene UNA interacción y es baja, está en riesgo
            else if (latestRating && latestRating <= 6) {
                passengersAtRisk.push({
                    ...passenger,
                    lastRating: latestRating,
                    lastInteraction: latestInteraction.fecha,
                    interactionCount: interactions.length,
                    hasRecoveryActions: latestInteraction.acciones_recuperacion && latestInteraction.acciones_recuperacion.trim() !== ''
                });
            }

            // Cumpleaños próximos
            if (Utils.isBirthday(passenger.fecha_nacimiento)) {
                birthdayPassengers.push(passenger);
            }
        });

        // Interacciones recientes (últimas 24 horas) - Zona horaria Perú
        const oneDayAgo = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Lima"}));
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        interactions.forEach(interaction => {
            const interactionDate = new Date(interaction.fecha);
            if (interactionDate >= oneDayAgo) {
                recentInteractions.push({
                    ...interaction,
                    passenger: passengerMap[interaction.pasajero_id]
                });
            }
        });

        // Ordenar por fecha (más reciente primero)
        recentInteractions.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));


        return `
            <div class="max-w-7xl mx-auto p-4 sm:p-6">
                <!-- Header con gradiente mejorado -->
                <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-6 sm:p-8 mb-8 text-white">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 class="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
                                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                                </svg>
                                Tracking de Pasajeros HVC
                            </h2>
                            <p class="text-white/90 text-base sm:text-lg">Monitoreo en tiempo real con insights inteligentes</p>
                        </div>
                        <div class="flex gap-3">
                            <div class="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                <p class="text-xs text-white/80">Total Pasajeros</p>
                                <p class="text-2xl font-bold">${passengers.length}</p>
                            </div>
                            <div class="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                <p class="text-xs text-white/80">Interacciones</p>
                                <p class="text-2xl font-bold">${interactions.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Buscador y filtros interactivos -->
                <div class="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-gray-100">
                    <div class="flex flex-col lg:flex-row gap-4">
                        <div class="flex-1">
                            <label class="block text-sm font-bold text-gray-700 mb-2">🔍 Buscar Pasajero</label>
                            <input type="text" id="trackingSearchInput"
                                   placeholder="Buscar por nombre, DNI o categoría..."
                                   onkeyup="filterTracking()"
                                   class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                        </div>
                        <div class="lg:w-64">
                            <label class="block text-sm font-bold text-gray-700 mb-2">🎯 Filtro Estado</label>
                            <select id="trackingFilterStatus" onchange="filterTracking()"
                                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                                <option value="all">Todos los estados</option>
                                <option value="risk">En Riesgo</option>
                                <option value="recovered">Recuperados</option>
                                <option value="birthday">Cumpleaños</option>
                                <option value="recent">Atendidos Hoy</option>
                            </select>
                        </div>
                        <div class="lg:w-64">
                            <label class="block text-sm font-bold text-gray-700 mb-2">⭐ Categoría</label>
                            <select id="trackingFilterCategory" onchange="filterTracking()"
                                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                                <option value="all">Todas</option>
                                <option value="SIGNATURE">SIGNATURE</option>
                                <option value="TOP">TOP</option>
                                <option value="BLACK">BLACK</option>
                                <option value="PLATINUM">PLATINUM</option>
                                <option value="GOLD PLUS">GOLD PLUS</option>
                                <option value="GOLD">GOLD</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Métricas rápidas mejoradas con animaciones -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
                    <div class="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
                        <div class="flex items-center justify-between mb-3">
                            <div class="bg-red-500 p-3 rounded-xl shadow-lg">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L4.082 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                            </div>
                            <span class="text-4xl font-black text-red-600">${passengersAtRisk.length}</span>
                        </div>
                        <h3 class="text-sm font-bold text-red-800 uppercase tracking-wide">😞 En Riesgo</h3>
                        <div class="mt-2 w-full bg-red-200 rounded-full h-2">
                            <div class="bg-red-600 h-2 rounded-full" style="width: ${passengers.length > 0 ? (passengersAtRisk.length / passengers.length * 100) : 0}%"></div>
                        </div>
                    </div>

                    <div class="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
                        <div class="flex items-center justify-between mb-3">
                            <div class="bg-green-500 p-3 rounded-xl shadow-lg">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <span class="text-4xl font-black text-green-600">${passengersRecovered.length}</span>
                        </div>
                        <h3 class="text-sm font-bold text-green-800 uppercase tracking-wide">🎉 Recuperados</h3>
                        <div class="mt-2 w-full bg-green-200 rounded-full h-2">
                            <div class="bg-green-600 h-2 rounded-full" style="width: ${passengersAtRisk.length > 0 ? (passengersRecovered.length / passengersAtRisk.length * 100) : 0}%"></div>
                        </div>
                    </div>

                    <div class="bg-gradient-to-br from-yellow-50 to-amber-100 border-2 border-yellow-200 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
                        <div class="flex items-center justify-between mb-3">
                            <div class="bg-yellow-500 p-3 rounded-xl shadow-lg">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <span class="text-4xl font-black text-yellow-600">${recentInteractions.length}</span>
                        </div>
                        <h3 class="text-sm font-bold text-yellow-800 uppercase tracking-wide">⚡ Hoy</h3>
                        <div class="mt-2 w-full bg-yellow-200 rounded-full h-2">
                            <div class="bg-yellow-600 h-2 rounded-full" style="width: ${interactions.length > 0 ? (recentInteractions.length / interactions.length * 100) : 0}%"></div>
                        </div>
                    </div>

                    <div class="bg-gradient-to-br from-pink-50 to-rose-100 border-2 border-pink-200 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
                        <div class="flex items-center justify-between mb-3">
                            <div class="bg-pink-500 p-3 rounded-xl shadow-lg">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18z"/>
                                </svg>
                            </div>
                            <span class="text-4xl font-black text-pink-600">${birthdayPassengers.length}</span>
                        </div>
                        <h3 class="text-sm font-bold text-pink-800 uppercase tracking-wide">🎂 Cumpleaños</h3>
                        <div class="mt-2 w-full bg-pink-200 rounded-full h-2">
                            <div class="bg-pink-600 h-2 rounded-full" style="width: ${passengers.length > 0 ? (birthdayPassengers.length / passengers.length * 100) : 0}%"></div>
                        </div>
                    </div>

                    <div class="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
                        <div class="flex items-center justify-between mb-3">
                            <div class="bg-blue-500 p-3 rounded-xl shadow-lg">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                                </svg>
                            </div>
                            <span class="text-4xl font-black text-blue-600">${interactions.length}</span>
                        </div>
                        <h3 class="text-sm font-bold text-blue-800 uppercase tracking-wide">📊 Total</h3>
                        <div class="mt-2 w-full bg-blue-200 rounded-full h-2">
                            <div class="bg-blue-600 h-2 rounded-full" style="width: 100%"></div>
                        </div>
                    </div>
                </div>

                <!-- Pasajeros Recuperados (Éxitos) -->
                ${passengersRecovered.length > 0 ? `
                    <div class="bg-white rounded-2xl shadow-xl mb-8 border-2 border-green-200 overflow-hidden" data-section="recovered">
                        <div class="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
                            <h3 class="text-2xl font-bold flex items-center gap-3">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                🎉 ¡Recuperaciones Exitosas!
                            </h3>
                            <p class="text-white/90 mt-2">Pasajeros que mejoraron significativamente su experiencia</p>
                        </div>
                        <div class="p-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                ${passengersRecovered.map(passenger => `
                                    <div class="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 hover:shadow-xl hover:scale-102 transition-all duration-300" data-passenger-card data-category="${passenger.categoria}">
                                        <div class="flex items-start gap-4">
                                            <div class="relative">
                                                <div class="w-16 h-16 ${Utils.getCategoryClass(passenger.categoria)} rounded-full flex items-center justify-center shadow-lg">
                                                    <span class="text-white font-bold text-2xl">${passenger.nombre.charAt(0)}</span>
                                                </div>
                                                <div class="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 shadow-lg">
                                                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                                    </svg>
                                                </div>
                                            </div>
                                            <div class="flex-1">
                                                <h4 class="font-bold text-gray-900 text-lg">${passenger.nombre}</h4>
                                                <p class="text-sm text-gray-600 mb-3">${passenger.dni_pasaporte} • ${passenger.categoria}</p>
                                                <div class="flex items-center gap-3 mb-3">
                                                    <span class="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium">${passenger.previousRating}/10 😞</span>
                                                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                                                    </svg>
                                                    <span class="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">${passenger.currentRating}/10 😊</span>
                                                </div>
                                                <div class="flex items-center justify-between">
                                                    <span class="text-xs text-gray-500">${Utils.formatDateTime(passenger.recoveryDate)}</span>
                                                    <button onclick="viewPassengerTimeline('${passenger.id}')"
                                                            class="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs font-medium">
                                                        Ver Timeline
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- Pasajeros en Riesgo (Requieren Atención) -->
                ${passengersAtRisk.length > 0 ? `
                    <div class="bg-white rounded-2xl shadow-xl mb-8 border-2 border-red-200 overflow-hidden" data-section="risk">
                        <div class="bg-gradient-to-r from-red-600 to-rose-600 p-6 text-white">
                            <h3 class="text-2xl font-bold flex items-center gap-3">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L4.082 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                                ⚠️ Pasajeros en Riesgo - Atención Inmediata
                            </h3>
                            <p class="text-white/90 mt-2">Última calificación baja - necesitan acciones de recuperación urgentes</p>
                        </div>
                        <div class="p-6">
                            <div class="space-y-4">
                                ${passengersAtRisk.map(passenger => `
                                    <div class="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300" data-passenger-card data-category="${passenger.categoria}">
                                        <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                                            <div class="flex items-start gap-4 flex-1">
                                                <div class="relative">
                                                    <div class="w-16 h-16 ${Utils.getCategoryClass(passenger.categoria)} rounded-full flex items-center justify-center shadow-lg">
                                                        <span class="text-white font-bold text-2xl">${passenger.nombre.charAt(0)}</span>
                                                    </div>
                                                    ${!passenger.hasRecoveryActions ? `
                                                        <div class="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 shadow-lg animate-pulse">
                                                            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                                                            </svg>
                                                        </div>
                                                    ` : ''}
                                                </div>
                                                <div class="flex-1">
                                                    <h4 class="font-bold text-gray-900 text-lg mb-1">${passenger.nombre}</h4>
                                                    <p class="text-sm text-gray-600 mb-3">${passenger.dni_pasaporte} • ${passenger.categoria}</p>
                                                    <div class="flex flex-wrap items-center gap-3 mb-3">
                                                        <span class="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-bold border-2 border-red-300">
                                                            😞 ${passenger.lastRating}/10 Detractor
                                                        </span>
                                                        <span class="text-xs text-gray-500">${Utils.formatDateTime(passenger.lastInteraction)}</span>
                                                        <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                            ${passenger.interactionCount} interacción${passenger.interactionCount > 1 ? 'es' : ''}
                                                        </span>
                                                    </div>
                                                    ${!passenger.hasRecoveryActions ? `
                                                        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                                                            <p class="text-xs text-yellow-800 font-medium">⚠️ Sin acciones de recuperación registradas</p>
                                                        </div>
                                                    ` : `
                                                        <div class="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                                                            <p class="text-xs text-blue-800 font-medium">✓ Acciones de recuperación aplicadas</p>
                                                        </div>
                                                    `}
                                                </div>
                                            </div>
                                            <div class="flex flex-col gap-2 sm:min-w-[140px]">
                                                <button onclick="startPassengerInteraction('${passenger.id}')"
                                                        class="bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-3 rounded-xl hover:from-red-700 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl text-sm font-bold flex items-center justify-center gap-2">
                                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                                                    </svg>
                                                    Atender
                                                </button>
                                                <button onclick="viewPassengerTimeline('${passenger.id}')"
                                                        class="bg-white border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all text-sm font-medium flex items-center justify-center gap-2">
                                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                    </svg>
                                                    Timeline
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- Cumpleaños del día -->
                ${birthdayPassengers.length > 0 ? `
                    <div class="bg-white rounded-2xl shadow-xl mb-8 border-2 border-pink-200 overflow-hidden" data-section="birthday">
                        <div class="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 p-6 text-white">
                            <h3 class="text-2xl font-bold flex items-center gap-3">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18z"/>
                                </svg>
                                🎂 ¡Cumpleaños del Día!
                            </h3>
                            <p class="text-white/90 mt-2">Celebra a estos pasajeros especiales y crea momentos memorables</p>
                        </div>
                        <div class="p-6">
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                ${birthdayPassengers.map(passenger => `
                                    <div class="bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 border-2 border-pink-200 rounded-xl p-5 text-center hover:shadow-xl hover:scale-105 transition-all duration-300" data-passenger-card data-category="${passenger.categoria}">
                                        <div class="relative inline-block mb-4">
                                            <div class="w-20 h-20 ${Utils.getCategoryClass(passenger.categoria)} rounded-full flex items-center justify-center shadow-xl">
                                                <span class="text-white font-bold text-2xl">${passenger.nombre.charAt(0)}</span>
                                            </div>
                                            <div class="absolute -top-2 -right-2 text-4xl animate-bounce">🎉</div>
                                        </div>
                                        <h4 class="font-bold text-gray-900 text-lg mb-1">${passenger.nombre}</h4>
                                        <p class="text-sm text-gray-600 mb-1">${passenger.dni_pasaporte}</p>
                                        <span class="inline-block px-3 py-1 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 rounded-full text-xs font-bold mb-4">
                                            ${passenger.categoria}
                                        </span>
                                        <button onclick="startPassengerInteraction('${passenger.id}')"
                                                class="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white px-4 py-3 rounded-xl hover:from-pink-700 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl font-bold flex items-center justify-center gap-2">
                                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
                                            </svg>
                                            Felicitar
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- Interacciones recientes -->
                <div class="bg-white rounded-2xl shadow-xl border-2 border-blue-200 overflow-hidden" data-section="recent">
                    <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                        <h3 class="text-2xl font-bold flex items-center gap-3">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            ⚡ Actividad Reciente (Últimas 24h)
                        </h3>
                        <p class="text-white/90 mt-2">Timeline de interacciones y atenciones del día</p>
                    </div>
                    <div class="p-6">
                        ${recentInteractions.length > 0 ? `
                            <div class="space-y-4">
                                ${recentInteractions.slice(0, 15).map((interaction, index) => `
                                    <div class="relative bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 hover:shadow-lg hover:scale-[1.01] transition-all duration-300" data-passenger-card data-category="${interaction.passenger.categoria}">
                                        <!-- Timeline connector -->
                                        ${index < recentInteractions.slice(0, 15).length - 1 ? `
                                            <div class="absolute left-8 top-full w-0.5 h-4 bg-blue-200"></div>
                                        ` : ''}

                                        <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                                            <div class="flex items-start gap-4 flex-1">
                                                <div class="relative flex-shrink-0">
                                                    <div class="w-14 h-14 ${Utils.getCategoryClass(interaction.passenger.categoria)} rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                                                        <span class="text-white font-bold text-lg">${interaction.passenger.nombre.charAt(0)}</span>
                                                    </div>
                                                    <!-- Badge de tiempo relativo -->
                                                    <div class="absolute -bottom-2 -right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow">
                                                        ${new Date(interaction.fecha).getHours()}:${String(new Date(interaction.fecha).getMinutes()).padStart(2, '0')}
                                                    </div>
                                                </div>

                                                <div class="flex-1">
                                                    <div class="flex items-center gap-2 mb-1">
                                                        <h4 class="font-bold text-gray-900 text-lg">${interaction.passenger.nombre}</h4>
                                                        <span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                                            ${interaction.passenger.categoria}
                                                        </span>
                                                    </div>

                                                    <div class="flex flex-wrap items-center gap-2 mb-3">
                                                        <span class="text-xs text-gray-600 flex items-center gap-1">
                                                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                                                            </svg>
                                                            ${interaction.agente_nombre}
                                                        </span>
                                                        <span class="text-xs text-gray-400">•</span>
                                                        <span class="text-xs text-gray-600">${Utils.formatDateTime(interaction.fecha)}</span>
                                                        ${interaction.calificacion_medallia ? `
                                                            <span class="text-xs text-gray-400">•</span>
                                                            <span class="px-3 py-1 rounded-lg text-sm font-bold ${Utils.getMedalliaColor(interaction.calificacion_medallia)}">
                                                                ${interaction.calificacion_medallia <= CONSTANTS.MEDALLIA_THRESHOLDS.DETRACTOR ? '😞' :
                                                                  interaction.calificacion_medallia <= CONSTANTS.MEDALLIA_THRESHOLDS.PASSIVE ? '😐' : '😊'}
                                                                ${interaction.calificacion_medallia}/10
                                                            </span>
                                                        ` : ''}
                                                    </div>

                                                    ${interaction.feedback ? `
                                                        <div class="bg-white p-3 rounded-lg border-l-4 border-indigo-400 shadow-sm mb-3">
                                                            <p class="text-sm text-gray-700 italic">"${interaction.feedback}"</p>
                                                        </div>
                                                    ` : ''}

                                                    ${interaction.servicios_utilizados && interaction.servicios_utilizados.length > 0 ? `
                                                        <div class="flex flex-wrap gap-2 mb-3">
                                                            <span class="text-xs text-gray-600 font-medium">Servicios:</span>
                                                            ${interaction.servicios_utilizados.map(servicio => `
                                                                <span class="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full font-medium">
                                                                    ${servicio}
                                                                </span>
                                                            `).join('')}
                                                        </div>
                                                    ` : ''}

                                                    ${interaction.incidentes ? `
                                                        <div class="bg-red-50 border-l-4 border-red-400 p-3 rounded-lg mb-2">
                                                            <p class="text-xs text-red-800"><strong>Incidente:</strong> ${interaction.incidentes}</p>
                                                        </div>
                                                    ` : ''}

                                                    ${interaction.acciones_recuperacion ? `
                                                        <div class="bg-green-50 border-l-4 border-green-400 p-3 rounded-lg">
                                                            <p class="text-xs text-green-800"><strong>Recuperación:</strong> ${interaction.acciones_recuperacion}</p>
                                                        </div>
                                                    ` : ''}
                                                </div>
                                            </div>

                                            <div class="flex flex-col gap-2 sm:min-w-[120px]">
                                                <button onclick="viewPassengerTimeline('${interaction.passenger.id}')"
                                                        class="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all text-xs font-bold shadow-lg hover:shadow-xl flex items-center justify-center gap-1">
                                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                                    </svg>
                                                    Ver más
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="text-center py-16">
                                <div class="inline-block p-6 bg-gray-100 rounded-full mb-4">
                                    <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <p class="text-lg text-gray-600 font-medium">No hay interacciones en las últimas 24 horas</p>
                                <p class="text-sm text-gray-500 mt-2">Las nuevas interacciones aparecerán aquí</p>
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

    // Calcular estadísticas del mes
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthInteractions = interactions.filter(i => {
        const date = new Date(i.fecha);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    // Identificar detractores y detractores recuperados
    const allDetractors = monthInteractions.filter(i => i.calificacion_medallia && i.calificacion_medallia <= 6);
    const recoveredDetractors = allDetractors.filter(i => i.acciones_recuperacion && i.acciones_recuperacion.trim() !== '');
    const activeDetractors = allDetractors.filter(i => !i.acciones_recuperacion || i.acciones_recuperacion.trim() === '');

    const monthStats = {
        totalInteractions: monthInteractions.length,
        avgRating: monthInteractions.length > 0 ?
            (monthInteractions.reduce((sum, i) => sum + (i.calificacion_medallia || 0), 0) / monthInteractions.filter(i => i.calificacion_medallia).length).toFixed(1) : 0,
        detractors: activeDetractors.length, // Solo detractores SIN recuperación
        promoters: monthInteractions.filter(i => i.calificacion_medallia && i.calificacion_medallia >= 9).length,
        withRecovery: recoveredDetractors.length // Solo detractores que SÍ tienen recuperación
    };

    return `
        <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <!-- 1. HEADER: Monitoreo en Tiempo Real -->
            <div class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-2xl p-6 sm:p-8 mb-8 text-white relative overflow-hidden">
                <!-- Patrón de fondo decorativo -->
                <div class="absolute inset-0 opacity-10">
                    <div class="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32"></div>
                    <div class="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-32 translate-y-32"></div>
                </div>

                <div class="relative z-10">
                    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                        <div>
                            <h1 class="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
                                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                                </svg>
                                Dashboard HVC
                            </h1>
                            <p class="text-blue-100 text-lg">Monitoreo en tiempo real de pasajeros de alto valor</p>
                        </div>
                        ${window.DB_AVAILABLE ? `
                            <div class="bg-green-500/20 backdrop-blur-sm border-2 border-green-300 rounded-xl px-5 py-3">
                                <div class="flex items-center gap-2">
                                    <div class="w-3 h-3 bg-green-300 rounded-full animate-pulse shadow-lg"></div>
                                    <span class="text-sm font-bold">Sistema Activo</span>
                                </div>
                                <p class="text-xs text-green-200 mt-1">Datos en tiempo real</p>
                            </div>
                        ` : `
                            <div class="bg-yellow-500/20 backdrop-blur-sm border-2 border-yellow-300 rounded-xl px-5 py-3">
                                <div class="flex items-center gap-2">
                                    <div class="w-3 h-3 bg-yellow-300 rounded-full"></div>
                                    <span class="text-sm font-bold">Modo Demo</span>
                                </div>
                                <p class="text-xs text-yellow-200 mt-1">Datos de ejemplo</p>
                            </div>
                        `}
                    </div>

                    <!-- Métricas en tiempo real -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition">
                            <p class="text-blue-100 text-sm mb-1">👥 Pasajeros HVC</p>
                            <p class="text-3xl font-black">${metrics.totalPassengers || 0}</p>
                        </div>
                        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition">
                            <p class="text-blue-100 text-sm mb-1">⭐ Satisfacción</p>
                            <p class="text-3xl font-black">${(metrics.avgMedallia || 0).toFixed(1)}<span class="text-lg">/10</span></p>
                        </div>
                        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition">
                            <p class="text-blue-100 text-sm mb-1">📊 NPS Score</p>
                            <p class="text-3xl font-black">${npsScore}</p>
                        </div>
                        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition">
                            <p class="text-blue-100 text-sm mb-1">⚠️ En Riesgo</p>
                            <p class="text-3xl font-black ${metrics.passengersAtRisk > 0 ? 'text-yellow-300' : 'text-green-300'}">${metrics.passengersAtRisk || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 2. ALERTAS E INSIGHTS PRIORITARIOS (con Manual) -->
            ${(dashboardInsights && dashboardInsights.length > 0) || (performanceInsights && performanceInsights.length > 0) ? `
                <div class="mb-8">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <svg class="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L4.082 16c-.77 1.333.192 3 1.732 3z"/>
                            </svg>
                            Alertas e Insights Inteligentes
                        </h2>
                        <button onclick="showManualRecommendations()"
                                class="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2 rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg transition-all hover:shadow-xl">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                            </svg>
                            Ver Más Recomendaciones
                        </button>
                    </div>
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
                                <div class="${colors.bg} border-l-4 ${colors.border} rounded-xl p-5 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                                     onclick="showInsightDetails('${insight.title}', '${insight.message}', '${insight.action || ''}')">
                                    <div class="flex items-start justify-between mb-3">
                                        <div class="flex items-center gap-3">
                                            <span class="text-3xl">${insight.icon}</span>
                                            <h3 class="font-bold ${colors.title} text-base">${insight.title}</h3>
                                        </div>
                                        <span class="text-xs font-bold text-white ${colors.badge} px-3 py-1 rounded-full uppercase">
                                            ${insight.priority === 'critical' ? 'Crítico' :
                                              insight.priority === 'high' ? 'Alto' :
                                              insight.priority === 'medium' ? 'Medio' : 'Bajo'}
                                        </span>
                                    </div>
                                    <p class="text-sm text-gray-700 mb-3">${insight.message}</p>
                                    ${insight.action ? `
                                        <div class="mt-3 pt-3 border-t ${colors.border}">
                                            <p class="text-sm font-semibold ${colors.icon} flex items-center gap-2">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                                                </svg>
                                                ${insight.action}
                                            </p>
                                        </div>
                                    ` : ''}
                                </div>
                            `;
                        }).join('') : ''}

                        ${performanceInsights && performanceInsights.length > 0 ? performanceInsights.map(insight => `
                            <div class="p-5 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer ${
                                insight.type === 'success' ? 'bg-green-50 border-l-4 border-green-400' :
                                insight.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-400' :
                                insight.type === 'danger' ? 'bg-red-50 border-l-4 border-red-400' :
                                'bg-blue-50 border-l-4 border-blue-400'}">
                                <div class="flex items-start gap-3">
                                    <div class="text-3xl flex-shrink-0">${insight.icon}</div>
                                    <div class="flex-1">
                                        <h3 class="font-bold text-gray-800 text-base mb-2">${insight.title}</h3>
                                        <p class="text-sm text-gray-600 mb-3">${insight.message}</p>
                                        ${insight.action ? `
                                            <p class="text-sm font-medium text-blue-600 flex items-center gap-2">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                                                </svg>
                                                ${insight.action}
                                            </p>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('') : ''}
                    </div>
                </div>
            ` : ''}

            <!-- 3. SISTEMA DE RECUPERACIÓN DE PASAJEROS (Interactivo) -->
            ${recoveryMetrics ? `
                <div class="mb-8">
                    <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Sistema de Recuperación NPS
                    </h2>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <!-- NPS Score -->
                        <div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:scale-105 transition-transform cursor-pointer">
                            <div class="text-center">
                                <p class="text-sm font-medium opacity-90 mb-2">NPS Score</p>
                                <p class="text-5xl font-black mb-2">${npsScore}</p>
                                <p class="text-xs opacity-75">Net Promoter Score</p>
                            </div>
                        </div>

                        <!-- Detractores -->
                        <div class="bg-gradient-to-br from-red-50 to-rose-100 border-2 border-red-200 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
                             onclick="filterByNPS('detractors')">
                            <div class="flex items-center justify-between mb-3">
                                <div class="bg-red-500 p-3 rounded-xl">
                                    <span class="text-2xl">😞</span>
                                </div>
                                <span class="text-4xl font-black text-red-600">${recoveryMetrics.detractors || 0}</span>
                            </div>
                            <p class="text-sm font-bold text-red-800 uppercase">Detractores</p>
                            <p class="text-xs text-red-600 mt-1">Calificación ≤ 6</p>
                        </div>

                        <!-- Pasivos -->
                        <div class="bg-gradient-to-br from-yellow-50 to-amber-100 border-2 border-yellow-200 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
                             onclick="filterByNPS('passives')">
                            <div class="flex items-center justify-between mb-3">
                                <div class="bg-yellow-500 p-3 rounded-xl">
                                    <span class="text-2xl">😐</span>
                                </div>
                                <span class="text-4xl font-black text-yellow-600">${recoveryMetrics.passives || 0}</span>
                            </div>
                            <p class="text-sm font-bold text-yellow-800 uppercase">Pasivos</p>
                            <p class="text-xs text-yellow-600 mt-1">Calificación 7-8</p>
                        </div>

                        <!-- Promotores -->
                        <div class="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
                             onclick="filterByNPS('promoters')">
                            <div class="flex items-center justify-between mb-3">
                                <div class="bg-green-500 p-3 rounded-xl">
                                    <span class="text-2xl">😊</span>
                                </div>
                                <span class="text-4xl font-black text-green-600">${recoveryMetrics.promoters || 0}</span>
                            </div>
                            <p class="text-sm font-bold text-green-800 uppercase">Promotores</p>
                            <p class="text-xs text-green-600 mt-1">Calificación ≥ 9</p>
                        </div>

                        <!-- Tasa de Recuperación -->
                        <div class="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                            <div class="flex items-center justify-between mb-3">
                                <div class="bg-blue-500 p-3 rounded-xl">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                                    </svg>
                                </div>
                                <span class="text-4xl font-black text-blue-600">${parseFloat(recoveryMetrics.successfulRecoveryRate || 0).toFixed(0)}%</span>
                            </div>
                            <p class="text-sm font-bold text-blue-800 uppercase">Efectividad</p>
                            <p class="text-xs text-blue-600 mt-1">${recoveryMetrics.successfulRecoveries || 0} recuperados</p>
                        </div>
                    </div>
                </div>
            ` : ''}

            <!-- 4. ANÁLISIS DE DATOS -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <!-- Distribución por Categoría -->
                <div class="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
                    <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
                        </svg>
                        Distribución por Categoría
                    </h3>
                    <div class="space-y-4">
                        ${Object.entries(metrics.categoryCount || {}).sort((a, b) => b[1] - a[1]).map(([category, count]) => {
                            const total = Object.values(metrics.categoryCount).reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                            const categoryColors = {
                                'SIGNATURE': 'from-purple-500 to-pink-500',
                                'TOP': 'from-amber-500 to-orange-500',
                                'BLACK': 'from-gray-700 to-gray-900',
                                'PLATINUM': 'from-cyan-500 to-blue-500',
                                'GOLD PLUS': 'from-orange-500 to-yellow-500',
                                'GOLD': 'from-yellow-500 to-amber-500'
                            };
                            const gradient = categoryColors[category] || 'from-gray-400 to-gray-600';

                            return `
                                <div class="group hover:bg-gray-50 p-3 rounded-xl transition">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="text-sm font-bold text-gray-700">${category}</span>
                                        <div class="flex items-center gap-2">
                                            <span class="text-sm text-gray-600">${count}</span>
                                            <span class="text-xs text-gray-500">(${percentage}%)</span>
                                        </div>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                                        <div class="bg-gradient-to-r ${gradient} h-3 rounded-full transition-all duration-500 group-hover:opacity-90"
                                             style="width: ${percentage}%"></div>
                                    </div>
                                </div>
                            `;
                        }).join('') || '<p class="text-center text-gray-400 py-8">No hay datos disponibles</p>'}
                    </div>
                </div>

                <!-- Servicios Utilizados -->
                <div class="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
                    <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                        </svg>
                        Servicios Utilizados
                    </h3>
                    <div class="space-y-4">
                        ${Object.entries(metrics.serviciosCount || {}).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([servicio, count]) => {
                            const total = Object.values(metrics.serviciosCount).reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                            const serviceIcons = {
                                'sala_vip': '🏆',
                                'fast_track': '⚡',
                                'asistencia_especial': '🤝',
                                'upgrade': '⬆️',
                                'transporte': '🚗',
                                'concierge': '🔔'
                            };

                            return `
                                <div class="group hover:bg-gray-50 p-3 rounded-xl transition">
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
                        }).join('') || '<p class="text-center text-gray-400 py-8">No hay datos disponibles</p>'}
                    </div>
                </div>
            </div>

            <!-- 5. TENDENCIA DE SATISFACCIÓN (Gráfico Interactivo) -->
            ${metrics.trendData && metrics.trendData.length > 0 ? `
                <div class="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-gray-100">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
                            </svg>
                            Tendencia de Satisfacción (Últimos 30 días)
                        </h3>
                        <div class="flex gap-2">
                            <button onclick="toggleChartType('line')" class="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition">
                                Línea
                            </button>
                            <button onclick="toggleChartType('bar')" class="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                                Barras
                            </button>
                        </div>
                    </div>
                    <div class="h-80">
                        <canvas id="trendChart"></canvas>
                    </div>
                    <script>
                        if (typeof Chart !== 'undefined') {
                            const ctx = document.getElementById('trendChart');
                            if (ctx && !window.trendChartInstance) {
                                window.trendChartInstance = new Chart(ctx.getContext('2d'), {
                                    type: 'line',
                                    data: {
                                        labels: ${JSON.stringify(metrics.trendData.map(d => d.date))},
                                        datasets: [{
                                            label: 'Calificación Promedio',
                                            data: ${JSON.stringify(metrics.trendData.map(d => d.avg))},
                                            borderColor: 'rgb(59, 130, 246)',
                                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                            tension: 0.4,
                                            fill: true,
                                            borderWidth: 3,
                                            pointRadius: 4,
                                            pointHoverRadius: 6,
                                            pointBackgroundColor: 'rgb(59, 130, 246)',
                                            pointBorderColor: '#fff',
                                            pointBorderWidth: 2
                                        }]
                                    },
                                    options: {
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                display: true,
                                                position: 'top',
                                                labels: {
                                                    font: { size: 14, weight: 'bold' },
                                                    padding: 15
                                                }
                                            },
                                            tooltip: {
                                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                padding: 12,
                                                titleFont: { size: 14, weight: 'bold' },
                                                bodyFont: { size: 13 },
                                                cornerRadius: 8
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: false,
                                                min: 0,
                                                max: 10,
                                                ticks: {
                                                    stepSize: 1,
                                                    font: { size: 12, weight: 'bold' }
                                                },
                                                grid: {
                                                    color: 'rgba(0, 0, 0, 0.05)'
                                                }
                                            },
                                            x: {
                                                ticks: {
                                                    font: { size: 11 },
                                                    maxRotation: 45,
                                                    minRotation: 45
                                                },
                                                grid: {
                                                    display: false
                                                }
                                            }
                                        },
                                        interaction: {
                                            mode: 'index',
                                            intersect: false
                                        }
                                    }
                                });

                                // Función para cambiar tipo de gráfico
                                window.toggleChartType = function(type) {
                                    if (window.trendChartInstance) {
                                        window.trendChartInstance.config.type = type;
                                        window.trendChartInstance.update();
                                    }
                                };
                            }
                        }
                    </script>
                </div>
            ` : ''}

            <!-- 6. ACCIONES PRIORITARIAS (con enlaces a manual) -->
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <svg class="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                    </svg>
                    Acciones Prioritarias
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <!-- Detractores sin acciones -->
                    <div class="bg-gradient-to-br from-red-50 to-rose-100 border-2 border-red-200 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
                         onclick="filterByNPS('detractors')">
                        <div class="flex items-start justify-between mb-3">
                            <div class="bg-red-500 p-3 rounded-xl">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                            </div>
                            <span class="text-xs font-bold bg-red-600 text-white px-2 py-1 rounded-full">URGENTE</span>
                        </div>
                        <h3 class="font-bold text-gray-900 text-lg mb-2">Atender Detractores</h3>
                        <p class="text-sm text-gray-600 mb-3">Aplicar acciones de recuperación inmediatas a pasajeros insatisfechos</p>
                        <div class="flex items-center gap-2 text-red-600 text-sm font-medium">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                            </svg>
                            Ver Pasajeros en Riesgo
                        </div>
                    </div>

                    <!-- Comunicación proactiva -->
                    <div class="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
                         onclick="showManualSection('COMUNICACION_PROACTIVA')">
                        <div class="flex items-start justify-between mb-3">
                            <div class="bg-blue-500 p-3 rounded-xl">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                                </svg>
                            </div>
                            <span class="text-xs font-bold bg-blue-600 text-white px-2 py-1 rounded-full">ALTO</span>
                        </div>
                        <h3 class="font-bold text-gray-900 text-lg mb-2">Comunicación Proactiva</h3>
                        <p class="text-sm text-gray-600 mb-3">Informar cambios antes de que el pasajero pregunte</p>
                        <div class="flex items-center gap-2 text-blue-600 text-sm font-medium">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Mejora Percepción +40%
                        </div>
                    </div>

                    <!-- Personalización del servicio -->
                    <div class="bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
                         onclick="showManualSection('PERSONALIZACION')">
                        <div class="flex items-start justify-between mb-3">
                            <div class="bg-purple-500 p-3 rounded-xl">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                                </svg>
                            </div>
                            <span class="text-xs font-bold bg-purple-600 text-white px-2 py-1 rounded-full">ESTRATÉGICO</span>
                        </div>
                        <h3 class="font-bold text-gray-900 text-lg mb-2">Personalizar Experiencia</h3>
                        <p class="text-sm text-gray-600 mb-3">Usar preferencias y gustos para sorprender positivamente</p>
                        <div class="flex items-center gap-2 text-purple-600 text-sm font-medium">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Mejora Lealtad +60%
                        </div>
                    </div>

                    <!-- Empatía y escucha activa -->
                    <div class="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
                         onclick="showManualSection('EMPATIA')">
                        <div class="flex items-start justify-between mb-3">
                            <div class="bg-green-500 p-3 rounded-xl">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                                </svg>
                            </div>
                            <span class="text-xs font-bold bg-green-600 text-white px-2 py-1 rounded-full">ESENCIAL</span>
                        </div>
                        <h3 class="font-bold text-gray-900 text-lg mb-2">Empatía y Escucha</h3>
                        <p class="text-sm text-gray-600 mb-3">Validar emociones del pasajero antes de solucionar</p>
                        <div class="flex items-center gap-2 text-green-600 text-sm font-medium">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Reduce Escalamiento -70%
                        </div>
                    </div>

                    <!-- Cumpleaños y momentos especiales -->
                    <div class="bg-gradient-to-br from-pink-50 to-rose-100 border-2 border-pink-200 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
                         onclick="showManualSection('CUMPLEANOS')">
                        <div class="flex items-start justify-between mb-3">
                            <div class="bg-pink-500 p-3 rounded-xl">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18z"/>
                                </svg>
                            </div>
                            <span class="text-xs font-bold bg-pink-600 text-white px-2 py-1 rounded-full">ESPECIAL</span>
                        </div>
                        <h3 class="font-bold text-gray-900 text-lg mb-2">Momentos Memorables</h3>
                        <p class="text-sm text-gray-600 mb-3">Crear experiencias únicas en cumpleaños y ocasiones especiales</p>
                        <div class="flex items-center gap-2 text-pink-600 text-sm font-medium">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Viralidad en Redes +300%
                        </div>
                    </div>

                    <!-- Seguimiento post-servicio -->
                    <div class="bg-gradient-to-br from-orange-50 to-amber-100 border-2 border-orange-200 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
                         onclick="showManualSection('SEGUIMIENTO')">
                        <div class="flex items-start justify-between mb-3">
                            <div class="bg-orange-500 p-3 rounded-xl">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                </svg>
                            </div>
                            <span class="text-xs font-bold bg-orange-600 text-white px-2 py-1 rounded-full">IMPORTANTE</span>
                        </div>
                        <h3 class="font-bold text-gray-900 text-lg mb-2">Seguimiento 48h</h3>
                        <p class="text-sm text-gray-600 mb-3">Contactar pasajeros post-vuelo para verificar satisfacción</p>
                        <div class="flex items-center gap-2 text-orange-600 text-sm font-medium">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Recuperación NPS +25%
                        </div>
                    </div>
                </div>
            </div>

            <!-- 7. ESTADÍSTICAS DEL MES (Interactivas) -->
            <div class="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
                <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <svg class="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    Estadísticas del Mes - ${now.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}
                </h2>
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div class="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-5 border-2 border-blue-200 hover:shadow-lg transition cursor-pointer">
                        <div class="flex items-center justify-between mb-2">
                            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                            </svg>
                            <span class="text-3xl font-black text-blue-600">${monthStats.totalInteractions}</span>
                        </div>
                        <p class="text-sm font-bold text-blue-800">Total Interacciones</p>
                        <p class="text-xs text-blue-600 mt-1">Este mes</p>
                    </div>

                    <div class="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-5 border-2 border-green-200 hover:shadow-lg transition cursor-pointer">
                        <div class="flex items-center justify-between mb-2">
                            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                            </svg>
                            <span class="text-3xl font-black text-green-600">${monthStats.avgRating}</span>
                        </div>
                        <p class="text-sm font-bold text-green-800">Calificación Promedio</p>
                        <p class="text-xs text-green-600 mt-1">De 10 puntos</p>
                    </div>

                    <div class="bg-gradient-to-br from-red-50 to-rose-100 rounded-xl p-5 border-2 border-red-200 hover:shadow-lg transition cursor-pointer">
                        <div class="flex items-center justify-between mb-2">
                            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L4.082 16c-.77 1.333.192 3 1.732 3z"/>
                            </svg>
                            <span class="text-3xl font-black text-red-600">${monthStats.detractors}</span>
                        </div>
                        <p class="text-sm font-bold text-red-800">Detractores</p>
                        <p class="text-xs text-red-600 mt-1">Requieren atención</p>
                    </div>

                    <div class="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-5 border-2 border-purple-200 hover:shadow-lg transition cursor-pointer">
                        <div class="flex items-center justify-between mb-2">
                            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span class="text-3xl font-black text-purple-600">${monthStats.promoters}</span>
                        </div>
                        <p class="text-sm font-bold text-purple-800">Promotores</p>
                        <p class="text-xs text-purple-600 mt-1">Satisfechos</p>
                    </div>

                    <div class="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-5 border-2 border-orange-200 hover:shadow-lg transition cursor-pointer">
                        <div class="flex items-center justify-between mb-2">
                            <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                            </svg>
                            <span class="text-3xl font-black text-orange-600">${monthStats.withRecovery}</span>
                        </div>
                        <p class="text-sm font-bold text-orange-800">Con Recuperación</p>
                        <p class="text-xs text-orange-600 mt-1">Acciones aplicadas</p>
                    </div>
                </div>

                <!-- Progreso del mes -->
                <div class="mt-6 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-sm font-bold text-gray-700">Progreso del Mes</span>
                        <span class="text-sm font-bold text-indigo-600">${now.getDate()} / ${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()} días</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 h-4 rounded-full transition-all duration-500"
                             style="width: ${((now.getDate() / new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()) * 100).toFixed(1)}%"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
};
