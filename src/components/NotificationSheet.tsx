import { Box, IconButton } from '@mui/material';
import { keyframes } from '@emotion/react';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import NotificationCard from './NotificationCard';

export interface Notificacion {
  id: number;
  titulo: string;
  detalle: string;
  tiempo?: string;
  unread?: boolean;
}

interface NotificationSheetProps {
  isExpanded: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
  notificaciones: Notificacion[];
  // NUEVO: Propiedad para recibir la función que colapsa la lista
  onCollapse: () => void; 
}

// Animación invertida: salta hacia arriba (-20px)
const bounceSwipeUp = keyframes`
  0% { transform: translateY(0); animation-timing-function: ease-in; }
  15% { transform: translateY(-20px); animation-timing-function: ease-out; }
  100% { transform: translateY(0); }
`;

export default function NotificationSheet({ isExpanded, listRef, notificaciones, onCollapse }: NotificationSheetProps) {
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
            tiempo={noti.tiempo} 
            unread={noti.unread} 
          />
        ))}

        {/* FLECHA ANIMADA HACIA ARRIBA */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <IconButton onClick={onCollapse} sx={{ color: 'text.secondary', p: 2 }}>
            <KeyboardArrowUpIcon 
              sx={{ 
                fontSize: 48, 
                animation: `${bounceSwipeUp} 2.5s infinite` 
              }} 
            />
          </IconButton>
        </Box>

      </Box>
    </Box>
  );
}