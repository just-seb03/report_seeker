/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : SQLiteAdapter.ts                                                 *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 07 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 07 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   Adaptador exclusivo para Capacitor SQLite.                                                *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { CapacitorSQLite, SQLiteConnection, type SQLiteDBConnection } from '@capacitor-community/sqlite';
import { databaseName, schema } from './schema';
import { blobToDataUrl, mapIssueReport, type IssueReport, type IssueReportPage, type Ubicacion } from './types';

const sqlite = new SQLiteConnection(CapacitorSQLite);
let databasePromise: Promise<SQLiteDBConnection> | null = null;

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
  if (!workerColumns.values?.some((column) => column.name === 'es_prevencionista')) {
    await connection.execute("ALTER TABLE trabajadores ADD COLUMN es_prevencionista INTEGER DEFAULT 0;");
  }
  if (!workerColumns.values?.some((column) => column.name === 'foto_url')) {
    await connection.execute("ALTER TABLE trabajadores ADD COLUMN foto_url TEXT;");
  }

  const issueColumns = await connection.query('PRAGMA table_info(issues_riesgos);');
  if (!issueColumns.values?.some((column) => column.name === 'trabajador_nombre')) {
    await connection.execute('ALTER TABLE issues_riesgos ADD COLUMN trabajador_nombre TEXT;');
  }
  if (!issueColumns.values?.some((column) => column.name === 'ubicacion_id')) {
    await connection.execute('ALTER TABLE issues_riesgos ADD COLUMN ubicacion_id INTEGER REFERENCES ubicaciones(ubicacion_id);');
  }

  const locationsCount = await connection.query('SELECT COUNT(*) as count FROM ubicaciones;');
  if (locationsCount.values && locationsCount.values[0].count === 0) {
    const defaultLocations = ['Sector Norte', 'Sector Centro', 'Sector Sur', 'Planta de Procesos', 'Mina Subterránea', 'Taller de Mantenimiento', 'Administración'];
    for (const loc of defaultLocations) {
      await connection.run('INSERT INTO ubicaciones (nombre) VALUES (?);', [loc]);
    }
  }

  return connection;
}

export function initializeDatabase(): Promise<SQLiteDBConnection> {
  if (!databasePromise) {
    databasePromise = openDatabase().catch((error: unknown) => {
      databasePromise = null;
      throw error;
    });
  }
  return databasePromise;
}

export async function insertOrUpdateTrabajadorLocal(t: { trabajador_id: number; nombre: string; email: string; pin: string; es_prevencionista?: boolean; foto_url?: string | null }) {
  const connection = await initializeDatabase();
  const existingWorker = await connection.query(
    'SELECT trabajador_id FROM trabajadores WHERE trabajador_id = ? LIMIT 1;',
    [t.trabajador_id]
  );

  if (existingWorker.values?.length) {
    await connection.run(
      'UPDATE trabajadores SET nombre = ?, email = ?, pin = ?, es_prevencionista = ?, foto_url = ? WHERE trabajador_id = ?;',
      [t.nombre, t.email, t.pin, t.es_prevencionista ? 1 : 0, t.foto_url ?? null, t.trabajador_id]
    );
    return;
  }

  await connection.run(
    'INSERT INTO trabajadores (trabajador_id, nombre, email, pin, es_prevencionista, foto_url) VALUES (?, ?, ?, ?, ?, ?);',
    [t.trabajador_id, t.nombre, t.email, t.pin, t.es_prevencionista ? 1 : 0, t.foto_url ?? null]
  );
}

export async function saveIssueReport(report: { title: string; description: string; location: string; priority: string; image: Blob | null; trabajador_id?: number; trabajador_nombre?: string; ubicacion_id?: number; }): Promise<number> {
  const connection = await initializeDatabase();
  const imageData = report.image ? await blobToDataUrl(report.image) : null;
  const result = await connection.run(
    'INSERT INTO issues_riesgos (titulo, descripcion, ubicacion, ubicacion_id, prioridad, fotografia_url, trabajador_id, trabajador_nombre) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
    [report.title, report.description, report.location, report.ubicacion_id ?? null, report.priority, imageData, report.trabajador_id ?? null, report.trabajador_nombre ?? null],
  );
  const issueId = result.changes?.lastId;
  if (issueId === undefined) throw new Error('SQLite no devolvió el ID del reporte.');
  return issueId;
}

