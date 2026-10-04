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
import './SeekieAI.css';

export default function SeekieAIChatArea() {
  return (
    <Box className="seekie-chat-area">
      <Box className="seekie-greeting">
        <Typography variant="h5" className="seekie-greeting-title">
          Hola, soy Seekie AI
        </Typography>
        <Typography variant="body1" className="seekie-greeting-subtitle">
          ¿En qué puedo ayudarte?
        </Typography>
      </Box>
    </Box>
  );
}
