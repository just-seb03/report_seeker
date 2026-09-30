import { Box, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import './HomeHeader.css'; // <-- Importamos su CSS exclusivo

interface HomeHeaderProps {
  isExpanded: boolean;
}

export default function HomeHeader({ isExpanded }: HomeHeaderProps) {
  return (
    <Box 
      sx={{ 
        position: 'absolute', top: '12%', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', 
        zIndex: 0, pointerEvents: 'none', 
        opacity: isExpanded ? 0 : 1,
        transform: isExpanded ? 'scale(0.8) translateY(-40px)' : 'scale(1) translateY(0)',
        transition: 'all 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    > 
      <Typography variant="h3" component="h1" className="header-title">
        Hay<br />Nuevos<br />Reportes
      </Typography>
      
      {/* Usamos className para aplicar la animación CSS */}
      <KeyboardArrowDownIcon className="header-icon" sx={{ fontSize: 48 }} />
    </Box>
  );
}