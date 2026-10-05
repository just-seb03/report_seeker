/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : FollowUpCard.tsx                                                 *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 05 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 05 de Octubre de 2026                                            *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   FollowUpCard -- Aísla la tarjeta informativa de seguimiento del reporte.                  *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import { Box, Card, Stack, Typography, alpha, useTheme } from '@mui/material';
import { t } from '../../control/global/i18n';

export default function FollowUpCard() {
  const theme = useTheme();
  
  return (
    <Card
      variant="outlined"
      component="section"
      aria-labelledby="report-follow-up-heading"
      sx={{ p: 2.5, borderRadius: 3 }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: 'primary.main'
            }}
          >
            <AssignmentOutlinedIcon />
          </Box>
          <Typography id="report-follow-up-heading" variant="h6" component="h2" sx={{ fontWeight: 700 }}>
            {t.reportManagement.followUpTitle}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {t.reportManagement.followUpPlaceholder}
        </Typography>
      </Stack>
    </Card>
  );
}
