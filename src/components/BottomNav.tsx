import { useState } from 'react';
import { Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import './BottomNav.css';

type BottomNavProps = {
  onHomeClick?: () => void;
  onReportClick?: () => void;
  onProfileClick?: () => void;
};

export default function BottomNav({ onHomeClick, onReportClick, onProfileClick }: BottomNavProps) {
  const [value, setValue] = useState(1);

  const handleHomeClick = () => {
    setValue(1);
    onHomeClick?.();
  };

  const handleReportClick = () => {
    setValue(0);
    onReportClick?.();
  };

  const handleProfileClick = () => {
    setValue(2);
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
            className={`nav-item ${value === 0 ? 'active' : ''}`}
            aria-label="Reportar"
            aria-pressed={value === 0}
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
            className={`nav-item ${value === 1 ? 'active' : ''}`}
            aria-label="Inicio"
            aria-pressed={value === 1}
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
            className={`nav-item ${value === 2 ? 'active' : ''}`}
            aria-label="Perfil"
            aria-pressed={value === 2}
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