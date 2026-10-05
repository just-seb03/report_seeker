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
 *   Login -- Orquesta el ingreso, la recuperación de PIN y la actualización del correo      *
 *            confirmado mediante enlace.                                                    *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { type Trabajador } from '../control/authControl';
import {
  cancelEmailChangeAuthentication,
  completeEmailChangeLink,
  getPendingNativeEmailChangeLink,
  getSavedEmailChangeRequest,
  isEmailChangeLink,
  updateEmailChangeWorker
} from '../control/emailChangeControl';
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
import { t } from '../control/i18n';


interface LoginProps {
  onLoginSuccess: (user: Trabajador) => void;
}

function isInvalidRecoveryActionCode(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('code' in error)) return false;
  return error.code === 'auth/invalid-action-code' || error.code === 'auth/expired-action-code';
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [savedEmailChangeRequest] = useState(getSavedEmailChangeRequest);
  const [emailChangeActionUrl] = useState(() => {
    const pendingNativeLink = getPendingNativeEmailChangeLink();
    if (isEmailChangeLink(pendingNativeLink)) return pendingNativeLink;
    return isEmailChangeLink(window.location.href) ? window.location.href : '';
  });
  const openedFromEmailChangeLink = Boolean(emailChangeActionUrl);
  const emailChangeProcessingStarted = useRef(false);
  const [emailChangeStatus, setEmailChangeStatus] = useState<
    'checking' | 'updating' | 'updated' | 'needs_request' | 'error'
  >(() => {
    if (!emailChangeActionUrl) return 'checking';
    return savedEmailChangeRequest ? 'checking' : 'needs_request';
  });
  const [emailChangeError, setEmailChangeError] = useState('');
  const [recoveryActionUrl] = useState(() => {
    if (openedFromEmailChangeLink) return '';
    const pendingNativeLink = getPendingNativePinRecoveryLink();
    return isPinRecoveryLink(pendingNativeLink) ? pendingNativeLink : window.location.href;
  });
  const [openedFromRecoveryLink] = useState(
    () => !openedFromEmailChangeLink && isPinRecoveryLink(recoveryActionUrl)
  );
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
    if (
      !openedFromEmailChangeLink
      || !emailChangeActionUrl
      || !savedEmailChangeRequest
      || emailChangeProcessingStarted.current
    ) {
      return;
    }

    emailChangeProcessingStarted.current = true;
    const completeEmailChange = async () => {
      setEmailChangeStatus('updating');
      let completionError: unknown;
      let hasCompletionError = false;
      try {
        await completeEmailChangeLink(savedEmailChangeRequest, emailChangeActionUrl);
        await updateEmailChangeWorker(savedEmailChangeRequest);
      } catch (error) {
        completionError = error;
        hasCompletionError = true;
      }

      try {
        await cancelEmailChangeAuthentication();
      } catch (cleanupError) {
        console.error('No se pudo limpiar la sesión temporal del cambio de correo:', cleanupError);
        const message = !hasCompletionError
          ? ''
          : completionError instanceof Error
          ? completionError.message
          : 'No se pudo completar el cambio de correo.';
        setEmailChangeError(
          `${message}${message ? ' ' : ''}No se pudo cerrar la sesión temporal. Cierra la aplicación e inténtalo nuevamente.`
        );
        setEmailChangeStatus('error');
        return;
      }

      if (hasCompletionError) {
        console.error('No se pudo completar el cambio de correo:', completionError);
        setEmailChangeError(
          completionError instanceof Error
            ? completionError.message
            : 'No se pudo actualizar el correo. Vuelve a solicitar el cambio.'
        );
        setEmailChangeStatus('error');
        return;
      }

      setEmailChangeStatus('updated');
    };

    void completeEmailChange();
  }, [emailChangeActionUrl, openedFromEmailChangeLink, savedEmailChangeRequest]);

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

  if (openedFromEmailChangeLink) {
    return (
      <main className="login-screen">
        <section className="login-content">
          <div className="intro-step recovery-step active">
            <div className="recovery-form">
              <h2>Confirmar cambio de correo</h2>
              {emailChangeStatus === 'checking' && (
                <p role="status">Verificando el enlace...</p>
              )}
              {emailChangeStatus === 'updating' && (
                <p role="status">Confirmando el enlace y actualizando el correo...</p>
              )}
              {emailChangeStatus === 'updated' && savedEmailChangeRequest && (
                <p>
                  El correo de {savedEmailChangeRequest.workerId} se actualizó correctamente a
                  {' '}{savedEmailChangeRequest.email}.
                </p>
              )}
              {emailChangeStatus === 'needs_request' && (
                <p className="recovery-error" role="alert">
                  No se encontró la solicitud pendiente de este enlace. Vuelve a solicitar el cambio de correo.
                </p>
              )}
              {emailChangeStatus === 'error' && (
                <p className="recovery-error" role="alert">{emailChangeError}</p>
              )}
              {!['checking', 'updating'].includes(emailChangeStatus) && (
                <button
                  className="recovery-back"
                  type="button"
                  onClick={() => {
                    void cancelEmailChangeAuthentication()
                      .then(() => window.location.replace(window.location.pathname))
                      .catch((error: unknown) => {
                        console.error('No se pudo cancelar la solicitud de cambio de correo:', error);
                        setEmailChangeError(
                          error instanceof Error
                            ? error.message
                            : 'No se pudo cerrar la verificación temporal.'
                        );
                        setEmailChangeStatus('error');
                      });
                  }}
                >
                  Volver al inicio de sesión
                </button>
              )}
            </div>
          </div>
        </section>
      </main>
    );
  }

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
        <Box 
          sx={{
            position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center',
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            ...(step === 'welcome' 
              ? { opacity: 1, transform: 'translateY(0) scale(1)', pointerEvents: 'auto' } 
              : { opacity: 0, transform: 'translateY(-40px) scale(0.95)', pointerEvents: 'none' })
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 400, letterSpacing: 2 }}>{t.login.welcome}</Typography>
        </Box>

        {/* Paso: Ingreso de ID */}
        <Box 
          sx={{
            position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center',
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            ...(step === 'id_input' && !isRecoveryOpen 
              ? { opacity: 1, transform: 'translateX(0) scale(1)', pointerEvents: 'auto' } 
              : step === 'welcome' || isRecoveryOpen
                ? { opacity: 0, transform: 'translateX(100px) scale(0.95)', pointerEvents: 'none' }
                : { opacity: 0, transform: 'translateX(-100px) scale(0.95)', pointerEvents: 'none' })
          }}
        >
          <PinPad
            title={t.login.step1Title}
            subtitle={t.login.step1Subtitle}
            maxLength={5}
            currentValue={workerId}
            onKeyPress={handleIdKeyPress}
          />
        </Box>

        {/* Paso: Ingreso de PIN */}
        <Box 
          sx={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            ...(step === 'pin_input' && !isRecoveryOpen 
              ? { opacity: 1, transform: 'translateX(0) scale(1)', pointerEvents: 'auto' } 
              : step === 'welcome' || step === 'id_input' || isRecoveryOpen
                ? { opacity: 0, transform: 'translateX(100px) scale(0.95)', pointerEvents: 'none' }
                : { opacity: 0, transform: 'translateX(-100px) scale(0.95)', pointerEvents: 'none' })
          }}
        >
          <PinPad
            title={t.login.step2Title}
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
        </Box>

        <Box 
          sx={{
            position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', overflowY: 'auto', p: 2,
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            ...(isRecoveryOpen 
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

      </Box>

      {/* Pantalla negra de carga que cubre todo y se desvanece suavemente */}
      <Box 
        sx={{
          position: 'absolute', inset: 0, zIndex: 10, bgcolor: '#121212',
          transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          ...(step === 'loading' || step === 'black_screen' 
            ? { opacity: 1, pointerEvents: 'auto' } 
            : { opacity: 0, pointerEvents: 'none' })
        }}
      />

      <LoginErrorDialog
        open={isErrorDialogVisible}
        message={errorMessage}
        onClose={closeErrorDialog}
      />
    </Box>
  );
}
