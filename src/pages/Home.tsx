/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : Home.tsx                                                      *
 *                                                                                             *
 *              Programador :Sebastian Arredondo    *
 *                                                                                             *
 *          Fecha de Inicio : 29 de Septiembre de 2026                                      *
 *                                                                                             *
 *     Última Actualización :04 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   Home -- Contenedor principal; enruta vistas con useHome y coordina la navegación después  *
 *        de guardar correctamente la severidad de un reporte.                                 *
 *   renderView -- Devuelve el JSX correspondiente al componente que está actualmente visible  *
 *        (Home, Report, etc.).                                                                *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


import { Box } from '@mui/material';
import BottomNav from '../components/global/BottomNav';
import ReportCancelDialog from '../components/Home/ReportCancelDialog';
import Configuration from './Configuration';
import InfoReport from './InfoReport';
import Report from './Report';
import Profile from './Profile';
import Queue from './Queue';
import Summary from './Summary';
import ReportManagement from './ReportManagement';
import SeekieAIPage from './SeekieAIPage';
import HomeScene from '../components/Home/HomeScene';
import ViewTransition from '../components/Home/ViewTransition';
import { useHome, type NavigationView } from '../control/Home/useHome';
import { useSwipeGesture } from '../control/Home/useSwipeGesture';
import { useNotificationFeed } from '../control/Home/useNotificationFeed';
import { useQueue } from '../control/global/useQueue';
import { getCurrentUser } from '../control/global/authControl';

interface HomeProps {
  isDarkMode: boolean;
  onToggleManualTheme: () => void;
}

export default function Home({ isDarkMode, onToggleManualTheme }: HomeProps) {
  const {
    isExpanded,
    pullDistance,
    listRef,
    setPullDistance,
    handleCollapse,
    handleTouchStart,
    handleTouchEnd,
  } = useSwipeGesture();

  const {
    notificaciones,
    hasMoreNotifications,
    isLoadingNotifications,
    isRefreshingNotifications,
    hasUnreadNotifications,
    handleMarkAsRead,
    handleRefreshNotifications,
    handleLoadMoreNotifications,
    addNotificationLocally,
  } = useNotificationFeed(handleCollapse);

  const {
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
  } = useHome({
    isExpanded,
    handleCollapse,
    handleMarkAsRead,
    addNotificationLocally,
  });

  const { reports: pendingReports, loading: loadingQueue } = useQueue();
  const hasPendingReports = !loadingQueue && pendingReports.length > 0;
  
  const user = getCurrentUser();
  const isPrevencionista = user?.es_prevencionista ?? false;

  const renderView = (view: NavigationView) => {
    if (view === 'configuration') {
      return (
        <Configuration 
          onBack={() => navigateTo('profile')} 
          isDarkMode={isDarkMode}
          onToggleTheme={onToggleManualTheme}
          configMenuState={configMenuState}
          setConfigMenuState={setConfigMenuState}
        />
      );
    }
    if (view === 'info-report') {
      return selectedReport ? (
        <InfoReport
          key={selectedReport.issueId}
          report={selectedReport}
          isPrevencionista={isPrevencionista}
          onBack={handleCloseInfoReport}
          onManageReport={isPrevencionista ? () => handleManageReport(selectedReport) : undefined}
        />
      ) : null;
    }
    if (view === 'report-management') {
      return selectedReport && isPrevencionista ? (
        <ReportManagement
          key={selectedReport.issueId}
          report={selectedReport}
          onBack={handleCloseReportManagement}
          onSeveritySaved={() => navigateTo('home')}
        />
      ) : null;
    }
    if (view === 'report') {
      return reportPhoto ? (
        <Report
          photo={reportPhoto}
          onRetakePhoto={handleRetakeReportPhoto}
          onComplete={handleReportComplete}
          onReportCreated={handleReportCreated}
        />
      ) : null;
    }
    if (view === 'profile') return <Profile onSettingsClick={handleOpenConfiguration} />;
    if (view === 'queue') {
      return <Queue onReportClick={handleOpenReport} />;
    }
    if (view === 'sumario') {
      return <Summary />;
    }
    if (view === 'seekie') {
      return <SeekieAIPage />;
    }

    return (
      <HomeScene
        pullDistance={pullDistance}
        isExpanded={isExpanded}
        hasUnreadNotifications={hasUnreadNotifications}
        hasPendingReports={hasPendingReports}
        notificaciones={notificaciones}
        hasMoreNotifications={hasMoreNotifications}
        isLoadingNotifications={isLoadingNotifications}
        isRefreshingNotifications={isRefreshingNotifications}
        listRef={listRef}
        onRefreshNotifications={handleRefreshNotifications}
        onSwipeProgress={setPullDistance}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onOpenReport={handleOpenReport}
        onLoadMore={handleLoadMoreNotifications}
        onCollapse={handleCollapse}
        onMarkAsRead={handleMarkAsRead}
      />
    );
  };

  const showBottomNav = !(activeView === 'report' && reportIsComplete) && configMenuState === 'none';

  return (
    <Box sx={{ height: '100%', position: 'relative', overflow: 'hidden', bgcolor: 'background.default', transition: 'background-color 0.25s ease' }}>
      <Box sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
        {previousView && (
          <ViewTransition
            key={`exit-${previousView}`}
            isActive={false}
            direction={transitionDirection}
            isTransitioning={true}
          >
            {renderView(previousView)}
          </ViewTransition>
        )}
        <ViewTransition
          key={`active-${activeView}`}
          isActive={true}
          direction={transitionDirection}
          isTransitioning={!!previousView}
        >
          {renderView(activeView)}
        </ViewTransition>
      </Box>

      {showBottomNav && (
        <Box
          sx={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
            transform: isNavEntering ? 'translateY(100%)' : 'translateY(0)',
            animation: isNavEntering ? 'navEnter 400ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards' : 'none'
          }}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) setIsNavEntering(false);
          }}
        >
          <BottomNav
            activeView={
              activeView === 'report' ? 'report' : 
              activeView === 'profile' || activeView === 'configuration' ? 'profile' : 
              activeView === 'queue' ? 'cola' : 
              activeView === 'sumario' ? 'sumario' : 
              activeView === 'seekie' ? 'seekie' : 
              'home'
            }
            isPrevencionista={isPrevencionista}
            onHomeClick={handleHomeClick}
            onReportClick={handleReportClick}
            onProfileClick={() => requestNavigation('profile')}
            onColaClick={() => requestNavigation('queue')}
            onSumarioClick={() => requestNavigation('sumario')}
            onSeekieClick={() => requestNavigation('seekie')}
          />
        </Box>
      )}
      <ReportCancelDialog
        open={cancelDialogOpen}
        onCancel={handleCancelReport}
        onExit={handleExitReport}
      />
    </Box>
  );
}
