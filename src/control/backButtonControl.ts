/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : backButtonControl.ts                                          *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                            *
 *                                                                                             *
 *          Fecha de Inicio : 02 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización : 02 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   useHardwareBackButton -- Custom hook que escucha el botón físico de retroceso nativo de   *
 *        Android/dispositivos para integrarlo con la navegación de la app.                    *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export function useHardwareBackButton(onBack: () => boolean) {
  useEffect(() => {
    // Solo aplica para plataformas nativas donde el hardware back button está presente
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let isActive = true;

    const listener = App.addListener('backButton', () => {
      if (!isActive) return;

      const handled = onBack();
      // Si el hook principal determinó que no había nada a qué volver (estamos en home y
      // sin notificaciones abiertas), entonces cerramos la aplicación.
      if (!handled) {
        App.exitApp();
      }
    });

    return () => {
      isActive = false;
      listener.then(handle => handle.remove()).catch(console.error);
    };
  }, [onBack]);
}
