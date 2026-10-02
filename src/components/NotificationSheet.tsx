import { useEffect, useRef } from 'react';
import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import NotificationCard from './NotificationCard';
import type { IssueReport } from '../database';
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
  reporte?: IssueReport;
}

interface NotificationSheetProps {
  isExpanded: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
  notificaciones: Notificacion[];
  hasMore: boolean;
  isLoading: boolean;
  onOpenReport: (report: IssueReport) => void;
  onLoadMore: () => void;
  onCollapse: () => void; 
}

export default function NotificationSheet({
  isExpanded, listRef, notificaciones, hasMore, isLoading, onOpenReport, onLoadMore, onCollapse,
}: NotificationSheetProps) {
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = listRef.current;
    const sentinel = loadMoreSentinelRef.current;
    if (!isExpanded || !hasMore || isLoading || !container || !sentinel) return;

    let requestStarted = false;
    const observer = new IntersectionObserver((entries) => {
      if (requestStarted || !entries.some((entry) => entry.isIntersecting)) return;
      requestStarted = true;
      onLoadMore();
    }, { root: container, rootMargin: '0px 0px 120px 0px' });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isExpanded, isLoading, listRef, onLoadMore]);

  return (
    <Box
      ref={listRef}
      // Alternamos la clase en lugar de reescribir CSS en línea
      className={`sheet-wrapper ${isExpanded ? 'expanded' : 'collapsed'}`} 
    >
      <Box className="sheet-content">
        
        {notificaciones.map((noti, index) => {
          const report = noti.reporte;
          return (
            <Box
              className="sheet-notification-item"
              key={noti.id}
              style={{ animationDelay: `${(index % 5) * 55}ms` }}
            >
              <NotificationCard
                titulo={noti.titulo}
                detalle={noti.detalle}
                ubicacion={noti.ubicacion}
                tiempo={noti.tiempo}
                unread={noti.unread}
                prioridad={noti.prioridad}
                fecha={noti.fecha}
                issueId={noti.issueId}
                onOpenReport={report ? () => onOpenReport(report) : undefined}
              />
            </Box>
          );
        })}

        {!isLoading && notificaciones.length === 0 && (
          <Typography className="sheet-empty-message">No hay notificaciones</Typography>
        )}

        {hasMore && (
          <Box
            ref={loadMoreSentinelRef}
            className={`sheet-load-more-sentinel${isLoading && isExpanded ? ' is-loading' : ''}`}
          >
            {isLoading && isExpanded && (
              <Box className="sheet-load-more-indicator" role="status" aria-label="Cargando reportes">
                <CircularProgress size={26} thickness={4} />
                <Typography variant="caption">Cargando reportes</Typography>
              </Box>
            )}
          </Box>
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