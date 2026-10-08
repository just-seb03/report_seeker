/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : useInfoReport.ts                                              *
 *                                                                                             *
 *              Programador :Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 02 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización :04 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   getImageData -- Extrae la información MIME y Base64 desde el DataURL de una imagen.       *
 *   formatReportDate -- Convierte la fecha de un reporte a un string formateado localmente    *
 *        para el usuario.                                                                     *
 *   useInfoReport -- Custom hook que administra el estado y acciones al visualizar los        *
 *        detalles de un reporte.                                                              *
 *   handleOpenFullImage -- Abre la fotografía a pantalla completa (nativo Android o modal     *
 *        web).                                                                                *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useState, useEffect } from 'react';
import { useNativeImage } from './useNativeImage';
import { Capacitor } from '@capacitor/core';
import { FileOpener } from '@capacitor-community/file-opener';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { getIssueReportImage, type IssueReport } from '../../database';

function getImageData(image: string) {
  // Helper: Separa el encabezado (ej. data:image/png;base64) de la carga útil Base64 real.
  const [header, data] = image.split(',', 2);
  const mimeType = header.match(/^data:(.+);base64$/)?.[1] ?? 'image/jpeg';
  const extension = mimeType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
  return { mimeType, extension, base64: data ?? image };
}

export function formatReportDate(capturedAt: string) {
  const dateObj = new Date(capturedAt);
  if (Number.isNaN(dateObj.getTime())) return { date: 'Fecha desconocida', time: '' };
  return {
    date: new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium' }).format(dateObj),
    time: new Intl.DateTimeFormat('es-CL', { timeStyle: 'short' }).format(dateObj)
  };
}

export function useInfoReport(report: IssueReport) {
  // Hook que administra el estado y acciones al visualizar los detalles de un reporte específico.
  // Su función principal es cargar asincrónicamente la foto asociada y coordinar su apertura.
  const [image, setImage] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [isOpeningImage, setIsOpeningImage] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const priorityClass = ['grave', 'alta'].includes(report.priority.toLowerCase())
    ? 'is-high'
    : ['leve', 'baja'].includes(report.priority.toLowerCase()) ? 'is-low' : 'is-medium';

  useEffect(() => {
    const controller = new AbortController();
    getIssueReportImage(report.issueId)
      .then((reportImage) => {
        if (!controller.signal.aborted) setImage(reportImage);
      })
      .catch((error: any) => {
        if (error.name === 'AbortError') return;
        console.error('No se pudo cargar la fotografía del reporte.', error);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingImage(false);
      });

    return () => { controller.abort(); };
  }, [report.issueId]);

  const displayImage = useNativeImage(image);

  const handleOpenFullImage = async () => {
    // Si estamos en un navegador web, simplemente mostramos la foto en un modal de React.
    if (!image || isOpeningImage) return;
    if (!Capacitor.isNativePlatform()) {
      setImageDialogOpen(true);
      return;
    }

    // Si estamos en nativo (Android), creamos un archivo temporal en caché y le pedimos
    // al Sistema Operativo que abra la foto usando su galería/visor nativo de imágenes.
    setIsOpeningImage(true);
    try {
      if (image.startsWith('file://')) {
        await FileOpener.open({ filePath: image, contentType: 'image/webp', openWithDefault: true });
      } else {
        const { mimeType, extension, base64 } = getImageData(image);
        const path = `report-photos/report-${report.issueId}.${extension}`;
        await Filesystem.writeFile({ path, data: base64, directory: Directory.Cache, recursive: true });
        const { uri } = await Filesystem.getUri({ path, directory: Directory.Cache });
        await FileOpener.open({ filePath: uri, contentType: mimeType, openWithDefault: true });
      }
    } catch (error) {
      console.error('No se pudo abrir la fotografía en Android.', error);
      setImageDialogOpen(true);
    } finally {
      setIsOpeningImage(false);
    }
  };

  return {
    image: displayImage, // Devuelve el displayImage para que el <img> de React lo pueda renderizar sin bloqueos de seguridad
    rawImage: image, // Por si se necesita el original
    isLoadingImage,
    isOpeningImage,
    imageDialogOpen,
    priorityClass,
    setImageDialogOpen,
    handleOpenFullImage,
  };
}
