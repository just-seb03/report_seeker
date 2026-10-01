import { useRef } from 'react';
import { Box, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import './HomeHeader.css';

interface HomeHeaderProps {
  isExpanded: boolean;
  onSwipeDown: () => void;
}

export default function HomeHeader({ isExpanded, onSwipeDown }: HomeHeaderProps) {
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;

    const deltaY = event.clientY - start.y;
    const deltaX = Math.abs(event.clientX - start.x);
    if (deltaY > 120 && deltaY > deltaX) onSwipeDown();
  };

  return (
    <Box 
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { pointerStart.current = null; }}
      sx={{ 
        position: 'absolute', top: '12%', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', 
        zIndex: 5,
        pointerEvents: 'auto',
        touchAction: 'none',
        userSelect: 'none',
        opacity: isExpanded ? 0 : 1,
        visibility: isExpanded ? 'hidden' : 'visible',
        transform: isExpanded ? 'scale(0.8) translateY(-40px)' : 'scale(1) translateY(0)',
        transition: 'all 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    > 
      <Typography variant="h3" component="h1" className="header-title">
        Hay<br />Nuevos<br />Reportes
      </Typography>
      
      <KeyboardArrowDownIcon className="header-icon" sx={{ fontSize: 48, pointerEvents: 'none' }} />
    </Box>
  );
}