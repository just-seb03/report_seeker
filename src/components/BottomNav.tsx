import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import './BottomNav.css';

type BottomNavProps = {
  onHomeClick?: () => void;
  onReportClick?: () => void;
  onProfileClick?: () => void;
};

export default function BottomNav({ onHomeClick, onReportClick, onProfileClick }: BottomNavProps) {
  const [value, setValue] = useState(0);

  const handleHomeClick = () => {
    setValue(0);
    onHomeClick?.();
  };

  const handleReportClick = () => {
    setValue(1);
    onReportClick?.();
  };

  const handleProfileClick = () => {
    setValue(2);
    onProfileClick?.();
  };

  return (
    <Box className="nav-wrapper">
      <Box className="nav-container">
        {/* Capa 1: Fondo blanco con la curva recortada y la sombra inteligente */}
        <Box className="nav-pill-bg" />

        {/* Capa 2: Contenedor de botones reales */}
        <Box className="nav-pill-content">
          <Box
            component="button"
            type="button"
            onClick={handleHomeClick}
            className={`nav-item ${value === 0 ? 'active' : ''}`}
            aria-label="Home"
            aria-pressed={value === 0}
          >
            <Box className="nav-icon-wrap">
              <HomeIcon className="nav-icon" sx={{ fontSize: 26 }} />
            </Box>
            <Typography className="nav-item-text">Home</Typography>
          </Box>

          <Box
            component="button"
            type="button"
            onClick={handleReportClick}
            className={`nav-fab-container ${value === 1 ? 'active' : ''}`}
            aria-label="Reportar"
            aria-pressed={value === 1}
          >
            {/* El botón central flota encima del recorte de la máscara */}
            <Box className="nav-fab">
              <AddIcon className="nav-icon" sx={{ fontSize: 32 }} />
            </Box>
            <Typography className="nav-item-text">Reportar</Typography>
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
            <Typography className="nav-item-text">Perfil</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}