/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : SeverityEditor.tsx                                               *
 *                                                                                             *
 *              Programador : Maximiliano Cantuarias                                            *
 *                                                                                             *
 *          Fecha de Inicio : 05 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 05 de Octubre de 2026                                            *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   SeverityEditor -- Selector y botón para editar la severidad de un reporte.               *
 *        Deshabilita la edición sin conexión y notifica al padre al guardar correctamente.    *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useState } from 'react';
import { Alert, Button, FormControl, MenuItem, Select, Stack, Typography } from '@mui/material';
import { getTranslatedSeverity, t } from '../../control/global/i18n';

type SeverityOption = 'low' | 'medium' | 'high' | 'current';

function getSeverityOption(priority: string): SeverityOption {
  const normalizedPriority = priority.toLowerCase();
  if (['baja', 'leve', 'low'].includes(normalizedPriority)) return 'low';
  if (['media', 'moderada', 'medium', 'warning'].includes(normalizedPriority)) return 'medium';
  if (['alta', 'grave', 'high'].includes(normalizedPriority)) return 'high';
  return 'current';
}

function getPriority(option: SeverityOption): string {
  if (option === 'low') return t.report.severityLow;
  if (option === 'medium') return t.report.severityMedium;
  return t.report.severityHigh;
}

interface SeverityEditorProps {
  priority: string;
  isOnline: boolean | null;
  isSaving: boolean;
  error: 'offline' | 'save' | null;
  onSave: (priority: string) => Promise<boolean>;
  onSaved: () => void;
}

export default function SeverityEditor({
  priority,
  isOnline,
  isSaving,
  error,
  onSave,
  onSaved
}: SeverityEditorProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityOption>(
    () => getSeverityOption(priority)
  );
  const isDisabled = isOnline !== true || isSaving;

  const handleSave = async () => {
    if (selectedSeverity === 'current' || isDisabled) return;
    const saved = await onSave(getPriority(selectedSeverity));
    if (saved) {
      setSelectedSeverity(getSeverityOption(getPriority(selectedSeverity)));
      onSaved();
    }
  };

  const hasChanged = selectedSeverity !== 'current' && getPriority(selectedSeverity) !== priority;

  return (
    <Stack spacing={2} sx={{ mt: 1, p: 2, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {t.reportManagement.severityLabel}
      </Typography>
      
      <FormControl fullWidth disabled={isDisabled} size="small">
        <Select<SeverityOption>
          id="report-severity"
          value={selectedSeverity}
          onChange={(event) => setSelectedSeverity(event.target.value as SeverityOption)}
          sx={{ fontWeight: 600, borderRadius: 2 }}
        >
          {selectedSeverity === 'current' && (
            <MenuItem value="current">{getTranslatedSeverity(priority)}</MenuItem>
          )}
          <MenuItem value="low">{t.report.severityLow}</MenuItem>
          <MenuItem value="medium">{t.report.severityMedium}</MenuItem>
          <MenuItem value="high">{t.report.severityHigh}</MenuItem>
        </Select>
      </FormControl>
      
      {(isOnline === false || error === 'offline') && (
        <Alert severity="warning" sx={{ py: 0, px: 2, borderRadius: 2 }}>{t.reportManagement.severityOffline}</Alert>
      )}
      {error === 'save' && (
        <Alert severity="error" sx={{ py: 0, px: 2, borderRadius: 2 }}>{t.reportManagement.saveSeverityError}</Alert>
      )}
      
      {hasChanged && (
        <Button
          variant="contained"
          disabled={isDisabled}
          onClick={handleSave}
          fullWidth
          disableElevation
          sx={{ fontWeight: 600, borderRadius: 2, textTransform: 'none' }}
        >
          {t.reportManagement.saveSeverity}
        </Button>
      )}
    </Stack>
  );
}
