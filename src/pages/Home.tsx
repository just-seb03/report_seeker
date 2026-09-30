import React, { useState, useRef } from 'react';
import { Box } from '@mui/material';
import HomeHeader from '../components/HomeHeader';
import NotificationSheet, { type Notificacion } from '../components/NotificationSheet';
import BottomNav from '../components/BottomNav';

const notificacionesData: Notificacion[] = [
  { id: 1, titulo: 'Sincronización pausada', detalle: 'Esperando red para subir 3 reportes.', tiempo: 'hace 2 min', unread: true },
  { id: 2, titulo: 'Alerta de clima', detalle: 'Vientos fuertes previstos en el sector norte.', tiempo: 'hace 5 min', unread: true },
  { id: 3, titulo: 'Revisión de equipo', detalle: 'Mantenimiento del camión A-14.', tiempo: 'hace 14 min', unread: true },
  { id: 4, titulo: 'Turno finalizado', detalle: 'Recuerda firmar tu salida.', tiempo: 'hace 45 min', unread: false },
  { id: 5, titulo: 'Nueva zona', detalle: 'Sector sur habilitado para inspección.', tiempo: 'hace 1 hora', unread: false },
  { id: 6, titulo: 'Batería baja', detalle: 'Conecta el dispositivo a la brevedad.', tiempo: 'hace 3 horas', unread: false },
  { id: 7, titulo: 'Reporte subido', detalle: 'El reporte de voladura se envió con éxito.', tiempo: 'hace 5 horas', unread: false },
  { id: 8, titulo: 'Mensaje de central', detalle: 'Reunión de seguridad a las 14:00 hrs.', tiempo: 'ayer', unread: false },
  { id: 9, titulo: 'Actualización de mapa', detalle: 'Nuevas rutas topográficas descargadas.', tiempo: 'ayer', unread: false },
  { id: 10, titulo: 'Falla de sensor', detalle: 'Sensor de proximidad en sector B inactivo.', tiempo: 'hace 2 días', unread: false },
];

export default function Home() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Función para colapsar la lista y reiniciar el scroll de manera invisible
  const handleCollapse = () => {
    setIsExpanded(false);
    
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollTop = 0;
      }
    }, 400);
  };

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setTouchStart(clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStart === 0) return;
    
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;
    const deltaY = touchStart - clientY;

    if (!isExpanded && deltaY > 40) {
      setIsExpanded(true);
    } else if (isExpanded && deltaY < -40) {
      if (listRef.current && listRef.current.scrollTop <= 0) {
        setIsExpanded(false); 
      }
    }
    setTouchStart(0);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!isExpanded && e.deltaY > 0) setIsExpanded(true);
    else if (isExpanded && e.deltaY < 0 && listRef.current && listRef.current.scrollTop <= 0) {
      setIsExpanded(false);
    }
  };

  return (
    <Box 
      sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onWheel={handleWheel}
    >
      <HomeHeader isExpanded={isExpanded} />
      
      <NotificationSheet 
        isExpanded={isExpanded} 
        listRef={listRef} 
        notificaciones={notificacionesData} 
        onCollapse={handleCollapse}
      />

      <Box 
        sx={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '220px', 
          background: 'linear-gradient(to bottom, transparent, #f5f5f5 75%)',
          pointerEvents: 'none', zIndex: 2, 
        }}
      />

      <Box sx={{ position: 'absolute', bottom: 0, width: '100%', zIndex: 10 }}>
        <BottomNav />
      </Box>
    </Box>
  );
}