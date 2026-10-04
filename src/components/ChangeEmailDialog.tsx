/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : ChangeEmailDialog.tsx                                            *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 03 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 04 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   ChangeEmailDialog -- Solicita un cambio de correo mediante un enlace de confirmación.     *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useState } from 'react';
import PinPad from './PinPad';
import LoginErrorDialog from './LoginErrorDialog';
import { getCurrentUser } from '../control/authControl';
import { sendEmailChangeLink } from '../control/emailChangeControl';
import { Box, IconButton, TextField, Button } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import './ChangePinDialog.css'; // Reutilizamos estilos

interface ChangeEmailDialogProps {
  onClose: () => void;
  isClosing?: boolean;
}

type Step = 'confirm_current' | 'enter_new' | 'loading' | 'success';

export default function ChangeEmailDialog({ onClose, isClosing }: ChangeEmailDialogProps) {
  const [step, setStep] = useState<Step>('confirm_current');
  const [pinInput, setPinInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const user = getCurrentUser();

  const handleKeyPress = (key: string) => {
    if (step === 'loading' || step === 'success') return;

    if (key === 'backspace') {
      setPinInput(prev => prev.slice(0, -1));
      return;
    }

    if (pinInput.length < 4) {
      const newVal = pinInput + key;
      setPinInput(newVal);

      if (newVal.length === 4) {
        if (newVal === user?.pin) {
          setStep('loading');
          setTimeout(() => {
            setEmailInput(user?.email || '');
            setStep('enter_new');
          }, 600);
        } else {
          setErrorMsg('PIN actual incorrecto');
          setPinInput('');
        }
      }
    }
  };

  const handleUpdateEmail = async () => {
    if (!user) return;
    
    // Simple email validation
    if (!/^\S+@\S+\.\S+$/.test(emailInput)) {
      setErrorMsg('Formato de correo inválido');
      return;
    }

    setStep('loading');
    try {
      await sendEmailChangeLink(emailInput, user.email, user.trabajador_id);
      setStep('success');
    } catch (error) {
      console.error('No se pudo enviar el enlace para cambiar el correo:', error);
      setErrorMsg(error instanceof Error ? error.message : 'No se pudo enviar el enlace.');
      setStep('enter_new');
    }
  };

  return (
    <Box className={`change-pin-dialog ${isClosing ? 'closing' : ''}`}>
      <IconButton className="change-pin-close" onClick={onClose} aria-label="Cerrar">
        <CloseRoundedIcon />
      </IconButton>

      <div className={`change-pin-step ${step === 'confirm_current' ? 'active' : 'hidden'}`}>
        <PinPad
          title="Confirma tu PIN"
          subtitle="Para cambiar el correo, verifica tu identidad"
          maxLength={4}
          currentValue={step === 'confirm_current' ? pinInput : ''}
          onKeyPress={handleKeyPress}
        />
      </div>

      <div className={`change-pin-step ${step === 'enter_new' ? 'active' : 'hidden'}`} style={{ flexDirection: 'column', padding: '32px', maxWidth: '400px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 500, marginBottom: '8px', textAlign: 'center' }}>Nuevo Correo</h2>
        <p style={{ color: '#74777f', marginBottom: '32px', textAlign: 'center' }}>Ingresa tu nueva dirección de correo de recuperación</p>
        
        <TextField 
          fullWidth
          label="Correo Electrónico"
          type="email"
          variant="outlined"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          sx={{ marginBottom: '24px' }}
        />
        
        <Button 
          variant="contained" 
          fullWidth 
          size="large"
          onClick={handleUpdateEmail}
          sx={{ borderRadius: '24px', padding: '12px', textTransform: 'none', fontSize: '16px' }}
        >
          Actualizar Correo
        </Button>
      </div>

      <div className={`change-pin-loader ${step === 'loading' ? 'active' : ''}`}>
        {/* Loading overlay oscuro */}
      </div>

      <div
        className={`change-pin-success ${step === 'success' ? 'active' : ''}`}
        style={{ flexDirection: 'column', gap: '16px', padding: '32px', textAlign: 'center' }}
      >
        <h2>Enlace enviado a {emailInput}</h2>
        <p>El correo actual se mantendrá hasta que confirmes el enlace.</p>
        <Button
          variant="contained"
          fullWidth
          onClick={onClose}
          sx={{ borderRadius: '24px', padding: '12px', textTransform: 'none', fontSize: '16px' }}
        >
          Cerrar
        </Button>
      </div>

      <LoginErrorDialog 
        open={!!errorMsg} 
        message={errorMsg} 
        onClose={() => setErrorMsg('')} 
      />
    </Box>
  );
}
