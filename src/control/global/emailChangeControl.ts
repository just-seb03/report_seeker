/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : emailChangeControl.ts                                            *
 *                                                                                             *
 *              Programador :Cristian Vega                                              *
 *                                                                                             *
 *          Fecha de Inicio : 04 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización :04 de Octubre de 2026 [CV]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   sendEmailChangeLink -- Envía el enlace y guarda los datos de la solicitud.                 *
 *   getSavedEmailChangeRequest -- Recupera la solicitud pendiente de cambio de correo.        *
 *   isEmailChangeLink -- Identifica enlaces de acceso del flujo de cambio de correo.          *
 *   completeEmailChangeLink -- Comprueba el enlace y su correspondencia con el trabajador.   *
 *   updateEmailChangeWorker -- Actualiza el correo confirmado en Firebase y cachés locales.  *
 *   getPendingNativeEmailChangeLink -- Recupera un enlace recibido al abrir Android.          *
 *   savePendingNativeEmailChangeLink -- Conserva el enlace recibido hasta montar la pantalla. *
 *   clearPendingNativeEmailChangeLink -- Descarta el enlace nativo pendiente al salir.         *
 *   cancelEmailChangeAuthentication -- Cierra la sesión y limpia los datos del flujo.        *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import {
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  signOut
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  where
} from 'firebase/firestore';
import { auth, db } from '../../firebase';
import {
  getCurrentUser,
  updateUserLocal,
  type Trabajador
} from './authControl';
import { insertOrUpdateTrabajadorLocal } from '../../database';
import { getRecoveryContinueUrl } from './pinRecoveryControl';

const EMAIL_CHANGE_REQUEST_KEY = 'email_change_request';
const PENDING_NATIVE_EMAIL_CHANGE_LINK_KEY = 'pending_native_email_change_link';

export interface EmailChangeRequest {
  email: string;
  currentEmail: string;
  workerId: string;
}

interface EmailChangeWorker extends Trabajador {
  trabajador_id: number;
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

export async function updateEmailChangeWorker(request: EmailChangeRequest): Promise<void> {
  if (!isValidEmailChangeRequest(request)) {
    throw new Error('La solicitud pendiente de cambio de correo no es válida.');
  }
  const verifiedEmail = auth.currentUser?.email?.trim().toLowerCase();
  if (
    !auth.currentUser?.emailVerified
    || verifiedEmail !== request.email.trim().toLowerCase()
  ) {
    throw new Error('El correo nuevo debe estar confirmado antes de actualizar los datos.');
  }

  const emailMatches = await getDocs(query(
    collection(db, 'trabajadores'),
    where('email', '==', request.email.trim())
  ));
  if (emailMatches.docs.some((workerDocument) => workerDocument.id !== request.workerId)) {
    throw new Error('Este correo ya está asociado a otro trabajador.');
  }

  const workerReference = doc(db, 'trabajadores', request.workerId);
  const updatedWorker = await runTransaction(db, async (transaction) => {
    const workerSnapshot = await transaction.get(workerReference);
    if (!workerSnapshot.exists()) {
      throw new Error('No se encontró el trabajador asociado a la solicitud.');
    }

    const workerData = workerSnapshot.data();
    if (
      typeof workerData.trabajador_id !== 'number'
      || workerData.trabajador_id !== Number(request.workerId)
      || typeof workerData.nombre !== 'string'
      || typeof workerData.pin !== 'string'
      || typeof workerData.email !== 'string'
      || workerData.email.trim().toLowerCase() !== request.currentEmail.trim().toLowerCase()
    ) {
      throw new Error('El correo registrado cambió o el trabajador no coincide con la solicitud.');
    }

    transaction.update(workerReference, { email: request.email.trim() });
    return {
      trabajador_id: workerData.trabajador_id,
      nombre: workerData.nombre,
      email: request.email.trim(),
      pin: workerData.pin
    } satisfies EmailChangeWorker;
  });

  try {
    const localUser = getCurrentUser();
    if (
      localUser?.trabajador_id === updatedWorker.trabajador_id
      && localUser.email.trim().toLowerCase() === request.currentEmail.trim().toLowerCase()
    ) {
      updateUserLocal(updatedWorker);
    }
    await insertOrUpdateTrabajadorLocal(updatedWorker);
  } catch (error) {
    console.error('El correo se actualizó en Firestore, pero falló la sincronización local:', error);
    throw new Error(
      'El correo se actualizó en Firebase, pero falló la sincronización local. Vuelve a iniciar sesión para sincronizar los datos.',
      { cause: error }
    );
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
  try {
    if (auth.currentUser) {
      await signOut(auth);
    }
  } finally {
    window.localStorage.removeItem(EMAIL_CHANGE_REQUEST_KEY);
    clearPendingNativeEmailChangeLink();

    if (isEmailChangeLink(window.location.href)) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
}
