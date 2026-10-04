import React from 'react';
import { Box } from '@mui/material';

interface ViewTransitionProps {
  children: React.ReactNode;
  isActive: boolean;
  direction: 'forward' | 'backward';
  isEntering: boolean;
}

export default function ViewTransition({ children, isActive, direction, isEntering }: ViewTransitionProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        animation: isActive && isEntering
          ? direction === 'forward'
            ? 'slideInRight 380ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
            : 'slideInLeft 380ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
          : 'none',
        transform: !isActive
          ? direction === 'forward'
            ? 'translateX(-30%)'
            : 'translateX(30%)'
          : 'translateX(0)',
        opacity: !isActive ? 0 : 1,
        transition: !isActive ? 'transform 380ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 380ms ease' : 'none',
        pointerEvents: isActive ? 'auto' : 'none',
        zIndex: isActive ? 1 : 0
      }}
      aria-hidden={!isActive}
    >
      {children}
    </Box>
  );
}
