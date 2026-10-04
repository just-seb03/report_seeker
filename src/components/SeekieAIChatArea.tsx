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
import SeekieAIDoodles from './SeekieAIDoodles';
import { t } from '../control/i18n';

export default function SeekieAIChatArea() {
  return (
    <Box sx={{ flex: 1, position: 'relative', overflowY: 'auto' }}>
      <SeekieAIDoodles />
      
      <Box sx={{ position: 'relative', zIndex: 1, minHeight: '100%', pt: 10, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
            {t.seekie.greeting} <Box component="span" sx={{ color: 'primary.main', textShadow: '0px 2px 4px rgba(0,0,0,0.2)' }}>{t.seekie.aiName}</Box>
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, opacity: 0.9 }}>
            {t.seekie.help}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
