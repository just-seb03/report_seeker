/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : SeekAIChatArea.tsx                                            *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 04 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización : 04 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   SeekAIChatArea -- Área principal del chat donde se mostrarán los mensajes de Seek AI.     *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Box, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import './SeekAI.css';

export default function SeekAIChatArea() {
  return (
    <Box className="seek-chat-area">
      <Box className="seek-greeting">
        <AutoAwesomeIcon className="seek-greeting-icon" />
        <Typography variant="h5" className="seek-greeting-title">
          Hola, soy Seek AI
        </Typography>
        <Typography variant="body1" className="seek-greeting-subtitle">
          ¿En qué te puedo ayudar el día de hoy?
        </Typography>
      </Box>
    </Box>
  );
}
