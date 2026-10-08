/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : sincronizador.ts                                                 *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 03 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 07 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   updateSyncedReportPriority -- Actualiza la severidad de un reporte existente en Firestore. *
 *   verifyReportManagementConnection -- Comprueba que Firestore responda desde el servidor.   *
 *   syncPendingReports -- Busca reportes locales pendientes y los sube a Firebase             *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { db } from '../../firebase';
import { collection, setDoc, doc, updateDoc, getDocsFromServer, limit, query } from 'firebase/firestore';
import { Network } from '@capacitor/network';
import { initializeDatabase } from '../../database';
import { useAppStore } from '../../store/useAppStore';

// Estructura oficial del JSON que viajará a Firebase
export interface IssueReportFirebase {
  firebase_id?: string;
  titulo: string;
  descripcion: string;
  fecha_captura: string;
  ubicacion: string;
  ubicacion_id?: number;
  estado: string;
  prioridad: string;
  trabajador_id: number;
  trabajador_nombre?: string;
  fotografiaBase64: string | null;
}

export async function updateSyncedReportPriority(firebaseId: string, priority: string): Promise<void> {
    // Actualiza el campo prioridad directamente en Firestore para un reporte ya sincronizado.
    await updateDoc(doc(db, "reportes_sincronizados", firebaseId), { prioridad: priority });
}

export async function verifyReportManagementConnection(): Promise<void> {
    // Prueba rápida de conectividad y acceso a Firestore trayendo un solo documento.
    // Lanza excepción si el dispositivo está offline o no tiene permisos.
    await getDocsFromServer(query(collection(db, "reportes_sincronizados"), limit(1)));
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
    const queryStr = `SELECT * FROM issues_riesgos WHERE estado_sync = 'pendiente'`;
    const res = await sqlite.query(queryStr);
    
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
                ubicacion_id: reporteLocal.ubicacion_id,
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
            useAppStore.getState().triggerReportsSync();

        } catch (err) {
            console.error(`❌ [Sincronizador] Error sincronizando reporte #${reporteLocal.issue_id}`, err);
            // Al ser offline-first, si falla uno (por peso o caída de red), sigue con el siguiente.
            // La próxima vez que haya internet intentará de nuevo porque su estado_sync sigue siendo 'pendiente'.
        }
    }
}
