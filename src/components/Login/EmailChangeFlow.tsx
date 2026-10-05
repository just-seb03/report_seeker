/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : EmailChangeFlow.tsx                                              *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 05 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 05 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   EmailChangeFlow -- Componente visual que renderiza la pantalla de confirmación de cambio  *
 *        de correo electrónico.                                                               *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useEmailChangeFlow } from '../../control/Login/useEmailChangeFlow';

export default function EmailChangeFlow() {
  const {
    emailChangeStatus,
    emailChangeError,
    savedEmailChangeRequest,
    handleBack
  } = useEmailChangeFlow();

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
                onClick={handleBack}
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
