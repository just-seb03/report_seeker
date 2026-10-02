import { useState } from 'react';
import { saveIssueReport } from '../database';
import { type ReportPhoto } from '../pages/Report';
import { type EditableReportStep } from '../components/ReportSummaryStep';

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
      const issueId = await saveIssueReport({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        priority: severityOptions[severity],
        image: currentPhoto.blob,
      });

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
