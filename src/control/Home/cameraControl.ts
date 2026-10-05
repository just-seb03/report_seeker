/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : cameraControl.ts                                              *
 *                                                                                             *
 *              Programador :Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 02 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización :02 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   captureReportPhoto -- Utiliza el hardware de la cámara para capturar y leer una           *
 *        fotografía como un Blob, comprimiéndola a WebP y reteniendo el path del archivo.     *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { type ReportPhoto } from '../../pages/Report';
import { compressImageToWebp } from './imageCompressionControl';

export async function captureReportPhoto(): Promise<ReportPhoto | null> {
  try {
    const capturedPhoto = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt,
    });
    if (!capturedPhoto.webPath) throw new Error('La cámara no devolvió una ruta para la fotografía.');

    const compressedBlob = await compressImageToWebp(capturedPhoto.webPath);

    return { blob: compressedBlob, webPath: capturedPhoto.webPath, path: capturedPhoto.path };
  } catch (error) {
    console.error('No se pudo capturar la fotografía del reporte.', error);
    return null;
  }
}
