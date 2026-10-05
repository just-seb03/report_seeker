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
import React, { forwardRef } from 'react';

interface SmoothScrollContainerProps extends BoxProps {
  children: React.ReactNode;
}

const SmoothScrollContainer = forwardRef<HTMLDivElement, SmoothScrollContainerProps>(
  ({ children, sx, ...props }, ref) => {
    return (
      <Box
        ref={ref}
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
        
        // Efecto de desvanecimiento (fade) tanto en la parte superior como en la inferior
        // El fade superior ocupa aprox el espacio del TopBar, por lo que solo se nota al hacer scroll hacia arriba
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black calc(60px + env(safe-area-inset-top)), black 85%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, transparent 0%, black calc(60px + env(safe-area-inset-top)), black 85%, transparent 100%)',
        
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
});

export default SmoothScrollContainer;
