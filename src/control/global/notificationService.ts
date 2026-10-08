/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : notificationService.ts                                           *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 07 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 07 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   initPushNotifications -- Inicializa las notificaciones Push Reales (FCM)                  *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

/**
 * Inicializa las notificaciones Push Reales (FCM) para recibir alertas 
 * incluso cuando la aplicación está cerrada.
 */
export async function initPushNotifications() {
    if (!Capacitor.isNativePlatform()) return;

    try {
        const permStatus = await PushNotifications.requestPermissions();
        if (permStatus.receive === 'granted') {
            await PushNotifications.register();
        }

        // Cuando el teléfono se registra exitosamente en Firebase Cloud Messaging
        PushNotifications.addListener('registration', (token) => {
            console.log('[notificationService] 🟢 Push Registration Token: ', token.value);
            // Aquí en un sistema avanzado, guardaríamos este token en Firestore 
            // asociado al usuario para mandarle mensajes directos.
        });

        // Manejo de errores de registro
        PushNotifications.addListener('registrationError', (error) => {
            console.error('[notificationService] 🔴 Error registrando Push: ', error);
        });

        // Cuando llega una notificación Push Y la app está abierta
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('[notificationService] 📥 Push Notification recibida: ', notification);
            // El radar (onSnapshot) se encargará de descargar el reporte a SQLite
        });

        // Cuando el usuario toca la notificación Push estando la app cerrada
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log('[notificationService] 👆 Usuario tocó la notificación Push: ', notification);
            // La app se abre y el radar onSnapshot detectará automáticamente los datos nuevos
        });

    } catch (e) {
        console.error("[notificationService] Error inicializando Push Notifications", e);
    }
}
