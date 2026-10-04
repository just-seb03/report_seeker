/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : database.ts                                                   *
 *                                                                                             *
 *              Programador : Sebastian Arredondo, Maximiliano Cantuarias, Cristian Vega                        *
 *                                                                                             *
 *          Fecha de Inicio : 01 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización : 03 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   openDatabase -- Inicializa y abre la conexión con la base de datos local Capacitor        *
 *        SQLite.                                                                              *
 *   initializeDatabase -- Ejecuta las sentencias DDL para crear las tablas necesarias de la   *
 *        aplicación.                                                                          *
 *   saveIssueReport -- Guarda la información capturada de un nuevo reporte en la base de      *
 *        datos.                                                                               *
 *   getIssueReportsPage -- Recupera una lista paginada de reportes ordenados de forma         *
 *        descendente.                                                                         *
 *   getIssueReportImage -- Carga el blob de la imagen específica de un reporte almacenado.    *
 *   saveIssueReportOnWeb -- Alternativa web (IndexedDB/LocalStorage) para guardar el reporte  *
 *        (mocking fallback).                                                                  *
 *   getIssueReportImageOnWeb -- Alternativa web para recuperar la imagen guardada de un       *
 *        reporte.                                                                             *
 *   getIssueReportsPageOnWeb -- Alternativa web para obtener el historial paginado de         *
 *        reportes.                                                                            *
 *   mapIssueReport -- Convierte los datos en crudo de la tabla (fila DB) a un objeto          *
 *        IssueReport tipado.                                                                  *
 *   blobToDataUrl -- Transforma un Blob crudo en un string Base64 Data URL para visualización *
 *        en el navegador.                                                                     *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  type SQLiteDBConnection,
} from '@capacitor-community/sqlite';

const databaseName = 'report_seeker';
const webObjectStore = 'issues_riesgos';
const sqlite = new SQLiteConnection(CapacitorSQLite);

const schema = `
CREATE TABLE IF NOT EXISTS trabajadores (
  trabajador_id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  pin TEXT NOT NULL,
  estado TEXT DEFAULT 'activo'
);

CREATE TABLE IF NOT EXISTS roles_seguridad (
  rol_id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_rol TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trabajador_rol (
  trabajador_id INTEGER,
  rol_id INTEGER,
  FOREIGN KEY (trabajador_id) REFERENCES trabajadores(trabajador_id),
  FOREIGN KEY (rol_id) REFERENCES roles_seguridad(rol_id)
);

CREATE TABLE IF NOT EXISTS niveles_escalamiento (
  nivel_id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_etapa TEXT NOT NULL,
  orden_escalamiento INTEGER NOT NULL,
  trabajador_id INTEGER,
  FOREIGN KEY (trabajador_id) REFERENCES trabajadores(trabajador_id)
);

CREATE TABLE IF NOT EXISTS issues_riesgos (
  issue_id INTEGER PRIMARY KEY AUTOINCREMENT,
  firebase_id TEXT UNIQUE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fotografia_url TEXT,
  fecha_captura DATETIME DEFAULT CURRENT_TIMESTAMP,
  trabajador_id INTEGER,
  trabajador_nombre TEXT,
  ubicacion TEXT,
  estado TEXT DEFAULT 'capturado',
  estado_sync TEXT DEFAULT 'pendiente',
  prioridad TEXT,
  FOREIGN KEY (trabajador_id) REFERENCES trabajadores(trabajador_id)
);

CREATE TABLE IF NOT EXISTS evaluacion_impacto (
  evaluacion_id INTEGER PRIMARY KEY AUTOINCREMENT,
  issue_id INTEGER UNIQUE,
  impacto_costo NUMERIC,
  impacto_plazo_dias INTEGER,
  impacto_seguridad TEXT,
  impacto_calidad TEXT,
  FOREIGN KEY (issue_id) REFERENCES issues_riesgos(issue_id)
);

CREATE TABLE IF NOT EXISTS historial_escalamiento (
  escalamiento_id INTEGER PRIMARY KEY AUTOINCREMENT,
  issue_id INTEGER,
  nivel_id INTEGER,
  trabajador_id INTEGER,
  fecha_escalamiento DATETIME DEFAULT CURRENT_TIMESTAMP,
  comentarios TEXT,
  decision_tomada TEXT,
  FOREIGN KEY (issue_id) REFERENCES issues_riesgos(issue_id),
  FOREIGN KEY (nivel_id) REFERENCES niveles_escalamiento(nivel_id),
  FOREIGN KEY (trabajador_id) REFERENCES trabajadores(trabajador_id)
);

CREATE TABLE IF NOT EXISTS acciones_seguimiento (
  accion_id INTEGER PRIMARY KEY AUTOINCREMENT,
  issue_id INTEGER,
  descripcion_accion TEXT NOT NULL,
  trabajador_id INTEGER,
  fecha_compromiso DATE,
  fecha_cierre_real DATE,
  estado_accion TEXT DEFAULT 'pendiente',
  FOREIGN KEY (issue_id) REFERENCES issues_riesgos(issue_id),
  FOREIGN KEY (trabajador_id) REFERENCES trabajadores(trabajador_id)
);

CREATE TABLE IF NOT EXISTS analisis_agente_ia (
  analisis_id INTEGER PRIMARY KEY AUTOINCREMENT,
  issue_id INTEGER,
  vinculos_detectados TEXT,
  historia_relacionada TEXT,
  cobertura_riesgo TEXT,
  recomendacion_generada TEXT,
  fecha_analisis DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues_riesgos(issue_id)
);

CREATE TABLE IF NOT EXISTS audit_trail (
  audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
  tabla_afectada TEXT NOT NULL,
  registro_id INTEGER NOT NULL,
  tipo_accion TEXT NOT NULL,
  trabajador_id INTEGER,
  fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
  valores_anteriores TEXT,
  valores_nuevos TEXT,
  FOREIGN KEY (trabajador_id) REFERENCES trabajadores(trabajador_id)
);

CREATE TABLE IF NOT EXISTS integraciones_bhp (
  integracion_id INTEGER PRIMARY KEY AUTOINCREMENT,
  issue_id INTEGER,
  sistema_destino TEXT NOT NULL,
  id_remoto_sistema TEXT,
  fecha_sincronizacion DATETIME,
  estado_sincronizacion TEXT,
  FOREIGN KEY (issue_id) REFERENCES issues_riesgos(issue_id)
);
`;

