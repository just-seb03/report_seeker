/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : ReportCancelDialog.tsx                                        *
 *                                                                                             *
 *              Programador :Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 01 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización :04 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   ReportCancelDialog -- Cuadro de diálogo de confirmación para cancelar un reporte en       *
 *        progreso.                                                                            *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { t } from '../../control/global/i18n';


type ReportCancelDialogProps = {
  open: boolean;
  onCancel: () => void;
  onExit: () => void;
};

export default function ReportCancelDialog({ open, onCancel, onExit }: ReportCancelDialogProps) {
  return (
    <Dialog
      className="report-cancel-dialog"
      open={open}
      onClose={onCancel}
      aria-labelledby="report-cancel-title"
      aria-describedby="report-cancel-description"
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle id="report-cancel-title" className="report-cancel-title">
        <Box className="report-cancel-icon" aria-hidden="true">
          <HelpOutlineRoundedIcon />
        </Box>
        {t.report.cancelTitle}
      </DialogTitle>
      <DialogContent>
        <Typography id="report-cancel-description" className="report-cancel-description">
          {t.report.cancelDesc}
        </Typography>
      </DialogContent>
      <DialogActions className="report-cancel-actions">
        <Button className="report-cancel-keep" onClick={onCancel}>{t.report.cancelKeep}</Button>
        <Button className="report-cancel-exit" onClick={onExit} autoFocus>{t.report.cancelConfirm}</Button>
      </DialogActions>
    </Dialog>
  );
}
