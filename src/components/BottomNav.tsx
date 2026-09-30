// src/components/BottomNav.tsx
import { useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SummarizeIcon from '@mui/icons-material/Summarize';

export default function BottomNav() {
  const [value, setValue] = useState(0);

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'fixed',
        bottom: 24, // Separación del borde inferior
        left: '50%',
        transform: 'translateX(-50%)', // Centrar horizontalmente
        width: '90%',
        maxWidth: 400,
        borderRadius: 50, // Esto crea el efecto de píldora
        overflow: 'hidden',
        backgroundColor: '#ffffff'
      }}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(_event, newValue) => {
          setValue(newValue);
        }}
        sx={{
          backgroundColor: 'transparent',
          '& .MuiBottomNavigationAction-root': {
            color: '#9e9e9e', // Color gris para los inactivos
            minWidth: 'auto',
            padding: '8px 0',
          },
          '& .Mui-selected': {
            color: '#000000', // Color negro para el seleccionado (Monocromo)
          },
        }}
      >
        {/* El ícono queda arriba y el label abajo automáticamente */}
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Reportar" icon={<AssignmentIcon />} />
        <BottomNavigationAction label="Sumario" icon={<SummarizeIcon />} />
      </BottomNavigation>
    </Paper>
  );
}