/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : useNotificationFeed.ts                                           *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 07 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 07 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   useNotificationFeed -- Hook que maneja el ciclo de vida, paginación y estado de lectura   *
 *        del muro principal de reportes de riesgo.                                            *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useState, useRef, useEffect, useCallback } from 'react';
import { getIssueReportsPage } from '../../database';
import { getInitialReadNotificationIds, saveReadNotificationIds, toNotification } from './notificationsControl';
import { type Notificacion } from '../../components/Home/NotificationSheet';

const notificationPageSize = 50;

export function useNotificationFeed(onListRefresh?: () => void) {
  const readNotificationIds = useRef<Set<number>>(getInitialReadNotificationIds());
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [lastNotificationId, setLastNotificationId] = useState<number | undefined>();
  const [hasMoreNotifications, setHasMoreNotifications] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [isRefreshingNotifications, setIsRefreshingNotifications] = useState(false);

  const isLoadingMoreNotifications = useRef(false);
  const isRefreshingNotificationsRef = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleMarkAsRead = useCallback((id: number) => {
    if (readNotificationIds.current.has(id)) return;
    readNotificationIds.current.add(id);
    saveReadNotificationIds(readNotificationIds.current);
    
    setNotificaciones((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: false } : item))
    );
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadInitialReports = () => {
      getIssueReportsPage(notificationPageSize)
        .then((page) => {
          if (!controller.signal.aborted) {
            setNotificaciones(page.items.map((item) => toNotification(item, readNotificationIds.current)));
            setLastNotificationId(page.items[page.items.length - 1]?.issueId);
            setHasMoreNotifications(page.hasMore);
          }
        })
        .catch((error: any) => {
          if (error.name === 'AbortError') return;
          console.error('No se pudieron cargar los reportes guardados', error);
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsLoadingNotifications(false);
        });
    };

    loadInitialReports();
    window.addEventListener('reportes_actualizados', loadInitialReports);

    return () => {
      controller.abort();
      window.removeEventListener('reportes_actualizados', loadInitialReports);
    };
  }, []);

  const handleRefreshNotifications = useCallback(async () => {
    if (
      isRefreshingNotificationsRef.current
      || isLoadingMoreNotifications.current
      || isLoadingNotifications
    ) return;
    isRefreshingNotificationsRef.current = true;
    setIsRefreshingNotifications(true);
    setIsLoadingNotifications(true);
    try {
      const page = await getIssueReportsPage(notificationPageSize);
      if (!isMounted.current) return;
      setNotificaciones(page.items.map((item) => toNotification(item, readNotificationIds.current)));
      setLastNotificationId(page.items[page.items.length - 1]?.issueId);
      setHasMoreNotifications(page.hasMore);
      if (onListRefresh) onListRefresh();
    } catch (error: unknown) {
      console.error('No se pudieron actualizar las notificaciones', error);
    } finally {
      isRefreshingNotificationsRef.current = false;
      if (isMounted.current) setIsRefreshingNotifications(false);
      if (isMounted.current) setIsLoadingNotifications(false);
    }
  }, [isLoadingNotifications, onListRefresh]);

  const handleLoadMoreNotifications = useCallback(async () => {
    if (!hasMoreNotifications || isLoadingNotifications || isLoadingMoreNotifications.current || lastNotificationId === undefined) return;

    const loadingStartedAt = performance.now();
    isLoadingMoreNotifications.current = true;
    setIsLoadingNotifications(true);
    try {
      const page = await getIssueReportsPage(notificationPageSize, lastNotificationId);
      const notifications = page.items.map((item) => toNotification(item, readNotificationIds.current));
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
  }, [hasMoreNotifications, isLoadingNotifications, lastNotificationId]);

  const addNotificationLocally = useCallback((report: { issueId: number; title: string; description: string; location: string; priority: string }) => {
    const notification = toNotification({
      issueId: report.issueId,
      title: report.title,
      description: report.description,
      location: report.location,
      priority: report.priority,
      capturedAt: new Date().toISOString(),
    }, readNotificationIds.current);
    setNotificaciones((current) => [
      notification,
      ...current.filter((item) => item.issueId !== report.issueId),
    ]);
  }, []);

  const hasUnreadNotifications = notificaciones.some((item) => item.unread);

  return {
    notificaciones,
    hasMoreNotifications,
    isLoadingNotifications,
    isRefreshingNotifications,
    hasUnreadNotifications,
    handleMarkAsRead,
    handleRefreshNotifications,
    handleLoadMoreNotifications,
    addNotificationLocally,
  };
}
