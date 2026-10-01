import React, { useState, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import HomeHeader from '../components/HomeHeader';
import NotificationSheet, { type Notificacion } from '../components/NotificationSheet';
import BottomNav from '../components/BottomNav';
import Report from '../components/Report';
import './Home.css';

interface HomeProps {
  isDarkMode: boolean;
  onToggleManualTheme: () => void;
}

const notificacionesData: Notificacion[] = [
  { id: 1, titulo: 'Sincronización pausada', detalle: 'Esperando red para subir 3 reportes.', tiempo: 'hace 2 min', unread: true, prioridad: 'Alta' },
  { id: 2, titulo: 'Alerta de clima', detalle: 'Vientos fuertes previstos en el sector norte.', tiempo: 'hace 5 min', unread: true, prioridad: 'Alta' },
  { id: 3, titulo: 'Revisión de equipo', detalle: 'Mantenimiento del camión A-14.', tiempo: 'hace 14 min', unread: true },
  { id: 4, titulo: 'Turno finalizado', detalle: 'Recuerda firmar tu salida.', tiempo: 'hace 45 min', unread: false },
  { id: 5, titulo: 'Nueva zona', detalle: 'Sector sur habilitado para inspección.', tiempo: 'hace 1 hora', unread: false },
  { id: 6, titulo: 'Batería baja', detalle: 'Conecta el dispositivo a la brevedad.', tiempo: 'hace 3 horas', unread: false },
];

export default function Home({ isDarkMode, onToggleManualTheme }: HomeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStart = useRef<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const handleCollapse = () => {
    setIsExpanded(false);
    if (listRef.current) listRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    touchStart.current = clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStart.current === null) return;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;
    const deltaY = touchStart.current - clientY;

    if (!isExpanded && deltaY > 40) {
      setIsExpanded(true);
    } else if (isExpanded && deltaY < -40 && listRef.current && listRef.current.scrollTop <= 0) {
      setIsExpanded(false); 
    }

    touchStart.current = null;
  };

  const handleHomeClick = () => {
    setIsReportOpen(false);
    setPullDistance(0);
  };

  const handleReportClick = () => {
    setIsReportOpen(true);
    setPullDistance(0);
  };

  return (
    <Box className="home-container">
      {isReportOpen ? (
        <Report />
      ) : (
        <>
          <Box
            className="home-scene"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            sx={{
              transform: `translateY(${Math.min(pullDistance * 0.65, 88)}px)`,
              transition: pullDistance === 0 ? 'transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
            }}
          >
            <HomeHeader
              isExpanded={isExpanded}
              onSwipeDown={onToggleManualTheme}
              onSwipeProgress={setPullDistance}
            />

            <NotificationSheet
              isExpanded={isExpanded}
              listRef={listRef}
              notificaciones={notificacionesData}
              onCollapse={handleCollapse}
            />

            <Box className="home-gradient-overlay" />
          </Box>

          <Typography
            aria-hidden={pullDistance < 8}
            className="theme-swipe-feedback"
            sx={{
              opacity: Math.min(pullDistance / 36, 1),
              transform: `translateY(${Math.min(pullDistance * 0.12, 12)}px)`,
              transition: pullDistance === 0 ? 'opacity 180ms ease, transform 220ms ease' : 'none',
            }}
          >
            Desliza hacia abajo para activar el modo {isDarkMode ? 'claro' : 'oscuro'}
          </Typography>
        </>
      )}

      <Box className="home-bottom-nav">
        <BottomNav onHomeClick={handleHomeClick} onReportClick={handleReportClick} />
      </Box>
    </Box>
  );
}