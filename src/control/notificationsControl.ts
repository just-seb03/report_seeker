/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : notificationsControl.ts                                       *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 02 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización : 02 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   getInitialReadNotificationIds -- Recupera la lista de IDs de notificaciones previamente   *
 *        leídas desde LocalStorage.                                                           *
 *   saveReadNotificationIds -- Persiste los IDs de las notificaciones marcadas como leídas en *
 *        LocalStorage.                                                                        *
 *   toNotification -- Transforma el modelo nativo IssueReport en la estructura de interfaz    *
 *        Notificacion.                                                                        *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { type IssueReport } from '../database';
import { type Notificacion } from '../components/NotificationSheet';

const READ_NOTIFICATIONS_STORAGE_KEY = 'report_seeker_read_notifications';

export function getInitialReadNotificationIds(): Set<number> {
  try {
    const raw = localStorage.getItem(READ_NOTIFICATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed);
      }
    }
  } catch (error) {
    console.error('No se pudieron leer las notificaciones vistas del almacenamiento', error);
  }
  return new Set<number>();
}

export function saveReadNotificationIds(ids: Set<number>) {
  try {
    localStorage.setItem(READ_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch (error) {
    console.error('No se pudieron guardar las notificaciones vistas en el almacenamiento', error);
  }
}

export function toNotification(report: IssueReport, readIds: Set<number>): Notificacion {
  const capturedAt = new Date(report.capturedAt.includes('T')
    ? report.capturedAt
    : `${report.capturedAt.replace(' ', 'T')}Z`);

  return {
    id: report.issueId,
    issueId: report.issueId,
    titulo: report.title,
    detalle: report.description,
    ubicacion: report.location,
    fecha: Number.isNaN(capturedAt.getTime()) ? undefined : capturedAt.toISOString(),
    unread: !readIds.has(report.issueId),
    prioridad: report.priority,
    reporte: report,
  };
}
