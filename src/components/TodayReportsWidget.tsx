/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : TodayReportsWidget.tsx                                           *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 05 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 05 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   TodayReportsWidget -- Componente widget que muestra la cantidad de reportes generados hoy *
 *            con una gráfica circular delgada.                                                *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Box, Card, Typography, useTheme, alpha } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { t } from '../control/i18n';
import type { SummaryData } from '../control/useSummary';

interface TodayReportsWidgetProps {
  data: SummaryData['today'];
}

export default function TodayReportsWidget({ data }: TodayReportsWidgetProps) {
  const theme = useTheme();

  // Mapeamos los datos de hoy para el mini gráfico
  const chartData = [
    { id: 0, value: data.high, color: theme.palette.mode === 'dark' ? theme.palette.error.dark : alpha(theme.palette.error.main, 0.4) },
    { id: 1, value: data.medium, color: theme.palette.mode === 'dark' ? theme.palette.warning.dark : alpha(theme.palette.warning.main, 0.4) },
    { id: 2, value: data.low, color: theme.palette.mode === 'dark' ? theme.palette.success.dark : alpha(theme.palette.success.main, 0.4) },
  ];

  const hasData = data.total > 0;

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
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
        {t.summary.todayReports}
      </Typography>

      <Box 
        sx={{ 
          position: 'relative', 
          width: '100%', 
          height: 120, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          '& .MuiChartsLegend-root': { display: 'none !important' },
          '& .MuiChartsLegend-series': { display: 'none !important' }
        }}
      >
        {hasData ? (
          <PieChart
            series={[
              {
                data: chartData,
                innerRadius: 40,
                outerRadius: 52, // Dona delgada pero más grande
                paddingAngle: 2,
                cornerRadius: 4,
                cx: '50%',
                cy: '50%',
              }
            ]}
            width={120}
            height={120}
            margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
          />
        ) : (
          <Box sx={{ width: 104, height: 104, borderRadius: '50%', border: `4px solid ${theme.palette.divider}` }} />
        )}

        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1 }}>
            {data.total}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}
