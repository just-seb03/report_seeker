import React from 'react';
import { Box, Typography } from '@mui/material';
import HomeHeader from './HomeHeader';
import NotificationSheet, { type Notificacion } from './NotificationSheet';
import { type IssueReport } from '../database';
import './HomeScene.css';

interface HomeSceneProps {
  isDarkMode: boolean;
  pullDistance: number;
  isExpanded: boolean;
  hasUnreadNotifications: boolean;
  notificaciones: Notificacion[];
  hasMoreNotifications: boolean;
  isLoadingNotifications: boolean;
  listRef: React.RefObject<HTMLDivElement>;
  onToggleManualTheme: () => void;
  onSwipeProgress: (progress: number) => void;
  onTouchStart: (e: React.TouchEvent | React.MouseEvent) => void;
  onTouchEnd: (e: React.TouchEvent | React.MouseEvent) => void;
  onOpenReport: (report: IssueReport) => void;
  onLoadMore: () => void;
  onCollapse: () => void;
  onMarkAsRead: (id: number) => void;
}

export default function HomeScene({
  isDarkMode,
  pullDistance,
  isExpanded,
  hasUnreadNotifications,
  notificaciones,
  hasMoreNotifications,
  isLoadingNotifications,
  listRef,
  onToggleManualTheme,
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
          onSwipeDown={onToggleManualTheme}
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

      <Typography
        aria-hidden={pullDistance < 8}
        className="theme-swipe-feedback"
        sx={{
          opacity: Math.min(pullDistance / 36, 1),
          transform: `translateY(${Math.min(pullDistance * 0.12, 12)}px)`,
          transition: pullDistance === 0 ? 'opacity 180ms ease, transform 220ms ease' : 'none',
        }}
      >
        Desliza hacia abajo para activar el modo {isDarkMode ? 'claro' : 'oscuro'}
      </Typography>
    </>
  );
}
