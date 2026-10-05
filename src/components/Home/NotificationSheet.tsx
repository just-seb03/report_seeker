/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : NotificationSheet.tsx                                         *
 *                                                                                             *
 *              Programador :Sebastian Arredondo    *
 *                                                                                             *
 *          Fecha de Inicio : 29 de Septiembre de 2026                                      *
 *                                                                                             *
 *     Última Actualización :04 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   NotificationSheet -- Componente desplegable que lista y pagina las notificaciones         *
 *        recientes.                                                                           *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import NotificationCard from './NotificationCard';
import type { IssueReport } from '../../database';


export interface Notificacion {
  id: number;
  titulo: string;
  detalle: string;
  ubicacion?: string;
  fecha?: string;
  unread?: boolean;
  prioridad?: string;
  issueId?: number;
  workerName?: string;
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
  onMarkAsRead?: (id: number) => void;
}

export default function NotificationSheet({
  isExpanded, listRef, notificaciones, hasMore, isLoading, onOpenReport, onLoadMore, onCollapse, onMarkAsRead,
}: NotificationSheetProps) {
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

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
      sx={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 1,
        transition: 'all 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
        overflowY: isExpanded ? 'auto' : 'hidden',
        transform: isExpanded ? 'translateY(0)' : 'translateY(42vh)',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 4, pt: 6, pb: 24, maxWidth: 400, mx: 'auto' }}>
        {notificaciones.map((noti, index) => {
          const report = noti.reporte;
          return (
            <Box
              key={noti.id}
              sx={{ animation: 'notification-enter 340ms cubic-bezier(0.2, 0.8, 0.2, 1) both', animationDelay: `${(index % 5) * 55}ms` }}
            >
              <NotificationCard
                titulo={noti.titulo}
                detalle={noti.detalle}
                ubicacion={noti.ubicacion}
                fecha={noti.fecha}
                currentTime={currentTime}
                unread={noti.unread}
                prioridad={noti.prioridad}
                issueId={noti.issueId}
                workerName={noti.workerName}
                onOpenReport={report ? () => onOpenReport(report) : undefined}
                onMarkAsRead={() => onMarkAsRead?.(noti.id)}
              />
            </Box>
          );
        })}

        {!isLoading && notificaciones.length === 0 && (
          <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>No hay notificaciones</Typography>
        )}

        {hasMore && (
          <Box
            ref={loadMoreSentinelRef}
            sx={{ display: 'flex', minHeight: isLoading && isExpanded ? 64 : 1, alignItems: 'center', justifyContent: 'center' }}
          >
            {isLoading && isExpanded && (
              <Box role="status" aria-label="Cargando reportes" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, py: 2, color: 'text.secondary', animation: 'notification-enter 220ms ease-out both' }}>
                <CircularProgress size={26} thickness={4} color="inherit" />
                <Typography variant="caption">Cargando reportes</Typography>
              </Box>
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <IconButton 
            onClick={onCollapse} 
            sx={{ 
              color: 'text.secondary', 
              p: 1, 
              bgcolor: 'action.hover', 
              '&:hover': { bgcolor: 'action.selected' } 
            }}
          >
            <KeyboardArrowUpIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
