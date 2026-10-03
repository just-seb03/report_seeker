/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : Home.tsx                                                      *
 *                                                                                             *
 *              Programador : Sebastian Arredondo, Maximiliano Cantuarias, Cristian Vega    *
 *                                                                                             *
 *          Fecha de Inicio : 29 de Septiembre de 2026                                      *
 *                                                                                             *
 *     Última Actualización : 02 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   Home -- Contenedor principal de la pantalla de inicio; enruta componentes utilizando el   *
 *        hook useHome.                                                                        *
 *   renderView -- Devuelve el JSX correspondiente al componente que está actualmente visible  *
 *        (Home, Report, etc.).                                                                *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Box } from '@mui/material';
import BottomNav from '../components/BottomNav';
import ReportCancelDialog from '../components/ReportCancelDialog';
import Configuration from './Configuration';
import InfoReport from './InfoReport';
import Report from './Report';
import Profile from './profile';
import HomeScene from '../components/HomeScene';
import { useHome, type NavigationView } from '../control/useHome';
import './Home.css';

interface HomeProps {
  isDarkMode: boolean;
  onToggleManualTheme: () => void;
}

export default function Home({ isDarkMode, onToggleManualTheme }: HomeProps) {
  const {
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
  } = useHome();

  const renderView = (view: NavigationView) => {
    if (view === 'configuration') return <Configuration onBack={() => navigateTo('profile')} />;
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
          onComplete={handleReportComplete}
          onReportCreated={handleReportCreated}
        />
      ) : null;
    }
    if (view === 'profile') return <Profile onSettingsClick={handleOpenConfiguration} />;

    return (
      <HomeScene
        isDarkMode={isDarkMode}
        pullDistance={pullDistance}
        isExpanded={isExpanded}
        hasUnreadNotifications={hasUnreadNotifications}
        notificaciones={notificaciones}
        hasMoreNotifications={hasMoreNotifications}
        isLoadingNotifications={isLoadingNotifications}
        listRef={listRef}
        onToggleManualTheme={onToggleManualTheme}
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

      {!(activeView === 'report' && reportIsComplete) && (
        <Box
          className={`home-bottom-nav${isNavEntering ? ' nav-entering' : ''}`}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) setIsNavEntering(false);
          }}
        >
          <BottomNav
            activeView={activeView === 'report' ? 'report' : activeView === 'profile' || activeView === 'configuration' ? 'profile' : 'home'}
            onHomeClick={handleHomeClick}
            onReportClick={handleReportClick}
            onProfileClick={() => requestNavigation('profile')}
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
