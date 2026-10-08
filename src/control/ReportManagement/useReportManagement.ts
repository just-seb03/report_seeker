/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : useReportManagement.ts                                           *
 *                                                                                             *
 *              Programador : Maximiliano Cantuarias                                             *
 *                                                                                             *
 *          Fecha de Inicio : 05 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 05 de Octubre de 2026                                            *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   useReportManagement -- Coordina la conectividad y el guardado de severidad.              *
 *        Verifica Firestore y actualiza primero la nube y luego el almacenamiento local.     *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useCallback, useEffect, useState } from 'react';
import { Network } from '@capacitor/network';
import { updateIssueReportPriority, type IssueReport } from '../../database';
import {
  updateSyncedReportPriority,
  verifyReportManagementConnection
} from '../global/sincronizador';
import { useAppStore } from '../../store/useAppStore';

type SeveritySaveError = 'offline' | 'save';

export function useReportManagement(report: IssueReport) {
  const [priority, setPriority] = useState(report.priority);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isSavingSeverity, setIsSavingSeverity] = useState(false);
  const [severitySaveError, setSeveritySaveError] = useState<SeveritySaveError | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let removeNetworkListener: (() => Promise<void>) | undefined;

    void Network.getStatus()
      .then((status) => {
        if (!controller.signal.aborted) setIsOnline(status.connected);
      })
      .catch((error: any) => {
        if (error.name === 'AbortError') return;
        console.error('No se pudo comprobar la conexión de red:', error);
        if (!controller.signal.aborted) setIsOnline(false);
      });

    void Network.addListener('networkStatusChange', (status) => {
      if (!controller.signal.aborted) setIsOnline(status.connected);
    })
      .then((listener) => {
        if (!controller.signal.aborted) removeNetworkListener = () => listener.remove();
        else void listener.remove();
      })
      .catch((error: any) => {
        if (error.name === 'AbortError') return;
        console.error('No se pudo escuchar el estado de la conexión:', error);
      });

    return () => {
      controller.abort();
      if (removeNetworkListener) void removeNetworkListener();
    };
  }, []);

  const saveSeverity = useCallback(async (nextPriority: string): Promise<boolean> => {
    if (isSavingSeverity) return false;

    setIsSavingSeverity(true);
    setSeveritySaveError(null);
    try {
      const networkStatus = await Network.getStatus();
      setIsOnline(networkStatus.connected);
      if (!networkStatus.connected) {
        setSeveritySaveError('offline');
        return false;
      }

      await verifyReportManagementConnection();
      if (report.firebaseId) {
        await updateSyncedReportPriority(report.firebaseId, nextPriority);
      }
      await updateIssueReportPriority(report.issueId, nextPriority);

      setPriority(nextPriority);
      useAppStore.getState().triggerReportsSync();
      return true;
    } catch (error) {
      console.error(`No se pudo guardar la severidad del reporte #${report.issueId}:`, error);
      setSeveritySaveError('save');
      return false;
    } finally {
      setIsSavingSeverity(false);
    }
  }, [isSavingSeverity, report.firebaseId, report.issueId]);

  return {
    priority,
    isOnline,
    isSavingSeverity,
    severitySaveError,
    saveSeverity
  };
}
