/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : systemNotificationsControl.ts                                    *
 *                                                                                             *
 *              Programador :Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 02 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización :02 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   sendReportNotification -- Envía una notificación local cuando se crea un reporte, o agrupa*
 *        el mensaje indicando la cantidad de reportes nuevos si la app no se ha abierto.      *
 *   resetPushNotificationCount -- Reinicia el contador de notificaciones no leídas y limpia   *
 *        las notificaciones pendientes al abrir la app.                                       *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { LocalNotifications } from '@capacitor/local-notifications';
import { Filesystem, Directory } from '@capacitor/filesystem';

const UNREAD_PUSH_COUNT_KEY = 'report_seeker_unread_push_count';

function getUnreadPushCount(): number {
  const count = localStorage.getItem(UNREAD_PUSH_COUNT_KEY);
  return count ? parseInt(count, 10) : 0;
}

function setUnreadPushCount(count: number) {
  localStorage.setItem(UNREAD_PUSH_COUNT_KEY, count.toString());
}

export async function resetPushNotificationCount() {
  setUnreadPushCount(0);
  try {
    const delivered = await LocalNotifications.getDeliveredNotifications();
    if (delivered.notifications.length > 0) {
      await LocalNotifications.removeAllDeliveredNotifications();
    }
  } catch (error) {
    console.error('No se pudieron limpiar las notificaciones de sistema', error);
  }
}

/**
 * Guarda temporalmente la imagen del reporte en caché para usarla en la notificación.
 * El SO se encargará de limpiarla después, evitando que se llene la memoria.
 */
async function saveTempNotificationImage(blob: Blob): Promise<string | undefined> {
  try {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        if (!base64data) {
          resolve(undefined);
          return;
        }
        try {
          const fileName = `temp_notif_${new Date().getTime()}.webp`;
          const result = await Filesystem.writeFile({
            path: fileName,
            data: base64data,
            directory: Directory.Cache
          });
          resolve(result.uri);
        } catch (e) {
          resolve(undefined);
        }
      };
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    return undefined;
  }
}

export async function sendReportNotification(title: string, body: string, photoBlob?: Blob | null) {
  try {
    const permStatus = await LocalNotifications.checkPermissions();
    if (permStatus.display !== 'granted') {
      const requested = await LocalNotifications.requestPermissions();
      if (requested.display !== 'granted') return;
    }

    let count = getUnreadPushCount();
    count += 1;
    setUnreadPushCount(count);

    // Cancelar la notificación agrupada anterior
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    // Remover las entregadas de la barra de estado
    await LocalNotifications.removeAllDeliveredNotifications();

    if (count === 1) {
      let imageUri: string | undefined;
      if (photoBlob) {
        imageUri = await saveTempNotificationImage(photoBlob);
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            title: title,
            body: body,
            id: new Date().getTime(),
            schedule: { at: new Date(Date.now() + 500) },
            largeBody: body, // Permite expandir para ver más texto si se quiere
            largeIcon: imageUri, // En Android, puede mostrar la imagen al lado
            attachments: imageUri ? [{ id: 'photo', url: imageUri }] : undefined // En iOS/Android muestra la imagen grande al expandir
          }
        ]
      });
    } else {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Reportes Nuevos',
            body: `Tienes ${count} Reportes nuevos.`,
            id: new Date().getTime(),
            schedule: { at: new Date(Date.now() + 500) }
          }
        ]
      });
    }

  } catch (error) {
    console.error('Error al programar la notificación local', error);
  }
}
