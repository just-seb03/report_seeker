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

export default function SeekieAIChatArea() {
  return (
    <Box sx={{ flex: 1, position: 'relative', overflowY: 'auto' }}>
      <SeekieAIDoodles />
      
      <Box sx={{ position: 'relative', zIndex: 1, minHeight: '100%', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center', opacity: 0.8 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Hola, soy Seekie AI
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ¿En qué puedo ayudarte?
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
