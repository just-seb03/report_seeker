/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : pinRecoveryControl.ts                                            *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 04 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 04 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   getRecoveryContinueUrl -- Obtiene la URL web a la que Firebase devolverá el enlace.       *
 *   isPinRecoveryLink -- Comprueba si una URL contiene un enlace de acceso de Firebase.       *
 *   sendPinRecoveryLink -- Envía al correo un enlace para verificar acceso al buzón.          *
 *   completePinRecoveryEmailLink -- Completa el acceso mediante el enlace recibido.           *
 *   verifyPinRecoveryWorker -- Comprueba que el correo verificado pertenezca al trabajador.   *
 *   getSavedPinRecoveryRequest -- Recupera ID y correo guardados para completar el proceso.    *
 *   clearPinRecoveryLinkFromUrl -- Elimina parámetros del enlace del historial del navegador. *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Capacitor } from '@capacitor/core';
import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut,
  type UserCredential
} from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';

const PIN_RECOVERY_REQUEST_KEY = 'pin_recovery_request';

interface PinRecoveryRequest {
  email: string;
  workerId: string;
}

function getRecoveryContinueUrl(): string {
  const configuredUrl = import.meta.env.VITE_RECOVERY_CONTINUE_URL;

  if (configuredUrl) {
    return configuredUrl;
  }

  if (Capacitor.isNativePlatform()) {
    throw new Error('Configura VITE_RECOVERY_CONTINUE_URL con la URL pública de la aplicación web.');
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
    handleCodeInApp: true
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
  window.history.replaceState({}, document.title, window.location.pathname);
}
