/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : TopLocationsWidget.tsx                                           *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 05 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 05 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   TopLocationsWidget -- Componente widget que muestra una lista del top 3 de los lugares    *
 *            más afectados, es decir, con mayor cantidad de reportes registrados.             *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Card, Typography, List, ListItem, ListItemText, Box, alpha, useTheme } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import { t } from '../../control/global/i18n';
import type { SummaryData } from '../../control/Summary/useSummary';

interface TopLocationsWidgetProps {
  locations: SummaryData['topLocations'];
}

export default function TopLocationsWidget({ locations }: TopLocationsWidgetProps) {
  const theme = useTheme();

  return (
    <Card 
      elevation={0}
      sx={{ 
        p: 3, 
        m: 2, 
        display: 'flex', 
        flexDirection: 'column', 
        borderRadius: '24px',
        backgroundColor: 'background.paper',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)'
      }}
    >
      <Typography variant="body1" align="center" sx={{ fontWeight: 600, color: 'text.secondary', mb: 3 }}>
        {t.summary.topLocations}
      </Typography>

      {locations.length > 0 ? (
        <List disablePadding>
          {locations.map((loc, index) => {
            // Opacidad de fondo disminuye según la posición
            const opacities = [0.15, 0.08, 0.03];
            const bgOpacity = opacities[index] || 0.02;

            return (
              <ListItem 
                key={loc.name} 
                disableGutters
                sx={{ 
                  mb: index < locations.length - 1 ? 2 : 0,
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: alpha(theme.palette.error.main, bgOpacity),
                  borderRadius: '16px',
                  p: 1.5,
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    backgroundColor: 'background.paper',
                    mr: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                >
                  <PlaceIcon color="error" fontSize="small" />
                </Box>
                
                <ListItemText 
                  primary={<Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.95rem' }}>{loc.name}</Typography>}
                />
                
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 32,
                    height: 32,
                    borderRadius: '16px',
                    backgroundColor: 'background.paper',
                    color: 'error.main',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    px: 1.5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                >
                  {loc.count}
                </Box>
              </ListItem>
            );
          })}
        </List>
      ) : (
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {t.summary.noLocations}
          </Typography>
        </Box>
      )}
    </Card>
  );
}
