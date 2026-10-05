/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : ReportSeverityStep.tsx                                        *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 01 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización : 02 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   ReportSeverityStep -- Componente del paso para seleccionar el nivel de gravedad de un     *
 *        riesgo.                                                                              *
 *   updateFromPointer -- Actualiza la gravedad seleccionada basándose en la posición del      *
 *        puntero del usuario.                                                                 *
 *   handleKeyDown -- Permite la selección de gravedad utilizando el teclado (flechas) por     *
 *        accesibilidad.                                                                       *
 *   handlePointerDown -- Maneja el inicio de un evento de puntero (toque o clic) para         *
 *        interactuar.                                                                         *
 *   handlePointerMove -- Calcula la distancia de arrastre del puntero para efectos visuales.  *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Box, Typography, Button, Slider } from '@mui/material';
import { t } from '../control/i18n';


type ReportSeverityStepProps = {
  severity: number;
  options: readonly string[];
  onChange: (severity: number) => void;
  onConfirm: () => void;
};

export default function ReportSeverityStep({ severity, options, onChange, onConfirm }: ReportSeverityStepProps) {
  
  const marks = options.map((label, index) => ({
    value: index,
    label: label,
  }));

  const handleChange = (_event: Event, newValue: number | number[]) => {
    onChange(newValue as number);
  };

  const severityColors = ['success.main', 'warning.main', 'error.main'];

  return (
    <Box component="section" sx={{ display: 'flex', flexDirection: 'column', minHeight: { xs: '66vh', md: 560 }, justifyContent: 'center' }} aria-labelledby="report-severity-heading">
      <Typography variant="h5" id="report-severity-heading" sx={{ fontWeight: 800, textAlign: 'center', mb: 8 }}>
        {t.report.severityHeading}
      </Typography>
      
      <Box sx={{ px: 4, mb: 6 }}>
        <Slider
          aria-label="Gravedad del riesgo"
          value={severity}
          onChange={handleChange}
          step={1}
          marks={marks}
          min={0}
          max={options.length - 1}
          sx={{
            color: severityColors[severity],
            height: 8,
            '& .MuiSlider-markLabel': {
              mt: 1,
              fontWeight: 500,
              color: 'text.secondary'
            },
            '& .MuiSlider-markLabelActive': {
              color: 'text.primary',
              fontWeight: 700
            },
            transition: 'color 0.3s ease'
          }}
        />
      </Box>

      <Typography 
        variant="subtitle1" 
        sx={{ textAlign: 'center', fontWeight: 'bold', color: severityColors[severity], mb: 4, transition: 'color 0.3s ease' }} 
        aria-live="polite"
      >
        {options[severity]}
      </Typography>

      <Button 
        variant="contained" 
        color="primary" 
        onClick={onConfirm}
        fullWidth
        sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
      >
        {t.common.confirm}
      </Button>
    </Box>
  );
}
