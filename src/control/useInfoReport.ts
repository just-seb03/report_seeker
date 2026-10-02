import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { FileOpener } from '@capacitor-community/file-opener';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { getIssueReportImage, type IssueReport } from '../database';

function getImageData(image: string) {
  const [header, data] = image.split(',', 2);
  const mimeType = header.match(/^data:(.+);base64$/)?.[1] ?? 'image/jpeg';
  const extension = mimeType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
  return { mimeType, extension, base64: data ?? image };
}

export function formatReportDate(capturedAt: string) {
  const date = new Date(capturedAt);
  return Number.isNaN(date.getTime())
    ? 'Fecha desconocida'
    : new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function useInfoReport(report: IssueReport) {
  const [image, setImage] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [isOpeningImage, setIsOpeningImage] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const priorityClass = ['grave', 'alta'].includes(report.priority.toLowerCase())
    ? 'is-high'
    : ['leve', 'baja'].includes(report.priority.toLowerCase()) ? 'is-low' : 'is-medium';

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

  return {
    image,
    isLoadingImage,
    isOpeningImage,
    imageDialogOpen,
    priorityClass,
    setImageDialogOpen,
    handleOpenFullImage,
  };
}
