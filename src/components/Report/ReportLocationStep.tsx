import { useState, useEffect, type FormEvent } from 'react';
import { Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, FormHelperText, CircularProgress } from '@mui/material';
import { t } from '../../control/global/i18n';
import { getUbicaciones, type Ubicacion } from '../../database';

type ReportLocationStepProps = {
  valueId?: number;
  errorMessage?: string;
  isBusy?: boolean;
  onChange: (id: number, name: string) => void;
  onConfirm: () => void;
};

export default function ReportLocationStep({
  valueId,
  errorMessage,
  isBusy = false,
  onChange,
  onConfirm,
}: ReportLocationStepProps) {
  const [locations, setLocations] = useState<Ubicacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getUbicaciones()
      .then((data) => {
        if (mounted) {
          setLocations(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load locations', err);
        if (mounted) setIsLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (valueId !== undefined) {
      onConfirm();
    }
  };

  const handleSelect = (event: any) => {
    const selectedId = event.target.value as number;
    const selectedLoc = locations.find(l => l.id === selectedId);
    if (selectedLoc) {
      onChange(selectedLoc.id, selectedLoc.nombre);
    }
  };

  return (
    <Box component="section" sx={{ display: 'flex', flexDirection: 'column', minHeight: { xs: '66vh', md: 560 }, justifyContent: 'center' }} aria-labelledby="report-location-heading">
      <Typography variant="h5" id="report-location-heading" sx={{ fontWeight: 800, textAlign: 'center', mb: 4 }}>
        {t.report.locationHeading || 'Ubicación'}
      </Typography>
      <Box component="form" autoComplete="off" onSubmit={handleSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <FormControl fullWidth error={!!errorMessage}>
            <InputLabel id="location-select-label">Selecciona la ubicación</InputLabel>
            <Select
              labelId="location-select-label"
              id="location-select"
              value={valueId || ''}
              label="Selecciona la ubicación"
              onChange={handleSelect}
              required
              sx={{
                borderRadius: 2,
                backgroundColor: 'background.paper',
                textAlign: 'left'
              }}
            >
              {locations.map((loc) => (
                <MenuItem key={loc.id} value={loc.id}>
                  {loc.nombre}
                </MenuItem>
              ))}
            </Select>
            {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
          </FormControl>
        )}

        <Button 
          variant="contained" 
          color="primary" 
          type="submit" 
          disabled={valueId === undefined || isBusy || isLoading}
          sx={{ mt: 2, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
        >
          {isBusy ? t.report.textSaving : t.report.textAccept}
        </Button>
      </Box>
    </Box>
  );
}
