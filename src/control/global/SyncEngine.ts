/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : SyncEngine.ts                                                    *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 07 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 07 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   Motor de sincronización en background para subida autónoma de reportes a la nube.         *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { App } from '@capacitor/app';
import { Network } from '@capacitor/network';
import { BackgroundTask } from '@capgo/capacitor-background-task';
import { syncPendingReports } from './sincronizador';

export function initializeSyncEngine() {
  console.log('[SyncEngine] Inicializando motor de sincronización offline-first...');

  // 1. Escuchar cambios de red nativos (recuperación de internet activa)
  Network.addListener('networkStatusChange', async (status) => {
    console.log('[SyncEngine] Cambio de estado de red detectado:', status);
    if (status.connected) {
      console.log('[SyncEngine] Red recuperada. Intentando sincronizar reportes pendientes...');
      await syncPendingReports().catch((e) => {
        console.error('[SyncEngine] Fallo al sincronizar tras recuperar red:', e);
      });
    }
  });

  // 2. Tareas periódicas en Background utilizando el plugin instalado
  BackgroundTask.defineTask('syncReportsOfflineFirst', async () => {
    console.log('[SyncEngine] Tarea en segundo plano (syncReportsOfflineFirst) ejecutándose...');
    try {
      const status = await Network.getStatus();
      if (status.connected) {
          await syncPendingReports();
      }
    } catch (err) {
      console.error('[SyncEngine] Error ejecutando BackgroundTask:', err);
    }
  });

  // Registramos la tarea para que intente ejecutarse en background periódicamente (ej: cada 15 mins)
  BackgroundTask.registerTaskAsync('syncReportsOfflineFirst', {
    minimumInterval: 15, // Mínimo 15 mins (limitación nativa de Android/iOS)
    requiresNetwork: true
  }).catch((err) => console.error('[SyncEngine] No se pudo registrar BackgroundTask:', err));

  App.addListener('appStateChange', async ({ isActive }) => {
    if (!isActive) {
      console.log('[SyncEngine] App se fue a segundo plano.');
      // En este punto el SO puede decidir ejecutar nuestra tarea periódica
    }
  });
}
