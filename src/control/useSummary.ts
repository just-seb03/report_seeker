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
import type { DateFilterType, DateRange } from '../components/DateFilterWidget';

export interface SummaryData {
  total: number;
  high: number;
  medium: number;
  low: number;
  topLocations: { name: string; count: number }[];
  topUsers: { name: string; count: number }[];
}

export function useSummary(filterType: DateFilterType = 'all', customRange?: DateRange) {
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
        const allReports = await getAllIssueReports();
        if (!mounted) return;

        let filteredReports = allReports;

        if (filterType !== 'all') {
          const now = new Date();
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          
          const startOfYesterday = new Date(startOfToday);
          startOfYesterday.setDate(startOfYesterday.getDate() - 1);
          
          const dayOfWeek = now.getDay() || 7;
          const startOfWeek = new Date(startOfToday);
          startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek + 1);

          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

          filteredReports = allReports.filter(r => {
            if (!r.capturedAt) return false;
            const rDate = new Date(r.capturedAt);
            
            switch (filterType) {
              case 'today':
                return rDate >= startOfToday;
              case 'yesterday':
                return rDate >= startOfYesterday && rDate < startOfToday;
              case 'week':
                return rDate >= startOfWeek;
              case 'month':
                return rDate >= startOfMonth;
              case 'custom':
                if (!customRange) return true;
                if (!customRange.from && !customRange.to) return true;
                
                if (customRange.from) {
                  const fromDate = new Date(customRange.from);
                  if (rDate < new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate() + 1)) return false;
                }
                if (customRange.to) {
                  const toDate = new Date(customRange.to);
                  const endOfDay = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate() + 1, 23, 59, 59, 999);
                  if (rDate > endOfDay) return false;
                }
                return true;
              default:
                return true;
            }
          });
        }

        const reports = filteredReports;

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
  }, [filterType, customRange]);

  return { data, loading };
}
