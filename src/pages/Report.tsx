/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : Report.tsx                                                    *
 *                                                                                             *
 *              Programador : Sebastian Arredondo, Maximiliano Cantuarias, Cristian Vega    *
 *                                                                                             *
 *          Fecha de Inicio : 01 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización : 02 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   Report -- Contenedor principal del flujo de captura de reporte, que delega estado en      *
 *        useReport.                                                                           *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import ReportPhotoStep from '../components/ReportPhotoStep';
import ReportReadyStep from '../components/ReportReadyStep';
import ReportSeverityStep from '../components/ReportSeverityStep';
import ReportSummaryStep from '../components/ReportSummaryStep';
import ReportTextStep from '../components/ReportTextStep';
import { useReport } from '../control/useReport';
import './Report.css';

export type ReportPhoto = { blob: Blob; webPath: string };

interface ReportProps {
  photo: ReportPhoto;
  onRetakePhoto: () => Promise<ReportPhoto | null>;
  onComplete: () => void;
  onReportCreated: (report: { issueId: number; title: string; description: string; location: string; priority: string }) => void;
}

export default function Report({ photo, onRetakePhoto, onComplete, onReportCreated }: ReportProps) {
  const {
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
  } = useReport({ photo, onRetakePhoto, onReportCreated });

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
