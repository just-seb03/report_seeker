import { Box } from '@mui/material';
import NotificationCard from './NotificationCard';

export interface Notificacion {
  id: number;
  titulo: string;
  detalle: string;
  tiempo?: string; // Nuevo: Texto como "hace 2 min"
  unread?: boolean; // Nuevo: Estado de no leído
}

interface NotificationSheetProps {
  isExpanded: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
  notificaciones: Notificacion[];
}

export default function NotificationSheet({ isExpanded, listRef, notificaciones }: NotificationSheetProps) {
  return (
    <Box
      ref={listRef}
      sx={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 1,
        overflowY: isExpanded ? 'auto' : 'hidden',
        transform: isExpanded ? 'translateY(0)' : 'translateY(42vh)',
        transition: 'all 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
        '&::-webkit-scrollbar': { display: 'none' },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, px: 4, pt: 6, pb: 24, maxWidth: 400, mx: 'auto' }}>
        {notificaciones.map((noti) => (
          <NotificationCard 
            key={noti.id} 
            titulo={noti.titulo} 
            detalle={noti.detalle} 
            tiempo={noti.tiempo} // Pasamos la nueva propiedad
            unread={noti.unread} // Pasamos la nueva propiedad
          />
        ))}
      </Box>
    </Box>
  );
}