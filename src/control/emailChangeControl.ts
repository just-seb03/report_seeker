/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : emailChangeControl.ts                                            *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 04 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 04 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   sendEmailChangeLink -- Envía un enlace y guarda la solicitud de cambio de correo.        *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { sendSignInLinkToEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { getRecoveryContinueUrl } from './pinRecoveryControl';

const EMAIL_CHANGE_REQUEST_KEY = 'email_change_request';

export interface EmailChangeRequest {
  email: string;
  workerId: string;
}

export async function sendEmailChangeLink(email: string, workerId: number): Promise<void> {
  const normalizedEmail = email.trim();
  await sendSignInLinkToEmail(auth, normalizedEmail, {
    url: getRecoveryContinueUrl(),
    handleCodeInApp: true,
    android: {
      packageName: 'app.reportseeker.mobile'
    }
  });

  window.localStorage.setItem(EMAIL_CHANGE_REQUEST_KEY, JSON.stringify({
    email: normalizedEmail,
    workerId: String(workerId)
  } satisfies EmailChangeRequest));
}
