/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : ReportSummaryStep.tsx                                         *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 01 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización : 02 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   ReportSummaryStep -- Componente del paso de resumen, permite revisar todos los datos      *
 *        antes de enviar.                                                                     *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Box, Typography, Button, Card, CardActionArea, CardMedia, CardContent, List, ListItem, ListItemButton, ListItemText } from '@mui/material';

export type EditableReportStep = 'photo' | 'severity' | 'description' | 'location' | 'title';

type ReportSummaryStepProps = {
  photoUrl: string;
  severity: string;
  description: string;
  location: string;
  title: string;
  errorMessage?: string;
  isSaving: boolean;
  onEdit: (step: EditableReportStep) => void;
  onConfirm: () => void;
};

const summaryFields: { step: EditableReportStep; label: string; valueKey: 'title' | 'severity' | 'description' | 'location' }[] = [
  { step: 'title', label: 'Título', valueKey: 'title' },
  { step: 'severity', label: 'Gravedad', valueKey: 'severity' },
  { step: 'description', label: 'Descripción', valueKey: 'description' },
  { step: 'location', label: 'Ubicación', valueKey: 'location' },
];

export default function ReportSummaryStep({
  photoUrl,
  severity,
  description,
  location,
  title,
  errorMessage,
  isSaving,
  onEdit,
  onConfirm,
}: ReportSummaryStepProps) {
  const values = { title, severity, description, location };

  return (
    <Box component="section" sx={{ display: 'flex', flexDirection: 'column', pb: 2 }} aria-labelledby="report-summary-heading">
      <Typography variant="h5" id="report-summary-heading" sx={{ fontWeight: 800, textAlign: 'center', mb: 4, mt: 4 }}>
        Revisa tu reporte
      </Typography>

      <Card sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }} variant="outlined">
        <CardActionArea onClick={() => onEdit('photo')} aria-label="Editar fotografía">
          <CardMedia
            component="img"
            height="150"
            image={photoUrl}
            alt="Fotografía del riesgo"
            sx={{ backgroundColor: 'action.hover', objectFit: 'cover' }}
          />
          <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Fotografía</Typography>
            <EditOutlinedIcon color="action" fontSize="small" />
          </CardContent>
        </CardActionArea>
      </Card>

      <List disablePadding sx={{ borderTop: 1, borderColor: 'divider', mb: 4 }}>
        {summaryFields.map(({ step, label, valueKey }) => (
          <ListItem key={step} disablePadding sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <ListItemButton onClick={() => onEdit(step)} aria-label={`Editar ${label.toLowerCase()}`}>
              <ListItemText
                primary={<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>{label}</Typography>}
                secondary={<Typography variant="body2" color="text.primary" sx={{ overflowWrap: 'anywhere' }}>{values[valueKey]}</Typography>}
              />
              <EditOutlinedIcon color="action" fontSize="small" />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {errorMessage && <Typography color="error" variant="body2" sx={{ textAlign: 'center', mb: 2 }} role="alert">{errorMessage}</Typography>}

      <Button
        variant="contained"
        color="primary"
        onClick={onConfirm}
        disabled={isSaving}
        fullWidth
        sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
      >
        {isSaving ? 'Guardando...' : 'Confirmar reporte'}
      </Button>
    </Box>
  );
}
