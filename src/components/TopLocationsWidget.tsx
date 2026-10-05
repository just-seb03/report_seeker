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

import { Card, Typography, List, ListItem, ListItemIcon, ListItemText, Box, alpha, useTheme } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import { t } from '../control/i18n';
import type { SummaryData } from '../control/useSummary';

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
        borderRadius: 6,
        backgroundColor: 'background.paper',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)'
      }}
    >
      <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
        {t.summary.topLocations}
      </Typography>

      {locations.length > 0 ? (
        <List disablePadding>
          {locations.map((loc, index) => (
            <ListItem 
              key={loc.name} 
              disableGutters
              sx={{ 
                mb: index < locations.length - 1 ? 1 : 0,
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                borderRadius: 3,
                px: 2,
                py: 1
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <PlaceIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={loc.name} 
                primaryTypographyProps={{ fontWeight: 600, color: 'text.primary' }}
              />
              <Box 
                sx={{ 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  fontWeight: 800,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  minWidth: 32,
                  textAlign: 'center'
                }}
              >
                {loc.count}
              </Box>
            </ListItem>
          ))}
        </List>
      ) : (
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No hay información de ubicaciones.
          </Typography>
        </Box>
      )}
    </Card>
  );
}
