/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : SeekieChatMessage.tsx                                            *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 04 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 04 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   SeekieChatMessage -- Componente que renderiza un mensaje individual enviado por el        *
 *        asistente virtual, estilizado con animación de entrada y un avatar de IA.            *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Box, Typography, Avatar, alpha } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { t } from '../control/i18n';

type SeekieChatMessageProps = {
  text: string;
};

export default function SeekieChatMessage({ text }: SeekieChatMessageProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2, px: 2 }}>
      <Avatar
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          width: 36,
          height: 36,
          mr: 1.5,
          alignSelf: 'flex-end',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
        aria-label={t.seekie.aiName}
      >
        <AutoAwesomeRoundedIcon fontSize="small" />
      </Avatar>
      
      <Box
        sx={{
          maxWidth: '75%',
          bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          color: 'text.primary',
          borderRadius: '20px',
          borderBottomLeftRadius: '4px',
          p: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid',
          borderColor: 'divider',
          animation: 'seekie-enter 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          transformOrigin: 'bottom left',
          '@keyframes seekie-enter': {
            '0%': { opacity: 0, transform: 'scale(0.8)' },
            '100%': { opacity: 1, transform: 'scale(1)' },
          },
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.5, overflowWrap: 'break-word' }}>
          {text}
        </Typography>
      </Box>
    </Box>
  );
}
