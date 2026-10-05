/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : SmoothScrollContainer.tsx                                        *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 05 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 05 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   SmoothScrollContainer -- Contenedor que habilita el scroll vertical suave y con rebote    *
 *            nativo para mejorar la experiencia en dispositivos móviles y web.                *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Box } from '@mui/material';
import type { BoxProps } from '@mui/material';
import React from 'react';

interface SmoothScrollContainerProps extends BoxProps {
  children: React.ReactNode;
}

export default function SmoothScrollContainer({ children, sx, ...props }: SmoothScrollContainerProps) {
  return (
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        // Efecto momentum para iOS
        WebkitOverflowScrolling: 'touch',
        // Resistencia/rebote nativo al llegar al límite
        overscrollBehaviorY: 'contain',
        // Desplazamiento suave para anclas
        scrollBehavior: 'smooth',
        
        // Estilización elegante de la barra de scroll (Webkit)
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0,0,0,0.1)',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: 'rgba(0,0,0,0.2)',
        },
        ...sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
