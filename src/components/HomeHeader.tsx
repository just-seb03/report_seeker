import { Box, Typography } from '@mui/material';
import { keyframes } from '@emotion/react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const bounceSwipe = keyframes`
  0% { transform: translateY(0); animation-timing-function: ease-in; }
  15% { transform: translateY(20px); animation-timing-function: ease-out; }
  100% { transform: translateY(0); }
`;

interface HomeHeaderProps {
  isExpanded: boolean;
}

export default function HomeHeader({ isExpanded }: HomeHeaderProps) {
  return (
    <Box 
      sx={{ 
        position: 'absolute',
        top: '12%', 
        left: 0,
        right: 0,
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        zIndex: 0,
        opacity: isExpanded ? 0 : 1,
        transform: isExpanded ? 'scale(0.8) translateY(-40px)' : 'scale(1) translateY(0)',
        transition: 'all 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
        pointerEvents: 'none', 
      }}
    > 
      <Typography variant="h3" component="h1" color="text.primary" sx={{ textAlign: 'center', mb: 3 }}>
        Hay<br />Nuevos<br />Reportes
      </Typography>
      <KeyboardArrowDownIcon sx={{ fontSize: 48, color: 'text.secondary', animation: `${bounceSwipe} 2.5s infinite` }} />
    </Box>
  );
}