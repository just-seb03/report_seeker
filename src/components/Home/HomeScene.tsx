/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : HomeScene.tsx                                                 *
 *                                                                                             *
 *              Programador :Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 02 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización :04 de Octubre de 2026 [SA]                                    *
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
import { type IssueReport } from '../../database';

interface HomeSceneProps {
  pullDistance: number;
  isExpanded: boolean;
  hasUnreadNotifications: boolean;
  hasPendingReports?: boolean;
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
  hasPendingReports = false,
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
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onTouchStart}
        onMouseUp={onTouchEnd}
        onMouseLeave={onTouchEnd}
        sx={{
          position: 'absolute',
          inset: 0,
          transformOrigin: 'top center',
          willChange: 'transform',
          transform: `translateY(${Math.min(pullDistance * 0.65, 88)}px)`,
          transition: pullDistance === 0 ? 'transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
        }}
      >
        <HomeHeader
          isExpanded={isExpanded}
          hasNotifications={hasUnreadNotifications}
          hasPendingReports={hasPendingReports}
          isLoading={isRefreshingNotifications}
          isInitialLoading={isLoadingNotifications}
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

        <Box sx={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0, height: 220, pointerEvents: 'none', zIndex: 2, transition: 'background 0.25s ease',
          background: (theme) => `linear-gradient(to bottom, transparent, ${theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5'} 75%)`
        }} />
      </Box>

      {pullDistance >= 120 && !isRefreshingNotifications && (
        <Box sx={{
          position: 'absolute', zIndex: 20, top: 'max(12px, env(safe-area-inset-top))', left: '50%',
          width: 40, height: 40, ml: '-20px', pointerEvents: 'none',
          color: (theme) => theme.palette.mode === 'dark' ? '#f5f5f5' : '#202020',
          textShadow: (theme) => theme.palette.mode === 'dark' ? '0 1px 8px rgba(0,0,0,0.7)' : 'none'
        }}>
          <RefreshIndicator label="Suelta para actualizar reportes" />
        </Box>
      )}
    </>
  );
}
