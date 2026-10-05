/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : RiskDonutChart.tsx                                               *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 05 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 05 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   RiskDonutChart -- Componente visual que dibuja una gráfica tipo media dona usando la      *
 *        librería @mui/x-charts, mostrando los conteos de riesgos por prioridad.              *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Box, Card, Typography, useTheme, alpha } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { t } from '../control/i18n';
import type { SummaryData } from '../control/useSummary';

interface RiskDonutChartProps {
  data: SummaryData;
}

export default function RiskDonutChart({ data }: RiskDonutChartProps) {
  const theme = useTheme();

  // Mapeamos los datos de useSummary a la serie de datos esperada por PieChart usando colores más suaves
  const chartData = [
    { id: 0, value: data.high, label: t.summary.highRisk, color: theme.palette.mode === 'dark' ? theme.palette.error.dark : alpha(theme.palette.error.main, 0.4) },
    { id: 1, value: data.medium, label: t.summary.mediumRisk, color: theme.palette.mode === 'dark' ? theme.palette.warning.dark : alpha(theme.palette.warning.main, 0.4) },
    { id: 2, value: data.low, label: t.summary.lowRisk, color: theme.palette.mode === 'dark' ? theme.palette.success.dark : alpha(theme.palette.success.main, 0.4) },
  ];

  // Si no hay datos, no dibujamos la dona vacía con colores grises
  const hasData = data.total > 0;

  return (
    <Card 
      elevation={0}
      sx={{ 
        p: 3, 
        m: 2, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        position: 'relative',
        borderRadius: '24px',
        backgroundColor: 'background.paper',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)'
      }}
    >
      <Typography variant="body1" gutterBottom align="center" sx={{ mb: 3, fontWeight: 600, color: 'text.secondary' }}>
        {t.summary.totalReports}
      </Typography>

      <Box 
        sx={{ 
          position: 'relative', 
          width: '100%', 
          height: 120, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'flex-end', 
          overflow: 'hidden',
          '& .MuiChartsLegend-root': { display: 'none !important' }, // Ocultamos la leyenda nativa a la fuerza
          '& .MuiChartsLegend-series': { display: 'none !important' }
        }}
      >
        {hasData ? (
          <PieChart
            series={[
              {
                data: chartData,
                innerRadius: 50,
                outerRadius: 85,
                paddingAngle: 4,
                cornerRadius: 6,
                startAngle: -90,
                endAngle: 90,
                cx: 100,
                cy: 100,
              }
            ]}
            width={200}
            height={110}
            margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
          />
        ) : (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No hay reportes disponibles.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Custom Legend for Mobile */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, width: '100%', mt: 2, px: 1 }}>
        {chartData.map((item) => (
          <Box key={item.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: item.color }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {item.label}
              </Typography>
            </Box>
            <Typography component="div" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.25rem' }}>
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
