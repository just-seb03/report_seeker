/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : ReportPhotoStep.tsx                                           *
 *                                                                                             *
 *              Programador :Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 01 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización :04 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   ReportPhotoStep -- Componente del paso inicial de creación de reporte para mostrar o      *
 *        tomar una fotografía.                                                                *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { t } from '../control/i18n';


type ReportPhotoStepProps = {
  photoUrl: string;
  isRetakingPhoto: boolean;
  onRetakePhoto: () => void;
  onConfirm: () => void;
};

export default function ReportPhotoStep({
  photoUrl,
  isRetakingPhoto,
  onRetakePhoto,
  onConfirm,
}: ReportPhotoStepProps) {
  return (
    <Box component="section" sx={{ display: 'flex', flexDirection: 'column' }} aria-labelledby="report-photo-question">
      <Paper 
        elevation={0}
        sx={{ 
          width: '100%', 
          height: { xs: '46vh', md: 420 },
          minHeight: 190,
          overflow: 'hidden',
          borderRadius: 3,
          bgcolor: 'action.hover',
          border: 1,
          borderColor: 'divider',
          display: 'grid',
          placeItems: 'center'
        }}
      >
        <Box 
          component="img" 
          src={photoUrl} 
          alt="Fotografía seleccionada para el reporte" 
          sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </Paper>
      
      <Typography variant="h5" id="report-photo-question" sx={{ fontWeight: 800, textAlign: 'center', mt: 4, mb: 3 }}>
        {t.report.photoConfirm}
      </Typography>
      
      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
        <Button 
          variant="outlined" 
          color="inherit" 
          onClick={onRetakePhoto} 
          disabled={isRetakingPhoto}
          fullWidth
          sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
        >
          {isRetakingPhoto ? t.report.photoOpening : t.report.photoNo}
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onConfirm} 
          disabled={isRetakingPhoto}
          fullWidth
          sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
        >
          {t.report.photoYes}
        </Button>
      </Stack>
    </Box>
  );
}
