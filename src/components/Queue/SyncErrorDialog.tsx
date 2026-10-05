/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : SyncErrorDialog.tsx                                              *
 *                                                                                             *
 *              Programador :Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 04 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización :04 de Octubre de 2026 [SA]                                            *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   SyncErrorDialog -- Cuadro de diálogo para mostrar errores al intentar sincronizar cola.   *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import CloudOffIcon from '@mui/icons-material/CloudOff';
import { t } from '../../control/global/i18n';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

type SyncErrorDialogProps = {
  open: boolean;
  message: string;
  onClose: () => void;
};

export default function SyncErrorDialog({ open, message, onClose }: SyncErrorDialogProps) {
  return (
    <Dialog
      className="report-cancel-dialog"
      open={open}
      onClose={onClose}
      aria-labelledby="sync-error-title"
      aria-describedby="sync-error-description"
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle id="sync-error-title" className="report-cancel-title">
        <Box className="report-cancel-icon" aria-hidden="true">
          <CloudOffIcon color="warning" />
        </Box>
        {t.sync.errorTitle}
      </DialogTitle>
      <DialogContent>
        <Typography id="sync-error-description" className="report-cancel-description">
          {message}
        </Typography>
      </DialogContent>
      <DialogActions className="report-cancel-actions">
        <Button className="report-cancel-keep" onClick={onClose} autoFocus>
          {t.sync.understood}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
