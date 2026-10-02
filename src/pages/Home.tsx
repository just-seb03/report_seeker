import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import HomeHeader from '../components/HomeHeader';
import NotificationSheet, { type Notificacion } from '../components/NotificationSheet';
import BottomNav from '../components/BottomNav';
import ReportCancelDialog from '../components/ReportCancelDialog';
import InfoReport from './InfoReport';
import Report, { type ReportPhoto } from './Report';
import Profile from './profile';
import { getIssueReportsPage, type IssueReport } from '../database';
import './Home.css';

interface HomeProps {
  isDarkMode: boolean;
  onToggleManualTheme: () => void;
}

type NavigationView = 'home' | 'report' | 'profile' | 'info-report';
type TransitionDirection = 'forward' | 'backward';
const viewOrder: NavigationView[] = ['report', 'home', 'info-report', 'profile'];
const notificationPageSize = 5;

function toNotification(report: IssueReport): Notificacion {
  const capturedAt = new Date(report.capturedAt.includes('T')
    ? report.capturedAt
    : `${report.capturedAt.replace(' ', 'T')}Z`);
  const dateLabel = Number.isNaN(capturedAt.getTime())
    ? 'Fecha desconocida'
    : new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(capturedAt);

  return {
    id: report.issueId,
    issueId: report.issueId,
    titulo: `Nuevo reporte: ${report.title}`,
    detalle: `UID-${report.issueId} · ${report.description}`,
    ubicacion: report.location,
    fechaPublicacion: Number.isNaN(capturedAt.getTime()) ? undefined : capturedAt.toISOString(),
    fecha: dateLabel,
    unread: true,
    prioridad: report.priority,
    reporte: report,
  };
}

