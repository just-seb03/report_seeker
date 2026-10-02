import { Box, Button, IconButton, Typography } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import NotificationCard from './NotificationCard';
import './NotificationSheet.css'; // <-- Importamos su CSS exclusivo

export interface Notificacion {
  id: number;
  titulo: string;
  detalle: string;
  ubicacion?: string;
  tiempo?: string;
  fecha?: string;
  unread?: boolean;
  prioridad?: string;
  issueId?: number;
}

interface NotificationSheetProps {
  isExpanded: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
  notificaciones: Notificacion[];
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  onCollapse: () => void; 
}

export default function NotificationSheet({
  isExpanded, listRef, notificaciones, hasMore, isLoading, onLoadMore, onCollapse,
}: NotificationSheetProps) {
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
            ubicacion={noti.ubicacion}
            tiempo={noti.tiempo} 
            unread={noti.unread}
            prioridad={noti.prioridad} 
            fecha={noti.fecha}
            issueId={noti.issueId}
          />
        ))}

        {!isLoading && notificaciones.length === 0 && (
          <Typography className="sheet-empty-message">No hay notificaciones</Typography>
        )}

        {hasMore && (
          <Button
            className="sheet-load-more-btn"
            onClick={onLoadMore}
            disabled={isLoading}
            variant="outlined"
          >
            {isLoading ? 'Cargando...' : 'Cargar 5 más'}
          </Button>
        )}

        <Box className="sheet-action-container">
          <IconButton onClick={onCollapse} className="sheet-collapse-btn">
            <KeyboardArrowUpIcon className="sheet-collapse-icon" />
          </IconButton>
        </Box>

      </Box>
    </Box>
  );
}