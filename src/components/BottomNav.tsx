import { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';

export default function BottomNav() {
  const [value, setValue] = useState(0);

  return (
    <Box 
      sx={{ 
        position: 'fixed', 
        bottom: 24, 
        left: 0, 
        right: 0, 
        display: 'flex', 
        justifyContent: 'center', 
        zIndex: 50, 
        px: 2 // Margen lateral de seguridad para pantallas pequeñas
      }}
    >
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: 360,
          height: 72,
          borderRadius: 36, // Píldora perfectamente redondeada
          px: 3,
          backgroundColor: '#ffffff',
          boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.08)', // Sombra mucho más suave, difuminada y moderna
        }}
      >
        {/* BOTÓN IZQUIERDO: HOME */}
        <Box
          onClick={() => setValue(0)}
          sx={{
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center',
            cursor: 'pointer', flex: 1, height: 50,
            color: value === 0 ? '#000000' : '#9e9e9e',
            transition: 'color 0.2s ease',
          }}
        >
          <HomeIcon sx={{ fontSize: 28, mb: 0.5 }} />
          <Typography variant="caption" sx={{ fontWeight: value === 0 ? 700 : 500, fontSize: '0.7rem' }}>
            Home
          </Typography>
        </Box>

        {/* BOTÓN CENTRAL: REPORTAR (Sobresale hacia arriba) */}
        <Box
          onClick={() => setValue(1)}
          sx={{
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center',
            cursor: 'pointer', flex: 1.2, height: 50, position: 'relative'
          }}
        >
          {/* Círculo oscuro flotante */}
          <Box
            sx={{
              position: 'absolute',
              top: -32, // Sube para romper el límite superior de la píldora
              backgroundColor: '#111111',
              color: '#ffffff',
              width: 56,
              height: 56,
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)', // Le da su propia profundidad
              transition: 'transform 0.1s ease',
              '&:active': { transform: 'scale(0.92)' } // Efecto táctil nativo al presionarlo
            }}
          >
            <AddIcon sx={{ fontSize: 32 }} />
          </Box>
          
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: value === 1 ? 700 : 500, 
              color: value === 1 ? '#000000' : '#9e9e9e',
              fontSize: '0.7rem'
            }}
          >
            Reportar
          </Typography>
        </Box>

        {/* BOTÓN DERECHO: PERFIL */}
        <Box
          onClick={() => setValue(2)}
          sx={{
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center',
            cursor: 'pointer', flex: 1, height: 50,
            color: value === 2 ? '#000000' : '#9e9e9e',
            transition: 'color 0.2s ease',
          }}
        >
          <PersonIcon sx={{ fontSize: 28, mb: 0.5 }} />
          <Typography variant="caption" sx={{ fontWeight: value === 2 ? 700 : 500, fontSize: '0.7rem' }}>
            Perfil
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}