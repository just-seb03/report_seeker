/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : PinRecoveryFlow.tsx                                              *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 05 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 05 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   PinRecoveryFlow -- Componente visual que encapsula el formulario de recuperación de PIN.  *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Box, Button, TextField, Typography } from '@mui/material';
import { usePinRecoveryFlow } from '../control/usePinRecoveryFlow';
import { isPinRecoveryLink } from '../control/pinRecoveryControl';

interface PinRecoveryFlowProps {
  initialWorkerId: string;
  onClose: () => void;
  isVisible: boolean;
}

export default function PinRecoveryFlow({ initialWorkerId, onClose, isVisible }: PinRecoveryFlowProps) {
  const {
    recoveryWorkerId,
    setRecoveryWorkerId,
    recoveryEmail,
    setRecoveryEmail,
    recoveryStatus,
    recoveryError,
    newRecoveryPin,
    setNewRecoveryPin,
    confirmRecoveryPin,
    setConfirmRecoveryPin,
    activeRecoveryActionUrl,
    handleRecoverySubmit,
    handleRecoveryBack
  } = usePinRecoveryFlow(initialWorkerId, onClose);

  return (
    <Box 
      sx={{
        position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', overflowY: 'auto', p: 2,
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        ...(isVisible 
          ? { opacity: 1, transform: 'translateY(0) scale(1)', pointerEvents: 'auto' } 
          : { opacity: 0, transform: 'translateY(100px) scale(0.95)', pointerEvents: 'none' })
      }}
    >
      <Box
        component="form"
        onSubmit={handleRecoverySubmit}
        sx={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 360, gap: 2 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 500 }}>Recuperar PIN</Typography>
        <Typography variant="body2" color="text.secondary">
          {recoveryStatus === 'verified'
            ? 'Correo verificado. Ingresa y confirma tu nuevo PIN de 4 dígitos.'
            : 'Ingresa tu ID de trabajador y el correo asociado a tu cuenta.'}
        </Typography>

        <TextField
          label="ID de trabajador"
          variant="outlined"
          fullWidth
          inputMode="numeric"
          autoComplete="off"
          required
          disabled={recoveryStatus === 'verified' || recoveryStatus === 'updating' || recoveryStatus === 'completed'}
          value={recoveryWorkerId}
          onChange={(event) => setRecoveryWorkerId(event.target.value.replace(/\D/g, '').slice(0, 5))}
        />

        <TextField
          label="Correo electrónico"
          type="email"
          variant="outlined"
          fullWidth
          autoComplete="email"
          required
          disabled={recoveryStatus === 'verified' || recoveryStatus === 'updating' || recoveryStatus === 'completed'}
          value={recoveryEmail}
          onChange={(event) => setRecoveryEmail(event.target.value)}
        />

        {recoveryStatus === 'verified' && (
          <>
            <TextField
              label="Nuevo PIN"
              type="password"
              variant="outlined"
              fullWidth
              inputMode="numeric"
              autoComplete="new-password"
              required
              value={newRecoveryPin}
              onChange={(event) => setNewRecoveryPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
            />
            <TextField
              label="Confirma el nuevo PIN"
              type="password"
              variant="outlined"
              fullWidth
              inputMode="numeric"
              autoComplete="new-password"
              required
              value={confirmRecoveryPin}
              onChange={(event) => setConfirmRecoveryPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
            />
          </>
        )}

        {!['sent', 'completed'].includes(recoveryStatus) && (
          <Button 
            variant="contained" 
            color="primary" 
            type="submit" 
            disabled={recoveryStatus === 'sending' || recoveryStatus === 'verifying' || recoveryStatus === 'updating'}
            sx={{ mt: 1, py: 1.5, borderRadius: 6 }}
          >
            {recoveryStatus === 'sending'
              ? 'Enviando...'
              : recoveryStatus === 'verifying'
                ? 'Verificando...'
                : recoveryStatus === 'updating'
                  ? 'Actualizando PIN...'
                  : recoveryStatus === 'verified'
                    ? 'Guardar nuevo PIN'
                : recoveryStatus === 'needs_details' || isPinRecoveryLink(activeRecoveryActionUrl)
                  ? 'Confirmar correo'
                  : 'Enviar enlace'}
          </Button>
        )}

        {recoveryStatus === 'sent' && (
          <Typography color="success.main" variant="body2" role="status" sx={{ mt: 1 }}>
            Si el correo puede recibir enlaces de acceso, recibirás un enlace para confirmar que tienes acceso a esa bandeja.
          </Typography>
        )}
        {recoveryStatus === 'verified' && (
          <Typography color="success.main" variant="body2" role="status" sx={{ mt: 1 }}>
            Correo verificado y asociado al trabajador.
          </Typography>
        )}
        {recoveryStatus === 'completed' && (
          <Typography color="success.main" variant="body2" role="status" sx={{ mt: 1 }}>
            PIN actualizado. Vuelve al inicio de sesión para ingresar con tu PIN nuevo.
          </Typography>
        )}
        {recoveryStatus === 'not_matched' && (
          <Typography color="error.main" variant="body2" role="alert" sx={{ mt: 1 }}>
            No se pudo validar la combinación de ID y correo. Revisa los datos e inténtalo nuevamente.
          </Typography>
        )}
        {recoveryError && (
          <Typography color="error.main" variant="body2" role="alert" sx={{ mt: 1 }}>{recoveryError}</Typography>
        )}

        <Button
          variant="text"
          color="primary"
          disabled={recoveryStatus === 'sending' || recoveryStatus === 'verifying' || recoveryStatus === 'updating'}
          onClick={() => void handleRecoveryBack()}
          sx={{ alignSelf: 'center', mt: 1 }}
        >
          {recoveryStatus === 'completed' ? 'Ir al inicio de sesión' : 'Volver al inicio de sesión'}
        </Button>
      </Box>
    </Box>
  );
}
