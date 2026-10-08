/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : types.ts                                                         *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 07 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 07 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   Módulo creado en fase de refactorización para interfaces de base de datos.                *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

export interface IssueReport {
  issueId: number;
  firebaseId?: string;
  title: string;
  description: string;
  location: string;
  priority: string;
  capturedAt: string;
  workerName?: string;
  workerPhoto?: string | null;
  image?: string | null;
}

export interface IssueReportPage {
  items: IssueReport[];
  hasMore: boolean;
}

export interface Ubicacion {
  id: number;
  nombre: string;
}

export function mapIssueReport(report: Record<string, unknown>): IssueReport {
  return {
    issueId: Number(report.issue_id),
    firebaseId: typeof report.firebase_id === 'string' ? report.firebase_id : undefined,
    title: String(report.titulo ?? ''),
    description: String(report.descripcion ?? ''),
    location: String(report.ubicacion ?? ''),
    priority: String(report.prioridad ?? 'Normal'),
    capturedAt: String(report.fecha_captura ?? ''),
    workerName: report.trabajador_nombre ? String(report.trabajador_nombre) : undefined,
    workerPhoto: typeof report.trabajador_foto === 'string' ? report.trabajador_foto : undefined,
    image: typeof report.fotografia_url === 'string' 
      ? report.fotografia_url 
      : (report.fotografia instanceof Blob ? URL.createObjectURL(report.fotografia) : (typeof report.fotografia === 'string' ? report.fotografia : null)),
  };
}

export function blobToDataUrl(blob: Blob): Promise<string> {
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
