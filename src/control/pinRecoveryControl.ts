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
 *   getSavedPinRecoveryEmail -- Recupera el correo guardado para completar el acceso.         *
 *   clearPinRecoveryLinkFromUrl -- Elimina parámetros del enlace del historial del navegador. *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Capacitor } from '@capacitor/core';
import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  type UserCredential
} from 'firebase/auth';
import { auth } from '../firebase';

const EMAIL_FOR_SIGN_IN_KEY = 'pin_recovery_email';

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

export async function sendPinRecoveryLink(email: string): Promise<void> {
  const normalizedEmail = email.trim();
  await sendSignInLinkToEmail(auth, normalizedEmail, {
    url: getRecoveryContinueUrl(),
    handleCodeInApp: true
  });
  window.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, normalizedEmail);
}

export async function completePinRecoveryEmailLink(
  email: string,
  url: string
): Promise<UserCredential> {
  const credential = await signInWithEmailLink(auth, email.trim(), url);
  window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
  return credential;
}

export function getSavedPinRecoveryEmail(): string {
  return window.localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY) ?? '';
}

export function clearPinRecoveryLinkFromUrl(): void {
  window.history.replaceState({}, document.title, window.location.pathname);
}
