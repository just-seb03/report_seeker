import { Box, IconButton } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import NotificationCard from './NotificationCard';
import './NotificationSheet.css'; // <-- Importamos su CSS exclusivo

export interface Notificacion {
  id: number;
  titulo: string;
  detalle: string;
  tiempo?: string;
  unread?: boolean;
  prioridad?: string;
}

interface NotificationSheetProps {
  isExpanded: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
  notificaciones: Notificacion[];
  onCollapse: () => void; 
}

export default function NotificationSheet({ isExpanded, listRef, notificaciones, onCollapse }: NotificationSheetProps) {
  return (
    <Box
      ref={listRef}
      // Alternamos la clase en lugar de reescribir CSS en línea
      className={`sheet-wrapper ${isExpanded ? 'expanded' : 'collapsed'}`} 
    >
      <Box className="sheet-content">
        
        {notificaciones.map((noti) => (
          <NotificationCard 
            key={noti.id} 
            titulo={noti.titulo} 
            detalle={noti.detalle} 
            tiempo={noti.tiempo} 
            unread={noti.unread}
            prioridad={noti.prioridad} 
          />
        ))}

        <Box className="sheet-action-container">
          <IconButton onClick={onCollapse} className="sheet-collapse-btn">
            <KeyboardArrowUpIcon className="sheet-collapse-icon" />
          </IconButton>
        </Box>

      </Box>
    </Box>
  );
}