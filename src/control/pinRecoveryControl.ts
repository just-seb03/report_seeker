/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : pinRecoveryControl.ts                                            *
 *                                                                                             *
 *              Programador :Cristian Vega                                              *
 *                                                                                             *
 *          Fecha de Inicio : 04 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización :04 de Octubre de 2026 [CV]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   getRecoveryContinueUrl -- Obtiene la URL de retorno para enlaces de Firebase Auth.         *
 *   isPinRecoveryLink -- Comprueba si una URL contiene un enlace de acceso de Firebase.       *
 *   sendPinRecoveryLink -- Envía al correo un enlace para verificar acceso al buzón.          *
 *   completePinRecoveryEmailLink -- Completa el acceso mediante el enlace recibido.           *
 *   verifyPinRecoveryWorker -- Comprueba que el correo verificado pertenezca al trabajador.   *
 *   updatePinRecoveryWorker -- Guarda un PIN nuevo tras volver a validar la identidad.         *
 *   cancelPinRecoveryAuthentication -- Cierra la sesión temporal de recuperación.              *
 *   getSavedPinRecoveryRequest -- Recupera ID y correo guardados para completar el proceso.    *
 *   clearPinRecoveryLinkFromUrl -- Elimina parámetros del enlace del historial del navegador. *
 *   getPendingNativePinRecoveryLink -- Recupera temporalmente el enlace recibido en Android.   *
 *   savePendingNativePinRecoveryLink -- Conserva el enlace Android hasta montar la pantalla.  *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Capacitor } from '@capacitor/core';
import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut,
  type UserCredential
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../firebase';

const PIN_RECOVERY_REQUEST_KEY = 'pin_recovery_request';
const PENDING_NATIVE_RECOVERY_LINK_KEY = 'pending_native_pin_recovery_link';

interface PinRecoveryRequest {
  email: string;
  workerId: string;
}

export function getRecoveryContinueUrl(): string {
  const configuredUrl = import.meta.env.VITE_RECOVERY_CONTINUE_URL;

  if (configuredUrl) {
    return configuredUrl;
  }

  if (Capacitor.isNativePlatform()) {
    const projectId = auth.app.options.projectId;
    if (!projectId) {
      throw new Error('Firebase no tiene projectId configurado para crear el enlace de recuperación móvil.');
    }
    return `https://${projectId}.web.app`;
  }

  return window.location.origin;
}

export function isPinRecoveryLink(url: string): boolean {
  return isSignInWithEmailLink(auth, url);
}

export async function sendPinRecoveryLink(email: string, workerId: string): Promise<void> {
  const normalizedEmail = email.trim();
  await sendSignInLinkToEmail(auth, normalizedEmail, {
    url: getRecoveryContinueUrl(),
    handleCodeInApp: true,
    android: {
      packageName: 'app.reportseeker.mobile'
    }
  });
  window.localStorage.setItem(PIN_RECOVERY_REQUEST_KEY, JSON.stringify({
    email: normalizedEmail,
    workerId
  } satisfies PinRecoveryRequest));
}

export async function completePinRecoveryEmailLink(
  email: string,
  url: string
): Promise<UserCredential> {
  return signInWithEmailLink(auth, email.trim(), url);
}

export async function verifyPinRecoveryWorker(workerId: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!user?.email || !user.emailVerified) {
    throw new Error('La sesión no contiene un correo verificado.');
  }

  const workerQuery = query(
    collection(db, 'trabajadores'),
    where('trabajador_id', '==', Number(workerId))
  );
  const snapshot = await getDocs(workerQuery);
  const workerEmail = snapshot.empty
    ? null
    : (snapshot.docs[0].data().email as string | undefined);
  const emailMatches = workerEmail?.trim().toLowerCase() === user.email.trim().toLowerCase();

  if (!emailMatches) {
    await signOut(auth);
    window.localStorage.removeItem(PIN_RECOVERY_REQUEST_KEY);
    return false;
  }

  window.localStorage.removeItem(PIN_RECOVERY_REQUEST_KEY);
  return true;
}

export async function updatePinRecoveryWorker(workerId: string, newPin: string): Promise<void> {
  if (!/^\d{5}$/.test(workerId)) {
    throw new Error('El ID del trabajador no es válido.');
  }
  if (!/^\d{4}$/.test(newPin)) {
    throw new Error('El PIN debe contener exactamente 4 dígitos.');
  }

  const user = auth.currentUser;
  if (!user?.email || !user.emailVerified) {
    throw new Error('La sesión no contiene un correo verificado.');
  }

  const workerReference = doc(db, 'trabajadores', workerId);
  const workerSnapshot = await getDoc(workerReference);
  const workerEmail = workerSnapshot.exists()
    ? (workerSnapshot.data().email as string | undefined)
    : undefined;

  if (workerEmail?.trim().toLowerCase() !== user.email.trim().toLowerCase()) {
    await signOut(auth);
    window.localStorage.removeItem(PIN_RECOVERY_REQUEST_KEY);
    throw new Error('No se pudo confirmar que el correo pertenezca a este trabajador.');
  }

  await updateDoc(workerReference, { pin: newPin });
  await signOut(auth);
  window.localStorage.removeItem(PIN_RECOVERY_REQUEST_KEY);
}

export async function cancelPinRecoveryAuthentication(): Promise<void> {
  if (auth.currentUser) {
    await signOut(auth);
  }
}

export function getSavedPinRecoveryRequest(): PinRecoveryRequest | null {
  const storedRequest = window.localStorage.getItem(PIN_RECOVERY_REQUEST_KEY);
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
    console.error('No se pudo recuperar la solicitud pendiente de recuperación de PIN:', error);
  }

  window.localStorage.removeItem(PIN_RECOVERY_REQUEST_KEY);
  return null;
}

export function clearPinRecoveryLinkFromUrl(): void {
  if (isPinRecoveryLink(window.location.href)) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  window.sessionStorage.removeItem(PENDING_NATIVE_RECOVERY_LINK_KEY);
}

export function getPendingNativePinRecoveryLink(): string {
  return window.sessionStorage.getItem(PENDING_NATIVE_RECOVERY_LINK_KEY) ?? '';
}

export function savePendingNativePinRecoveryLink(url: string): void {
  window.sessionStorage.setItem(PENDING_NATIVE_RECOVERY_LINK_KEY, url);
}
