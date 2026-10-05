/***********************************************************************************************
 *                               C O N F I D E N T I A L  ---  M C S                           *
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : ReportProgressBar.tsx                                            *
 *                                                                                             *
 *              Programador :Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 03 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización :04 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   ReportProgressBar -- Componente visual que renderiza una barra indicadora del progreso en *
 *        el flujo de creación de un reporte.                                                  *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Box } from '@mui/material';
import { type ReportStep } from '../../control/Report/useReport';

const stepsOrder: ReportStep[] = ['photo', 'severity', 'description', 'location', 'title', 'summary'];

interface ReportProgressBarProps {
  currentStep: ReportStep;
}

export default function ReportProgressBar({ currentStep }: ReportProgressBarProps) {
  if (currentStep === 'ready') return null;

  const currentIndex = stepsOrder.indexOf(currentStep);

  return (
    <Box 
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        padding: 'calc(16px + env(safe-area-inset-top)) 24px 16px',
        zIndex: 20,
        pointerEvents: 'none',
        boxSizing: 'border-box'
      }}
    >
      <Box 
        sx={{
          display: 'flex',
          gap: 1,
          width: 'min(100%, 560px)',
          mx: 'auto',
          height: 4
        }}
      >
        {stepsOrder.map((step, index) => {
          const isActive = index <= currentIndex;
          return (
            <Box
              key={step}
              sx={{
                flex: 1,
                borderRadius: 1,
                bgcolor: isActive ? 'primary.main' : 'action.disabledBackground',
                transition: 'background-color 0.4s ease, transform 0.4s ease'
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
