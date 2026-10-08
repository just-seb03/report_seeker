/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : firebaseRadar.ts                                                 *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 07 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 07 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   startListeningForNewReports -- Radar en tiempo real de Firebase para notificaciones locales*
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { db } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { LocalNotifications } from '@capacitor/local-notifications';
import { initializeDatabase } from '../../database';
import { useAppStore } from '../../store/useAppStore';
import { convertBase64ToWebP } from './imageUtils';
import type { IssueReportFirebase } from './sincronizador';

/**
 * Escucha en tiempo real (Listener) los reportes que suben otros teléfonos.
 * Esta función debe ejecutarse una sola vez al abrir la aplicación (ej: en main.tsx o App.tsx).
 */
export function startListeningForNewReports() {
    console.log("[firebaseRadar] 👀 Iniciando radar de reportes en la nube...");
    
    // Pedimos permisos para notificaciones
    LocalNotifications.requestPermissions().catch(e => console.error("Error pidiendo permisos de notificación", e));

    const q = collection(db, "reportes_sincronizados");

    // onSnapshot escucha la colección 24/7 mientras haya internet
    onSnapshot(q, async (snapshot) => {
        const sqlite = await initializeDatabase();
        const pendingNotifications: import('@capacitor/local-notifications').LocalNotificationSchema[] = [];
        
        for (const change of snapshot.docChanges()) {
            if (change.type === "modified") {
                try {
                    const localReport = await sqlite.query(
                        `SELECT issue_id FROM issues_riesgos WHERE firebase_id = ? LIMIT 1`,
                        [change.doc.id]
                    );
                    if (!localReport.values?.length) continue;

                    const data = change.doc.data() as IssueReportFirebase;
                    await sqlite.run(
                        `UPDATE issues_riesgos SET prioridad = ? WHERE firebase_id = ?`,
                        [data.prioridad || 'Normal', change.doc.id]
                    );
                    useAppStore.getState().triggerReportsSync();
                } catch (error) {
                    console.error(`[firebaseRadar] Error actualizando el reporte modificado ${change.doc.id}:`, error);
                }
                continue;
            }

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

                console.log(`[firebaseRadar] 📥 ¡Nuevo reporte recibido de la nube! (ID: ${cloudId})`);

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
                            console.warn("[firebaseRadar] No se pudo insertar el trabajador preventivamente", err);
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

                    console.log(`✅ [firebaseRadar] Reporte descargado y guardado #${cloudId}`);
                } catch (e) {
                    console.error(`[firebaseRadar] Error al procesar el reporte entrante ${cloudId}:`, e);
                }
            }
        }
        
        // Lanzamos todas las notificaciones juntas para evitar bloqueos del sistema operativo
        if (pendingNotifications.length > 0) {
            await LocalNotifications.schedule({ notifications: pendingNotifications }).catch(e => console.error("Error scheduling notifications", e));
        }

        // 4. Avisar a la interfaz gráfica (React) UNA SOLA VEZ al final, para no saturar SQLite
        if (snapshot.docChanges().some(change => change.type === "added")) {
            useAppStore.getState().triggerReportsSync();
        }
    }, (error) => {
        console.error("[firebaseRadar] ❌ Error en el radar de Firebase:", error);
    });
}