async function openDatabase(): Promise<SQLiteDBConnection> {
  const existingConnection = await sqlite.isConnection(databaseName, false);
  const connection = existingConnection.result
    ? await sqlite.retrieveConnection(databaseName, false)
    : await sqlite.createConnection(databaseName, false, 'no-encryption', 1, false);

  const isOpen = await connection.isDBOpen();
  if (!isOpen.result) await connection.open();

  await connection.execute('PRAGMA foreign_keys = ON;');
  await connection.execute(schema);

  const workerColumns = await connection.query('PRAGMA table_info(trabajadores);');
  if (!workerColumns.values?.some((column) => column.name === 'pin')) {
    await connection.execute("ALTER TABLE trabajadores ADD COLUMN pin TEXT NOT NULL DEFAULT '';");
  }

  const issueColumns = await connection.query('PRAGMA table_info(issues_riesgos);');
  if (!issueColumns.values?.some((column) => column.name === 'trabajador_nombre')) {
    await connection.execute('ALTER TABLE issues_riesgos ADD COLUMN trabajador_nombre TEXT;');
  }

  return connection;
}

let databasePromise: Promise<SQLiteDBConnection> | null = null;

export interface IssueReport {
  issueId: number;
  title: string;
  description: string;
  location: string;
  priority: string;
  capturedAt: string;
  workerName?: string;
}

export interface IssueReportPage {
  items: IssueReport[];
  hasMore: boolean;
}

