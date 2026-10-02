import { Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import './BottomNav.css';

type BottomNavProps = {
  activeView: 'home' | 'report' | 'profile';
  onHomeClick?: () => void;
  onReportClick?: () => void;
  onProfileClick?: () => void;
};

export default function BottomNav({ activeView, onHomeClick, onReportClick, onProfileClick }: BottomNavProps) {
  const value = activeView === 'report' ? 0 : activeView === 'profile' ? 2 : 1;

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
            onClick={handleHomeClick}
            className={`nav-item ${activeView === 'home' ? 'active' : ''}`}
            aria-label="Inicio"
            aria-pressed={activeView === 'home'}
          >
            <Box className="nav-icon-wrap">
              <HomeIcon className="nav-icon" sx={{ fontSize: 26 }} />
            </Box>
            <span className="nav-item-text">Inicio</span>
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
  );
}