export default function Home({ isDarkMode, onToggleManualTheme }: HomeProps) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [lastNotificationId, setLastNotificationId] = useState<number | undefined>();
  const [hasMoreNotifications, setHasMoreNotifications] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeView, setActiveView] = useState<NavigationView>('home');
  const [selectedReport, setSelectedReport] = useState<IssueReport | null>(null);
  const [reportPhoto, setReportPhoto] = useState<ReportPhoto | null>(null);
  const [reportIsComplete, setReportIsComplete] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [pendingView, setPendingView] = useState<NavigationView | null>(null);
  const [previousView, setPreviousView] = useState<NavigationView | null>(null);
  const [transitionDirection, setTransitionDirection] = useState<TransitionDirection>('forward');
  const [pullDistance, setPullDistance] = useState(0);
  const touchStart = useRef<number | null>(null);
  const isLoadingMoreNotifications = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);
  const transitionTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
  }, []);

  useEffect(() => {
    let isActive = true;
    getIssueReportsPage(notificationPageSize)
      .then((page) => {
        if (!isActive) return;
        setNotificaciones(page.items.map(toNotification));
        setLastNotificationId(page.items[page.items.length - 1]?.issueId);
        setHasMoreNotifications(page.hasMore);
      })
      .catch((error: unknown) => console.error('No se pudieron cargar los reportes guardados', error))
      .finally(() => {
        if (isActive) setIsLoadingNotifications(false);
      });

    return () => { isActive = false; };
  }, []);

  const handleLoadMoreNotifications = async () => {
    if (!hasMoreNotifications || isLoadingNotifications || isLoadingMoreNotifications.current || lastNotificationId === undefined) return;

    const loadingStartedAt = performance.now();
    isLoadingMoreNotifications.current = true;
    setIsLoadingNotifications(true);
    try {
      const page = await getIssueReportsPage(notificationPageSize, lastNotificationId);
      const notifications = page.items.map(toNotification);
      setNotificaciones((current) => {
        const existingIds = new Set(current.map((notification) => notification.issueId));
        return [...current, ...notifications.filter((notification) => !existingIds.has(notification.issueId))];
      });
      setLastNotificationId(page.items[page.items.length - 1]?.issueId ?? lastNotificationId);
      setHasMoreNotifications(page.hasMore);
    } catch (error) {
      console.error('No se pudieron cargar más reportes', error);
    } finally {
      const remainingIndicatorTime = 350 - (performance.now() - loadingStartedAt);
      if (remainingIndicatorTime > 0) {
        await new Promise<void>((resolve) => window.setTimeout(resolve, remainingIndicatorTime));
      }
      isLoadingMoreNotifications.current = false;
      setIsLoadingNotifications(false);
    }
  };

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
      if (nextView !== 'report') {
        setReportPhoto(null);
        setReportIsComplete(false);
      }
      transitionTimer.current = null;
    }, 380);
  };

  const requestNavigation = (nextView: NavigationView) => {
    if (nextView === activeView) return;
    if (activeView === 'report' && !reportIsComplete) {
      setPendingView(nextView);
      setCancelDialogOpen(true);
      return;
    }
    navigateTo(nextView);
  };

  const handleHomeClick = () => requestNavigation('home');
  const handleOpenReport = (report: IssueReport) => {
    setSelectedReport(report);
    navigateTo('info-report');
  };

  const captureReportPhoto = async (): Promise<ReportPhoto | null> => {
    try {
      const capturedPhoto = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });
      if (!capturedPhoto.webPath) throw new Error('La cámara no devolvió una ruta para la fotografía.');

      const response = await fetch(capturedPhoto.webPath);
      if (!response.ok) throw new Error('No se pudo leer la fotografía capturada.');
      const blob = await response.blob();
      if (blob.size === 0) throw new Error('La fotografía capturada está vacía.');

      return { blob, webPath: capturedPhoto.webPath };
    } catch (error) {
      console.error('No se pudo capturar la fotografía del reporte.', error);
      return null;
    }
  };

  const handleReportClick = async () => {
    if (activeView === 'report') return;
    const photo = await captureReportPhoto();
    if (!photo) return;

    setReportIsComplete(false);
    setReportPhoto(photo);
    navigateTo('report');
  };
  const handleRetakeReportPhoto = async () => {
    const photo = await captureReportPhoto();
    if (photo) setReportPhoto(photo);
    return photo;
  };

  const handleCancelReport = () => {
    setCancelDialogOpen(false);
    setPendingView(null);
  };

  const handleExitReport = () => {
    const destination = pendingView;
    setCancelDialogOpen(false);
    setPendingView(null);
    if (destination) navigateTo(destination);
  };

  const handleReportCreated = (report: { issueId: number; title: string; description: string; location: string; priority: string }) => {
    setReportIsComplete(true);
    const notification = toNotification({
      issueId: report.issueId,
      title: report.title,
      description: report.description,
      location: report.location,
      priority: report.priority,
      capturedAt: new Date().toISOString(),
    });
    setNotificaciones((current) => [
      notification,
      ...current.filter((item) => item.issueId !== report.issueId),
    ]);
  };

  const renderView = (view: NavigationView) => {
    if (view === 'info-report') {
      return selectedReport ? (
        <InfoReport
          key={selectedReport.issueId}
          report={selectedReport}
          onBack={() => navigateTo('home')}
        />
      ) : null;
    }
    if (view === 'report') {
      return reportPhoto ? (
        <Report
          photo={reportPhoto}
          onRetakePhoto={handleRetakeReportPhoto}
          onComplete={() => navigateTo('home')}
          onReportCreated={handleReportCreated}
        />
      ) : null;
    }
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
            hasMore={hasMoreNotifications}
            isLoading={isLoadingNotifications}
            onOpenReport={handleOpenReport}
            onLoadMore={handleLoadMoreNotifications}
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
          activeView={activeView === 'report' ? 'report' : activeView === 'profile' ? 'profile' : 'home'}
          onHomeClick={handleHomeClick}
          onReportClick={handleReportClick}
          onProfileClick={() => requestNavigation('profile')}
        />
      </Box>
      <ReportCancelDialog
        open={cancelDialogOpen}
        onCancel={handleCancelReport}
        onExit={handleExitReport}
      />
    </Box>
  );
}