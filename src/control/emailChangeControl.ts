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
 *   sendEmailChangeLink -- Envía el enlace y guarda los datos de la solicitud.                 *
 *   getSavedEmailChangeRequest -- Recupera la solicitud pendiente de cambio de correo.        *
 *   isEmailChangeLink -- Identifica enlaces de acceso del flujo de cambio de correo.          *
 *   completeEmailChangeLink -- Comprueba el enlace y su correspondencia con el trabajador.   *
 *   getPendingNativeEmailChangeLink -- Recupera un enlace recibido al abrir Android.          *
 *   savePendingNativeEmailChangeLink -- Conserva el enlace recibido hasta montar la pantalla. *
 *   clearPendingNativeEmailChangeLink -- Descarta el enlace nativo pendiente al salir.         *
 *   cancelEmailChangeAuthentication -- Cierra la sesión y descarta la solicitud al cancelar. *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import {
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  signOut
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { getRecoveryContinueUrl } from './pinRecoveryControl';

const EMAIL_CHANGE_REQUEST_KEY = 'email_change_request';
const PENDING_NATIVE_EMAIL_CHANGE_LINK_KEY = 'pending_native_email_change_link';

export interface EmailChangeRequest {
  email: string;
  currentEmail: string;
  workerId: string;
}

function isValidEmailChangeRequest(request: EmailChangeRequest): boolean {
  return /^\S+@\S+\.\S+$/.test(request.email.trim())
    && /^\S+@\S+\.\S+$/.test(request.currentEmail.trim())
    && /^\d{5}$/.test(request.workerId);
}

export async function sendEmailChangeLink(
  email: string,
  currentEmail: string,
  workerId: number
): Promise<void> {
  const normalizedEmail = email.trim();
  const normalizedCurrentEmail = currentEmail.trim();
  if (!isValidEmailChangeRequest({
    email: normalizedEmail,
    currentEmail: normalizedCurrentEmail,
    workerId: String(workerId)
  })) {
    throw new Error('Los datos de la solicitud de cambio de correo no son válidos.');
  }

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
    currentEmail: normalizedCurrentEmail,
    workerId: String(workerId)
  } satisfies EmailChangeRequest));
}

export async function completeEmailChangeLink(
  request: EmailChangeRequest,
  url: string
): Promise<void> {
  if (!isValidEmailChangeRequest(request)) {
    throw new Error('La solicitud pendiente de cambio de correo no es válida.');
  }
  if (!isEmailChangeLink(url)) {
    throw new Error('El enlace no corresponde a una solicitud de cambio de correo.');
  }

  const credential = await signInWithEmailLink(auth, request.email.trim(), url);

  try {
    const verifiedEmail = credential.user.email?.trim().toLowerCase();
    const requestedEmail = request.email.trim().toLowerCase();
    if (!credential.user.emailVerified || verifiedEmail !== requestedEmail) {
      throw new Error('El enlace no confirma el correo solicitado para esta cuenta.');
    }

    const workerSnapshot = await getDoc(doc(db, 'trabajadores', request.workerId));
    const workerData = workerSnapshot.data();
    const workerEmail = typeof workerData?.email === 'string'
      ? workerData.email.trim().toLowerCase()
      : '';
    const workerIdMatches = workerData?.trabajador_id === Number(request.workerId);

    if (
      !workerSnapshot.exists()
      || !workerIdMatches
      || workerEmail !== request.currentEmail.trim().toLowerCase()
    ) {
      throw new Error('La solicitud ya no corresponde al correo registrado para este trabajador.');
    }
  } catch (error) {
    await signOut(auth);
    throw error;
  }
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
      && 'currentEmail' in request
      && typeof request.currentEmail === 'string'
      && 'workerId' in request
      && typeof request.workerId === 'string'
    ) {
      const emailChangeRequest = {
        email: request.email,
        currentEmail: request.currentEmail,
        workerId: request.workerId
      };
      if (isValidEmailChangeRequest(emailChangeRequest)) return emailChangeRequest;
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

export async function cancelEmailChangeAuthentication(): Promise<void> {
  if (auth.currentUser) {
    await signOut(auth);
  }

  window.localStorage.removeItem(EMAIL_CHANGE_REQUEST_KEY);
  clearPendingNativeEmailChangeLink();
}
