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
import SeekAITopBar from '../components/SeekAITopBar';
import SeekAIChatArea from '../components/SeekAIChatArea';
import SeekAIInputBox from '../components/SeekAIInputBox';
import './SeekAIPage.css';

export default function SeekAIPage() {
  return (
    <Box className="seek-page-container">
      <SeekAITopBar />
      <SeekAIChatArea />
      <SeekAIInputBox />
    </Box>
  );
}
