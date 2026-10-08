/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : useQueue.ts                                                   *
 *                                                                                             *
 *              Programador :Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 03 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización :03 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   useQueue -- Hook para manejar la vista de Cola de salida offline.                         *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useState, useEffect } from 'react';
import { getPendingIssueReports, type IssueReport } from '../../database';
import { useAppStore } from '../../store/useAppStore';

export function useQueue() {
  // Hook que se encarga de consultar periódicamente la base de datos local (SQLite)
  // para obtener todos los reportes que se encuentren en estado 'pendiente' (offline-first).
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [loading, setLoading] = useState(true);
  const reportsSyncToken = useAppStore(state => state.reportsSyncToken);

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchReports = async () => {
      try {
        const pending = await getPendingIssueReports();
        if (!controller.signal.aborted) {
          setReports(pending);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error("Error al obtener reportes pendientes", err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    
    fetchReports();
    
    // Escuchamos el evento global para recargar la cola
    return () => {
      controller.abort();
    };
  }, [reportsSyncToken]);

  return {
    reports,
    loading
  };
}
