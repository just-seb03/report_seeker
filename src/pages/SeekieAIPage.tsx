/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : SeekAIPage.tsx                                                *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 04 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización : 04 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   SeekAIPage -- Página principal de la interfaz visual del chat con Seek AI.                *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Box } from '@mui/material';
import SeekieAIChatArea from '../components/SeekieAIChatArea';
import SeekieAIInputBox from '../components/SeekieAIInputBox';
import GlobalTopBar from '../components/GlobalTopBar';
import { t } from '../control/i18n';

export default function SeekieAIPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', position: 'absolute', inset: 0, bgcolor: 'background.default', pb: '90px' }}>
      <GlobalTopBar title={t.seekie.title} />
      <SeekieAIChatArea />
      <Box sx={{ px: 2, pb: 1, pt: 1, position: 'relative', zIndex: 2 }}>
        <SeekieAIInputBox />
      </Box>
    </Box>
  );
}
