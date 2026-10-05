/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : SeekieAIDoodles.tsx                                              *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 04 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 04 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   SeekieAIDoodles -- Componente que renderiza un fondo animado decorativo de íconos         *
 *        (doodles) para la página del asistente de IA.                                        *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useMemo } from 'react';
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
    // Reducimos la cantidad para mejorar rendimiento en móviles
    return Array.from({ length: 50 }).map((_, i) => {
      const pseudoRandom1 = (Math.sin(i * 1.23) + 1) / 2;
      const pseudoRandom2 = (Math.cos(i * 3.45) + 1) / 2;
      
      const Icon = icons[i % icons.length];
      const size = 20 + Math.floor(pseudoRandom1 * 30); // Tamaños entre 20 y 50
      const rotate = Math.floor(pseudoRandom2 * 360);
      const offsetX = Math.floor((pseudoRandom1 - 0.5) * 60); 
      const offsetY = Math.floor((pseudoRandom2 - 0.5) * 60); 

      return (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px', // Áreas más grandes para compensar que hay menos iconos
            height: '80px',
            transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotate}deg)`,
            willChange: 'transform',
          }}
        >
          <Icon style={{ fontSize: size }} />
        </div>
      );
    });
  }, []);

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0, 
        overflow: 'hidden', // Este contenedor exacto evita el scroll en el chat area
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: -60, // Este contenedor interno puede desbordarse libremente
          display: 'flex',
          flexWrap: 'wrap',
          alignContent: 'flex-start',
          justifyContent: 'space-evenly',
          opacity: (theme) => theme.palette.mode === 'dark' ? 0.03 : 0.06,
          color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
        }}
      >
        {doodles}
      </Box>
    </Box>
  );
}
