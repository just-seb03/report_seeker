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
 *   ReportManagement -- Muestra los datos del reporte y coordina la edición de severidad.    *
 *        Al guardar correctamente, solicita volver a la vista de inicio.                     *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Box, Stack } from '@mui/material';
import { type IssueReport } from '../database';
import { useReportManagement } from '../control/ReportManagement/useReportManagement';
import ReportHeader from '../components/ReportManagement/ReportHeader';
import ReportDetailsCard from '../components/ReportManagement/ReportDetailsCard';
import FollowUpCard from '../components/ReportManagement/FollowUpCard';

interface ReportManagementProps {
  report: IssueReport;
  onBack: () => void;
  onSeveritySaved: () => void;
}

export default function ReportManagement({ report, onBack, onSeveritySaved }: ReportManagementProps) {
  const { priority, isOnline, isSavingSeverity, severitySaveError, saveSeverity } = useReportManagement(report);

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
      <ReportHeader onBack={onBack} />

      <Stack spacing={2.5} sx={{ width: '100%', maxWidth: 560, mx: 'auto' }}>
        <ReportDetailsCard
          report={report}
          priority={priority}
          isOnline={isOnline}
          isSavingSeverity={isSavingSeverity}
          severitySaveError={severitySaveError}
          saveSeverity={saveSeverity}
          onSeveritySaved={onSeveritySaved}
        />
        <FollowUpCard />
      </Stack>
    </Box>
  );
}
