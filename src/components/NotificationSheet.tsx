/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : NotificationSheet.tsx                                         *
 *                                                                                             *
 *              Programador : Sebastian Arredondo, Maximiliano Cantuarias, Cristian Vega    *
 *                                                                                             *
 *          Fecha de Inicio : 29 de Septiembre de 2026                                      *
 *                                                                                             *
 *     Última Actualización : 02 de Octubre de 2026 [SA]                                    *
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
import type { IssueReport } from '../database';
import './NotificationSheet.css'; // <-- Importamos su CSS exclusivo

export interface Notificacion {
  id: number;
  titulo: string;
  detalle: string;
  ubicacion?: string;
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
                fecha={noti.fecha}
                currentTime={currentTime}
                unread={noti.unread}
                prioridad={noti.prioridad}
                issueId={noti.issueId}
                onOpenReport={report ? () => onOpenReport(report) : undefined}
                onMarkAsRead={() => onMarkAsRead?.(noti.id)}
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
