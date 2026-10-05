/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : imageCleanupControl.ts                                           *
 *                                                                                             *
 *              Programador :Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 02 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización :02 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   deletePhotoFile -- Elimina el archivo físico de una fotografía del dispositivo utilizando *
 *        Capacitor Filesystem. Se usa cuando se descarta o cancela un reporte.                *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Filesystem } from '@capacitor/filesystem';

export async function deletePhotoFile(path?: string): Promise<void> {
  if (!path) return;
  
  try {
    // Si la ruta es una URL web o blob, no podemos ni debemos borrarla usando el sistema de archivos nativo.
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
      return;
    }
    
    await Filesystem.deleteFile({
      path: path
    });
    console.log('Archivo de imagen descartado eliminado correctamente:', path);
  } catch (error) {
    console.error('Error al intentar eliminar el archivo de imagen descartado:', error);
  }
}
