import { useState } from 'react';
import { Box, Typography, Collapse } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import './NotificationCard.css'; // <-- Importamos su CSS exclusivo

interface NotificationCardProps {
  titulo: string; detalle: string; tiempo?: string;
  unread?: boolean; prioridad?: string; fecha?: string;
}

export default function NotificationCard({ 
  titulo, detalle, tiempo = 'ahora', unread = false, prioridad = 'Normal', fecha = '30 Sept 2026' 
}: NotificationCardProps) {
  
  const [expanded, setExpanded] = useState(false);
  const [isRead, setIsRead] = useState(!unread);
  const isHighPriority = ['alta', 'grave'].includes(prioridad.toLowerCase());

  // Determinamos las clases CSS a inyectar en el contenedor principal
  const cardClass = `card-paper ${isRead ? 'read' : 'unread'} ${isHighPriority ? 'high-priority' : ''}`;

  return (
    <Box className={cardClass}>
      <Box 
        onClick={() => { setExpanded(!expanded); if (!isRead) setIsRead(true); }}
        sx={{ p: 2, position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
      >
        {isHighPriority ? (
          <ErrorOutlinedIcon className={!isRead ? "icon-error" : "icon-info"} sx={{ mr: 2, flexShrink: 0 }} />
        ) : (
          <InfoOutlinedIcon className="icon-info" sx={{ mr: 2, flexShrink: 0 }} />
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, pr: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="subtitle2" className="card-title">{titulo}</Typography>
            <Typography variant="caption" className="card-text-muted" sx={{ flexShrink: 0 }}>{tiempo}</Typography>
          </Box>
          <Typography variant="body2" className="card-detail">{detalle}</Typography>
        </Box>

        <ExpandMoreIcon 
          className="card-text-muted"
          sx={{ 
            position: 'absolute', right: 16, top: '50%', marginTop: '-12px',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease' 
          }} 
        />
      </Box>

      <Collapse in={expanded} timeout={250} unmountOnExit>
        <Box sx={{ p: 2, pt: 0 }}>
          <Box className="card-placeholder">
            <InsertPhotoOutlinedIcon className="card-placeholder-icon" sx={{ fontSize: 48 }} />
          </Box>
          <Typography variant="subtitle1" className="card-title" sx={{ mb: 1 }}>{titulo}</Typography>
          <Typography variant="body2" className="card-text-muted" sx={{ mb: 2 }}>{detalle}</Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography variant="body2" className={isHighPriority ? "text-error" : "text-warning"}>
              Prioridad: {prioridad}
            </Typography>
            <Typography variant="caption" className="card-text-muted">{fecha}</Typography>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}