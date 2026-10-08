/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : schema.ts                                                        *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 07 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 07 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   Módulo creado en fase de refactorización arquitectónica para aislar DDL.                  *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

export const databaseName = 'report_seeker';
export const webObjectStore = 'issues_riesgos';

export const schema = `
CREATE TABLE IF NOT EXISTS trabajadores (
  trabajador_id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  pin TEXT NOT NULL,
  es_prevencionista INTEGER DEFAULT 0,
  estado TEXT DEFAULT 'activo',
  foto_url TEXT
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
  ubicacion_id INTEGER,
  FOREIGN KEY (trabajador_id) REFERENCES trabajadores(trabajador_id),
  FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(ubicacion_id)
);

CREATE TABLE IF NOT EXISTS ubicaciones (
  ubicacion_id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE
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
