/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : ChangePinDialog.tsx                                              *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 03 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 03 de Octubre de 2026                                            *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   ChangePinDialog -- Componente de pantalla completa para cambiar el PIN.                   *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useState } from 'react';
import PinPad from './PinPad';
import LoginErrorDialog from './LoginErrorDialog';
import { getCurrentUser, updateUserLocal } from '../control/authControl';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { insertOrUpdateTrabajadorLocal } from '../database';
import { Box, IconButton } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import './ChangePinDialog.css';

interface ChangePinDialogProps {
  onClose: () => void;
}

type Step = 'confirm_current' | 'enter_new' | 'loading' | 'success';

export default function ChangePinDialog({ onClose }: ChangePinDialogProps) {
  const [step, setStep] = useState<Step>('confirm_current');
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const user = getCurrentUser();

  const handleKeyPress = async (key: string) => {
    if (step === 'loading' || step === 'success') return;

    if (key === 'backspace') {
      setPinInput(prev => prev.slice(0, -1));
      return;
    }

    if (pinInput.length < 4) {
      const newVal = pinInput + key;
      setPinInput(newVal);

      if (newVal.length === 4) {
        if (step === 'confirm_current') {
          if (newVal === user?.pin) {
            // Animación al siguiente paso
            setStep('loading');
            setTimeout(() => {
              setPinInput('');
              setStep('enter_new');
            }, 600);
          } else {
            setErrorMsg('PIN actual incorrecto');
            setPinInput('');
          }
        } else if (step === 'enter_new') {
          // Cambiar el PIN
          setStep('loading');
          await updatePin(newVal);
        }
      }
    }
  };

  const updatePin = async (newPin: string) => {
    if (!user) return;
    try {
      // 1. Update in Firebase
      const userRef = doc(db, 'trabajadores', user.trabajador_id.toString());
      await updateDoc(userRef, { pin: newPin });
      
      // 2. Update local storage & SQLite
      const updatedUser = { ...user, pin: newPin };
      updateUserLocal(updatedUser);
      await insertOrUpdateTrabajadorLocal(updatedUser);

      setStep('success');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e) {
      console.error(e);
      setErrorMsg('Error al conectar con el servidor.');
      setStep('enter_new');
      setPinInput('');
    }
  };

  return (
    <Box className="change-pin-dialog">
      <IconButton className="change-pin-close" onClick={onClose} aria-label="Cerrar">
        <CloseRoundedIcon />
      </IconButton>

      <div className={`change-pin-step ${step === 'confirm_current' ? 'active' : 'hidden'}`}>
        <PinPad
          title="Confirma tu PIN actual"
          subtitle="Para continuar, verifica tu identidad"
          maxLength={4}
          currentValue={step === 'confirm_current' ? pinInput : ''}
          onKeyPress={handleKeyPress}
        />
      </div>

      <div className={`change-pin-step ${step === 'enter_new' ? 'active' : 'hidden'}`}>
        <PinPad
          title="Ingresa tu nuevo PIN"
          subtitle="4 dígitos"
          maxLength={4}
          currentValue={step === 'enter_new' ? pinInput : ''}
          onKeyPress={handleKeyPress}
        />
      </div>

      <div className={`change-pin-loader ${step === 'loading' ? 'active' : ''}`}>
        {/* Loading overlay sin texto, oscuro */}
      </div>

      <div className={`change-pin-success ${step === 'success' ? 'active' : ''}`}>
        <h2>PIN actualizado con éxito</h2>
      </div>

      <LoginErrorDialog 
        open={!!errorMsg} 
        message={errorMsg} 
        onClose={() => setErrorMsg('')} 
      />
    </Box>
  );
}
