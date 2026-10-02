import { useEffect, useState, type KeyboardEvent } from 'react';
import { Box, Typography, Collapse } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { getIssueReportImage } from '../database';
import './NotificationCard.css'; // <-- Importamos su CSS exclusivo

interface NotificationCardProps {
  titulo: string; detalle: string; ubicacion?: string; fecha?: string; currentTime: number;
  unread?: boolean; prioridad?: string; issueId?: number;
  onOpenReport?: () => void;
  onMarkAsRead?: () => void;
}

function formatRelativeTime(fecha: string, currentTime: number): string {
  const publishedAt = Date.parse(fecha);
  if (Number.isNaN(publishedAt)) return 'ahora';

  const elapsedMinutes = Math.floor(Math.max(0, currentTime - publishedAt) / 60_000);
  if (elapsedMinutes === 0) return 'ahora';

  const relativeTime = new Intl.RelativeTimeFormat('es-CL', { numeric: 'auto' });
  if (elapsedMinutes < 60) return relativeTime.format(-elapsedMinutes, 'minute');

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return relativeTime.format(-elapsedHours, 'hour');

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 30) return relativeTime.format(-elapsedDays, 'day');

  const elapsedMonths = Math.floor(elapsedDays / 30);
  if (elapsedMonths < 12) return relativeTime.format(-elapsedMonths, 'month');

  return relativeTime.format(-Math.floor(elapsedMonths / 12), 'year');
}

function formatPublicationDate(fecha?: string): string {
  if (!fecha || Number.isNaN(Date.parse(fecha))) return 'Fecha desconocida';
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(fecha));
}

export default function NotificationCard({ 
  titulo, detalle, ubicacion, fecha, currentTime, unread = false, prioridad = 'Normal', issueId, onOpenReport, onMarkAsRead,
}: NotificationCardProps) {
  
  const [expanded, setExpanded] = useState(false);
  const isRead = !unread;
  const [image, setImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const isHighPriority = ['alta', 'grave'].includes(prioridad.toLowerCase());
  const isLowPriority = ['leve', 'baja', 'low'].includes(prioridad.toLowerCase());
  const priorityClass = isHighPriority ? 'text-error' : isLowPriority ? 'text-success' : 'text-warning';
  const relativeTime = fecha ? formatRelativeTime(fecha, currentTime) : 'ahora';

  useEffect(() => {
    if (!expanded || issueId === undefined || image !== null) return;
    if (!expanded || issueId === undefined) return;

    let isActive = true;
    getIssueReportImage(issueId)
      .then((reportImage) => {
        if (isActive) setImage(reportImage);
      })
      .catch((error: unknown) => console.error('No se pudo cargar la fotografía del reporte', error))
      .finally(() => {
        if (isActive) setImageLoading(false);
      });

    return () => { isActive = false; };
  }, [expanded, image, issueId]);

  const handleHeaderClick = () => {
    const isOpening = !expanded;
    setImage(null);
    setImageLoading(isOpening && issueId !== undefined);
    setExpanded(isOpening);
    if (unread) {
      onMarkAsRead?.();
    }
  };

  const activateWithKeyboard = (event: KeyboardEvent<HTMLDivElement>, action: () => void) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    action();
  };

  const handleExpandedContentClick = () => {
    if (!expanded) return;
    onOpenReport?.();
  };

  // Determinamos las clases CSS a inyectar en el contenedor principal
  const cardClass = `card-paper ${isRead ? 'read' : 'unread'} ${isHighPriority ? 'high-priority' : ''}`;

  return (
    <Box className={cardClass}>
      <Box
        onClick={handleHeaderClick}
        onKeyDown={(event) => activateWithKeyboard(event, handleHeaderClick)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Contraer' : 'Expandir'} notificación: ${titulo}`}
        sx={{ p: 2, position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer', '&:focus-visible': { outline: '2px solid currentColor', outlineOffset: 3 } }}
      >
        {isHighPriority ? (
          <ErrorOutlinedIcon className={!isRead ? "icon-error" : "icon-info"} sx={{ mr: 2, flexShrink: 0 }} />
        ) : (
          <InfoOutlinedIcon className="icon-info" sx={{ mr: 2, flexShrink: 0 }} />
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, pr: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="subtitle2" className="card-title">{titulo}</Typography>
            <Typography variant="caption" className="card-text-muted card-relative-time" sx={{ flexShrink: 0 }}>{relativeTime}</Typography>
          </Box>
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
        <Box
          onClick={handleExpandedContentClick}
          onKeyDown={(event) => activateWithKeyboard(event, handleExpandedContentClick)}
          role={onOpenReport ? 'button' : undefined}
          tabIndex={onOpenReport ? 0 : undefined}
          aria-label={onOpenReport ? `Abrir reporte completo: ${titulo}` : undefined}
          sx={{
            p: 2,
            pt: 0,
            cursor: onOpenReport ? 'pointer' : 'default',
            '&:focus-visible': { outline: '2px solid currentColor', outlineOffset: -2 },
          }}
        >
          <Box className="card-placeholder">
            {image ? (
              <img className="card-report-image" src={image} alt={`Evidencia del reporte: ${titulo}`} />
            ) : (
              <Box className="card-image-empty">
                <InsertPhotoOutlinedIcon className="card-placeholder-icon" sx={{ fontSize: 48 }} />
                <Typography variant="caption" className="card-text-muted">
                  {imageLoading ? 'Cargando fotografía...' : 'Sin fotografía asociada'}
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, minWidth: 0, flex: 1 }}>
              <LocationOnOutlinedIcon className="card-text-muted" fontSize="small" sx={{ flexShrink: 0 }} />
              <Typography variant="body2" className="card-text-muted" sx={{ overflowWrap: 'anywhere' }}>
                {ubicacion || 'Ubicación no especificada'}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              className={priorityClass}
              sx={{ flexShrink: 0, textAlign: 'right' }}
            >
              {prioridad}
            </Typography>
          </Box>

          <Typography variant="body2" className="card-description" sx={{ mb: 2, overflowWrap: 'anywhere' }}>{detalle}</Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mt: 1 }}>
            <Typography variant="caption" className="card-text-muted">
              {issueId === undefined ? '' : `UID-${issueId}`}
            </Typography>
            <Typography variant="caption" className="card-text-muted">{formatPublicationDate(fecha)}</Typography>
          </Box>

        </Box>
      </Collapse>
    </Box>
  );
}