import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import EngineeringIcon from '@mui/icons-material/Engineering';
import BuildIcon from '@mui/icons-material/Build';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BoltIcon from '@mui/icons-material/Bolt';
import ConstructionIcon from '@mui/icons-material/Construction';
import DescriptionIcon from '@mui/icons-material/Description';

const icons = [
  ChatIcon, SupportAgentIcon, WarningAmberIcon, AssignmentIcon, CloudDoneIcon,
  VerifiedUserIcon, LocationOnIcon, PhotoCameraIcon, NotificationsActiveIcon,
  EngineeringIcon, BuildIcon, AssessmentIcon, BoltIcon, ConstructionIcon, DescriptionIcon
];

export default function SeekieAIDoodles() {
  const doodles = useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => {
      // Usar pseudo-aleatoriedad basada en el índice para que sea consistente en renderizados
      const pseudoRandom1 = (Math.sin(i * 1.23) + 1) / 2;
      const pseudoRandom2 = (Math.cos(i * 3.45) + 1) / 2;
      
      const Icon = icons[i % icons.length];
      const size = 20 + Math.floor(pseudoRandom1 * 24); // Tamaños entre 20 y 44
      const rotate = Math.floor(pseudoRandom2 * 360);
      const offsetX = Math.floor((pseudoRandom1 - 0.5) * 40); // Desfase X -20 a +20
      const offsetY = Math.floor((pseudoRandom2 - 0.5) * 40); // Desfase Y -20 a +20

      return (
        <Box
          key={i}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotate}deg)`,
          }}
        >
          <Icon sx={{ fontSize: size }} />
        </Box>
      );
    });
  }, []);

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: -40, // Extendemos el inset para que no se corten los bordes por los offsets
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'flex-start',
        justifyContent: 'space-evenly',
        // Opacidad muy baja para que sea un patrón sutil de fondo
        opacity: (theme) => theme.palette.mode === 'dark' ? 0.03 : 0.06,
        color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
      }}
    >
      {doodles}
    </Box>
  );
}
