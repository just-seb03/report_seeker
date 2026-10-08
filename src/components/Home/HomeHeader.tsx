/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : HomeHeader.tsx                                                *
 *                                                                                             *
 *              Programador :Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 29 de Septiembre de 2026                                      *
 *                                                                                             *
 *     Última Actualización :04 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   HomeHeader -- Componente de cabecera en el inicio y detector del gesto para actualizar   *
 *        las notificaciones; muestra el spinner mientras se ejecuta el refresco.              *
 *   handlePointerDown -- Maneja el inicio de un evento de puntero (toque o clic) para         *
 *        interactuar.                                                                         *
 *   handlePointerMove -- Calcula la distancia de arrastre del puntero para efectos visuales.  *
 *   handlePointerUp -- Finaliza el gesto y solicita la actualización si se supera el umbral. *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useRef } from 'react';
import { Box, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import RefreshIndicator from './RefreshIndicator';
import { t } from '../../control/global/i18n';

interface HomeHeaderProps {
  isExpanded: boolean;
  onSwipeDown: () => void;
  onSwipeProgress: (distance: number) => void;
  hasNotifications?: boolean;
  hasPendingReports?: boolean;
  isLoading?: boolean;
  isInitialLoading?: boolean;
}

export default function HomeHeader({ 
  isExpanded, 
  onSwipeDown, 
  onSwipeProgress,
  hasNotifications = false,
  hasPendingReports = false,
  isLoading = false,
  isInitialLoading = false,
}: HomeHeaderProps) {
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const hasPending = hasPendingReports;

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    onSwipeProgress(0);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    if (!start) return;

    const deltaY = event.clientY - start.y;
    const deltaX = Math.abs(event.clientX - start.x);
    onSwipeProgress(deltaY > 0 && deltaY > deltaX ? Math.min(deltaY, 160) : 0);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    onSwipeProgress(0);
    if (!start) return;

    const deltaY = event.clientY - start.y;
    const deltaX = Math.abs(event.clientX - start.x);
    if (deltaY > 60 && deltaY > deltaX) onSwipeDown();
  };

  return (
    <Box 
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        pointerStart.current = null;
        onSwipeProgress(0);
      }}
      sx={{ 
        position: 'absolute', top: '12%', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', 
        zIndex: 5,
        pointerEvents: 'auto',
        touchAction: 'none',
        userSelect: 'none',
        opacity: isExpanded ? 0 : 1,
        visibility: isExpanded ? 'hidden' : 'visible',
        transform: isExpanded ? 'scale(0.8) translateY(-40px)' : 'scale(1) translateY(0)',
        transition: 'all 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    > 
      <Box sx={{ display: 'grid', placeItems: 'center', mb: 3, opacity: isLoading || isInitialLoading ? 0 : 1, transition: 'opacity 0.3s ease' }}>
        <Typography 
          variant="h3" 
          component="h1" 
          aria-hidden={!hasNotifications && !hasPending}
          sx={{
            textAlign: 'center', fontWeight: 'bold', color: 'primary.main',
            transition: 'opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), filter 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
            gridArea: '1 / 1',
            ...(hasNotifications || hasPending ? {
              opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0px)'
            } : {
              opacity: 0, transform: 'translateY(-16px) scale(0.96)', filter: 'blur(4px)', pointerEvents: 'none'
            })
          }}
        >
          {hasPending ? (
            t.home.headerPendingReports.split("\n").map((line: string, i: number) => <span style={{display: "block"}} key={i}>{line}</span>)
          ) : (
            t.home.headerNewReports.split("\n").map((line: string, i: number) => <span style={{display: "block"}} key={i}>{line}</span>)
          )}
        </Typography>

        <Typography 
          variant="h3" 
          component="h1" 
          aria-hidden={hasNotifications || hasPending}
          sx={{
            textAlign: 'center', fontWeight: 'bold', color: 'primary.main',
            transition: 'opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), filter 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
            gridArea: '1 / 1',
            ...(!hasNotifications && !hasPending ? {
              opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0px)'
            } : {
              opacity: 0, transform: 'translateY(-16px) scale(0.96)', filter: 'blur(4px)', pointerEvents: 'none'
            })
          }}
        >
          {t.home.headerAllGood.split("\n").map((line: string, i: number) => <span style={{display: "block"}} key={i}>{line}</span>)}
        </Typography>
      </Box>
      
      {isLoading ? (
        <RefreshIndicator label={t.home.refreshing} />
      ) : (
        <KeyboardArrowDownIcon 
          sx={{ 
            fontSize: 48, 
            pointerEvents: 'none', 
            color: 'primary.main', 
            opacity: 0.6,
            '@keyframes muiBounceSwipe': {
              '0%': { transform: 'translateY(0)', animationTimingFunction: 'ease-in' },
              '15%': { transform: 'translateY(20px)', animationTimingFunction: 'ease-out' },
              '100%': { transform: 'translateY(0)' }
            },
            animation: 'muiBounceSwipe 2.5s infinite' 
          }} 
        />
      )}
    </Box>
  );
}
