import { useState, useRef, useEffect, useCallback } from 'react';
import { Network } from '@capacitor/network';
import { type IssueReport } from '../../database';
import { captureReportPhoto } from './cameraControl';
import { useHardwareBackButton } from './backButtonControl';
import { deletePhotoFile } from './imageCleanupControl';
import { sendReportNotification } from '../global/systemNotificationsControl';
import { type ReportPhoto } from '../../pages/Report';

export type NavigationView = 'home' | 'report' | 'profile' | 'info-report' | 'report-management' | 'configuration' | 'queue' | 'seekie' | 'sumario';
export type TransitionDirection = 'forward' | 'backward';
export type ConfigMenuState = 'none' | 'pin' | 'email';

export const viewOrder: NavigationView[] = ['report', 'queue', 'sumario', 'home', 'seekie', 'info-report', 'report-management', 'profile', 'configuration'];

export function useHome({
  isExpanded,
  handleCollapse,
  handleMarkAsRead,
  addNotificationLocally,
}: {
  isExpanded: boolean;
  handleCollapse: () => void;
  handleMarkAsRead: (id: number) => void;
  addNotificationLocally: (report: { issueId: number; title: string; description: string; location: string; priority: string }) => void;
}) {
  const [activeView, setActiveView] = useState<NavigationView>('home');
  const [selectedReport, setSelectedReport] = useState<IssueReport | null>(null);
  const [reportPhoto, setReportPhoto] = useState<ReportPhoto | null>(null);
  const [reportIsComplete, setReportIsComplete] = useState(false);
  const [isNavEntering, setIsNavEntering] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [configMenuState, setConfigMenuState] = useState<ConfigMenuState>('none');
  const [infoReportSource, setInfoReportSource] = useState<NavigationView>('home');
  const [reportManagementSource, setReportManagementSource] = useState<NavigationView>('home');
  const [pendingView, setPendingView] = useState<NavigationView | null>(null);
  const [previousView, setPreviousView] = useState<NavigationView | null>(null);
  const [transitionDirection, setTransitionDirection] = useState<TransitionDirection>('forward');
  
  const transitionTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
    };
  }, []);

  const navigateTo = useCallback((nextView: NavigationView) => {
    if (nextView === activeView) return;
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);

    const direction = viewOrder.indexOf(nextView) > viewOrder.indexOf(activeView) ? 'forward' : 'backward';
    setTransitionDirection(direction);
    setPreviousView(activeView);
    setActiveView(nextView);
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
  const handleReportComplete = useCallback(async () => {
    setIsNavEntering(true);
    try {
      const status = await Network.getStatus();
      if (!status.connected) {
        navigateTo('queue');
        return;
      }
    } catch (e) {
      console.error('Error verificando red', e);
    }
    navigateTo('home');
  }, [navigateTo]);

  const handleOpenReport = useCallback((report: IssueReport) => {
    handleMarkAsRead(report.issueId);
    setSelectedReport(report);
    setInfoReportSource(activeView);
    navigateTo('info-report');
  }, [activeView, handleMarkAsRead, navigateTo]);

  const handleCloseInfoReport = useCallback(() => {
    navigateTo(infoReportSource);
  }, [infoReportSource, navigateTo]);

  const handleManageReport = useCallback((report: IssueReport) => {
    handleMarkAsRead(report.issueId);
    setSelectedReport(report);
    setReportManagementSource(activeView);
    navigateTo('report-management');
  }, [activeView, handleMarkAsRead, navigateTo]);

  const handleCloseReportManagement = useCallback(() => {
    navigateTo(reportManagementSource);
  }, [reportManagementSource, navigateTo]);

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

  const handleReportCreated = useCallback(async (report: { issueId: number; title: string; description: string; location: string; priority: string }) => {
    setReportIsComplete(true);
    
    // Lanzar notificación push local con la imagen actual antes de que se limpie
    sendReportNotification(report.title, report.description, reportPhoto?.blob);

    try {
      const status = await Network.getStatus();
      if (!status.connected) {
         window.dispatchEvent(new CustomEvent('reportes_actualizados'));
         return;
      }
    } catch(e) {
      console.error(e);
    }
    
    addNotificationLocally(report);
  }, [reportPhoto, addNotificationLocally]);

  const handleHardwareBack = useCallback((): boolean => {
    if (cancelDialogOpen) {
      setCancelDialogOpen(false);
      setPendingView(null);
      return true;
    }
    if (activeView === 'info-report') {
      navigateTo(infoReportSource);
      return true;
    }
    if (activeView === 'report-management') {
      navigateTo(reportManagementSource);
      return true;
    }
    if (activeView === 'configuration') {
      if (configMenuState !== 'none') {
        setConfigMenuState('none');
        return true;
      }
      navigateTo('profile');
      return true;
    }
    if (activeView === 'profile') {
      navigateTo('home');
      return true;
    }
    if (activeView === 'queue') {
      navigateTo('home');
      return true;
    }
    if (activeView === 'seekie') {
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
  }, [cancelDialogOpen, activeView, reportIsComplete, isExpanded, navigateTo, handleCollapse, configMenuState, infoReportSource, reportManagementSource]);

  useHardwareBackButton(handleHardwareBack);

  return {
    activeView,
    selectedReport,
    reportPhoto,
    reportIsComplete,
    isNavEntering,
    cancelDialogOpen,
    configMenuState,
    previousView,
    transitionDirection,
    setIsNavEntering,
    setConfigMenuState,
    navigateTo,
    requestNavigation,
    handleHomeClick,
    handleReportComplete,
    handleOpenReport,
    handleCloseInfoReport,
    handleManageReport,
    handleCloseReportManagement,
    handleOpenConfiguration,
    handleReportClick,
    handleRetakeReportPhoto,
    handleCancelReport,
    handleExitReport,
    handleReportCreated,
  };
}
