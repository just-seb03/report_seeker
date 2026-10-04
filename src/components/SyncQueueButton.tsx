/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : SyncQueueButton.tsx                                           *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 03 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización : 04 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   SyncQueueButton -- Componente flotante (Extended FAB MD3) que permite forzar la subida    *
 *        de los reportes que se encuentran en la cola (offline-first).                        *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Box, Typography, CircularProgress } from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { useState } from 'react';
import { Network } from '@capacitor/network';
import { syncPendingReports } from '../control/sincronizador';
import SyncErrorDialog from './SyncErrorDialog';
import './SyncQueueButton.css';

export default function SyncQueueButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorDialogOptions, setErrorDialogOptions] = useState({ open: false, message: '' });

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      const status = await Network.getStatus();
      if (!status.connected) {
        setErrorDialogOptions({ open: true, message: 'No hay conexión a internet disponible para sincronizar los reportes.' });
        setIsSyncing(false);
        return;
      }
      
      // Ejecutamos la lógica de subida desde el controlador oficial
      await syncPendingReports();
      
      // Disparamos el evento para que las vistas escuchen el cambio y se actualicen solas
      window.dispatchEvent(new CustomEvent('reportes_actualizados'));

    } catch (e) {
      console.error('Error durante la sincronización manual:', e);
      setErrorDialogOptions({ open: true, message: 'Ocurrió un error al intentar sincronizar la cola. Por favor, inténtalo de nuevo más tarde.' });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <Box className="sync-btn-wrapper">
      <button 
        className={`sync-fab-btn ${isSyncing ? 'syncing' : ''}`}
        onClick={handleSync}
        disabled={isSyncing}
      >
        {isSyncing ? (
          <CircularProgress size={24} color="inherit" className="sync-fab-icon" />
        ) : (
          <CloudUploadOutlinedIcon className="sync-fab-icon" />
        )}
        <Typography className="sync-fab-text">
          {isSyncing ? 'Sincronizando...' : 'Sincronizar Cola'}
        </Typography>
      </button>
    </Box>
    <SyncErrorDialog 
      open={errorDialogOptions.open}
      message={errorDialogOptions.message}
      onClose={() => setErrorDialogOptions({ ...errorDialogOptions, open: false })}
    />
    </>
  );
}
