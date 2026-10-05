/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : ReportTextStep.tsx                                            *
 *                                                                                             *
 *              Programador :Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 01 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización :04 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   ReportTextStep -- Componente genérico de paso que captura texto (título, descripción,     *
 *        ubicación).                                                                          *
 *   handleSubmit -- Procesa y valida la información capturada, procediendo a guardar el       *
 *        reporte en la base de datos.                                                         *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import type { FormEvent } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { t } from '../../control/global/i18n';


type ReportTextStepProps = {
  field: 'description' | 'location' | 'title';
  heading: string;
  value: string;
  placeholder: string;
  maxLength: number;
  multiline?: boolean;
  errorMessage?: string;
  isBusy?: boolean;
  onChange: (value: string) => void;
  onConfirm: () => void;
};

export default function ReportTextStep({
  field,
  heading,
  value,
  placeholder,
  maxLength,
  multiline = false,
  errorMessage,
  isBusy = false,
  onChange,
  onConfirm,
}: ReportTextStepProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onConfirm();
  };

  return (
    <Box component="section" sx={{ display: 'flex', flexDirection: 'column', minHeight: { xs: '66vh', md: 560 }, justifyContent: 'center' }} aria-labelledby={`report-${field}-heading`}>
      <Typography variant="h5" id={`report-${field}-heading`} sx={{ fontWeight: 800, textAlign: 'center', mb: 4 }}>
        {heading}
      </Typography>
      <Box component="form" autoComplete="off" onSubmit={handleSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          id={`report-${field}`}
          variant="outlined"
          fullWidth
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          multiline={multiline}
          rows={multiline ? 5 : 1}
          required
          autoFocus
          slotProps={{ htmlInput: { maxLength } }}
          error={!!errorMessage}
          helperText={errorMessage || (multiline ? `${value.length} / ${maxLength}` : undefined)}
          sx={{ 
            '& .MuiInputBase-root': { 
              borderRadius: 2, 
              backgroundColor: 'background.paper',
              padding: multiline ? '12px 16px' : undefined
            },
            '& .MuiOutlinedInput-input': {
              paddingLeft: multiline ? undefined : '16px',
              paddingRight: multiline ? undefined : '16px'
            }
          }}
        />
        <Button 
          variant="contained" 
          color="primary" 
          type="submit" 
          disabled={!value.trim() || isBusy}
          sx={{ mt: 2, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
        >
          {isBusy ? t.report.textSaving : t.report.textAccept}
        </Button>
      </Box>
    </Box>
  );
}
