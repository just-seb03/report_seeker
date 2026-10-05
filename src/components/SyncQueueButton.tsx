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

import { t } from '../control/i18n';
import { Box, Typography, CircularProgress } from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { useState } from 'react';
import { Network } from '@capacitor/network';
import { syncPendingReports } from '../control/sincronizador';
import SyncErrorDialog from './SyncErrorDialog';

export default function SyncQueueButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorDialogOptions, setErrorDialogOptions] = useState({ open: false, message: '' });

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      const status = await Network.getStatus();
      if (!status.connected) {
        setErrorDialogOptions({ open: true, message: t.sync.noInternet });
        setIsSyncing(false);
        return;
      }
      
      // Ejecutamos la lógica de subida desde el controlador oficial
      await syncPendingReports();
      
      // Disparamos el evento para que las vistas escuchen el cambio y se actualicen solas
      window.dispatchEvent(new CustomEvent('reportes_actualizados'));

    } catch (e) {
      console.error('Error durante la sincronización manual:', e);
      setErrorDialogOptions({ open: true, message: t.sync.syncFailed });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
    <Box 
      sx={{ 
        position: 'absolute', bottom: 160, left: 0, right: 0, 
        display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 40 
      }}
    >
      <Box 
        component="button"
        onClick={handleSync}
        disabled={isSyncing}
        sx={{
          pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5,
          bgcolor: 'primary.main', color: 'primary.contrastText', border: 'none', borderRadius: '20px',
          px: 3.5, py: 2, cursor: isSyncing ? 'default' : 'pointer', fontFamily: 'inherit', minWidth: 200,
          boxShadow: (theme) => theme.palette.mode === 'dark' 
            ? '0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)' 
            : '0 4px 12px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
          opacity: isSyncing ? 0.9 : 1,
          '&:active:not(:disabled)': {
            transform: 'scale(0.96) translateY(2px)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.1)'
          }
        }}
      >
        {isSyncing ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          <CloudUploadOutlinedIcon sx={{ fontSize: 24 }} />
        )}
        <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.3px' }}>
          {isSyncing ? t.sync.syncing : t.sync.syncQueue}
        </Typography>
      </Box>
    </Box>
    <SyncErrorDialog 
      open={errorDialogOptions.open}
      message={errorDialogOptions.message}
      onClose={() => setErrorDialogOptions({ ...errorDialogOptions, open: false })}
    />
    </>
  );
}
