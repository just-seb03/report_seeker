/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : useHome.ts                                                    *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 02 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización : 02 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   useHome -- Custom hook que centraliza y provee toda la lógica de estado y navegación del  *
 *        Home.                                                                                *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useState, useRef, useEffect, useCallback } from 'react';
import { getIssueReportsPage, type IssueReport } from '../database';
import { getInitialReadNotificationIds, saveReadNotificationIds, toNotification } from './notificationsControl';
import { captureReportPhoto } from './cameraControl';
import { useHardwareBackButton } from './backButtonControl';
import { deletePhotoFile } from './imageCleanupControl';
import { type ReportPhoto } from '../pages/Report';
import { type Notificacion } from '../components/NotificationSheet';

export type NavigationView = 'home' | 'report' | 'profile' | 'info-report' | 'configuration';
export type TransitionDirection = 'forward' | 'backward';

export const viewOrder: NavigationView[] = ['report', 'home', 'info-report', 'profile', 'configuration'];
const notificationPageSize = 5;

export function useHome() {
  const [readNotificationIds, setReadNotificationIds] = useState<Set<number>>(getInitialReadNotificationIds);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [lastNotificationId, setLastNotificationId] = useState<number | undefined>();
  const [hasMoreNotifications, setHasMoreNotifications] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeView, setActiveView] = useState<NavigationView>('home');
  const [selectedReport, setSelectedReport] = useState<IssueReport | null>(null);
  const [reportPhoto, setReportPhoto] = useState<ReportPhoto | null>(null);
  const [reportIsComplete, setReportIsComplete] = useState(false);
  const [isNavEntering, setIsNavEntering] = useState(false);
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

  const handleMarkAsRead = useCallback((id: number) => {
    setReadNotificationIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      saveReadNotificationIds(next);
      return next;
    });
    setNotificaciones((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: false } : item))
    );
  }, []);

  useEffect(() => {
    let isActive = true;
    getIssueReportsPage(notificationPageSize)
      .then((page) => {
        if (!isActive) return;
        setNotificaciones(page.items.map((item) => toNotification(item, readNotificationIds)));
        setLastNotificationId(page.items[page.items.length - 1]?.issueId);
        setHasMoreNotifications(page.hasMore);
      })
      .catch((error: unknown) => console.error('No se pudieron cargar los reportes guardados', error))
      .finally(() => {
        if (isActive) setIsLoadingNotifications(false);
      });

    return () => { isActive = false; };
  }, []);

  const handleLoadMoreNotifications = useCallback(async () => {
    if (!hasMoreNotifications || isLoadingNotifications || isLoadingMoreNotifications.current || lastNotificationId === undefined) return;

    const loadingStartedAt = performance.now();
    isLoadingMoreNotifications.current = true;
    setIsLoadingNotifications(true);
    try {
      const page = await getIssueReportsPage(notificationPageSize, lastNotificationId);
      const notifications = page.items.map((item) => toNotification(item, readNotificationIds));
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
  }, [hasMoreNotifications, isLoadingNotifications, lastNotificationId, readNotificationIds]);

  const handleCollapse = useCallback(() => {
    setIsExpanded(false);
    if (listRef.current) listRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    touchStart.current = clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (touchStart.current === null) return;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;
    const deltaY = touchStart.current - clientY;

    if (!isExpanded && deltaY > 40) {
      setIsExpanded(true);
    } else if (isExpanded && deltaY < -40 && listRef.current && listRef.current.scrollTop <= 0) {
      setIsExpanded(false); 
    }

    touchStart.current = null;
  }, [isExpanded]);

  const navigateTo = useCallback((nextView: NavigationView) => {
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
        setReportPhoto((current) => {
          if (current?.path) deletePhotoFile(current.path);
          return null;
        });
        setReportIsComplete(false);
      }
      transitionTimer.current = null;
    }, 380);
  }, [activeView]);

  const requestNavigation = useCallback((nextView: NavigationView) => {
    if (nextView === activeView) return;
    if (activeView === 'report' && !reportIsComplete) {
      setPendingView(nextView);
      setCancelDialogOpen(true);
      return;
    }
    navigateTo(nextView);
  }, [activeView, reportIsComplete, navigateTo]);

  const handleHomeClick = useCallback(() => requestNavigation('home'), [requestNavigation]);
  const handleReportComplete = useCallback(() => {
    setIsNavEntering(true);
    navigateTo('home');
  }, [navigateTo]);

  const handleOpenReport = useCallback((report: IssueReport) => {
    handleMarkAsRead(report.issueId);
    setSelectedReport(report);
    navigateTo('info-report');
  }, [handleMarkAsRead, navigateTo]);

  const handleOpenConfiguration = useCallback(() => navigateTo('configuration'), [navigateTo]);

  const handleReportClick = useCallback(async () => {
    if (activeView === 'report') return;
    const photo = await captureReportPhoto();
    if (!photo) return;

    setReportIsComplete(false);
    setReportPhoto(photo);
    navigateTo('report');
  }, [activeView, navigateTo]);

  const handleRetakeReportPhoto = useCallback(async () => {
    const photo = await captureReportPhoto();
    if (photo) {
      setReportPhoto((current) => {
        if (current?.path) deletePhotoFile(current.path);
        return photo;
      });
    }
    return photo;
  }, []);

  const handleCancelReport = useCallback(() => {
    setCancelDialogOpen(false);
    setPendingView(null);
  }, []);

  const handleExitReport = useCallback(() => {
    const destination = pendingView;
    setCancelDialogOpen(false);
    setPendingView(null);
    if (destination) navigateTo(destination);
  }, [pendingView, navigateTo]);

  const handleReportCreated = useCallback((report: { issueId: number; title: string; description: string; location: string; priority: string }) => {
    setReportIsComplete(true);
    const notification = toNotification({
      issueId: report.issueId,
      title: report.title,
      description: report.description,
      location: report.location,
      priority: report.priority,
      capturedAt: new Date().toISOString(),
    }, readNotificationIds);
    setNotificaciones((current) => [
      notification,
      ...current.filter((item) => item.issueId !== report.issueId),
    ]);
  }, [readNotificationIds]);

  const hasUnreadNotifications = notificaciones.some((item) => item.unread);

  const handleHardwareBack = useCallback((): boolean => {
    if (cancelDialogOpen) {
      setCancelDialogOpen(false);
      setPendingView(null);
      return true;
    }
    if (activeView === 'info-report') {
      navigateTo('home');
      return true;
    }
    if (activeView === 'configuration') {
      navigateTo('profile');
      return true;
    }
    if (activeView === 'profile') {
      navigateTo('home');
      return true;
    }
    if (activeView === 'report') {
      if (reportIsComplete) {
        navigateTo('home');
      } else {
        setPendingView('home');
        setCancelDialogOpen(true);
      }
      return true;
    }
    if (activeView === 'home') {
      if (isExpanded) {
        handleCollapse();
        return true;
      }
      return false; // Permite que la app se cierre nativamente
    }
    return false;
  }, [cancelDialogOpen, activeView, reportIsComplete, isExpanded, navigateTo, handleCollapse]);

  useHardwareBackButton(handleHardwareBack);

  return {
    notificaciones,
    hasMoreNotifications,
    isLoadingNotifications,
    isExpanded,
    activeView,
    selectedReport,
    reportPhoto,
    reportIsComplete,
    isNavEntering,
    cancelDialogOpen,
    previousView,
    transitionDirection,
    pullDistance,
    listRef,
    hasUnreadNotifications,
    setIsNavEntering,
    setPullDistance,
    handleMarkAsRead,
    handleLoadMoreNotifications,
    handleCollapse,
    handleTouchStart,
    handleTouchEnd,
    navigateTo,
    requestNavigation,
    handleHomeClick,
    handleReportComplete,
    handleOpenReport,
    handleOpenConfiguration,
    handleReportClick,
    handleRetakeReportPhoto,
    handleCancelReport,
    handleExitReport,
    handleReportCreated,
  };
}
