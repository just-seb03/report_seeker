/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : index.ts (Database Repository)                                   *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 07 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 07 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   Fachada y punto de entrada que redirige peticiones de base de datos a Web o Nativo.       *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Capacitor } from '@capacitor/core';
import * as SQLite from './SQLiteAdapter';
import * as Web from './WebAdapter';
import { blobToDataUrl, type IssueReport, type IssueReportPage, type Ubicacion } from './types';

// Export types
export type { IssueReport, IssueReportPage, Ubicacion };

export function initializeDatabase() {
  if (!Capacitor.isNativePlatform()) {
    return Promise.reject(new Error('SQLite requiere ejecutar la app en Android o iOS.'));
  }
  return SQLite.initializeDatabase();
}

export async function insertOrUpdateTrabajadorLocal(t: { trabajador_id: number; nombre: string; email: string; pin: string; es_prevencionista?: boolean; foto_url?: string | null }) {
  if (Capacitor.isNativePlatform()) {
    await SQLite.insertOrUpdateTrabajadorLocal(t);
  } else {
    console.warn("insertOrUpdateTrabajadorLocal no soportado en web (mocking)");
  }
}

export async function saveIssueReport(report: {
  title: string;
  description: string;
  location: string;
  priority: string;
  image: Blob | null;
  trabajador_id?: number;
  trabajador_nombre?: string;
  ubicacion_id?: number;
}): Promise<number> {
  if (Capacitor.isNativePlatform()) {
    return SQLite.saveIssueReport(report);
  }
  return Web.saveIssueReport(report);
}

export async function getIssueReportsPage(limit: number, beforeIssueId?: number): Promise<IssueReportPage> {
  if (Capacitor.isNativePlatform()) {
    return SQLite.getIssueReportsPage(limit, beforeIssueId);
  }
  return Web.getIssueReportsPage(limit, beforeIssueId);
}

export async function updateIssueReportPriority(issueId: number, priority: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    return SQLite.updateIssueReportPriority(issueId, priority);
  }
  return Web.updateIssueReportPriority(issueId, priority);
}

export async function getPendingIssueReports(): Promise<IssueReport[]> {
  if (Capacitor.isNativePlatform()) {
    return SQLite.getPendingIssueReports();
  }
  return Web.getPendingIssueReports();
}

export async function getAllIssueReports(): Promise<IssueReport[]> {
  if (Capacitor.isNativePlatform()) {
    return SQLite.getAllIssueReports();
  }
  return Web.getAllIssueReports();
}

export async function getIssueReportImage(issueId: number): Promise<string | null> {
  if (Capacitor.isNativePlatform()) {
    return SQLite.getIssueReportImage(issueId);
  }
  const image = await Web.getIssueReportImage(issueId);
  return image instanceof Blob ? blobToDataUrl(image) : image;
}

export async function getUbicaciones(): Promise<Ubicacion[]> {
  if (Capacitor.isNativePlatform()) {
    return SQLite.getUbicaciones();
  }
  return Web.getUbicaciones();
}
