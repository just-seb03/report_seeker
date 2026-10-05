/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : Report.tsx                                                    *
 *                                                                                             *
 *              Programador :Cristian Vega    *
 *                                                                                             *
 *          Fecha de Inicio : 01 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización :04 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   Report -- Contenedor principal del flujo de captura de reporte, que delega estado en      *
 *        useReport.                                                                           *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import ReportPhotoStep from '../components/Report/ReportPhotoStep';
import ReportReadyStep from '../components/Report/ReportReadyStep';
import ReportSeverityStep from '../components/Report/ReportSeverityStep';
import ReportSummaryStep from '../components/Report/ReportSummaryStep';
import ReportTextStep from '../components/Report/ReportTextStep';
import ReportProgressBar from '../components/Report/ReportProgressBar';
import { useReport } from '../control/Report/useReport';
import { t } from '../control/global/i18n';
import { Box } from '@mui/material';


export type ReportPhoto = { blob: Blob; webPath: string; path?: string };

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
    <Box 
      component="main" 
      sx={{
        position: 'absolute', inset: 0, zIndex: 5, display: 'block',
        overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch',
        overscrollBehaviorY: 'contain', touchAction: 'pan-y', boxSizing: 'border-box',
        p: 'max(30px, calc(env(safe-area-inset-top) + 18px)) 24px calc(124px + env(safe-area-inset-bottom))',
        bgcolor: 'background.default', color: 'text.primary', scrollbarWidth: 'thin',
        transition: 'background-color 0.35s ease, color 0.35s ease',
        '@media (max-width: 480px)': { px: '20px' }
      }}
    >
      <Box sx={{ width: 'min(100%, 560px)', mx: 'auto', '@media (max-width: 480px)': { width: '100%' } }}>
        <Box className="report-step-transition" key={step}>
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
              heading={t.report.descHeading}
              value={description}
              placeholder={t.report.descPlaceholder}
              maxLength={1000}
              multiline
              onChange={setDescription}
              onConfirm={() => continueTo('location')}
            />
          )}
          {step === 'location' && (
            <ReportTextStep
              field="location"
              heading={t.report.locationHeading}
              value={location}
              placeholder={t.report.locationPlaceholder}
              maxLength={200}
              onChange={setLocation}
              onConfirm={() => continueTo('title')}
            />
          )}
          {step === 'title' && (
            <ReportTextStep
              field="title"
              heading={t.report.titleHeading}
              value={title}
              placeholder={t.report.titlePlaceholder}
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
        </Box>
      </Box>
      <ReportProgressBar currentStep={step} />
    </Box>
  );
}
