/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : Queue.tsx                                                     *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 03 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización : 03 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   Queue -- Componente que muestra la lista de reportes pendientes de sincronizar.           *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Box, Typography, AppBar, Toolbar, List, ListItem, ListItemButton, ListItemText, ListItemIcon } from '@mui/material';
import { useQueue } from '../control/useQueue';
import { type IssueReport } from '../database';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import SyncQueueButton from '../components/SyncQueueButton';

interface QueueProps {
  onReportClick: (report: IssueReport) => void;
}

export default function Queue({ onReportClick }: QueueProps) {
  const { reports, loading } = useQueue();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', bgcolor: 'background.default', overflow: 'hidden' }}>
      <AppBar position="static" color="transparent" elevation={1} sx={{ pt: 'env(safe-area-inset-top)', bgcolor: 'background.paper' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Bandeja de salida
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflowY: 'auto', pb: 12 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 300, color: 'text.secondary' }}>
            <Typography>Cargando...</Typography>
          </Box>
        ) : reports.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 300, color: 'text.secondary', p: 3, textAlign: 'center' }}>
            <CloudOffIcon sx={{ fontSize: 48, opacity: 0.5, mb: 2 }} />
            <Typography>No hay reportes pendientes.</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {reports.map((report) => (
              <ListItem key={report.issueId} disablePadding divider>
                <ListItemButton onClick={() => onReportClick(report)} sx={{ py: 1.5, px: 2.5 }}>
                  <ListItemText 
                    primary={<Typography variant="subtitle2" sx={{ fontWeight: 500 }} noWrap>{report.title}</Typography>}
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" noWrap>{report.location || 'Sin ubicación'}</Typography>
                        <Typography variant="caption" color="text.disabled">{report.capturedAt ? new Date(report.capturedAt).toLocaleString() : ''}</Typography>
                      </>
                    }
                  />
                  <ListItemIcon sx={{ minWidth: 'auto', ml: 2, color: 'warning.main' }}>
                    <CloudOffIcon fontSize="small" />
                  </ListItemIcon>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {!loading && reports.length > 0 && <SyncQueueButton />}
    </Box>
  );
}
