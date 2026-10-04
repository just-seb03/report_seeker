/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : RefreshIndicator.tsx                                             *
 *                                                                                             *
 *              Programador : Maximiliano Cantuarias                                          *
 *                                                                                             *
 *          Fecha de Inicio : 04 de Octubre de 2026                                             *
 *                                                                                             *
 *     Última Actualización : 04 de Octubre de 2026                                             *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   RefreshIndicator -- Renderiza el indicador circular de carga de Material UI con una      *
 *        etiqueta accesible para lectores de pantalla.                                       *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Box, CircularProgress } from '@mui/material';

interface RefreshIndicatorProps {
  label: string;
}

export default function RefreshIndicator({ label }: RefreshIndicatorProps) {
  return (
    <Box className="home-refresh-indicator" role="status" aria-label={label}>
      <CircularProgress size={40} thickness={4} color="inherit" aria-hidden="true" />
    </Box>
  );
}