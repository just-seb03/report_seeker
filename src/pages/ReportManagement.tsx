/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                 Programador : Maximiliano Cantuarias                                        *
 *                                                                                             *
 *                 Fecha de Inicio : 05 de Octubre de 2026                                     *
 *                                                                                             *
 *                 Última Actualización :05 de Octubre de 2026 [SA]                            *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 *   ReportManagement -- Vista inicial de gestión de un reporte para prevención.              *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded';
import {
  Box,
  Card,
  Chip,
  IconButton,
  Stack,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import { type IssueReport } from '../database';
import { formatReportDate } from '../control/global/useInfoReport';
import { getTranslatedSeverity, t } from '../control/global/i18n';

interface ReportManagementProps {
  report: IssueReport;
  onBack: () => void;
}

export default function ReportManagement({ report, onBack }: ReportManagementProps) {
  const theme = useTheme();
  const priority = report.priority.toLowerCase();
  const severityPalette = ['alta', 'grave', 'high'].includes(priority)
    ? 'error'
    : ['media', 'moderada', 'medium', 'warning'].includes(priority)
      ? 'warning'
      : 'success';
  const capturedDate = formatReportDate(report.capturedAt);

  return (
    <Box
      component="main"
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        overflowY: 'auto',
        boxSizing: 'border-box',
        px: 2,
        pt: 'max(12px, env(safe-area-inset-top))',
        pb: 'calc(110px + env(safe-area-inset-bottom))',
        bgcolor: 'background.default',
        color: 'text.primary',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <Box
        component="header"
        sx={{ display: 'flex', minHeight: 64, alignItems: 'center', gap: 1.5, mx: 'auto', mb: 2, maxWidth: 560 }}
      >
        <IconButton aria-label={t.common.back} onClick={onBack} sx={{ width: 48, height: 48, flex: '0 0 auto' }}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h1" variant="h6" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
            {t.reportManagement.title}
          </Typography>
        </Box>
      </Box>

      <Stack spacing={2} sx={{ width: '100%', maxWidth: 560, mx: 'auto' }}>
        <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                {t.reportManagement.reportLabel} · #{report.issueId}
              </Typography>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
                {report.title}
              </Typography>
            </Box>

            <Chip
              icon={<PriorityHighRoundedIcon />}
              label={getTranslatedSeverity(report.priority)}
              color={severityPalette}
              sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
            />

            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
                <LocationOnOutlinedIcon color="action" fontSize="small" />
                <Typography variant="body2">{report.location || t.notification.noLocation}</Typography>
              </Stack>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
                <PersonOutlineRoundedIcon color="action" fontSize="small" />
                <Typography variant="body2">{report.workerName || t.notification.unknownWorker}</Typography>
              </Stack>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
                <CalendarMonthOutlinedIcon color="action" fontSize="small" />
                <Typography variant="body2">
                  {capturedDate.date}{capturedDate.time ? ` · ${capturedDate.time}` : ''}
                </Typography>
              </Stack>
            </Stack>

            {report.description && (
              <Box>
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
      </Stack>
    </Box>
  );
}
