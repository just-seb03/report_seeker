/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : Summary.tsx                                                      *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 05 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 05 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   Summary -- Pantalla exclusiva para prevencionistas donde podrán visualizar el resumen de  *
 *            riesgos reportados por todos los trabajadores.                                   *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Box, Typography, CircularProgress } from '@mui/material';
import GlobalTopBar from '../components/GlobalTopBar';
import RiskDonutChart from '../components/RiskDonutChart';
import TodayReportsWidget from '../components/TodayReportsWidget';
import HighRiskWidget from '../components/HighRiskWidget';
import { useSummary } from '../control/useSummary';
import { t } from '../control/i18n';

export default function Summary() {
  const { data, loading } = useSummary();

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'background.default', pb: 10, pt: 'calc(80px + env(safe-area-inset-top))', overflowY: 'auto' }}>
      <GlobalTopBar title={t.summary.title} />
      
      {loading ? (
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <RiskDonutChart data={data} />
          
          {/* Fila de widgets (2 columnas) */}
          <Box sx={{ display: 'flex', gap: 2, px: 2, mt: 1 }}>
            <TodayReportsWidget data={data.today} />
            <HighRiskWidget count={data.high} />
          </Box>
          
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3, mt: 2 }}>
            <Typography variant="body1" color="text.secondary" align="center">
              {t.summary.underConstruction}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}
