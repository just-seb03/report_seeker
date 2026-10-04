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
 *   sendEmailChangeLink -- Envía un enlace marcado para el flujo de cambio y guarda la solicitud.
 *   getSavedEmailChangeRequest -- Recupera la solicitud pendiente de cambio de correo.        *
 *   isEmailChangeLink -- Identifica enlaces de acceso del flujo de cambio de correo.          *
 *   getPendingNativeEmailChangeLink -- Recupera un enlace recibido al abrir Android.          *
 *   savePendingNativeEmailChangeLink -- Conserva el enlace recibido hasta montar la pantalla. *
 *   clearPendingNativeEmailChangeLink -- Descarta el enlace nativo pendiente al salir.         *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { isSignInWithEmailLink, sendSignInLinkToEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { getRecoveryContinueUrl } from './pinRecoveryControl';

const EMAIL_CHANGE_REQUEST_KEY = 'email_change_request';
const PENDING_NATIVE_EMAIL_CHANGE_LINK_KEY = 'pending_native_email_change_link';

export interface EmailChangeRequest {
  email: string;
  workerId: string;
}

export async function sendEmailChangeLink(email: string, workerId: number): Promise<void> {
  const normalizedEmail = email.trim();
  const continueUrl = new URL(getRecoveryContinueUrl());
  continueUrl.searchParams.set('flow', 'email-change');

  await sendSignInLinkToEmail(auth, normalizedEmail, {
    url: continueUrl.toString(),
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

export function getSavedEmailChangeRequest(): EmailChangeRequest | null {
  const storedRequest = window.localStorage.getItem(EMAIL_CHANGE_REQUEST_KEY);
  if (!storedRequest) return null;

  try {
    const request: unknown = JSON.parse(storedRequest);
    if (
      typeof request === 'object'
      && request !== null
      && 'email' in request
      && typeof request.email === 'string'
      && 'workerId' in request
      && typeof request.workerId === 'string'
    ) {
      return { email: request.email, workerId: request.workerId };
    }
  } catch (error) {
    console.error('No se pudo recuperar la solicitud pendiente de cambio de correo:', error);
  }

  window.localStorage.removeItem(EMAIL_CHANGE_REQUEST_KEY);
  return null;
}

function hasEmailChangeFlow(url: string, depth = 0): boolean {
  if (depth > 2) return false;

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.searchParams.get('flow') === 'email-change') return true;

    const nestedUrl = parsedUrl.searchParams.get('continueUrl')
      ?? parsedUrl.searchParams.get('link');
    return nestedUrl ? hasEmailChangeFlow(nestedUrl, depth + 1) : false;
  } catch {
    return false;
  }
}

export function isEmailChangeLink(url: string): boolean {
  if (!isSignInWithEmailLink(auth, url)) return false;
  if (hasEmailChangeFlow(url)) return true;

  return getSavedEmailChangeRequest() !== null
    && window.localStorage.getItem('pin_recovery_request') === null;
}

export function getPendingNativeEmailChangeLink(): string {
  return window.sessionStorage.getItem(PENDING_NATIVE_EMAIL_CHANGE_LINK_KEY) ?? '';
}

export function savePendingNativeEmailChangeLink(url: string): void {
  window.sessionStorage.setItem(PENDING_NATIVE_EMAIL_CHANGE_LINK_KEY, url);
}

export function clearPendingNativeEmailChangeLink(): void {
  window.sessionStorage.removeItem(PENDING_NATIVE_EMAIL_CHANGE_LINK_KEY);
}
