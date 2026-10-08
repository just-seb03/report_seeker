/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : ChangePinDialog.tsx                                              *
 *                                                                                             *
 *              Programador :Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 03 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización :04 de Octubre de 2026 [SA]                                            *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   ChangePinDialog -- Componente de pantalla completa para cambiar el PIN.                   *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { t } from '../../control/global/i18n';
import { useState } from 'react';
import PinPad from '../global/PinPad';
import LoginErrorDialog from '../global/LoginErrorDialog';
import { getCurrentUser, updateUserLocal } from '../../control/global/authControl';
import { hashPin } from '../../control/global/cryptoControl';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { insertOrUpdateTrabajadorLocal } from '../../database';
import { Box, IconButton, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface ChangePinDialogProps {
  onClose: () => void;
  isClosing?: boolean;
}

type Step = 'confirm_current' | 'enter_new' | 'loading' | 'success';

export default function ChangePinDialog({ onClose, isClosing }: ChangePinDialogProps) {
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
          const hashedInput = await hashPin(newVal);
          if (hashedInput === user?.pin) {
            // Animación al siguiente paso
            setStep('loading');
            setTimeout(() => {
              setPinInput('');
              setStep('enter_new');
            }, 600);
          } else {
            setErrorMsg(t.changePin.errorIncorrect);
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
      console.log('Iniciando updatePin:', {
        trabajador_id: user.trabajador_id,
        idType: typeof user.trabajador_id,
        newPin
      });
      
      const docId = String(user.trabajador_id);
      console.log('Doc ID a actualizar:', docId);

      const hashedNewPin = await hashPin(newPin);
      const userRef = doc(db, 'trabajadores', docId);
      await updateDoc(userRef, { pin: hashedNewPin });
      console.log('Firebase updateDoc completado con exito.');
      
      const updatedUser = { ...user, pin: hashedNewPin };
      updateUserLocal(updatedUser);
      await insertOrUpdateTrabajadorLocal(updatedUser);
      console.log('Actualizacion local completada.');

      // Temporarily use error dialog to show debug success message
      setErrorMsg(`Exito! Doc actualizado: ${docId}, Nuevo PIN: ${newPin}`);
      setStep('success');
      setTimeout(() => {
        onClose();
        // Reset error message so it doesn't persist forever
        setErrorMsg('');
      }, 3500);
    } catch (e: any) {
      console.error('Error detallado en updatePin:', e);
      setErrorMsg(`Error: ${e.message || 'Desconocido'}`);
      setStep('enter_new');
      setPinInput('');
    }
  };

  return (
    <Box 
      sx={{
        position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', flexDirection: 'column', 
        justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
        bgcolor: 'background.default', color: 'text.primary',
        animation: isClosing 
          ? 'slideDownFade 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' 
          : 'slideUpFade 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
      }}
    >
      <IconButton 
        onClick={onClose} 
        aria-label="Cerrar"
        sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1001 }}
      >
        <CloseRoundedIcon />
      </IconButton>

      <Box 
        sx={{
          position: 'absolute', width: '100%', display: 'flex', justifyContent: 'center',
          transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          ...(step === 'confirm_current' 
            ? { opacity: 1, pointerEvents: 'auto', transform: 'translateY(0) scale(1)' } 
            : { opacity: 0, pointerEvents: 'none', transform: 'translateY(100px) scale(0.95)' })
        }}
      >
        <PinPad
          title={t.changePin.confirmTitle}
          subtitle={t.changePin.confirmSubtitle}
          maxLength={4}
          currentValue={step === 'confirm_current' ? pinInput : ''}
          onKeyPress={handleKeyPress}
        />
      </Box>

      <Box 
        sx={{
          position: 'absolute', width: '100%', display: 'flex', justifyContent: 'center',
          transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          ...(step === 'enter_new' 
            ? { opacity: 1, pointerEvents: 'auto', transform: 'translateY(0) scale(1)' } 
            : { opacity: 0, pointerEvents: 'none', transform: 'translateY(100px) scale(0.95)' })
        }}
      >
        <PinPad
          title={t.changePin.newTitle}
          subtitle={t.changePin.newSubtitle}
          maxLength={4}
          currentValue={step === 'enter_new' ? pinInput : ''}
          onKeyPress={handleKeyPress}
        />
      </Box>

      <Box 
        sx={{
          position: 'absolute', inset: 0, zIndex: 1002, bgcolor: '#121212',
          transition: 'opacity 0.4s ease',
          opacity: step === 'loading' ? 1 : 0, pointerEvents: step === 'loading' ? 'auto' : 'none'
        }}
      />

      <Box 
        sx={{
          position: 'absolute', inset: 0, zIndex: 1003, bgcolor: 'primary.main', color: '#ffffff',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          transition: 'opacity 0.4s ease',
          opacity: step === 'success' ? 1 : 0, pointerEvents: step === 'success' ? 'auto' : 'none'
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 500 }}>{t.changePin.success}</Typography>
      </Box>

      <LoginErrorDialog 
        open={!!errorMsg} 
        message={errorMsg} 
        onClose={() => setErrorMsg('')} 
      />
    </Box>
  );
}
