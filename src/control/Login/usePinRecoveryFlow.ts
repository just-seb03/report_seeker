/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : usePinRecoveryFlow.ts                                            *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 05 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 05 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   usePinRecoveryFlow -- Custom hook que maneja el estado y la lógica para la recuperación   *
 *        de PIN (enviar correo, verificar enlace, crear nuevo PIN).                           *
 *   isInvalidRecoveryActionCode -- Verifica si el error de Firebase es por enlace inválido.   *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useState, useRef, useEffect, type FormEvent } from 'react';
import {
  cancelPinRecoveryAuthentication,
  clearPinRecoveryLinkFromUrl,
  completePinRecoveryEmailLink,
  getPendingNativePinRecoveryLink,
  getSavedPinRecoveryRequest,
  isPinRecoveryLink,
  sendPinRecoveryLink,
  updatePinRecoveryWorker,
  verifyPinRecoveryWorker
} from '../global/pinRecoveryControl';

export function isInvalidRecoveryActionCode(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('code' in error)) return false;
  return (error as any).code === 'auth/invalid-action-code' || (error as any).code === 'auth/expired-action-code';
}

export function usePinRecoveryFlow(
  initialWorkerId: string, 
  onClose: () => void
) {
  const [recoveryActionUrl] = useState(() => {
    const pendingNativeLink = getPendingNativePinRecoveryLink();
    return isPinRecoveryLink(pendingNativeLink) ? pendingNativeLink : window.location.href;
  });
  
  const [openedFromRecoveryLink] = useState(() => isPinRecoveryLink(recoveryActionUrl));
  const [savedRecoveryRequest] = useState(getSavedPinRecoveryRequest);
  const recoveryLinkProcessingStarted = useRef(false);
  
  const [recoveryWorkerId, setRecoveryWorkerId] = useState(savedRecoveryRequest?.workerId ?? initialWorkerId);
  const [recoveryEmail, setRecoveryEmail] = useState(savedRecoveryRequest?.email ?? '');
  
  const [recoveryStatus, setRecoveryStatus] = useState<
    'idle' | 'sending' | 'sent' | 'needs_details' | 'verifying' | 'verified' | 'updating' | 'completed' | 'not_matched' | 'error'
  >(() => {
    if (!isPinRecoveryLink(recoveryActionUrl)) return 'idle';
    return savedRecoveryRequest ? 'verifying' : 'needs_details';
  });
  
  const [recoveryError, setRecoveryError] = useState('');
  const [newRecoveryPin, setNewRecoveryPin] = useState('');
  const [confirmRecoveryPin, setConfirmRecoveryPin] = useState('');
  
  const [activeRecoveryActionUrl, setActiveRecoveryActionUrl] = useState(
    () => isPinRecoveryLink(recoveryActionUrl) ? recoveryActionUrl : ''
  );

  useEffect(() => {
    const currentUrl = recoveryActionUrl;
    if (!isPinRecoveryLink(currentUrl) || recoveryLinkProcessingStarted.current) return;

    if (!savedRecoveryRequest) {
      return;
    }

    recoveryLinkProcessingStarted.current = true;
    void completePinRecoveryEmailLink(savedRecoveryRequest.email, currentUrl)
      .then(async () => {
        clearPinRecoveryLinkFromUrl();
        setActiveRecoveryActionUrl('');
        const matchesWorker = await verifyPinRecoveryWorker(savedRecoveryRequest.workerId);
        setRecoveryStatus(matchesWorker ? 'verified' : 'not_matched');
      })
      .catch((error: unknown) => {
        console.error('Error al verificar el enlace de recuperación:', error);
        if (isInvalidRecoveryActionCode(error)) {
          clearPinRecoveryLinkFromUrl();
          setActiveRecoveryActionUrl('');
          setRecoveryError('Este enlace venció o ya fue utilizado. Solicita uno nuevo e intenta abrirlo una sola vez.');
        } else {
          setRecoveryError('No se pudo completar la verificación. Revisa tu conexión e inténtalo nuevamente.');
        }
        setRecoveryStatus('error');
      });
  }, [recoveryActionUrl, savedRecoveryRequest]);

  const handleRecoverySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRecoveryError('');

    if (recoveryStatus === 'verified') {
      if (!/^\d{4}$/.test(newRecoveryPin)) {
        setRecoveryError('El nuevo PIN debe tener exactamente 4 dígitos.');
        return;
      }
      if (newRecoveryPin !== confirmRecoveryPin) {
        setRecoveryError('Los PIN ingresados no coinciden.');
        return;
      }

      setRecoveryStatus('updating');
      try {
        await updatePinRecoveryWorker(recoveryWorkerId, newRecoveryPin);
        setNewRecoveryPin('');
        setConfirmRecoveryPin('');
        setRecoveryStatus('completed');
      } catch (error) {
        console.error('Error al actualizar el PIN recuperado:', error);
        setRecoveryError(
          error instanceof Error
            ? error.message
            : 'No se pudo actualizar el PIN. Inténtalo nuevamente.'
        );
        setRecoveryStatus('verified');
      }
      return;
    }

    if (isPinRecoveryLink(activeRecoveryActionUrl)) {
      setRecoveryStatus('verifying');
      try {
        await completePinRecoveryEmailLink(recoveryEmail, activeRecoveryActionUrl);
        clearPinRecoveryLinkFromUrl();
        setActiveRecoveryActionUrl('');
        const matchesWorker = await verifyPinRecoveryWorker(recoveryWorkerId);
        setRecoveryStatus(matchesWorker ? 'verified' : 'not_matched');
      } catch (error) {
        console.error('Error al verificar el enlace de recuperación:', error);
        if (isInvalidRecoveryActionCode(error)) {
          clearPinRecoveryLinkFromUrl();
          setActiveRecoveryActionUrl('');
          setRecoveryError('Este enlace venció o ya fue utilizado. Solicita uno nuevo e intenta abrirlo una sola vez.');
        } else {
          setRecoveryError('No se pudo completar la verificación. Revisa los datos y tu conexión.');
        }
        setRecoveryStatus('error');
      }
      return;
    }

    setRecoveryStatus('sending');
    try {
      await sendPinRecoveryLink(recoveryEmail, recoveryWorkerId);
      setActiveRecoveryActionUrl('');
      setRecoveryStatus('sent');
    } catch (error) {
      console.error('Error al enviar el enlace de recuperación:', error);
      setRecoveryError(
        error instanceof Error
          ? error.message
          : 'No se pudo enviar el enlace. Revisa la configuración de Firebase e inténtalo nuevamente.'
      );
      setRecoveryStatus('error');
    }
  };

  const handleRecoveryBack = async () => {
    try {
      await cancelPinRecoveryAuthentication();
      onClose();
      if (recoveryStatus === 'completed') {
        setRecoveryStatus('idle');
        setRecoveryWorkerId('');
        setRecoveryEmail('');
      }
    } catch (error) {
      console.error('Error al cerrar la sesión temporal de recuperación:', error);
      setRecoveryError('No se pudo cerrar la sesión temporal. Inténtalo nuevamente.');
    }
  };

  return {
    openedFromRecoveryLink,
    recoveryWorkerId,
    setRecoveryWorkerId,
    recoveryEmail,
    setRecoveryEmail,
    recoveryStatus,
    recoveryError,
    newRecoveryPin,
    setNewRecoveryPin,
    confirmRecoveryPin,
    setConfirmRecoveryPin,
    activeRecoveryActionUrl,
    handleRecoverySubmit,
    handleRecoveryBack
  };
}
