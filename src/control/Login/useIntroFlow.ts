/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : useIntroFlow.ts                                                  *
 *                                                                                             *
 *              Programador :Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 03 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización :04 de Octubre de 2026 [CV]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   useIntroFlow -- Controlador de la máquina de estados para la bienvenida y el login;      *
 *                   permite omitir la introducción al abrir un enlace externo.               *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useState, useEffect, useCallback } from 'react';
import { loginWithFirebase, type Trabajador } from '../global/authControl';

import { getIssueReportsPage } from '../../database';

export type IntroStep = 'black_screen' | 'welcome' | 'id_input' | 'id_out' | 'pin_input' | 'loading' | 'done';

export function useIntroFlow(
  onLoginSuccess: (user: Trabajador) => void,
  skipIntro = false
) {
  const [step, setStep] = useState<IntroStep>(() => skipIntro ? 'id_input' : 'black_screen');
  const [workerId, setWorkerId] = useState('');
  const [pin, setPin] = useState('');
  const [isErrorDialogVisible, setIsErrorDialogVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Start sequence
  useEffect(() => {
    if (skipIntro) return;

    const skipWelcome = sessionStorage.getItem('skip_welcome') === 'true';
    if (skipWelcome) {
      const timer = setTimeout(() => setStep('id_input'), 1000); // 1 segundo negro
      return () => clearTimeout(timer);
    } else {
      const welcomeTimer = setTimeout(() => setStep('welcome'), 0);
      const timer = setTimeout(() => setStep('id_input'), 2000); // Muestra "Bienvenido" por 2 segundos
      return () => {
        clearTimeout(welcomeTimer);
        clearTimeout(timer);
      };
    }
  }, [skipIntro]);

  const performLogin = useCallback(async (idStr: string, pinStr: string) => {
    const numId = parseInt(idStr, 10);
    try {
      const user = await loginWithFirebase(numId, pinStr);

      if (user) {
        // Cargar caché real (SQLite) para evitar tirones en el inicio
        try {
          await getIssueReportsPage(5);
        } catch (error) {
          console.error(error);
        }

        setTimeout(() => {
          setStep('done');
          setTimeout(() => {
            onLoginSuccess(user);
          }, 300); // Tiempo para terminar transición antes de desmontar
        }, 500); // Breve espera para que la transición negra se vea bien
      } else {
        setErrorMessage('ID de trabajador o PIN incorrectos.');
        setIsErrorDialogVisible(true);
      }
    } catch (error) {
      console.error('Error inesperado durante el inicio de sesión:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo completar el inicio de sesión. Revisa la conexión e inténtalo de nuevo.'
      );
      setIsErrorDialogVisible(true);
    }
  }, [onLoginSuccess]);

  const handleIdKeyPress = useCallback((key: string) => {
    if (step !== 'id_input') return;

    if (key === 'backspace') {
      setWorkerId(prev => prev.slice(0, -1));
      return;
    }

    if (workerId.length < 5) {
      const newVal = workerId + key;
      setWorkerId(newVal);
      if (newVal.length === 5) {
        // Transición de salida del ID
        setTimeout(() => {
          setStep('id_out');
          setTimeout(() => setStep('pin_input'), 400); // 400ms para animar salida
        }, 300);
      }
    }
  }, [step, workerId]);

  const handlePinKeyPress = useCallback(async (key: string) => {
    if (step !== 'pin_input') return;

    if (key === 'backspace') {
      if (pin.length > 0) {
        setPin(prev => prev.slice(0, -1));
      } else {
        // Volver a id_input
        setWorkerId('');
        setStep('id_input');
      }
      return;
    }

    if (pin.length < 4) {
      const newVal = pin + key;
      setPin(newVal);
      if (newVal.length === 4) {
        setStep('loading'); // Pantalla negra
        await performLogin(workerId, newVal);
      }
    }
  }, [step, pin, workerId, performLogin]);

  const closeErrorDialog = () => {
    setIsErrorDialogVisible(false);
    setPin('');
    setStep('pin_input');
  };

  return {
    step,
    workerId,
    pin,
    isErrorDialogVisible,
    errorMessage,
    handleIdKeyPress,
    handlePinKeyPress,
    closeErrorDialog
  };
}
