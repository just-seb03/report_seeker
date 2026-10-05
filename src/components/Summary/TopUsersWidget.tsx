/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : TopUsersWidget.tsx                                               *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 05 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 05 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   TopUsersWidget -- Componente widget que muestra el top 3 de usuarios que más reportes     *
 *            han registrado en el sistema.                                                    *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Card, Typography, List, ListItem, ListItemText, Box, Avatar, alpha, useTheme } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { t } from '../../control/global/i18n';
import type { SummaryData } from '../../control/Summary/useSummary';

interface TopUsersWidgetProps {
  users: SummaryData['topUsers'];
}

export default function TopUsersWidget({ users }: TopUsersWidgetProps) {
  const theme = useTheme();

  if (users.length === 0) {
    return (
      <Card 
        elevation={0}
        sx={{ 
          p: 3, m: 2, display: 'flex', flexDirection: 'column', 
          borderRadius: '24px', backgroundColor: 'background.paper', 
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Typography variant="body1" align="center" sx={{ fontWeight: 600, color: 'text.secondary', mb: 3 }}>
          {t.summary.topUsers}
        </Typography>
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {t.summary.noUsers}
          </Typography>
        </Box>
      </Card>
    );
  }

  const top1 = users[0];
  const others = users.slice(1);

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
        {t.summary.topUsers}
      </Typography>

      {/* Podium: Usuario #1 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        <Avatar 
          sx={{ 
            width: 72, 
            height: 72, 
            backgroundColor: alpha(theme.palette.warning.main, 0.2), 
            color: 'warning.main',
            mb: 1
          }}
        >
          <PersonIcon fontSize="large" />
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', textAlign: 'center' }}>
          {top1.name}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main' }}>
          {top1.count} {t.summary.reports}
        </Typography>
      </Box>

      {/* Lista: Usuarios #2 y #3 */}
      {others.length > 0 && (
        <List disablePadding>
          {others.map((user, index) => {
            const opacities = [0.08, 0.03]; // Suavidad que disminuye para el 2do y 3er puesto
            const bgOpacity = opacities[index] || 0.02;

            return (
              <ListItem 
                key={user.name} 
                disableGutters
                sx={{ 
                  mb: index < others.length - 1 ? 2 : 0,
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: alpha(theme.palette.warning.main, bgOpacity),
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
                    borderRadius: '50%',
                    backgroundColor: 'background.paper',
                    mr: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'warning.main' }}>
                    #{index + 2}
                  </Typography>
                </Box>
                
                <ListItemText 
                  primary={<Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.95rem' }}>{user.name}</Typography>}
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
                    color: 'warning.main',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    px: 1.5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                >
                  {user.count}
                </Box>
              </ListItem>
            );
          })}
        </List>
      )}
    </Card>
  );
}
