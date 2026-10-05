/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : GlobalTopBar.tsx                                                 *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 04 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 04 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   GlobalTopBar -- Componente que renderiza una barra superior de navegación global con un   *
 *        título.                                                                              *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Box, Typography } from '@mui/material';

interface GlobalTopBarProps {
  title: string;
}

export default function GlobalTopBar({ title }: GlobalTopBarProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 'max(16px, env(safe-area-inset-top))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        backgroundColor: 'background.paper',
        borderRadius: 4, // 16px
        boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
        px: 6,
        py: 0.75,
        minWidth: 160,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main', textTransform: 'uppercase', letterSpacing: 1 }}>
        {title}
      </Typography>
    </Box>
  );
}
