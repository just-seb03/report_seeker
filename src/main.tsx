/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : main.tsx                                                      *
 *                                                                                             *
 *              Programador :Sebastian Arredondo                            *
 *                                                                                             *
 *          Fecha de Inicio : 29 de Septiembre de 2026                                      *
 *                                                                                             *
 *     Última Actualización :04 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   applyDarkMode -- Aplica clases y atributos al DOM para forzar el esquema de colores       *
 *        (oscuro/claro).                                                                      *
 *   initTheme -- Inicializa el tema visual preferido (dark mode o system) durante el inicio   *
 *        de la app.                                                                           *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import App from './App';
import { initializeDatabase } from './database';
import './index.css';



import { startListeningForNewReports, initPushNotifications } from './control/global/sincronizador';

if (Capacitor.isNativePlatform()) {
  void initializeDatabase().then(() => {
    // Iniciamos el radar (listener) cuando la BD nativa ya está lista
    startListeningForNewReports();
    // Preparamos el teléfono para recibir Push Notifications con la app cerrada
    initPushNotifications();
  }).catch((error: unknown) => {
    console.error('No se pudo inicializar la base de datos SQLite', error);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
