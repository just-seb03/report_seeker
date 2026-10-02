import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import HomeHeader from '../components/HomeHeader';
import NotificationSheet, { type Notificacion } from '../components/NotificationSheet';
import BottomNav from '../components/BottomNav';
import Report from './Report';
import Profile from './profile';
import './Home.css';

interface HomeProps {
  isDarkMode: boolean;
  onToggleManualTheme: () => void;
}

type NavigationView = 'home' | 'report' | 'profile';
type TransitionDirection = 'forward' | 'backward';
const viewOrder: NavigationView[] = ['report', 'home', 'profile'];

const notificacionesData: Notificacion[] = [
  { id: 1, titulo: 'Sincronización pausada', detalle: 'Esperando red para subir 3 reportes.', tiempo: 'hace 2 min', unread: true, prioridad: 'Alta' },
  { id: 2, titulo: 'Alerta de clima', detalle: 'Vientos fuertes previstos en el sector norte.', tiempo: 'hace 5 min', unread: true, prioridad: 'Alta' },
];

export default function Home({ isDarkMode, onToggleManualTheme }: HomeProps) {
  const [notificaciones, setNotificaciones] = useState(notificacionesData);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeView, setActiveView] = useState<NavigationView>('home');
  const [previousView, setPreviousView] = useState<NavigationView | null>(null);
  const [transitionDirection, setTransitionDirection] = useState<TransitionDirection>('forward');
  const [pullDistance, setPullDistance] = useState(0);
  const touchStart = useRef<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const transitionTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
  }, []);

  const handleCollapse = () => {
    setIsExpanded(false);
    if (listRef.current) listRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    touchStart.current = clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStart.current === null) return;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;
    const deltaY = touchStart.current - clientY;

    if (!isExpanded && deltaY > 40) {
      setIsExpanded(true);
    } else if (isExpanded && deltaY < -40 && listRef.current && listRef.current.scrollTop <= 0) {
      setIsExpanded(false); 
    }

    touchStart.current = null;
  };

  const navigateTo = (nextView: NavigationView) => {
    if (nextView === activeView) return;
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);

    const direction = viewOrder.indexOf(nextView) > viewOrder.indexOf(activeView) ? 'forward' : 'backward';
    setTransitionDirection(direction);
    setPreviousView(activeView);
    setActiveView(nextView);
    setPullDistance(0);
    transitionTimer.current = window.setTimeout(() => {
      setPreviousView(null);
      transitionTimer.current = null;
    }, 380);
  };

  const handleHomeClick = () => navigateTo('home');
  const handleReportClick = () => navigateTo('report');
  const handleProfileClick = () => navigateTo('profile');

  const handleReportCreated = (report: { issueId: number; title: string; description: string; location: string; priority: string }) => {
    const now = new Date();
    setNotificaciones((current) => [{
      id: now.getTime(),
      issueId: report.issueId,
      titulo: `Nuevo reporte: ${report.title}`,
      detalle: `UID-${report.issueId} · ${report.description}`,
      ubicacion: report.location,
      tiempo: 'ahora',
      unread: true,
      prioridad: report.priority,
      fecha: new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(now),
    }, ...current]);
    navigateTo('home');
  };

  const renderView = (view: NavigationView) => {
    if (view === 'report') return <Report onReportCreated={handleReportCreated} />;
    if (view === 'profile') return <Profile />;

    return (
      <>
        <Box
          className="home-scene"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          sx={{
            transform: `translateY(${Math.min(pullDistance * 0.65, 88)}px)`,
            transition: pullDistance === 0 ? 'transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
          }}
        >
          <HomeHeader
            isExpanded={isExpanded}
            onSwipeDown={onToggleManualTheme}
            onSwipeProgress={setPullDistance}
          />

          <NotificationSheet
            isExpanded={isExpanded}
            listRef={listRef}
            notificaciones={notificaciones}
            onCollapse={handleCollapse}
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
  };

  return (
    <Box className="home-container">
      <Box className="home-view-stage">
        {previousView && (
          <Box
            key={`exit-${previousView}`}
            className={`home-view home-view-exit exit-${transitionDirection}`}
            aria-hidden="true"
          >
            {renderView(previousView)}
          </Box>
        )}
        <Box
          key={`active-${activeView}`}
          className={`home-view home-view-active${previousView ? ` enter-${transitionDirection}` : ''}`}
        >
          {renderView(activeView)}
        </Box>
      </Box>

      <Box className="home-bottom-nav">
        <BottomNav
          activeView={activeView}
          onHomeClick={handleHomeClick}
          onReportClick={handleReportClick}
          onProfileClick={handleProfileClick}
        />
      </Box>
    </Box>
  );
}