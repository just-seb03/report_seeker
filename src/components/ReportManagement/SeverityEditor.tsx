/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : SeverityEditor.tsx                                               *
 *                                                                                             *
 *              Programador : Equipo Report Seeker                                             *
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
import { Alert, Button, FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
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

  return (
    <Stack spacing={1.5}>
      <FormControl fullWidth disabled={isDisabled}>
        <InputLabel id="report-severity-label">{t.reportManagement.severityLabel}</InputLabel>
        <Select<SeverityOption>
          labelId="report-severity-label"
          id="report-severity"
          value={selectedSeverity}
          label={t.reportManagement.severityLabel}
          onChange={(event) => setSelectedSeverity(event.target.value)}
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
        <Alert severity="warning">{t.reportManagement.severityOffline}</Alert>
      )}
      {error === 'save' && (
        <Alert severity="error">{t.reportManagement.saveSeverityError}</Alert>
      )}
      <Button
        variant="contained"
        disabled={isDisabled || selectedSeverity === 'current'}
        onClick={handleSave}
      >
        {t.reportManagement.saveSeverity}
      </Button>
    </Stack>
  );
}
