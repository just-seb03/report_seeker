import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  type SQLiteDBConnection,
} from '@capacitor-community/sqlite';

const databaseName = 'report_seeker';
const sqlite = new SQLiteConnection(CapacitorSQLite);

const schema = `
CREATE TABLE IF NOT EXISTS trabajadores (
  trabajador_id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cargo TEXT,
  unidad_organizacional TEXT,
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
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fotografia_url TEXT,
  fecha_captura DATETIME DEFAULT CURRENT_TIMESTAMP,
  trabajador_id INTEGER,
  estado TEXT DEFAULT 'capturado',
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
  return connection;
}

let databasePromise: Promise<SQLiteDBConnection> | null = null;

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

export async function saveIssueReport(report: {
  title: string;
  description: string;
  priority: string;
}): Promise<number> {
  const connection = await initializeDatabase();
  const result = await connection.run(
    'INSERT INTO issues_riesgos (titulo, descripcion, prioridad) VALUES (?, ?, ?);',
    [report.title, report.description, report.priority],
  );
  const issueId = result.changes?.lastId;

  if (issueId === undefined) throw new Error('SQLite no devolvió el ID del reporte.');
  return issueId;
}