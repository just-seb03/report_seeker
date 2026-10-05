/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : useEmailChangeFlow.ts                                            *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 05 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 05 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   useEmailChangeFlow -- Custom hook que maneja el estado y la lógica de verificación y      *
 *        actualización del enlace de cambio de correo electrónico.                            *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useState, useRef, useEffect } from 'react';
import {
  cancelEmailChangeAuthentication,
  completeEmailChangeLink,
  getPendingNativeEmailChangeLink,
  getSavedEmailChangeRequest,
  isEmailChangeLink,
  updateEmailChangeWorker
} from './emailChangeControl';

export function useEmailChangeFlow() {
  const [savedEmailChangeRequest] = useState(getSavedEmailChangeRequest);
  const [emailChangeActionUrl] = useState(() => {
    const pendingNativeLink = getPendingNativeEmailChangeLink();
    if (isEmailChangeLink(pendingNativeLink)) return pendingNativeLink;
    return isEmailChangeLink(window.location.href) ? window.location.href : '';
  });
  
  const openedFromEmailChangeLink = Boolean(emailChangeActionUrl);
  const emailChangeProcessingStarted = useRef(false);
  
  const [emailChangeStatus, setEmailChangeStatus] = useState<
    'checking' | 'updating' | 'updated' | 'needs_request' | 'error'
  >(() => {
    if (!emailChangeActionUrl) return 'checking';
    return savedEmailChangeRequest ? 'checking' : 'needs_request';
  });
  
  const [emailChangeError, setEmailChangeError] = useState('');

  useEffect(() => {
    if (
      !openedFromEmailChangeLink
      || !emailChangeActionUrl
      || !savedEmailChangeRequest
      || emailChangeProcessingStarted.current
    ) {
      return;
    }

    emailChangeProcessingStarted.current = true;
    const completeEmailChange = async () => {
      setEmailChangeStatus('updating');
      let completionError: unknown;
      let hasCompletionError = false;
      try {
        await completeEmailChangeLink(savedEmailChangeRequest, emailChangeActionUrl);
        await updateEmailChangeWorker(savedEmailChangeRequest);
      } catch (error) {
        completionError = error;
        hasCompletionError = true;
      }

      try {
        await cancelEmailChangeAuthentication();
      } catch (cleanupError) {
        console.error('No se pudo limpiar la sesión temporal del cambio de correo:', cleanupError);
        const message = !hasCompletionError
          ? ''
          : completionError instanceof Error
          ? completionError.message
          : 'No se pudo completar el cambio de correo.';
        setEmailChangeError(
          `${message}${message ? ' ' : ''}No se pudo cerrar la sesión temporal. Cierra la aplicación e inténtalo nuevamente.`
        );
        setEmailChangeStatus('error');
        return;
      }

      if (hasCompletionError) {
        console.error('No se pudo completar el cambio de correo:', completionError);
        setEmailChangeError(
          completionError instanceof Error
            ? completionError.message
            : 'No se pudo actualizar el correo. Vuelve a solicitar el cambio.'
        );
        setEmailChangeStatus('error');
        return;
      }

      setEmailChangeStatus('updated');
    };

    void completeEmailChange();
  }, [emailChangeActionUrl, openedFromEmailChangeLink, savedEmailChangeRequest]);

  const handleBack = async () => {
    try {
      await cancelEmailChangeAuthentication();
      window.location.replace(window.location.pathname);
    } catch (error: unknown) {
      console.error('No se pudo cancelar la solicitud de cambio de correo:', error);
      setEmailChangeError(
        error instanceof Error
          ? error.message
          : 'No se pudo cerrar la verificación temporal.'
      );
      setEmailChangeStatus('error');
    }
  };

  return {
    openedFromEmailChangeLink,
    emailChangeStatus,
    emailChangeError,
    savedEmailChangeRequest,
    handleBack
  };
}
