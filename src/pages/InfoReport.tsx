/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : InfoReport.tsx                                                *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 01 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización : 02 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   InfoReport -- Componente contenedor de la visualización de un reporte individual.         *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded';
import TagOutlinedIcon from '@mui/icons-material/TagOutlined';
import { Box, Dialog, IconButton, Typography } from '@mui/material';
import { type IssueReport } from '../database';
import { useInfoReport, formatReportDate } from '../control/useInfoReport';
import './InfoReport.css';

type InfoReportProps = {
  report: IssueReport;
  onBack: () => void;
};

export default function InfoReport({ report, onBack }: InfoReportProps) {
  const {
    image,
    isLoadingImage,
    isOpeningImage,
    imageDialogOpen,
    priorityClass,
    setImageDialogOpen,
    handleOpenFullImage,
  } = useInfoReport(report);

  return (
    <main className="info-report-screen">
      <header className="info-report-header">
        <IconButton className="info-report-back" aria-label="Volver" onClick={onBack}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Box className="info-report-heading">
          <Typography component="span">Reporte de riesgo</Typography>
          <Typography component="h1">{report.title}</Typography>
        </Box>
      </header>

      <div className="info-report-content">
        <button
          className={`info-report-photo-button${isLoadingImage ? ' is-loading' : ''}`}
          type="button"
          onClick={handleOpenFullImage}
          disabled={!image || isOpeningImage}
          aria-label="Abrir fotografía completa"
          aria-busy={isLoadingImage || isOpeningImage}
        >
          {image ? (
            <img src={image} alt={`Fotografía del riesgo: ${report.title}`} />
          ) : (
            <span className="info-report-photo-empty">
              {isLoadingImage ? 'Cargando fotografía...' : 'Este reporte no tiene fotografía'}
            </span>
          )}
        </button>

        <section className="info-report-details" aria-label="Información del reporte">
          <div className="info-report-detail-grid">
            <div className="info-report-fact">
              <span className="info-report-fact-icon" aria-hidden="true"><LocationOnOutlinedIcon /></span>
              <div className="info-report-fact-copy">
                <Typography component="h3">Ubicación</Typography>
                <p>{report.location || 'Ubicación no especificada'}</p>
              </div>
            </div>
            <div className={`info-report-fact info-report-severity ${priorityClass}`}>
              <span className="info-report-fact-icon" aria-hidden="true"><PriorityHighRoundedIcon /></span>
              <div className="info-report-fact-copy">
                <Typography component="h3">Gravedad</Typography>
                <p>{report.priority}</p>
              </div>
            </div>
          </div>
          <div className="info-report-description">
            <Typography component="h2">Descripción</Typography>
            <p>{report.description || 'Sin descripción'}</p>
          </div>
          <div className="info-report-metadata" aria-label="Identificación y fecha del reporte">
            <span><TagOutlinedIcon aria-hidden="true" /> UID-{report.issueId}</span>
            <span><CalendarMonthOutlinedIcon aria-hidden="true" /> {formatReportDate(report.capturedAt)}</span>
          </div>
        </section>
      </div>

      <Dialog
        className="info-report-image-dialog"
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        fullScreen
        aria-label="Fotografía completa del reporte"
      >
        <Box className="info-report-image-viewer" onClick={() => setImageDialogOpen(false)}>
          <IconButton className="info-report-viewer-close" aria-label="Cerrar fotografía">
            <ArrowBackRoundedIcon />
          </IconButton>
          {image && <img src={image} alt={`Fotografía completa: ${report.title}`} />}
        </Box>
      </Dialog>
    </main>
  );
}
