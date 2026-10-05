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

import { Box, Card, Typography, useTheme } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { t } from '../control/i18n';
import type { SummaryData } from '../control/useSummary';

interface RiskDonutChartProps {
  data: SummaryData;
}

export default function RiskDonutChart({ data }: RiskDonutChartProps) {
  const theme = useTheme();

  // Mapeamos los datos de useSummary a la serie de datos esperada por PieChart
  const chartData = [
    { id: 0, value: data.high, label: t.summary.highRisk, color: theme.palette.error.main },
    { id: 1, value: data.medium, label: t.summary.mediumRisk, color: theme.palette.warning.main },
    { id: 2, value: data.low, label: t.summary.lowRisk, color: theme.palette.success.main },
  ];

  // Si no hay datos, no dibujamos la dona vacía con colores grises
  const hasData = data.total > 0;

  return (
    <Card sx={{ p: 3, m: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <Typography variant="h6" fontWeight={700} gutterBottom align="center" sx={{ mb: 2 }}>
        {t.summary.totalReports}
      </Typography>

      <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
        {hasData ? (
          <PieChart
            series={[
              {
                data: chartData,
                innerRadius: 80,
                outerRadius: 130,
                paddingAngle: 5,
                cornerRadius: 8,
                startAngle: -90,
                endAngle: 90,
                cx: 150,
                cy: 140, // Centrado manual relativo al height para dar espacio
              }
            ]}
            width={300}
            height={160}
            slotProps={{
              legend: { hidden: true }, // Escondemos la leyenda por defecto para hacer una custom más bonita abajo
            }}
          />
        ) : (
          <Box sx={{ width: 300, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No hay reportes disponibles.
            </Typography>
          </Box>
        )}

        {/* Total number displayed in the middle of the half donut */}
        {hasData && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 20, // Posicionado justo en el hueco de la dona
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <Typography variant="h3" fontWeight={800}>
              {data.total}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Custom Legend */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 1, width: '100%', flexWrap: 'wrap' }}>
        {chartData.map((item) => (
          <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: item.color }} />
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              {item.label}: <Typography component="span" fontWeight={800} color="text.primary">{item.value}</Typography>
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
