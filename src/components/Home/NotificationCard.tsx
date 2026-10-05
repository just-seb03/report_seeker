/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : NotificationCard.tsx                                          *
 *                                                                                             *
 *              Programador :Sebastian Arredondo    *
 *                                                                                             *
 *          Fecha de Inicio : 29 de Septiembre de 2026                                      *
 *                                                                                             *
 *     Última Actualización :04 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   formatRelativeTime -- Formatea un timestamp a un texto relativo (ej: hace 2 horas).       *
 *   formatPublicationDate -- Formatea la fecha de publicación con la estructura local (día,   *
 *        mes, hora).                                                                          *
 *   NotificationCard -- Componente visual para mostrar los detalles de un reporte de riesgo   *
 *        en la lista.                                                                         *
 *   handleHeaderClick -- Maneja el clic en la cabecera de la notificación para expandir o     *
 *        abrir el reporte.                                                                    *
 *   activateWithKeyboard -- Permite la interacción de teclado para la accesibilidad en la     *
 *        tarjeta.                                                                             *
 *   handleExpandedContentClick -- Maneja el clic sobre el contenido desplegado en la          *
 *        notificación.                                                                        *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { t, currentLanguage, getTranslatedSeverity } from '../../control/global/i18n';
import { useEffect, useState, type KeyboardEvent } from 'react';
import { Box, Typography, Collapse, Avatar, alpha, useTheme } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { getIssueReportImage } from '../../database';

interface NotificationCardProps {
  titulo: string; detalle: string; ubicacion?: string; fecha?: string; currentTime: number;
  unread?: boolean; prioridad?: string; issueId?: number; workerName?: string;
  onOpenReport?: () => void;
  onMarkAsRead?: () => void;
}

function formatRelativeTime(fecha: string, currentTime: number): string {
  const publishedAt = Date.parse(fecha);
  if (Number.isNaN(publishedAt)) return t.notification.now;

  const elapsedMinutes = Math.floor(Math.max(0, currentTime - publishedAt) / 60_000);
  if (elapsedMinutes === 0) return t.notification.now;

  const relativeTime = new Intl.RelativeTimeFormat(currentLanguage === 'en' ? 'en-US' : 'es-CL', { numeric: 'auto' });
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
  if (!fecha || Number.isNaN(Date.parse(fecha))) return t.notification.unknownDate;
  return new Intl.DateTimeFormat(currentLanguage === 'en' ? 'en-US' : 'es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(fecha));
}

export default function NotificationCard({
  titulo, detalle, ubicacion, fecha, currentTime, unread = false, prioridad = 'Normal', issueId, workerName, onOpenReport, onMarkAsRead,
}: NotificationCardProps) {

  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const isRead = !unread;
  const [image, setImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const isHighPriority = ['alta', 'grave', 'high'].includes(prioridad.toLowerCase());
  const isModeratePriority = ['media', 'moderada', 'medium', 'warning'].includes(prioridad.toLowerCase());
  const isLowPriority = ['leve', 'baja', 'low'].includes(prioridad.toLowerCase());
  const relativeTime = fecha ? formatRelativeTime(fecha, currentTime) : 'ahora';

  useEffect(() => {
    if (!expanded || issueId === undefined || image !== null) return;

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
    if (isOpening) setImageLoading(issueId !== undefined);
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

  return (
    <Box sx={{ 
      borderRadius: '24px', 
      overflow: 'hidden', 
      bgcolor: expanded 
        ? 'background.paper' 
        : isHighPriority 
          ? alpha(theme.palette.error.main, 0.08) 
          : isModeratePriority
            ? alpha(theme.palette.warning.main, 0.12)
            : alpha(theme.palette.primary.main, 0.08),
      transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
      border: isRead ? 1 : 0,
      borderColor: 'divider'
    }}>
      <Box
        onClick={handleHeaderClick}
        onKeyDown={(event) => activateWithKeyboard(event, handleHeaderClick)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Contraer' : 'Expandir'} notificación: ${titulo}`}
        sx={{ p: 2.5, position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer', '&:focus-visible': { outline: '2px solid currentColor', outlineOffset: 3 } }}
      >
        {isHighPriority ? (
          <ErrorOutlinedIcon color={!isRead ? "error" : "action"} sx={{ mr: 2, flexShrink: 0 }} />
        ) : isModeratePriority ? (
          <InfoOutlinedIcon color={!isRead ? "warning" : "action"} sx={{ mr: 2, flexShrink: 0 }} />
        ) : (
          <InfoOutlinedIcon color={!isRead ? "primary" : "action"} sx={{ mr: 2, flexShrink: 0 }} />
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, pr: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: isRead ? 500 : 'bold', whiteSpace: 'nowrap', overflow: 'hidden', flex: 1, mr: 1, maskImage: 'linear-gradient(to right, black 70%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 70%, transparent 100%)' }}>{titulo}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, position: 'relative', top: 2, lineHeight: 1 }}>{relativeTime}</Typography>
          </Box>
        </Box>

        <ExpandMoreIcon
          color="action"
          sx={{
            position: 'absolute', right: 16, top: '50%', marginTop: '-12px',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        />
      </Box>

      <Collapse
        in={expanded}
        timeout={250}
        unmountOnExit
        onExited={() => {
          setImage(null);
          setImageLoading(false);
        }}
      >
        <Box
          onClick={handleExpandedContentClick}
          onKeyDown={(event) => activateWithKeyboard(event, handleExpandedContentClick)}
          role={onOpenReport ? 'button' : undefined}
          tabIndex={onOpenReport ? 0 : undefined}
          aria-label={onOpenReport ? `Abrir reporte completo: ${titulo}` : undefined}
          sx={{
            p: 2.5,
            pt: 0,
            cursor: onOpenReport ? 'pointer' : 'default',
            '&:focus-visible': { outline: '2px solid currentColor', outlineOffset: -2 },
          }}
        >
          <Box sx={{ width: '100%', height: 160, bgcolor: 'action.hover', borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2, border: 1, borderStyle: 'dashed', borderColor: 'divider' }}>
            {image ? (
              <Box component="img" src={image} alt={`Evidencia del reporte: ${titulo}`} sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 2 }} />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <InsertPhotoOutlinedIcon color="disabled" sx={{ fontSize: 48 }} />
                <Typography variant="caption" color="text.disabled">
                  {imageLoading ? t.notification.loadingPhoto : t.notification.noPhoto}
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, minWidth: 0, flex: 1 }}>
              <LocationOnOutlinedIcon color="action" fontSize="small" sx={{ flexShrink: 0 }} />
              <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                {ubicacion || t.notification.noLocation}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{ flexShrink: 0, textAlign: 'right', fontWeight: 'bold', color: isHighPriority ? 'error.main' : isLowPriority ? 'success.main' : 'warning.main' }}
            >
              {getTranslatedSeverity(prioridad)}
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ mb: 2, overflowWrap: 'anywhere', fontWeight: 500, color: 'text.primary', opacity: 0.85 }}>{detalle}</Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar 
                sx={{ 
                  width: 24, 
                  height: 24, 
                  fontSize: '0.75rem', 
                  bgcolor: isHighPriority 
                    ? 'error.main' 
                    : isModeratePriority 
                      ? 'warning.main' 
                      : 'primary.main',
                  fontWeight: 'bold'
                }}
              >
                {workerName ? workerName.charAt(0).toUpperCase() : '?'}
              </Avatar>
              <Typography variant="caption" color="text.secondary">
                {workerName || t.notification.unknownWorker}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">{formatPublicationDate(fecha)}</Typography>
          </Box>

        </Box>
      </Collapse>
    </Box>
  );
}
