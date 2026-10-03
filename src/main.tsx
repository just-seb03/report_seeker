/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : main.tsx                                                      *
 *                                                                                             *
 *              Programador : Sebastian Arredondo, Cristian Vega                            *
 *                                                                                             *
 *          Fecha de Inicio : 29 de Septiembre de 2026                                      *
 *                                                                                             *
 *     Última Actualización : 02 de Octubre de 2026 [SA]                                    *
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
import App from './App.tsx';
import { DarkMode } from '@aparajita/capacitor-dark-mode';
import { initializeDatabase } from './database';
import { analyticsPromise } from './firebase';
import './index.css';

void analyticsPromise.catch((error: unknown) => {
  console.error('No se pudo inicializar Firebase Analytics', error);
});

const applyDarkMode = (dark: boolean) => {
  document.documentElement.classList.toggle('dark', dark);
  document.body.classList.toggle('dark', dark);
};

const initTheme = async () => {
  try {
    await DarkMode.init({ cssClass: 'dark' });

    const { dark } = await DarkMode.isDarkMode();
    applyDarkMode(dark);

    const listener = await DarkMode.addAppearanceListener(({ dark }) => {
      applyDarkMode(dark);
    });

    void listener;
  } catch (error) {
    console.error('Dark mode no disponible en la web o no está corriendo en Android nativo', error);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    applyDarkMode(mediaQuery.matches);

    mediaQuery.addEventListener('change', (event) => {
      applyDarkMode(event.matches);
    });
  }
};

void initTheme();

if (Capacitor.isNativePlatform()) {
  void initializeDatabase().catch((error: unknown) => {
    console.error('No se pudo inicializar la base de datos SQLite', error);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
