/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : LoginErrorDialog.tsx                                             *
 *                                                                                             *
 *              Programador :Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 03 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización :03 de Octubre de 2026 [SA]                                            *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   LoginErrorDialog -- Cuadro de diálogo de confirmación para informar sobre errores al      *
 *        iniciar sesión.                                                                      *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

type LoginErrorDialogProps = {
  open: boolean;
  message: string;
  onClose: () => void;
};

export default function LoginErrorDialog({ open, message, onClose }: LoginErrorDialogProps) {
  return (
    <Dialog
      className="report-cancel-dialog" // Reutilizamos estilos existentes en App.css o similares
      open={open}
      onClose={onClose}
      aria-labelledby="login-error-title"
      aria-describedby="login-error-description"
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle id="login-error-title" className="report-cancel-title">
        <Box className="report-cancel-icon" aria-hidden="true">
          <ErrorOutlineRoundedIcon color="error" />
        </Box>
        Acceso Denegado
      </DialogTitle>
      <DialogContent>
        <Typography id="login-error-description" className="report-cancel-description">
          {message}
        </Typography>
      </DialogContent>
      <DialogActions className="report-cancel-actions">
        <Button className="report-cancel-keep" onClick={onClose} autoFocus>
          Reintentar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
