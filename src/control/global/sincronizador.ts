/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : sincronizador.ts                                                 *
 *                                                                                             *
 *              Programador :Sebastian Arredondo                             *
 *                                                                                             *
 *          Fecha de Inicio : 03 de Octubre de 2026                                          *
 *                                                                                             *
 *     Última Actualización :03 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   syncPendingReports -- Busca reportes locales pendientes y los sube a Firebase             *
 *   convertWebPToBase64 -- Convierte archivo WebP físico a texto Base64 en memoria viva       *
 *   convertBase64ToWebP -- Convierte texto Base64 a archivo físico WebP local                 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { db } from '../../firebase';
import { collection, setDoc, doc, onSnapshot } from 'firebase/firestore';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { initializeDatabase } from '../../database';

// Estructura oficial del JSON que viajará a Firebase
export interface IssueReportFirebase {
  firebase_id?: string;
  titulo: string;
  descripcion: string;
  fecha_captura: string;
  ubicacion: string;
  estado: string;
  prioridad: string;
  trabajador_id: number;
  trabajador_nombre?: string;
  fotografiaBase64: string | null;
}

/**
 * Función maestra para subir los reportes locales "pendientes" hacia Firebase.
 * Esta función es la que usarás cuando el trabajador tenga internet.
 */
export async function syncPendingReports() {
    // 1. Verificar si hay conexión a Internet
    const status = await Network.getStatus();
    if (!status.connected) {
        console.log("[Sincronizador] Sincronización abortada: Sin conexión a internet.");
        return;
    }

    // 2. Conectar BD Local
    const sqlite = await initializeDatabase();

    // 3. Obtener reportes con estado_sync = 'pendiente'
    const query = `SELECT * FROM issues_riesgos WHERE estado_sync = 'pendiente'`;
    const res = await sqlite.query(query);
    
    if (!res.values || res.values.length === 0) {
        console.log("[Sincronizador] No hay reportes nuevos en SQLite que necesiten enviarse.");
        return;
    }

    console.log(`[Sincronizador] Iniciando subida de ${res.values.length} reportes a Firebase...`);

    // 4. Procesar cada reporte (Cola offline-first)
    for (const reporteLocal of res.values) {
        try {
            // MAGIA 1: Descubrí que tu SQLite ya estaba guardando la foto como texto Base64
            // gracias a la función blobToDataUrl de tus compañeros.
            // Así que simplemente la pasamos directo a Firebase.
            const base64String = reporteLocal.fotografia_url || null;

            // Generamos un ID único universal antes de subirlo a Firebase
            // (Si ya tenía uno por un intento fallido anterior, lo reutilizamos)
            const cloudId = reporteLocal.firebase_id || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

            // 1. Guardamos el cloudId en SQLite PRIMERO.
            // Esto evita el bug de duplicación: cuando Firebase nos dispare el onSnapshot de vuelta,
            // ya sabremos que este reporte es nuestro y lo ignoraremos.
            if (!reporteLocal.firebase_id) {
                await sqlite.run(
                    `UPDATE issues_riesgos SET firebase_id = ? WHERE issue_id = ?`,
                    [cloudId, reporteLocal.issue_id]
                );
            }

            // Armamos el JSON para Firebase
            const payloadFirebase: IssueReportFirebase = {
                titulo: reporteLocal.titulo,
                descripcion: reporteLocal.descripcion,
                fecha_captura: reporteLocal.fecha_captura,
                ubicacion: reporteLocal.ubicacion,
                estado: reporteLocal.estado,
                prioridad: reporteLocal.prioridad,
                trabajador_id: reporteLocal.trabajador_id,
                trabajador_nombre: reporteLocal.trabajador_nombre || 'Trabajador Desconocido',
                fotografiaBase64: base64String
            };

            // 2. Subimos a Firestore forzando el ID que ya creamos usando setDoc
            await setDoc(doc(db, "reportes_sincronizados", cloudId), payloadFirebase);

            // 3. Actualizamos SQLite marcando oficialmente como 'sincronizado'
            await sqlite.run(
                `UPDATE issues_riesgos SET estado_sync = 'sincronizado' WHERE issue_id = ?`,
                [reporteLocal.issue_id]
            );

            console.log(`✅ [Sincronizador] Reporte local #${reporteLocal.issue_id} sincronizado con éxito (Cloud ID: ${cloudId})`);
            
            // Avisar a la UI (Home) que hay nuevos reportes sincronizados
            window.dispatchEvent(new CustomEvent('reportes_actualizados'));

        } catch (err) {
            console.error(`❌ [Sincronizador] Error sincronizando reporte #${reporteLocal.issue_id}`, err);
            // Al ser offline-first, si falla uno (por peso o caída de red), sigue con el siguiente.
            // La próxima vez que haya internet intentará de nuevo porque su estado_sync sigue siendo 'pendiente'.
        }
    }
}

