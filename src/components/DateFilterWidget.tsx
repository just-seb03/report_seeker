/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : DateFilterWidget.tsx                                             *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 05 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 05 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   DateFilterWidget -- Componente para seleccionar un rango de fechas con opciones rápidas y *
 *            una opción personalizada con un calendario nativo.                               *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useState } from 'react';
import { 
  Box, 
  Chip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  useTheme
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { t } from '../control/i18n';

export type DateFilterType = 'today' | 'yesterday' | 'week' | 'month' | 'all' | 'custom';
export interface DateRange {
  from: string;
  to: string;
}

interface DateFilterWidgetProps {
  currentFilter: DateFilterType;
  customRange: DateRange;
  onChange: (filter: DateFilterType, range?: DateRange) => void;
}

export default function DateFilterWidget({ currentFilter, customRange, onChange }: DateFilterWidgetProps) {
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange>(customRange || { from: '', to: '' });

  const options: { value: DateFilterType; label: string }[] = [
    { value: 'all', label: t.summary.filterAll },
    { value: 'today', label: t.summary.filterToday },
    { value: 'yesterday', label: t.summary.filterYesterday },
    { value: 'week', label: t.summary.filterWeek },
    { value: 'month', label: t.summary.filterMonth },
    { value: 'custom', label: t.summary.filterCustom },
  ];

  const handleChipClick = (value: DateFilterType) => {
    if (value === 'custom') {
      setDialogOpen(true);
    } else {
      onChange(value);
    }
  };

  const handleApplyCustom = () => {
    setDialogOpen(false);
    onChange('custom', tempRange);
  };

  return (
    <Box sx={{ width: '100%', mb: 2, mt: 2 }}>
      {/* Scroll horizontal para las opciones */}
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 1, 
          overflowX: 'auto', 
          px: 2, 
          pb: 1,
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none'
        }}
      >
        {options.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            onClick={() => handleChipClick(opt.value)}
            color={currentFilter === opt.value ? 'primary' : 'default'}
            variant={currentFilter === opt.value ? 'filled' : 'outlined'}
            icon={opt.value === 'custom' ? <CalendarTodayIcon fontSize="small" /> : undefined}
            sx={{ 
              fontWeight: currentFilter === opt.value ? 700 : 500,
              borderRadius: '12px',
              px: 0.5
            }}
          />
        ))}
      </Box>

      {/* Modal para rango personalizado usando inputs nativos tipo 'date' */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: 'text.primary' }}>
          {t.summary.filterCustom}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <TextField
            label={t.summary.dateFrom}
            type="date"
            value={tempRange.from}
            onChange={(e) => setTempRange(prev => ({ ...prev, from: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label={t.summary.dateTo}
            type="date"
            value={tempRange.to}
            onChange={(e) => setTempRange(prev => ({ ...prev, to: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
            {t.summary.cancel}
          </Button>
          <Button onClick={handleApplyCustom} variant="contained" sx={{ borderRadius: '12px', px: 3, fontWeight: 700 }}>
            {t.summary.apply}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
