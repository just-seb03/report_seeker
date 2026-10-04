/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : SeekAIInputBox.tsx                                            *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 04 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización : 04 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   SeekAIInputBox -- Caja de texto inferior estilo Gemini para enviar mensajes a Seek AI.    *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Box, InputBase, IconButton } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import { useState } from 'react';
import './SeekieAI.css';

export default function SeekieAIInputBox() {
  const [text, setText] = useState('');

  return (
    <Box className="seekie-input-container">
      <Box className="seekie-input-wrapper">
        <InputBase
          className="seekie-input-field"
          placeholder="Escribe tu mensaje aquí..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          multiline
          maxRows={4}
        />
        <IconButton className="seekie-action-btn">
          {text.trim().length > 0 ? (
            <SendRoundedIcon className="seekie-send-icon" />
          ) : (
            <MicRoundedIcon className="seekie-mic-icon" />
          )}
        </IconButton>
      </Box>
    </Box>
  );
}
