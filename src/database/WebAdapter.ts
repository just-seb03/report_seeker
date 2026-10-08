/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : WebAdapter.ts                                                    *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 07 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 07 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   Adaptador exclusivo para IndexedDB (Fallback Web).                                        *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { databaseName, webObjectStore } from './schema';
import { mapIssueReport, type IssueReport, type IssueReportPage } from './types';

export function updateIssueReportPriority(issueId: number, priority: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 2);

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(webObjectStore)) {
        request.result.createObjectStore(webObjectStore, { keyPath: 'issue_id', autoIncrement: true });
      }
    };
    request.onerror = () => reject(request.error ?? new Error('No se pudo abrir el almacenamiento web.'));
    request.onsuccess = () => {
      const database = request.result;
      const transaction = database.transaction(webObjectStore, 'readwrite');
      const store = transaction.objectStore(webObjectStore);
      const getRequest = store.get(issueId);
      let reportFound = false;

      getRequest.onsuccess = () => {
        if (!getRequest.result) return;
        reportFound = true;
        store.put({ ...getRequest.result, prioridad: priority });
      };
      getRequest.onerror = () => {
        database.close();
        reject(getRequest.error ?? new Error('No se pudo consultar el reporte web.'));
      };
      transaction.oncomplete = () => {
        database.close();
        if (reportFound) resolve();
        else reject(new Error(`No se encontró el reporte #${issueId}.`));
      };
      transaction.onerror = () => {
        database.close();
        reject(transaction.error ?? new Error('No se pudo actualizar la severidad del reporte.'));
      };
      transaction.onabort = () => {
        database.close();
        reject(transaction.error ?? new Error('Se canceló la actualización de la severidad.'));
      };
    };
  });
}

export function saveIssueReport(report: {
  title: string;
  description: string;
  location: string;
  priority: string;
  image: Blob | null;
  trabajador_id?: number;
  trabajador_nombre?: string;
  ubicacion_id?: number;
}): Promise<number> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 2);

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(webObjectStore)) {
        request.result.createObjectStore(webObjectStore, { keyPath: 'issue_id', autoIncrement: true });
      }
    };
    request.onerror = () => reject(request.error ?? new Error('No se pudo abrir el almacenamiento web.'));
    request.onsuccess = () => {
      const database = request.result;
      const transaction = database.transaction(webObjectStore, 'readwrite');
      const addRequest = transaction.objectStore(webObjectStore).add({
        titulo: report.title,
        descripcion: report.description,
        ubicacion: report.location,
        ubicacion_id: report.ubicacion_id ?? null,
        prioridad: report.priority,
        fotografia: report.image,
        fecha_captura: new Date().toISOString(),
        estado: 'capturado',
        estado_sync: 'pendiente',
        trabajador_id: report.trabajador_id ?? null,
        trabajador_nombre: report.trabajador_nombre ?? null
      });
      let issueId: number | undefined;

      addRequest.onsuccess = () => { issueId = addRequest.result as number; };
      addRequest.onerror = () => reject(addRequest.error ?? new Error('No se pudo guardar el reporte web.'));
      transaction.oncomplete = () => {
        database.close();
        if (issueId === undefined) reject(new Error('IndexedDB no devolvió el ID del reporte.'));
        else resolve(issueId);
      };
      transaction.onerror = () => reject(transaction.error ?? new Error('No se pudo guardar el reporte web.'));
      transaction.onabort = () => {
        database.close();
        reject(transaction.error ?? new Error('Se canceló el guardado del reporte web.'));
      };
    };
  });
}

export function getIssueReportImage(issueId: number): Promise<Blob | string | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 2);

    request.onerror = () => reject(request.error ?? new Error('No se pudo abrir el almacenamiento web.'));
    request.onsuccess = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(webObjectStore)) {
        database.close();
        resolve(null);
        return;
      }

      const transaction = database.transaction(webObjectStore, 'readonly');
      const getRequest = transaction.objectStore(webObjectStore).get(issueId);
      getRequest.onsuccess = () => {
        const image = getRequest.result?.fotografia;
        database.close();
        resolve(image instanceof Blob || typeof image === 'string' ? image : null);
      };
      getRequest.onerror = () => {
        database.close();
        reject(getRequest.error ?? new Error('No se pudo leer la fotografía del reporte.'));
      };
    };
  });
}

