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

export default function SeekieAIInputBox() {
  const [text, setText] = useState('');

  return (
    <Box sx={{ p: 2, pb: 4, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider' }}>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          bgcolor: 'background.paper', 
          borderRadius: 6, 
          p: 1, 
          pl: 2, 
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
        }}
      >
        <InputBase
          sx={{ flex: 1, typography: 'body1' }}
          placeholder="Escribe tu mensaje aquí..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          multiline
          maxRows={4}
        />
        <IconButton sx={{ bgcolor: text.trim() ? 'primary.main' : 'action.selected', color: text.trim() ? 'primary.contrastText' : 'text.secondary', ml: 1, '&:hover': { bgcolor: text.trim() ? 'primary.dark' : 'action.hover' } }}>
          {text.trim().length > 0 ? (
            <SendRoundedIcon fontSize="small" />
          ) : (
            <MicRoundedIcon fontSize="small" />
          )}
        </IconButton>
      </Box>
    </Box>
  );
}
