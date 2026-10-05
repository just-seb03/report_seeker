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
import TopLocationsWidget from '../components/TopLocationsWidget';
import TopUsersWidget from '../components/TopUsersWidget';
import SmoothScrollContainer from '../components/SmoothScrollContainer';
import { useSummary } from '../control/useSummary';
import { t } from '../control/i18n';

export default function Summary() {
  const { data, loading } = useSummary();

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'background.default', height: '100%', overflow: 'hidden' }}>
      <GlobalTopBar title={t.summary.title} />
      
      {loading ? (
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <SmoothScrollContainer sx={{ pt: 'calc(80px + env(safe-area-inset-top))', pb: 10 }}>
          <RiskDonutChart data={data} />
          
          <TopLocationsWidget locations={data.topLocations} />

          <TopUsersWidget users={data.topUsers} />
          
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3, mt: 2 }}>
            <Typography variant="body1" color="text.secondary" align="center">
              {t.summary.underConstruction}
            </Typography>
          </Box>
        </SmoothScrollContainer>
      )}
    </Box>
  );
}
