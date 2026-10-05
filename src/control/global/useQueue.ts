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

export function useQueue() {
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    
    const fetchReports = async () => {
      try {
        const pending = await getPendingIssueReports();
        if (isActive) {
          setReports(pending);
        }
      } catch (err) {
        console.error("Error al obtener reportes pendientes", err);
      } finally {
        if (isActive) setLoading(false);
      }
    };
    
    fetchReports();
    
    window.addEventListener('reportes_actualizados', fetchReports);
    
    return () => {
      isActive = false;
      window.removeEventListener('reportes_actualizados', fetchReports);
    };
  }, []);

  return {
    reports,
    loading
  };
}
