/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : Login.tsx                                                        *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 03 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 04 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   Login -- Orquesta el ingreso, la verificación de correo y la actualización del PIN        *
 *            durante su recuperación.                                                        *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { type Trabajador } from '../control/authControl';
import {
  cancelPinRecoveryAuthentication,
  clearPinRecoveryLinkFromUrl,
  completePinRecoveryEmailLink,
  getPendingNativePinRecoveryLink,
  getSavedPinRecoveryRequest,
  isPinRecoveryLink,
  sendPinRecoveryLink,
  updatePinRecoveryWorker,
  verifyPinRecoveryWorker
} from '../control/pinRecoveryControl';
import { useIntroFlow } from '../control/useIntroFlow';
import { Box, Button, TextField, Typography } from '@mui/material';
import PinPad from '../components/PinPad';
import LoginErrorDialog from '../components/LoginErrorDialog';
import './Login.css';

interface LoginProps {
  onLoginSuccess: (user: Trabajador) => void;
}

function isInvalidRecoveryActionCode(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('code' in error)) return false;
  return error.code === 'auth/invalid-action-code' || error.code === 'auth/expired-action-code';
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [recoveryActionUrl] = useState(() => {
    const pendingNativeLink = getPendingNativePinRecoveryLink();
    return isPinRecoveryLink(pendingNativeLink) ? pendingNativeLink : window.location.href;
  });
  const [openedFromRecoveryLink] = useState(() => isPinRecoveryLink(recoveryActionUrl));
  const [savedRecoveryRequest] = useState(getSavedPinRecoveryRequest);
  const recoveryLinkProcessingStarted = useRef(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(openedFromRecoveryLink);
  const [recoveryWorkerId, setRecoveryWorkerId] = useState(savedRecoveryRequest?.workerId ?? '');
  const [recoveryEmail, setRecoveryEmail] = useState(savedRecoveryRequest?.email ?? '');
  const [recoveryStatus, setRecoveryStatus] = useState<
    'idle' | 'sending' | 'sent' | 'needs_details' | 'verifying' | 'verified' | 'updating' | 'completed' | 'not_matched' | 'error'
  >(() => {
    if (!isPinRecoveryLink(recoveryActionUrl)) return 'idle';
    return savedRecoveryRequest ? 'verifying' : 'needs_details';
  });
  const [recoveryError, setRecoveryError] = useState('');
  const [newRecoveryPin, setNewRecoveryPin] = useState('');
  const [confirmRecoveryPin, setConfirmRecoveryPin] = useState('');
  const [activeRecoveryActionUrl, setActiveRecoveryActionUrl] = useState(
    () => isPinRecoveryLink(recoveryActionUrl) ? recoveryActionUrl : ''
  );

  useEffect(() => {
    const currentUrl = recoveryActionUrl;
    if (!isPinRecoveryLink(currentUrl) || recoveryLinkProcessingStarted.current) return;

    if (!savedRecoveryRequest) {
      return;
    }

    recoveryLinkProcessingStarted.current = true;
    void completePinRecoveryEmailLink(savedRecoveryRequest.email, currentUrl)
      .then(async () => {
        clearPinRecoveryLinkFromUrl();
        setActiveRecoveryActionUrl('');
        const matchesWorker = await verifyPinRecoveryWorker(savedRecoveryRequest.workerId);
        setRecoveryStatus(matchesWorker ? 'verified' : 'not_matched');
      })
      .catch((error: unknown) => {
        console.error('Error al verificar el enlace de recuperación:', error);
        if (isInvalidRecoveryActionCode(error)) {
          clearPinRecoveryLinkFromUrl();
          setActiveRecoveryActionUrl('');
          setRecoveryError('Este enlace venció o ya fue utilizado. Solicita uno nuevo e intenta abrirlo una sola vez.');
        } else {
          setRecoveryError('No se pudo completar la verificación. Revisa tu conexión e inténtalo nuevamente.');
        }
        setRecoveryStatus('error');
      });
  }, [recoveryActionUrl, savedRecoveryRequest]);

  const handleRecoverySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRecoveryError('');

    if (recoveryStatus === 'verified') {
      if (!/^\d{4}$/.test(newRecoveryPin)) {
        setRecoveryError('El nuevo PIN debe tener exactamente 4 dígitos.');
        return;
      }
      if (newRecoveryPin !== confirmRecoveryPin) {
        setRecoveryError('Los PIN ingresados no coinciden.');
        return;
      }

      setRecoveryStatus('updating');
      try {
        await updatePinRecoveryWorker(recoveryWorkerId, newRecoveryPin);
        setNewRecoveryPin('');
        setConfirmRecoveryPin('');
        setRecoveryStatus('completed');
      } catch (error) {
        console.error('Error al actualizar el PIN recuperado:', error);
        setRecoveryError(
          error instanceof Error
            ? error.message
            : 'No se pudo actualizar el PIN. Inténtalo nuevamente.'
        );
        setRecoveryStatus('verified');
      }
      return;
    }

    if (isPinRecoveryLink(activeRecoveryActionUrl)) {
      setRecoveryStatus('verifying');
      try {
        await completePinRecoveryEmailLink(recoveryEmail, activeRecoveryActionUrl);
        clearPinRecoveryLinkFromUrl();
        setActiveRecoveryActionUrl('');
        const matchesWorker = await verifyPinRecoveryWorker(recoveryWorkerId);
        setRecoveryStatus(matchesWorker ? 'verified' : 'not_matched');
      } catch (error) {
        console.error('Error al verificar el enlace de recuperación:', error);
        if (isInvalidRecoveryActionCode(error)) {
          clearPinRecoveryLinkFromUrl();
          setActiveRecoveryActionUrl('');
          setRecoveryError('Este enlace venció o ya fue utilizado. Solicita uno nuevo e intenta abrirlo una sola vez.');
        } else {
          setRecoveryError('No se pudo completar la verificación. Revisa los datos y tu conexión.');
        }
        setRecoveryStatus('error');
      }
      return;
    }

    setRecoveryStatus('sending');
    try {
      await sendPinRecoveryLink(recoveryEmail, recoveryWorkerId);
      setActiveRecoveryActionUrl('');
      setRecoveryStatus('sent');
    } catch (error) {
      console.error('Error al enviar el enlace de recuperación:', error);
      setRecoveryError(
        error instanceof Error
          ? error.message
          : 'No se pudo enviar el enlace. Revisa la configuración de Firebase e inténtalo nuevamente.'
      );
      setRecoveryStatus('error');
    }
  };

  const handleRecoveryBack = async () => {
    try {
      await cancelPinRecoveryAuthentication();
      setIsRecoveryOpen(false);
      if (recoveryStatus === 'completed') {
        setRecoveryStatus('idle');
        setRecoveryWorkerId('');
        setRecoveryEmail('');
      }
    } catch (error) {
      console.error('Error al cerrar la sesión temporal de recuperación:', error);
      setRecoveryError('No se pudo cerrar la sesión temporal. Inténtalo nuevamente.');
    }
  };

  const {
    step,
    workerId,
    pin,
    isErrorDialogVisible,
    errorMessage,
    handleIdKeyPress,
    handlePinKeyPress,
    closeErrorDialog
  } = useIntroFlow(onLoginSuccess, openedFromRecoveryLink);

  return (
    <Box 
      sx={{ 
        position: 'absolute', 
        inset: 0, 
        zIndex: 5, 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: 'background.default'
      }}
    >
      <Box sx={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        
        {/* Paso: Bienvenida */}
        <div className={`intro-step intro-welcome ${step === 'welcome' ? 'active' : 'exit'}`}>
          <Typography variant="h3" sx={{ fontWeight: 400, letterSpacing: 2 }}>Bienvenido</Typography>
        </div>

        {/* Paso: Ingreso de ID */}
        <div className={`intro-step intro-id ${step === 'id_input' && !isRecoveryOpen ? 'active' : ''} ${step === 'welcome' || isRecoveryOpen ? 'hidden' : ''} ${step === 'id_out' || step === 'pin_input' || step === 'loading' || step === 'done' ? 'exit-up' : ''}`}>
          <PinPad
            title="Ingrese su ID de trabajador"
            subtitle="5 dígitos"
            maxLength={5}
            currentValue={workerId}
            onKeyPress={handleIdKeyPress}
          />
        </div>

        {/* Paso: Ingreso de PIN */}
        <div className={`intro-step intro-pin ${step === 'pin_input' && !isRecoveryOpen ? 'active' : ''} ${step === 'welcome' || step === 'id_input' || step === 'id_out' || isRecoveryOpen ? 'hidden' : ''} ${step === 'loading' || step === 'done' ? 'exit-up' : ''}`}>
          <PinPad
            title="Ingrese su PIN"
            subtitle={workerId}
            maxLength={4}
            currentValue={pin}
            onKeyPress={handlePinKeyPress}
          />
          <Button
            variant="text"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => {
              setRecoveryWorkerId(workerId);
              setRecoveryStatus('idle');
              setRecoveryError('');
              setIsRecoveryOpen(true);
            }}
          >
            Olvidé mi PIN
          </Button>
        </div>

        <div className={`intro-step recovery-step ${isRecoveryOpen ? 'active' : 'hidden'}`} style={{ overflowY: 'auto' }}>
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
        </div>

      </Box>

      {/* Pantalla negra de carga que cubre todo y se desvanece suavemente */}
      <div className={`intro-cache-loader ${step === 'loading' || step === 'black_screen' ? 'active' : ''} ${step === 'done' || step === 'welcome' || step === 'id_input' ? 'exit-done' : ''}`}>
      </div>

      <LoginErrorDialog
        open={isErrorDialogVisible}
        message={errorMessage}
        onClose={closeErrorDialog}
      />
    </Box>
  );
}