/**
 * Helper: Lee un archivo físico .webp del disco del teléfono y lo convierte a Base64
 * Esto permite enviar la foto por Firebase sin que quede basura en el SQLite
 */
export async function convertWebPToBase64(localUri: string): Promise<string | null> {
    try {
        const fileContent = await Filesystem.readFile({
            path: localUri
        });
        
        // Filesystem devuelve el dato en base64 puro, le agregamos el cabezal para que los navegadores lo entiendan
        return `data:image/webp;base64,${fileContent.data}`;
    } catch (e) {
        console.error("[Sincronizador] Error leyendo archivo físico .webp para convertir a base64", e);
        return null;
    }
}

/**
 * Helper (para el teléfono que recibe): Toma el texto gigante de Firebase y lo vuelve un archivo real.
 */
export async function convertBase64ToWebP(base64Data: string, filename: string): Promise<string | null> {
    try {
        // Le quitamos el cabezal de webp si lo tiene
        const pureBase64 = base64Data.replace("data:image/webp;base64,", "");
        const path = `reportes_descargados/${filename}.webp`;
        
        const result = await Filesystem.writeFile({
            path: path,
            data: pureBase64,
            directory: Directory.Data, // Guardado seguro interno de la app (no ensucia la galería)
            recursive: true
        });

        // Esta URI (file://...) es la que deberías guardar en tu SQLite al insertar el registro que llegó de la nube
        return result.uri;
    } catch (e) {
        console.error("[Sincronizador] Error convirtiendo texto Base64 a archivo local .webp", e);
        return null;
    }
}

/**
 * Escucha en tiempo real (Listener) los reportes que suben otros teléfonos.
 * Esta función debe ejecutarse una sola vez al abrir la aplicación (ej: en main.tsx o App.tsx).
 */
