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
    setEmailChangeStatus('updating');
    void completeEmailChangeLink(savedEmailChangeRequest, emailChangeActionUrl)
      .then(() => updateEmailChangeWorker(savedEmailChangeRequest))
      .then(() => setEmailChangeStatus('updated'))
      .catch((error: unknown) => {
        console.error('No se pudo completar el cambio de correo:', error);
        setEmailChangeError(
          error instanceof Error
            ? error.message
            : 'No se pudo actualizar el correo. Vuelve a solicitar el cambio.'
        );
        setEmailChangeStatus('error');
      });
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
    <main className={`login-screen ${step === 'loading' || step === 'done' || step === 'black_screen' ? 'is-loading' : ''}`}>
      <section className="login-content">
        
        {/* Paso: Bienvenida */}
        <div className={`intro-step intro-welcome ${step === 'welcome' ? 'active' : 'exit'}`}>
          <h1>Bienvenido</h1>
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
          <button
            className="recovery-link"
            type="button"
            onClick={() => {
              setRecoveryWorkerId(workerId);
              setRecoveryStatus('idle');
              setRecoveryError('');
              setIsRecoveryOpen(true);
            }}
          >
            Olvidé mi PIN
          </button>
        </div>

        <div className={`intro-step recovery-step ${isRecoveryOpen ? 'active' : 'hidden'}`}>
          <form
            className="recovery-form"
            onSubmit={handleRecoverySubmit}
          >
            <h2>Recuperar PIN</h2>
            <p>
              {recoveryStatus === 'verified'
                ? 'Correo verificado. Ingresa y confirma tu nuevo PIN de 4 dígitos.'
                : 'Ingresa tu ID de trabajador y el correo asociado a tu cuenta.'}
            </p>
            <label htmlFor="recovery-worker-id">ID de trabajador</label>
            <input
              id="recovery-worker-id"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{5}"
              maxLength={5}
              autoComplete="off"
              required
              disabled={recoveryStatus === 'verified' || recoveryStatus === 'updating' || recoveryStatus === 'completed'}
              value={recoveryWorkerId}
              onChange={(event) => {
                setRecoveryWorkerId(event.target.value.replace(/\D/g, '').slice(0, 5));
              }}
            />
            <label htmlFor="recovery-email">Correo electrónico</label>
            <input
              id="recovery-email"
              type="email"
              autoComplete="email"
              required
              disabled={recoveryStatus === 'verified' || recoveryStatus === 'updating' || recoveryStatus === 'completed'}
              value={recoveryEmail}
              onChange={(event) => {
                setRecoveryEmail(event.target.value);
              }}
            />
            {recoveryStatus === 'verified' && (
              <>
                <label htmlFor="recovery-new-pin">Nuevo PIN</label>
                <input
                  id="recovery-new-pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  autoComplete="new-password"
                  required
                  value={newRecoveryPin}
                  onChange={(event) => setNewRecoveryPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
                />
                <label htmlFor="recovery-confirm-pin">Confirma el nuevo PIN</label>
                <input
                  id="recovery-confirm-pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  autoComplete="new-password"
                  required
                  value={confirmRecoveryPin}
                  onChange={(event) => setConfirmRecoveryPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
                />
              </>
            )}
            {!['sent', 'completed'].includes(recoveryStatus) && (
              <button className="recovery-submit" type="submit" disabled={recoveryStatus === 'sending' || recoveryStatus === 'verifying' || recoveryStatus === 'updating'}>
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
              </button>
            )}
            {recoveryStatus === 'sent' && (
              <p className="recovery-notice" role="status">
                Si el correo puede recibir enlaces de acceso, recibirás un enlace para confirmar que tienes acceso a esa bandeja.
              </p>
            )}
            {recoveryStatus === 'verified' && (
              <p className="recovery-notice" role="status">
                Correo verificado y asociado al trabajador.
              </p>
            )}
            {recoveryStatus === 'completed' && (
              <p className="recovery-notice" role="status">
                PIN actualizado. Vuelve al inicio de sesión para ingresar con tu PIN nuevo.
              </p>
            )}
            {recoveryStatus === 'not_matched' && (
              <p className="recovery-error" role="alert">
                No se pudo validar la combinación de ID y correo. Revisa los datos e inténtalo nuevamente.
              </p>
            )}
            {recoveryError && (
              <p className="recovery-error" role="alert">{recoveryError}</p>
            )}
            <button
              className="recovery-back"
              disabled={recoveryStatus === 'sending' || recoveryStatus === 'verifying' || recoveryStatus === 'updating'}
              type="button"
              onClick={() => void handleRecoveryBack()}
            >
              {recoveryStatus === 'completed' ? 'Ir al inicio de sesión' : 'Volver al inicio de sesión'}
            </button>
          </form>
        </div>

      </section>

      {/* Pantalla negra de carga que cubre todo y se desvanece suavemente */}
      <div className={`intro-cache-loader ${step === 'loading' || step === 'black_screen' ? 'active' : ''} ${step === 'done' || step === 'welcome' || step === 'id_input' ? 'exit-done' : ''}`}>
      </div>

      <LoginErrorDialog
        open={isErrorDialogVisible}
        message={errorMessage}
        onClose={closeErrorDialog}
      />
    </main>
  );
}
