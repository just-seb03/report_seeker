import { useEffect, useState } from 'react';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Capacitor } from '@capacitor/core';
import { FileOpener } from '@capacitor-community/file-opener';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Box, Dialog, IconButton, Typography } from '@mui/material';
import { getIssueReportImage, type IssueReport } from '../database';
import './InfoReport.css';

type InfoReportProps = {
  report: IssueReport;
  onBack: () => void;
};

function getImageData(image: string) {
  const [header, data] = image.split(',', 2);
  const mimeType = header.match(/^data:(.+);base64$/)?.[1] ?? 'image/jpeg';
  const extension = mimeType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
  return { mimeType, extension, base64: data ?? image };
}

export default function InfoReport({ report, onBack }: InfoReportProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [isOpeningImage, setIsOpeningImage] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  useEffect(() => {
    let isActive = true;
    getIssueReportImage(report.issueId)
      .then((reportImage) => {
        if (isActive) setImage(reportImage);
      })
      .catch((error: unknown) => console.error('No se pudo cargar la fotografía del reporte.', error))
      .finally(() => {
        if (isActive) setIsLoadingImage(false);
      });

    return () => { isActive = false; };
  }, [report.issueId]);

  const handleOpenFullImage = async () => {
    if (!image || isOpeningImage) return;
    if (!Capacitor.isNativePlatform()) {
      setImageDialogOpen(true);
      return;
    }

    setIsOpeningImage(true);
    try {
      const { mimeType, extension, base64 } = getImageData(image);
      const path = `report-photos/report-${report.issueId}.${extension}`;
      await Filesystem.writeFile({ path, data: base64, directory: Directory.Cache, recursive: true });
      const { uri } = await Filesystem.getUri({ path, directory: Directory.Cache });
      await FileOpener.open({ filePath: uri, contentType: mimeType, openWithDefault: true });
    } catch (error) {
      console.error('No se pudo abrir la fotografía en Android.', error);
      setImageDialogOpen(true);
    } finally {
      setIsOpeningImage(false);
    }
  };

  return (
    <main className="info-report-screen">
      <header className="info-report-header">
        <IconButton className="info-report-back" aria-label="Volver a Inicio" onClick={onBack}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography component="h1" className="info-report-heading">Detalle del reporte</Typography>
      </header>

      <div className="info-report-content">
        <button
          className="info-report-photo-button"
          type="button"
          onClick={handleOpenFullImage}
          disabled={!image || isOpeningImage}
          aria-label="Abrir fotografía completa"
        >
          {image ? (
            <img src={image} alt={`Fotografía del riesgo: ${report.title}`} />
          ) : (
            <span>{isLoadingImage ? 'Cargando fotografía...' : 'Este reporte no tiene fotografía'}</span>
          )}
        </button>

        <section className="info-report-details" aria-label="Información del reporte">
          <div className="info-report-title-row">
            <Typography component="h2">{report.title}</Typography>
            <span className="info-report-uid">UID-{report.issueId}</span>
          </div>
          <div className="info-report-detail-row">
            <Typography component="h3">Descripción</Typography>
            <p>{report.description || 'Sin descripción'}</p>
          </div>
          <div className="info-report-detail-row">
            <Typography component="h3">Ubicación</Typography>
            <p>{report.location || 'Ubicación no especificada'}</p>
          </div>
          <div className="info-report-detail-grid">
            <div className="info-report-detail-row">
              <Typography component="h3">Gravedad</Typography>
              <p>{report.priority}</p>
            </div>
            <div className="info-report-detail-row">
              <Typography component="h3">Fecha</Typography>
              <p>{report.capturedAt}</p>
            </div>
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