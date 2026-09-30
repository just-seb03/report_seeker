import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import './BottomNav.css'; // <-- Importamos su CSS exclusivo

export default function BottomNav() {
  const [value, setValue] = useState(0);

  return (
    <Box className="nav-wrapper">
      <Box className="nav-pill">
        
        {/* BOTÓN IZQUIERDO: HOME */}
        <Box onClick={() => setValue(0)} className={`nav-item ${value === 0 ? 'active' : ''}`}>
          <HomeIcon sx={{ fontSize: 28 }} />
          <Typography className="nav-item-text">Home</Typography>
        </Box>

        {/* BOTÓN CENTRAL: REPORTAR */}
        <Box onClick={() => setValue(1)} className="nav-fab-container">
          <Box className="nav-fab">
            <AddIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography className={`nav-item-text ${value === 1 ? 'active' : ''}`} sx={{ color: value === 1 ? 'inherit' : '#9e9e9e' }}>
            Reportar
          </Typography>
        </Box>

        {/* BOTÓN DERECHO: PERFIL */}
        <Box onClick={() => setValue(2)} className={`nav-item ${value === 2 ? 'active' : ''}`}>
          <PersonIcon sx={{ fontSize: 28 }} />
          <Typography className="nav-item-text">Perfil</Typography>
        </Box>
        
      </Box>
    </Box>
  );
}