export function getIssueReportsPage(limit: number, beforeIssueId?: number): Promise<IssueReportPage> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 2);

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(webObjectStore)) {
        request.result.createObjectStore(webObjectStore, { keyPath: 'issue_id', autoIncrement: true });
      }
    };
    request.onerror = () => reject(request.error ?? new Error('No se pudieron consultar los reportes.'));
    request.onsuccess = () => {
      const database = request.result;
      const transaction = database.transaction(webObjectStore, 'readonly');
      const store = transaction.objectStore(webObjectStore);
      const range = beforeIssueId === undefined ? undefined : IDBKeyRange.upperBound(beforeIssueId, true);
      const cursorRequest = store.openCursor(range, 'prev');
      const reports: Record<string, unknown>[] = [];

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (!cursor || reports.length === limit + 1) {
          database.close();
          resolve({ items: reports.slice(0, limit).map(mapIssueReport), hasMore: reports.length > limit });
          return;
        }

        const report = cursor.value as Record<string, unknown>;
        if (report.estado_sync !== 'pendiente') {
          reports.push(report);
        }
        cursor.continue();
      };
      cursorRequest.onerror = () => {
        database.close();
        reject(cursorRequest.error ?? new Error('No se pudieron consultar los reportes.'));
      };
    };
  });
}

export function getPendingIssueReports(): Promise<IssueReport[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 2);

    request.onerror = () => reject(request.error ?? new Error('No se pudieron consultar los reportes pendientes.'));
    request.onsuccess = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(webObjectStore)) {
        database.close();
        resolve([]);
        return;
      }

      const transaction = database.transaction(webObjectStore, 'readonly');
      const store = transaction.objectStore(webObjectStore);
      const cursorRequest = store.openCursor(null, 'prev');
      const reports: Record<string, unknown>[] = [];

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (!cursor) {
          database.close();
          resolve(reports.map(mapIssueReport));
          return;
        }

        const report = cursor.value as Record<string, unknown>;
        if (report.estado_sync === 'pendiente') {
           reports.push(report);
        }
        cursor.continue();
      };
      cursorRequest.onerror = () => {
        database.close();
        reject(cursorRequest.error ?? new Error('No se pudieron consultar los reportes pendientes.'));
      };
    };
  });
}

export function getAllIssueReports(): Promise<IssueReport[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 2);

    request.onerror = () => reject(request.error ?? new Error('No se pudieron consultar todos los reportes.'));
    request.onsuccess = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(webObjectStore)) {
        database.close();
        resolve([]);
        return;
      }

      const transaction = database.transaction(webObjectStore, 'readonly');
      const store = transaction.objectStore(webObjectStore);
      const cursorRequest = store.openCursor(null, 'prev');
      const reports: Record<string, unknown>[] = [];

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (!cursor) {
          database.close();
          resolve(reports.map(mapIssueReport));
          return;
        }

        reports.push(cursor.value as Record<string, unknown>);
        cursor.continue();
      };
      cursorRequest.onerror = () => {
        database.close();
        reject(cursorRequest.error ?? new Error('No se pudieron consultar todos los reportes.'));
      };
    };
  });
}

export async function getUbicaciones(): Promise<{ id: number; nombre: string }[]> {
  return [
    { id: 1, nombre: 'Sector Norte' },
    { id: 2, nombre: 'Sector Centro' },
    { id: 3, nombre: 'Sector Sur' },
    { id: 4, nombre: 'Planta de Procesos' },
    { id: 5, nombre: 'Mina Subterránea' },
    { id: 6, nombre: 'Taller de Mantenimiento' },
    { id: 7, nombre: 'Administración' }
  ];
}
