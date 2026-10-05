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

import { t } from '../control/i18n';
import { Box, InputBase, IconButton } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import { useState } from 'react';

export default function SeekieAIInputBox() {
  const [text, setText] = useState('');

  return (
    <Box sx={{ width: '100%', maxWidth: '800px', mx: 'auto', pointerEvents: 'auto' }}>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          bgcolor: 'background.paper', 
          borderRadius: '32px', 
          p: '6px 12px 6px 24px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'box-shadow 0.2s',
          '&:focus-within': { boxShadow: '0 6px 24px rgba(0,0,0,0.12)' },
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <InputBase
          sx={{ flex: 1, py: 1.5, typography: 'body1', maxHeight: '120px', overflowY: 'auto' }}
          placeholder={t.seekie.inputPlaceholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          multiline
          maxRows={5}
        />
        <IconButton 
          sx={{ 
            mb: '4px', ml: 1, width: 44, height: 44, flexShrink: 0,
            bgcolor: text.trim() ? 'primary.main' : 'transparent', 
            color: text.trim() ? 'primary.contrastText' : 'text.secondary', 
            '&:hover': { bgcolor: text.trim() ? 'primary.dark' : 'action.hover' },
            transition: 'all 0.2s'
          }}
        >
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
