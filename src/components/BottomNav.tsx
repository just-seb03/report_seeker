/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : BottomNav.tsx                                                 *
 *                                                                                             *
 *              Programador : Sebastian Arredondo, Maximiliano Cantuarias                   *
 *                                                                                             *
 *          Fecha de Inicio : 29 de Septiembre de 2026                                      *
 *                                                                                             *
 *     Última Actualización : 02 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   BottomNav -- Renderiza la barra de navegación inferior de la aplicación.                  *
 *   handleHomeClick -- Navega hacia la pantalla de inicio principal.                          *
 *   handleReportClick -- Inicia el flujo de creación de un nuevo reporte fotográfico.         *
 *   handleProfileClick -- Navega hacia la pantalla del perfil del usuario.                    *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import './BottomNav.css';

type BottomNavProps = {
  activeView: 'home' | 'report' | 'profile' | 'cola' | 'seekie';
  onHomeClick?: () => void;
  onReportClick?: () => void;
  onProfileClick?: () => void;
  onColaClick?: () => void;
  onSeekieClick?: () => void;
};

export default function BottomNav({ activeView, onHomeClick, onReportClick, onProfileClick, onColaClick, onSeekieClick }: BottomNavProps) {
  const value = 
    activeView === 'report' ? 0 : 
    activeView === 'cola' ? 1 : 
    activeView === 'home' ? 2 : 
    activeView === 'seekie' ? 3 : 
    activeView === 'profile' ? 4 : 2;

  const handleHomeClick = () => {
    onHomeClick?.();
  };

  const handleReportClick = () => {
    onReportClick?.();
  };

  const handleProfileClick = () => {
    onProfileClick?.();
  };

  return (
    <Box className="nav-wrapper">
      <Box className="nav-container">
        {/* Capa 1: Fondo sólido principal de la barra */}
        <Box className="nav-pill-bg" />

        <Box className="nav-inner">
          {/* Capa 2: La "isla líquida" que viaja animada al botón seleccionado */}
          <Box
            className="indicator-wrapper"
            style={{ transform: `translateX(${value * 100}%)` }}
          >
            <Box className="nav-indicator" />
          </Box>

          {/* Capa 3: Contenedor de botones reales */}
          <Box className="nav-pill-content">

          <Box
            component="button"
            type="button"
            onClick={handleReportClick}
            className={`nav-item ${activeView === 'report' ? 'active' : ''}`}
            aria-label="Reportar"
            aria-pressed={activeView === 'report'}
          >
            <Box className="nav-icon-wrap">
              <AssignmentOutlinedIcon className="nav-icon" sx={{ fontSize: 28 }} />
            </Box>
            <span className="nav-item-text">Reportar</span>
          </Box>

          <Box
            component="button"
            type="button"
            onClick={onColaClick}
            className={`nav-item ${activeView === 'cola' ? 'active' : ''}`}
            aria-label="Cola"
            aria-pressed={activeView === 'cola'}
          >
            <Box className="nav-icon-wrap">
              <AccessTimeOutlinedIcon className="nav-icon" sx={{ fontSize: 26 }} />
            </Box>
            <span className="nav-item-text">Cola</span>
          </Box>

          <Box
            component="button"
            type="button"
            onClick={handleHomeClick}
            className={`nav-item ${activeView === 'home' ? 'active' : ''}`}
            aria-label="Inicio"
            aria-pressed={activeView === 'home'}
          >
            <Box className="nav-icon-wrap">
              <HomeIcon className="nav-icon" sx={{ fontSize: 30 }} />
            </Box>
            <span className="nav-item-text">Inicio</span>
          </Box>

          <Box
            component="button"
            type="button"
            onClick={onSeekieClick}
            className={`nav-item ${activeView === 'seekie' ? 'active' : ''}`}
            aria-label="Seekie AI"
            aria-pressed={activeView === 'seekie'}
          >
            <Box className="nav-icon-wrap">
              <ChatOutlinedIcon className="nav-icon" sx={{ fontSize: 26 }} />
            </Box>
            <span className="nav-item-text">Seekie AI</span>
          </Box>

          <Box
            component="button"
            type="button"
            onClick={handleProfileClick}
            className={`nav-item ${activeView === 'profile' ? 'active' : ''}`}
            aria-label="Perfil"
            aria-pressed={activeView === 'profile'}
          >
            <Box className="nav-icon-wrap">
              <PersonIcon className="nav-icon" sx={{ fontSize: 26 }} />
            </Box>
            <span className="nav-item-text">Perfil</span>
          </Box>

        </Box>
        </Box>
      </Box>
    </Box>
  );
}
