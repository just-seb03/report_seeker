/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : HighRiskWidget.tsx                                               *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 05 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 05 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   HighRiskWidget -- Componente widget que muestra la cantidad total de reportes catalogados *
 *            con prioridad Grave, destacándolo con el color rojo de error.                    *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Box, Card, Typography } from '@mui/material';
import { t } from '../control/i18n';

interface HighRiskWidgetProps {
  count: number;
}

export default function HighRiskWidget({ count }: HighRiskWidgetProps) {
  return (
    <Card 
      elevation={0}
      sx={{ 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        borderRadius: 4,
        backgroundColor: 'background.paper',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        flex: 1
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2, textAlign: 'center' }}>
        {t.summary.highRiskReports}
      </Typography>

      <Box 
        sx={{ 
          position: 'relative', 
          width: '100%', 
          height: 120, // Empata con la altura interna del widget de al lado
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
        }}
      >
        <Typography variant="h2" sx={{ fontWeight: 800, color: 'error.main', lineHeight: 1 }}>
          {count}
        </Typography>
      </Box>
    </Card>
  );
}
