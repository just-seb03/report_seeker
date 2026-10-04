/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : HomeScene.tsx                                                 *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 02 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización : 02 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   HomeScene -- Componente contenedor visual que muestra el encabezado y la lista de         *
 *        notificaciones en el inicio; conecta el gesto y muestra el indicador al alcanzar    *
 *        el umbral de actualización.                                                         *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import React from 'react';
import { Box } from '@mui/material';
import HomeHeader from './HomeHeader';
import RefreshIndicator from './RefreshIndicator';
import NotificationSheet, { type Notificacion } from './NotificationSheet';
import { type IssueReport } from '../database';
import './HomeScene.css';

interface HomeSceneProps {
  pullDistance: number;
  isExpanded: boolean;
  hasUnreadNotifications: boolean;
  notificaciones: Notificacion[];
  hasMoreNotifications: boolean;
  isLoadingNotifications: boolean;
  isRefreshingNotifications: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
  onRefreshNotifications: () => void;
  onSwipeProgress: (progress: number) => void;
  onTouchStart: (e: React.TouchEvent | React.MouseEvent) => void;
  onTouchEnd: (e: React.TouchEvent | React.MouseEvent) => void;
  onOpenReport: (report: IssueReport) => void;
  onLoadMore: () => void;
  onCollapse: () => void;
  onMarkAsRead: (id: number) => void;
}

export default function HomeScene({
  pullDistance,
  isExpanded,
  hasUnreadNotifications,
  notificaciones,
  hasMoreNotifications,
  isLoadingNotifications,
  isRefreshingNotifications,
  listRef,
  onRefreshNotifications,
  onSwipeProgress,
  onTouchStart,
  onTouchEnd,
  onOpenReport,
  onLoadMore,
  onCollapse,
  onMarkAsRead
}: HomeSceneProps) {
  return (
    <>
      <Box
        className="home-scene"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onTouchStart}
        onMouseUp={onTouchEnd}
        onMouseLeave={onTouchEnd}
        sx={{
          transform: `translateY(${Math.min(pullDistance * 0.65, 88)}px)`,
          transition: pullDistance === 0 ? 'transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
        }}
      >
        <HomeHeader
          isExpanded={isExpanded}
          hasNotifications={hasUnreadNotifications}
          isLoading={isRefreshingNotifications}
          onSwipeDown={onRefreshNotifications}
          onSwipeProgress={onSwipeProgress}
        />

        <NotificationSheet
          isExpanded={isExpanded}
          listRef={listRef}
          notificaciones={notificaciones}
          hasMore={hasMoreNotifications}
          isLoading={isLoadingNotifications}
          onOpenReport={onOpenReport}
          onLoadMore={onLoadMore}
          onCollapse={onCollapse}
          onMarkAsRead={onMarkAsRead}
        />

        <Box className="home-gradient-overlay" />
      </Box>

      {pullDistance >= 120 && !isRefreshingNotifications && (
        <Box className="refresh-swipe-feedback">
          <RefreshIndicator label="Suelta para actualizar reportes" />
        </Box>
      )}
    </>
  );
}
