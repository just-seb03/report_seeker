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
import { useEffect, useRef } from 'react';
import SeekieAIDoodles from './SeekieAIDoodles';
import UserChatMessage from './UserChatMessage';
import SeekieChatMessage from './SeekieChatMessage';
import { type ChatMessage } from '../control/useSeekieChat';
import { t } from '../control/i18n';

type SeekieAIChatAreaProps = {
  messages?: ChatMessage[];
};

export default function SeekieAIChatArea({ messages = [] }: SeekieAIChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      <SeekieAIDoodles />
      
      <Box sx={{ position: 'absolute', inset: 0, overflowY: 'auto', zIndex: 1 }}>
        <Box sx={{ minHeight: '100%', pt: 10, p: 3, display: 'flex', flexDirection: 'column' }}>
        {messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 'auto', mb: 'auto' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
              {t.seekie.greeting} <Box component="span" sx={{ color: 'primary.main', textShadow: '0px 2px 4px rgba(0,0,0,0.2)' }}>{t.seekie.aiName}</Box>
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, opacity: 0.9 }}>
              {t.seekie.help}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 'max-content' }}>
            {messages.map(msg => (
              msg.sender === 'user' ? 
                <UserChatMessage key={msg.id} text={msg.text} /> :
                <SeekieChatMessage key={msg.id} text={msg.text} />
            ))}
            <div ref={bottomRef} />
          </Box>
        )}
      </Box>
      </Box>
    </Box>
  );
}
