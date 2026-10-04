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
    <Box 
      role="status" 
      aria-label={label}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 44,
        borderRadius: '50%',
        bgcolor: 'background.paper',
        boxShadow: 3,
        color: 'primary.main',
        mx: 'auto',
      }}
    >
      <CircularProgress size={22} thickness={4.5} color="inherit" aria-hidden="true" />
    </Box>
  );
}