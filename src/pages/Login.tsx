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
 *   Login -- Orquesta el ingreso de credenciales y la verificación de correo para recuperar   *
 *            el PIN.                                                                          *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useEffect, useState, type FormEvent } from 'react';
import { type Trabajador } from '../control/authControl';
import {
  clearPinRecoveryLinkFromUrl,
  completePinRecoveryEmailLink,
  getSavedPinRecoveryEmail,
  isPinRecoveryLink,
  sendPinRecoveryLink
} from '../control/pinRecoveryControl';
import { useIntroFlow } from '../control/useIntroFlow';
import PinPad from '../components/PinPad';
import LoginErrorDialog from '../components/LoginErrorDialog';
import './Login.css';

interface LoginProps {
  onLoginSuccess: (user: Trabajador) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [openedFromRecoveryLink] = useState(() => isPinRecoveryLink(window.location.href));
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(openedFromRecoveryLink);
  const [recoveryWorkerId, setRecoveryWorkerId] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState(getSavedPinRecoveryEmail);
  const [recoveryStatus, setRecoveryStatus] = useState<
    'idle' | 'sending' | 'sent' | 'needs_email' | 'verifying' | 'verified' | 'error'
  >(() => {
    if (!isPinRecoveryLink(window.location.href)) return 'idle';
    return getSavedPinRecoveryEmail() ? 'verifying' : 'needs_email';
  });
  const [recoveryError, setRecoveryError] = useState('');

  useEffect(() => {
    const currentUrl = window.location.href;
    if (!isPinRecoveryLink(currentUrl)) return;

    const savedEmail = getSavedPinRecoveryEmail();
    if (!savedEmail) {
      return;
    }

    void completePinRecoveryEmailLink(savedEmail, currentUrl)
      .then(() => {
        clearPinRecoveryLinkFromUrl();
        setRecoveryStatus('verified');
      })
      .catch((error: unknown) => {
        console.error('Error al verificar el enlace de recuperación:', error);
        setRecoveryError('No se pudo verificar el enlace. Puede haber vencido o ya haber sido utilizado.');
        setRecoveryStatus('error');
      });
  }, []);

  const handleRecoverySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRecoveryError('');

    if (isPinRecoveryLink(window.location.href)) {
      setRecoveryStatus('verifying');
      try {
        await completePinRecoveryEmailLink(recoveryEmail, window.location.href);
        clearPinRecoveryLinkFromUrl();
        setRecoveryStatus('verified');
      } catch (error) {
        console.error('Error al verificar el enlace de recuperación:', error);
        setRecoveryError('No se pudo verificar el enlace. Revisa el correo ingresado o solicita un enlace nuevo.');
        setRecoveryStatus('error');
      }
      return;
    }

    setRecoveryStatus('sending');
    try {
      await sendPinRecoveryLink(recoveryEmail);
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
            <p>Ingresa tu ID de trabajador y el correo asociado a tu cuenta.</p>
            <label htmlFor="recovery-worker-id">ID de trabajador</label>
            <input
              id="recovery-worker-id"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{5}"
              maxLength={5}
              autoComplete="off"
              required
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
              value={recoveryEmail}
              onChange={(event) => {
                setRecoveryEmail(event.target.value);
              }}
            />
            {recoveryStatus !== 'sent' && recoveryStatus !== 'verified' && (
              <button className="recovery-submit" type="submit" disabled={recoveryStatus === 'sending' || recoveryStatus === 'verifying'}>
                {recoveryStatus === 'sending'
                  ? 'Enviando...'
                  : recoveryStatus === 'verifying'
                    ? 'Verificando...'
                    : recoveryStatus === 'needs_email' || isPinRecoveryLink(window.location.href)
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
                Correo verificado. Esto confirma el acceso al correo, pero todavía no cambia ni recupera el PIN.
              </p>
            )}
            {recoveryError && (
              <p className="recovery-error" role="alert">{recoveryError}</p>
            )}
            <button
              className="recovery-back"
              disabled={recoveryStatus === 'sending' || recoveryStatus === 'verifying'}
              type="button"
              onClick={() => setIsRecoveryOpen(false)}
            >
              Volver al inicio de sesión
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
