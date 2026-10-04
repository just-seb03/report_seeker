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
 *     Última Actualización : 03 de Octubre de 2026    [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   Login -- Orquestador de la pantalla de bienvenida y flujo de ingreso de credenciales.     *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useState } from 'react';
import { type Trabajador } from '../control/authControl';
import { useIntroFlow } from '../control/useIntroFlow';
import PinPad from '../components/PinPad';
import LoginErrorDialog from '../components/LoginErrorDialog';
import './Login.css';

interface LoginProps {
  onLoginSuccess: (user: Trabajador) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryWorkerId, setRecoveryWorkerId] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryDetailsSubmitted, setRecoveryDetailsSubmitted] = useState(false);

  const {
    step,
    workerId,
    pin,
    isErrorDialogVisible,
    errorMessage,
    handleIdKeyPress,
    handlePinKeyPress,
    closeErrorDialog
  } = useIntroFlow(onLoginSuccess);

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
              setRecoveryDetailsSubmitted(false);
              setIsRecoveryOpen(true);
            }}
          >
            Olvidé mi PIN
          </button>
        </div>

        <div className={`intro-step recovery-step ${isRecoveryOpen ? 'active' : 'hidden'}`}>
          <form
            className="recovery-form"
            onSubmit={(event) => {
              event.preventDefault();
              setRecoveryDetailsSubmitted(true);
            }}
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
                setRecoveryDetailsSubmitted(false);
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
                setRecoveryDetailsSubmitted(false);
              }}
            />
            <button className="recovery-submit" type="submit">Continuar</button>
            {recoveryDetailsSubmitted && (
              <p className="recovery-notice" role="status">
                Datos ingresados. El envío del correo se incorporará en el siguiente paso.
              </p>
            )}
            <button
              className="recovery-back"
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
