/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : ReportReadyStep.tsx                                           *
 *                                                                                             *
 *              Programador :Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 01 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización :04 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   ReportReadyStep -- Componente del paso final, confirmando que el reporte se ha guardado   *
 *        exitosamente.                                                                        *
 *   handleAnimationEnd -- Ejecuta acciones (como navegar al inicio) tras finalizar una        *
 *        animación de la interfaz.                                                            *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useEffect, useState, type AnimationEvent } from 'react';
import { Box, Typography } from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { t } from '../control/i18n';


type ReportReadyStepProps = {
  onComplete: () => void;
};

export default function ReportReadyStep({ onComplete }: ReportReadyStepProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setIsExiting(true), 1600);
    return () => window.clearTimeout(exitTimer);
  }, []);

  const handleAnimationEnd = (event: AnimationEvent<HTMLElement>) => {
    if (isExiting && event.target === event.currentTarget) onComplete();
  };

  return (
    <Box
      component="section"
      className={`report-ready-step${isExiting ? ' is-exiting' : ''}`}
      role="status"
      aria-live="polite"
      onAnimationEnd={handleAnimationEnd}
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}
    >
      <CheckCircleOutlinedIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
      <Typography variant="h5" sx={{ fontWeight: 800, textAlign: 'center' }}>
        {t.report.readyTitle}
      </Typography>
    </Box>
  );
}
