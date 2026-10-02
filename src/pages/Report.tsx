import { useState } from 'react';
import { saveIssueReport } from '../database';
import ReportPhotoStep from '../components/ReportPhotoStep';
import ReportReadyStep from '../components/ReportReadyStep';
import ReportSeverityStep from '../components/ReportSeverityStep';
import ReportSummaryStep, { type EditableReportStep } from '../components/ReportSummaryStep';
import ReportTextStep from '../components/ReportTextStep';
import './Report.css';

const severityOptions = ['Leve', 'Moderada', 'Grave'] as const;
type ReportStep = EditableReportStep | 'summary' | 'ready';

export type ReportPhoto = { blob: Blob; webPath: string };

interface ReportProps {
  photo: ReportPhoto;
  onRetakePhoto: () => Promise<ReportPhoto | null>;
  onComplete: () => void;
  onReportCreated: (report: { issueId: number; title: string; description: string; location: string; priority: string }) => void;
}

export default function Report({ photo, onRetakePhoto, onComplete, onReportCreated }: ReportProps) {
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

  return (
    <main className="report-screen">
      <div className="report-content">
        <div className="report-step-transition" key={step}>
          {step === 'photo' && (
            <ReportPhotoStep
              photoUrl={currentPhoto.webPath}
              isRetakingPhoto={isRetakingPhoto}
              onRetakePhoto={handleRetakePhoto}
              onConfirm={() => continueTo('severity')}
            />
          )}
          {step === 'severity' && (
            <ReportSeverityStep
              severity={severity}
              options={severityOptions}
              onChange={setSeverity}
              onConfirm={() => continueTo('description')}
            />
          )}
          {step === 'description' && (
            <ReportTextStep
              field="description"
              heading="Describe lo que has visto"
              value={description}
              placeholder="Escribe la descripción"
              maxLength={1000}
              multiline
              onChange={setDescription}
              onConfirm={() => continueTo('location')}
            />
          )}
          {step === 'location' && (
            <ReportTextStep
              field="location"
              heading="¿En dónde está localizado el riesgo?"
              value={location}
              placeholder="Ingresa la ubicación"
              maxLength={200}
              onChange={setLocation}
              onConfirm={() => continueTo('title')}
            />
          )}
          {step === 'title' && (
            <ReportTextStep
              field="title"
              heading="Ponle un título al riesgo"
              value={title}
              placeholder="Escribe un título"
              maxLength={100}
              errorMessage={errorMessage}
              onChange={setTitle}
              onConfirm={() => continueTo('summary')}
            />
          )}
          {step === 'summary' && (
            <ReportSummaryStep
              photoUrl={currentPhoto.webPath}
              severity={severityOptions[severity]}
              description={description}
              location={location}
              title={title}
              errorMessage={errorMessage}
              isSaving={isSaving}
              onEdit={editSummaryStep}
              onConfirm={handleSubmit}
            />
          )}
          {step === 'ready' && <ReportReadyStep onComplete={onComplete} />}
        </div>
      </div>
    </main>
  );
}