export async function getIssueReportsPage(limit: number, beforeIssueId?: number): Promise<IssueReportPage> {
  const connection = await initializeDatabase();
  const result = beforeIssueId === undefined
    ? await connection.query(
      'SELECT i.issue_id, i.firebase_id, i.titulo, i.descripcion, i.ubicacion, i.prioridad, i.fecha_captura, i.fotografia_url, i.trabajador_nombre, t.foto_url as trabajador_foto FROM issues_riesgos i LEFT JOIN trabajadores t ON i.trabajador_id = t.trabajador_id WHERE i.estado_sync != ? ORDER BY i.fecha_captura DESC LIMIT ?;',
      ['pendiente', limit + 1],
    )
    : await connection.query(
      'SELECT i.issue_id, i.firebase_id, i.titulo, i.descripcion, i.ubicacion, i.prioridad, i.fecha_captura, i.fotografia_url, i.trabajador_nombre, t.foto_url as trabajador_foto FROM issues_riesgos i LEFT JOIN trabajadores t ON i.trabajador_id = t.trabajador_id WHERE i.estado_sync != ? AND i.fecha_captura < (SELECT fecha_captura FROM issues_riesgos WHERE issue_id = ?) ORDER BY i.fecha_captura DESC LIMIT ?;',
      ['pendiente', beforeIssueId, limit + 1],
    );
  const reports = result.values ?? [];
  return {
    items: reports.slice(0, limit).map(mapIssueReport),
    hasMore: reports.length > limit,
  };
}

export async function updateIssueReportPriority(issueId: number, priority: string): Promise<void> {
  const connection = await initializeDatabase();
  const report = await connection.query(
    'SELECT issue_id FROM issues_riesgos WHERE issue_id = ? LIMIT 1;',
    [issueId],
  );
  if (!report.values?.length) throw new Error(`No se encontró el reporte #${issueId}.`);
  await connection.run(
    'UPDATE issues_riesgos SET prioridad = ? WHERE issue_id = ?;',
    [priority, issueId],
  );
}

export async function getPendingIssueReports(): Promise<IssueReport[]> {
  const connection = await initializeDatabase();
  const result = await connection.query(
    'SELECT i.issue_id, i.firebase_id, i.titulo, i.descripcion, i.ubicacion, i.prioridad, i.fecha_captura, i.fotografia_url, i.trabajador_nombre, t.foto_url as trabajador_foto FROM issues_riesgos i LEFT JOIN trabajadores t ON i.trabajador_id = t.trabajador_id WHERE i.estado_sync = ? ORDER BY i.issue_id DESC;',
    ['pendiente']
  );
  return (result.values ?? []).map(mapIssueReport);
}

export async function getAllIssueReports(): Promise<IssueReport[]> {
  const connection = await initializeDatabase();
  const result = await connection.query(
    'SELECT i.issue_id, i.firebase_id, i.titulo, i.descripcion, i.ubicacion, i.prioridad, i.fecha_captura, i.fotografia_url, i.trabajador_nombre, t.foto_url as trabajador_foto FROM issues_riesgos i LEFT JOIN trabajadores t ON i.trabajador_id = t.trabajador_id ORDER BY i.issue_id DESC;'
  );
  return (result.values ?? []).map(mapIssueReport);
}

export async function getIssueReportImage(issueId: number): Promise<string | null> {
  const connection = await initializeDatabase();
  const result = await connection.query(
    'SELECT fotografia_url FROM issues_riesgos WHERE issue_id = ?;',
    [issueId],
  );
  const image = result.values?.[0]?.fotografia_url;
  return typeof image === 'string' ? image : null;
}

export async function getUbicaciones(): Promise<Ubicacion[]> {
  const connection = await initializeDatabase();
  const result = await connection.query('SELECT ubicacion_id as id, nombre FROM ubicaciones ORDER BY nombre ASC;');
  return (result.values ?? []) as Ubicacion[];
}
