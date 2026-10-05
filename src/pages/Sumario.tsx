/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : Sumario.tsx                                                      *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 05 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 05 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   Sumario -- Pantalla exclusiva para prevencionistas donde podrán visualizar el resumen de  *
 *            riesgos reportados por todos los trabajadores.                                   *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Box, Typography } from '@mui/material';
import GlobalTopBar from '../components/GlobalTopBar';

export default function Sumario() {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'background.default', pb: 10 }}>
      <GlobalTopBar title="Sumario" />
      
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <Typography variant="body1" color="text.secondary" align="center">
          Esta pantalla está en construcción. Próximamente verás aquí el sumario de riesgos (Exclusivo Prevencionistas).
        </Typography>
      </Box>
    </Box>
  );
}
