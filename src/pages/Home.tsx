// src/pages/Home.tsx
import { Box, Typography } from '@mui/material';
import BottomNav from '../components/BottomNav';

export default function Home() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* Contenedor del texto desplazado hacia arriba (mb: 15) */}
      <Box sx={{ mb: 15 }}> 
        <Typography 
          variant="h3" 
          component="h1" 
          color="text.primary"
          sx={{ fontFamily: 'Ndot, sans-serif', fontWeight: 'bold' }}
        >
          Bienvenido
        </Typography>
      </Box>

      {/* Píldora de navegación */}
      <BottomNav />
    </Box>
  );
}