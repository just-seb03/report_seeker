/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : imageUtils.ts                                                    *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 07 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 07 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   convertWebPToBase64 -- Convierte archivo WebP físico a texto Base64 en memoria viva       *
 *   convertBase64ToWebP -- Convierte texto Base64 a archivo físico WebP local                 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Filesystem, Directory } from '@capacitor/filesystem';

/**
 * Helper: Lee un archivo físico .webp del disco del teléfono y lo convierte a Base64
 * Esto permite enviar la foto por Firebase sin que quede basura en el SQLite
 */
export async function convertWebPToBase64(localUri: string): Promise<string | null> {
    try {
        const fileContent = await Filesystem.readFile({
            path: localUri
        });
        
        // Filesystem devuelve el dato en base64 puro, le agregamos el cabezal para que los navegadores lo entiendan
        return `data:image/webp;base64,${fileContent.data}`;
    } catch (e) {
        console.error("[imageUtils] Error leyendo archivo físico .webp para convertir a base64", e);
        return null;
    }
}

/**
 * Helper (para el teléfono que recibe): Toma el texto gigante de Firebase y lo vuelve un archivo real.
 */
export async function convertBase64ToWebP(base64Data: string, filename: string): Promise<string | null> {
    try {
        // Le quitamos el cabezal de webp si lo tiene
        const pureBase64 = base64Data.replace("data:image/webp;base64,", "");
        const path = `reportes_descargados/${filename}.webp`;
        
        const result = await Filesystem.writeFile({
            path: path,
            data: pureBase64,
            directory: Directory.Data, // Guardado seguro interno de la app (no ensucia la galería)
            recursive: true
        });

        // Esta URI (file://...) es la que deberías guardar en tu SQLite al insertar el registro que llegó de la nube
        return result.uri;
    } catch (e) {
        console.error("[imageUtils] Error convirtiendo texto Base64 a archivo local .webp", e);
        return null;
    }
}
