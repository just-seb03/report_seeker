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

import { type Trabajador } from '../control/authControl';
import { useIntroFlow } from '../control/useIntroFlow';
import PinPad from '../components/PinPad';
import LoginErrorDialog from '../components/LoginErrorDialog';
import './Login.css';

interface LoginProps {
  onLoginSuccess: (user: Trabajador) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
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
        <div className={`intro-step intro-id ${step === 'id_input' ? 'active' : ''} ${step === 'welcome' ? 'hidden' : ''} ${step === 'id_out' || step === 'pin_input' || step === 'loading' || step === 'done' ? 'exit-up' : ''}`}>
          <PinPad
            title="Ingrese su ID de trabajador"
            subtitle="5 dígitos"
            maxLength={5}
            currentValue={workerId}
            onKeyPress={handleIdKeyPress}
          />
        </div>

        {/* Paso: Ingreso de PIN */}
        <div className={`intro-step intro-pin ${step === 'pin_input' ? 'active' : ''} ${step === 'welcome' || step === 'id_input' || step === 'id_out' ? 'hidden' : ''} ${step === 'loading' || step === 'done' ? 'exit-up' : ''}`}>
          <PinPad
            title="Ingrese su PIN"
            subtitle={workerId}
            maxLength={4}
            currentValue={pin}
            onKeyPress={handlePinKeyPress}
          />
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