export function initializeDatabase(): Promise<SQLiteDBConnection> {
  if (!Capacitor.isNativePlatform()) {
    return Promise.reject(new Error('SQLite requiere ejecutar la app en Android o iOS.'));
  }

  if (!databasePromise) {
    databasePromise = openDatabase().catch((error: unknown) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
}

export async function insertOrUpdateTrabajadorLocal(t: { trabajador_id: number; nombre: string; email: string; pin: string }) {
  if (!Capacitor.isNativePlatform()) return;
  const connection = await initializeDatabase();
  const existingWorker = await connection.query(
    'SELECT trabajador_id FROM trabajadores WHERE trabajador_id = ? LIMIT 1;',
    [t.trabajador_id]
  );

  if (existingWorker.values?.length) {
    await connection.run(
      'UPDATE trabajadores SET nombre = ?, pin = ? WHERE trabajador_id = ?;',
      [t.nombre, t.pin, t.trabajador_id]
    );
    return;
  }

  await connection.run(
    'INSERT INTO trabajadores (trabajador_id, nombre, email, pin) VALUES (?, ?, ?, ?);',
    [t.trabajador_id, t.nombre, t.email, t.pin]
  );
}

export async function saveIssueReport(report: {
  title: string;
  description: string;
  location: string;
  priority: string;
  image: Blob | null;
  trabajador_id?: number;
  trabajador_nombre?: string;
}): Promise<number> {
  if (!Capacitor.isNativePlatform()) {
    return saveIssueReportOnWeb(report);
  }

  const connection = await initializeDatabase();
  const imageData = report.image ? await blobToDataUrl(report.image) : null;
  const result = await connection.run(
    'INSERT INTO issues_riesgos (titulo, descripcion, ubicacion, prioridad, fotografia_url, trabajador_id, trabajador_nombre) VALUES (?, ?, ?, ?, ?, ?, ?);',
    [report.title, report.description, report.location, report.priority, imageData, report.trabajador_id ?? null, report.trabajador_nombre ?? null],
  );
  const issueId = result.changes?.lastId;

  if (issueId === undefined) throw new Error('SQLite no devolvió el ID del reporte.');
  return issueId;
}

export async function getIssueReportsPage(limit: number, beforeIssueId?: number): Promise<IssueReportPage> {
  if (!Capacitor.isNativePlatform()) return getIssueReportsPageOnWeb(limit, beforeIssueId);

  const connection = await initializeDatabase();
  const result = beforeIssueId === undefined
    ? await connection.query(
      'SELECT issue_id, titulo, descripcion, ubicacion, prioridad, fecha_captura, trabajador_nombre FROM issues_riesgos WHERE estado_sync != ? ORDER BY issue_id DESC LIMIT ?;',
      ['pendiente', limit + 1],
    )
    : await connection.query(
      'SELECT issue_id, titulo, descripcion, ubicacion, prioridad, fecha_captura, trabajador_nombre FROM issues_riesgos WHERE estado_sync != ? AND issue_id < ? ORDER BY issue_id DESC LIMIT ?;',
      ['pendiente', beforeIssueId, limit + 1],
    );
  const reports = result.values ?? [];

  return {
    items: reports.slice(0, limit).map(mapIssueReport),
    hasMore: reports.length > limit,
  };
}

export async function getPendingIssueReports(): Promise<IssueReport[]> {
  if (!Capacitor.isNativePlatform()) return getPendingIssueReportsOnWeb();

  const connection = await initializeDatabase();
  const result = await connection.query(
    'SELECT issue_id, titulo, descripcion, ubicacion, prioridad, fecha_captura, trabajador_nombre FROM issues_riesgos WHERE estado_sync = ? ORDER BY issue_id DESC;',
    ['pendiente']
  );
  return (result.values ?? []).map(mapIssueReport);
}

export async function getIssueReportImage(issueId: number): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) {
    const image = await getIssueReportImageOnWeb(issueId);
    return image instanceof Blob ? blobToDataUrl(image) : image;
  }

  const connection = await initializeDatabase();
  const result = await connection.query(
    'SELECT fotografia_url FROM issues_riesgos WHERE issue_id = ?;',
    [issueId],
  );
  const image = result.values?.[0]?.fotografia_url;
  return typeof image === 'string' ? image : null;
}

function saveIssueReportOnWeb(report: {
  title: string;
  description: string;
  location: string;
  priority: string;
  image: Blob | null;
  trabajador_id?: number;
  trabajador_nombre?: string;
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
        prioridad: report.priority,
        fotografia: report.image,
        fecha_captura: new Date().toISOString(),
        estado: 'capturado',
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

function getIssueReportImageOnWeb(issueId: number): Promise<Blob | string | null> {
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

function getIssueReportsPageOnWeb(limit: number, beforeIssueId?: number): Promise<IssueReportPage> {
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

function getPendingIssueReportsOnWeb(): Promise<IssueReport[]> {
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

        reports.push(cursor.value as Record<string, unknown>);
        cursor.continue();
      };
      cursorRequest.onerror = () => {
        database.close();
        reject(cursorRequest.error ?? new Error('No se pudieron consultar los reportes pendientes.'));
      };
    };
  });
}

function mapIssueReport(report: Record<string, unknown>): IssueReport {
  return {
    issueId: Number(report.issue_id),
    title: String(report.titulo ?? ''),
    description: String(report.descripcion ?? ''),
    location: String(report.ubicacion ?? ''),
    priority: String(report.prioridad ?? 'Normal'),
    capturedAt: String(report.fecha_captura ?? ''),
    workerName: report.trabajador_nombre ? String(report.trabajador_nombre) : undefined,
  };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('No se pudo leer la fotografía.'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer la fotografía.'));
    reader.readAsDataURL(blob);
  });
}
