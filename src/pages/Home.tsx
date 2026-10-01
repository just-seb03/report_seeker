import React, { useState, useRef } from 'react';
import { Box } from '@mui/material';
import HomeHeader from '../components/HomeHeader';
import NotificationSheet, { type Notificacion } from '../components/NotificationSheet';
import BottomNav from '../components/BottomNav';
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

  return (
    <Box 
      className="home-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      // Soporte para mouse en navegador web
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd} 
    >
      {/* BARRA INDICADORA ANIMADA */}
      <Box 
        sx={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '4px',
          backgroundColor: isDarkMode ? '#ffffff' : '#000000',
          transform: 'scaleX(0)',
          transformOrigin: 'center',
          opacity: 0,
          transition: 'transform 0.3s ease, opacity 0.3s ease',
          zIndex: 100,
        }}
      />

      <HomeHeader isExpanded={isExpanded} onSwipeDown={onToggleManualTheme} />
      
      <NotificationSheet 
        isExpanded={isExpanded} 
        listRef={listRef} 
        notificaciones={notificacionesData} 
        onCollapse={handleCollapse}
      />

      <Box className="home-gradient-overlay" />

      <Box className="home-bottom-nav">
        <BottomNav />
      </Box>
    </Box>
  );
}