export function startListeningForNewReports() {
    console.log("[Sincronizador] 👀 Iniciando radar de reportes en la nube...");
    
    // Pedimos permisos para notificaciones
    LocalNotifications.requestPermissions().catch(e => console.error("Error pidiendo permisos de notificación", e));

    const q = collection(db, "reportes_sincronizados");

    // onSnapshot escucha la colección 24/7 mientras haya internet
    onSnapshot(q, async (snapshot) => {
        const sqlite = await initializeDatabase();
        const pendingNotifications: import('@capacitor/local-notifications').LocalNotificationSchema[] = [];
        
        for (const change of snapshot.docChanges()) {
            // Solo nos importan los reportes NUEVOS que entran a Firebase
            if (change.type === "added") {
                const data = change.doc.data() as IssueReportFirebase;
                const cloudId = change.doc.id;

                let fechaParaGuardar = new Date().toISOString();
                if (data.fecha_captura) {
                    if (typeof data.fecha_captura === 'string') {
                        fechaParaGuardar = data.fecha_captura;
                    } else if (typeof (data.fecha_captura as any).toDate === 'function') {
                        fechaParaGuardar = (data.fecha_captura as any).toDate().toISOString();
                    }
                }

                // 1. Verificamos si ya lo tenemos en el SQLite local
                const localCheck = await sqlite.query(`SELECT issue_id, fecha_captura FROM issues_riesgos WHERE firebase_id = ?`, [cloudId]);
                if (localCheck.values && localCheck.values.length > 0) {
                    // Auto-reparación: si la fecha se guardó como [object Object], la corregimos
                    if (localCheck.values[0].fecha_captura === '[object Object]') {
                        await sqlite.run(`UPDATE issues_riesgos SET fecha_captura = ? WHERE firebase_id = ?`, [fechaParaGuardar, cloudId]);
                    }
                    continue; // Ya lo tenemos, lo ignoramos
                }

                console.log(`[Sincronizador] 📥 ¡Nuevo reporte recibido de la nube! (ID: ${cloudId})`);

                try {
                    // Procesar la foto para evitar que el texto gigante rompa el límite del plugin de SQLite
                    let localPhotoUri: string | null = null;
                    if (data.fotografiaBase64) {
                        localPhotoUri = await convertBase64ToWebP(data.fotografiaBase64, cloudId);
                    }

                    // 1.5. Asegurarnos que el trabajador existe localmente para no violar la Foreign Key
                    if (data.trabajador_id) {
                        try {
                            await sqlite.run(
                                `INSERT OR IGNORE INTO trabajadores (trabajador_id, nombre, email, pin, es_prevencionista) VALUES (?, ?, ?, ?, ?)`,
                                [data.trabajador_id, data.trabajador_nombre || 'Desconocido', `dummy-${data.trabajador_id}@system.local`, '', 0]
                            );
                        } catch (err) {
                            console.warn("[Sincronizador] No se pudo insertar el trabajador preventivamente", err);
                        }
                    }

                    // 2. Insertamos en nuestro SQLite respetando la fecha original del reporte
                    await sqlite.run(
                        `INSERT INTO issues_riesgos (firebase_id, titulo, descripcion, ubicacion, prioridad, estado, fotografia_url, estado_sync, trabajador_id, trabajador_nombre, fecha_captura) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, 'sincronizado', ?, ?, ?)`,
                        [
                            cloudId, 
                            data.titulo || 'Sin título', 
                            data.descripcion || null, 
                            data.ubicacion || null, 
                            data.prioridad || 'Normal', 
                            data.estado || 'capturado', 
                            localPhotoUri, 
                            data.trabajador_id || null,
                            data.trabajador_nombre || null,
                            fechaParaGuardar
                        ]
                    );

                    // 3. Preparamos la Notificación Nativa para agruparla
                    pendingNotifications.push({
                        title: `🚨 Nuevo Riesgo: ${data.prioridad?.toUpperCase() || 'NORMAL'}`,
                        body: `${data.titulo} en ${data.ubicacion || 'Ubicación no especificada'}`,
                        id: Math.floor(Math.random() * 2147483647), // Evita que se sobreescriban al llegar al mismo tiempo
                        schedule: { at: new Date(Date.now() + 1000) }
                    });

                    console.log(`✅ [Sincronizador] Reporte descargado y guardado #${cloudId}`);
                } catch (e) {
                    console.error(`[Sincronizador] Error al procesar el reporte entrante ${cloudId}:`, e);
                }
            }
        }
        
        // Lanzamos todas las notificaciones juntas para evitar bloqueos del sistema operativo
        if (pendingNotifications.length > 0) {
            await LocalNotifications.schedule({ notifications: pendingNotifications }).catch(e => console.error("Error scheduling notifications", e));
        }

        // 4. Avisar a la interfaz gráfica (React) UNA SOLA VEZ al final, para no saturar SQLite
        if (snapshot.docChanges().some(change => change.type === "added")) {
            window.dispatchEvent(new CustomEvent('reportes_actualizados'));
        }
    }, (error) => {
        console.error("[Sincronizador] ❌ Error en el radar de Firebase:", error);
    });
}

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
            console.log('[Sincronizador] 🟢 Push Registration Token: ', token.value);
            // Aquí en un sistema avanzado, guardaríamos este token en Firestore 
            // asociado al usuario para mandarle mensajes directos.
        });

        // Manejo de errores de registro
        PushNotifications.addListener('registrationError', (error) => {
            console.error('[Sincronizador] 🔴 Error registrando Push: ', error);
        });

        // Cuando llega una notificación Push Y la app está abierta
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('[Sincronizador] 📥 Push Notification recibida: ', notification);
            // El radar (onSnapshot) se encargará de descargar el reporte a SQLite
        });

        // Cuando el usuario toca la notificación Push estando la app cerrada
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log('[Sincronizador] 👆 Usuario tocó la notificación Push: ', notification);
            // La app se abre y el radar onSnapshot detectará automáticamente los datos nuevos
        });

    } catch (e) {
        console.error("[Sincronizador] Error inicializando Push Notifications", e);
    }
}
