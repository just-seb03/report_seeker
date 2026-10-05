/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : useSummary.ts                                                    *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 05 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 05 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   useSummary -- Hook para obtener y calcular el resumen estadístico de los reportes de      *
 *            riesgos.                                                                         *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useState, useEffect } from 'react';
import { getAllIssueReports, type IssueReport } from '../database';

export interface SummaryData {
  total: number;
  high: number;
  medium: number;
  low: number;
}

export function useSummary() {
  const [data, setData] = useState<SummaryData>({ total: 0, high: 0, medium: 0, low: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const reports = await getAllIssueReports();
        if (!mounted) return;

        let high = 0;
        let medium = 0;
        let low = 0;

        reports.forEach((report: IssueReport) => {
          const p = report.priority.toLowerCase();
          if (['alta', 'grave', 'high'].includes(p)) {
            high++;
          } else if (['media', 'moderada', 'medium', 'warning'].includes(p)) {
            medium++;
          } else {
            low++; // 'leve', 'baja', 'low', 'normal', or unknown
          }
        });

        setData({ total: reports.length, high, medium, low });
      } catch (error) {
        console.error('Error fetching summary data:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading };
}
