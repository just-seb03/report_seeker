/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : useReport.ts                                                  *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 02 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización : 02 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   useReport -- Custom hook encargado del manejo de estados durante el flujo de creación de  *
 *        un nuevo reporte.                                                                    *
 *   continueTo -- Avanza al siguiente paso específico durante la captura de información de un *
 *        riesgo.                                                                              *
 *   editSummaryStep -- Permite regresar al resumen desde cualquier paso al editar la          *
 *        información ingresada.                                                               *
 *   handleRetakePhoto -- Inicia nuevamente la captura de cámara si el usuario desea cambiar   *
 *        la fotografía.                                                                       *
 *   handleSubmit -- Procesa y valida la información capturada, procediendo a guardar el       *
 *        reporte en la base de datos.                                                         *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useState } from 'react';
import { insertOrUpdateTrabajadorLocal, saveIssueReport } from '../database';
import { syncPendingReports } from './sincronizador';
import { type ReportPhoto } from '../pages/Report';
import { type EditableReportStep } from '../components/ReportSummaryStep';
import { getCurrentUser } from './authControl';

const severityOptions = ['Leve', 'Moderada', 'Grave'] as const;
export type ReportStep = EditableReportStep | 'summary' | 'ready';

interface UseReportProps {
  photo: ReportPhoto;
  onRetakePhoto: () => Promise<ReportPhoto | null>;
  onReportCreated: (report: { issueId: number; title: string; description: string; location: string; priority: string }) => void;
}

export function useReport({ photo, onRetakePhoto, onReportCreated }: UseReportProps) {
  const [step, setStep] = useState<ReportStep>('photo');
  const [currentPhoto, setCurrentPhoto] = useState(photo);
  const [severity, setSeverity] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRetakingPhoto, setIsRetakingPhoto] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [returnToSummary, setReturnToSummary] = useState(false);

  const continueTo = (nextStep: ReportStep) => {
    if (returnToSummary) {
      setReturnToSummary(false);
      setStep('summary');
      return;
    }
    setStep(nextStep);
  };

  const editSummaryStep = (nextStep: EditableReportStep) => {
    setReturnToSummary(true);
    setStep(nextStep);
  };

  const handleRetakePhoto = async () => {
    setIsRetakingPhoto(true);
    try {
      const replacement = await onRetakePhoto();
      if (replacement) setCurrentPhoto(replacement);
    } finally {
      setIsRetakingPhoto(false);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setErrorMessage('');

    try {
      const user = getCurrentUser();
      if (user) {
        await insertOrUpdateTrabajadorLocal(user);
      }

      const issueId = await saveIssueReport({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        priority: severityOptions[severity],
        image: currentPhoto.blob,
        trabajador_id: user?.trabajador_id,
        trabajador_nombre: user?.nombre
      });

      // Disparar sincronización con Firebase en segundo plano
      syncPendingReports().catch(e => console.error("Error lanzando sync", e));

      onReportCreated({
        issueId,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        priority: severityOptions[severity],
      });
      setStep('ready');
    } catch (error) {
      console.error('No se pudo guardar el reporte.', error);
      setErrorMessage('No se pudo guardar el reporte. Inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    step,
    currentPhoto,
    severity,
    title,
    description,
    location,
    isSaving,
    isRetakingPhoto,
    errorMessage,
    severityOptions,
    setSeverity,
    setTitle,
    setDescription,
    setLocation,
    continueTo,
    editSummaryStep,
    handleRetakePhoto,
    handleSubmit,
  };
}
