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
  topLocations: { name: string; count: number }[];
  topUsers: { name: string; count: number }[];
}

export function useSummary() {
  const [data, setData] = useState<SummaryData>({ 
    total: 0, high: 0, medium: 0, low: 0, 
    topLocations: [],
    topUsers: []
  });
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
        
        const locationCounts: Record<string, number> = {};
        const userCounts: Record<string, number> = {};

        reports.forEach((report: IssueReport) => {
          const p = report.priority.toLowerCase();
          const isHigh = ['alta', 'grave', 'high'].includes(p);
          const isMedium = ['media', 'moderada', 'medium', 'warning'].includes(p);
          
          if (isHigh) high++;
          else if (isMedium) medium++;
          else low++;

          // Contar ubicaciones
          if (report.location) {
            const loc = report.location.trim();
            if (loc !== '') {
              locationCounts[loc] = (locationCounts[loc] || 0) + 1;
            }
          }

          // Contar usuarios
          if (report.workerName) {
            const user = report.workerName.trim();
            if (user !== '') {
              userCounts[user] = (userCounts[user] || 0) + 1;
            }
          }
        });

        // Ordenar y sacar el Top 3
        const topLocations = Object.entries(locationCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        const topUsers = Object.entries(userCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        setData({ 
          total: reports.length, high, medium, low,
          topLocations,
          topUsers
        });
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
