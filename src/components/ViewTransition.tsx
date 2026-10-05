import React from 'react';
import { Box } from '@mui/material';

interface ViewTransitionProps {
  children: React.ReactNode;
  isActive: boolean;
  direction: 'forward' | 'backward';
  isTransitioning: boolean;
}

export default function ViewTransition({ children, isActive, direction, isTransitioning }: ViewTransitionProps) {
  let animationName = 'none';

  if (isTransitioning) {
    if (isActive) {
      animationName = direction === 'forward' ? 'slideInRight' : 'slideInLeft';
    } else {
      animationName = direction === 'forward' ? 'slideOutLeft' : 'slideOutRight';
    }
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        animation: animationName !== 'none'
          ? `${animationName} 380ms cubic-bezier(0.25, 1, 0.5, 1) forwards`
          : 'none',
        pointerEvents: isActive ? 'auto' : 'none',
        zIndex: isActive ? 1 : 0,
        opacity: isTransitioning ? undefined : (isActive ? 1 : 0),
        bgcolor: 'background.default'
      }}
      aria-hidden={!isActive}
    >
      {children}
    </Box>
  );
}
