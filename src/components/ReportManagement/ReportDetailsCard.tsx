/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : ReportDetailsCard.tsx                                            *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 05 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 05 de Octubre de 2026                                            *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   ReportDetailsCard -- Centraliza la información del reporte y el selector de severidad.    *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import { Box, Card, Stack, Typography } from '@mui/material';
import { type IssueReport } from '../../database';
import { formatReportDate } from '../../control/global/useInfoReport';
import { t } from '../../control/global/i18n';
import SeverityEditor from './SeverityEditor';

interface ReportDetailsCardProps {
  report: IssueReport;
  priority: string;
  isOnline: boolean | null;
  isSavingSeverity: boolean;
  severitySaveError: 'offline' | 'save' | null;
  saveSeverity: (newPriority: string) => Promise<boolean>;
  onSeveritySaved: () => void;
}

export default function ReportDetailsCard({
  report,
  priority,
  isOnline,
  isSavingSeverity,
  severitySaveError,
  saveSeverity,
  onSeveritySaved
}: ReportDetailsCardProps) {
  const capturedDate = formatReportDate(report.capturedAt);

  return (
    <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="overline" color="text.secondary">
            {t.reportManagement.reportLabel} · #{report.issueId}
          </Typography>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
            {report.title}
          </Typography>
        </Box>

        <SeverityEditor
          priority={priority}
          isOnline={isOnline}
          isSaving={isSavingSeverity}
          error={severitySaveError}
          onSave={saveSeverity}
          onSaved={onSeveritySaved}
        />

        <Stack spacing={1.5} sx={{ pt: 1 }}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
            <LocationOnOutlinedIcon color="action" fontSize="small" />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{report.location || t.notification.noLocation}</Typography>
          </Stack>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
            <PersonOutlineRoundedIcon color="action" fontSize="small" />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{report.workerName || t.notification.unknownWorker}</Typography>
          </Stack>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
            <CalendarMonthOutlinedIcon color="action" fontSize="small" />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {capturedDate.date}{capturedDate.time ? ` · ${capturedDate.time}` : ''}
            </Typography>
          </Stack>
        </Stack>

        {report.description && (
          <Box sx={{ mt: 1, p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
              {t.reportManagement.descriptionLabel}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
              {report.description}
            </Typography>
          </Box>
        )}
      </Stack>
    </Card>
  );
}
