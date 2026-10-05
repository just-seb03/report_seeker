/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : ReportHeader.tsx                                                 *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 05 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 05 de Octubre de 2026                                            *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   ReportHeader -- Muestra el título y el botón para volver atrás en la vista de reporte.    *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Box, IconButton, Typography } from '@mui/material';
import { t } from '../../control/global/i18n';

interface ReportHeaderProps {
  onBack: () => void;
}

export default function ReportHeader({ onBack }: ReportHeaderProps) {
  return (
    <Box
      component="header"
      sx={{ display: 'flex', minHeight: 64, alignItems: 'center', gap: 1.5, mx: 'auto', mb: 2, maxWidth: 560 }}
    >
      <IconButton aria-label={t.common.back} onClick={onBack} sx={{ width: 48, height: 48, flex: '0 0 auto' }}>
        <ArrowBackRoundedIcon />
      </IconButton>
      <Box sx={{ minWidth: 0 }}>
        <Typography component="h1" variant="h6" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
          {t.reportManagement.title}
        </Typography>
      </Box>
    </Box>
  );
}
