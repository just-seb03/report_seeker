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

import { Box, Typography } from '@mui/material';
import { useQueue } from '../control/useQueue';
import { type IssueReport } from '../database';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import SyncQueueButton from '../components/SyncQueueButton';
import './Queue.css';

interface QueueProps {
  onReportClick: (report: IssueReport) => void;
}

export default function Queue({ onReportClick }: QueueProps) {
  const { reports, loading } = useQueue();

  return (
    <Box className="queue-container">
      <Box className="queue-header">
        <Typography variant="h6" className="queue-title">Bandeja de salida</Typography>
      </Box>

      <Box className="queue-list">
        {loading ? (
          <Box className="queue-empty-state">
            <Typography>Cargando...</Typography>
          </Box>
        ) : reports.length === 0 ? (
          <Box className="queue-empty-state">
            <CloudOffIcon sx={{ fontSize: 48, opacity: 0.5, mb: 2 }} />
            <Typography>No hay reportes pendientes.</Typography>
          </Box>
        ) : (
          reports.map((report) => (
            <Box 
              key={report.issueId} 
              className="queue-item"
              onClick={() => onReportClick(report)}
            >
              <Box className="queue-item-content">
                <Typography className="queue-item-title" noWrap>{report.title}</Typography>
                <Typography className="queue-item-subtitle" noWrap>{report.location || 'Sin ubicación'}</Typography>
                <Typography className="queue-item-date">{report.capturedAt ? new Date(report.capturedAt).toLocaleString() : ''}</Typography>
              </Box>
              <Box className="queue-item-status">
                <CloudOffIcon fontSize="small" />
              </Box>
            </Box>
          ))
        )}
      </Box>

      {!loading && reports.length > 0 && <SyncQueueButton />}
    </Box>
  );
}
