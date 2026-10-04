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
import { Box, IconButton, TextField, Button, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

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
          title="Confirma tu PIN"
          subtitle="Para cambiar el correo, verifica tu identidad"
          maxLength={4}
          currentValue={step === 'confirm_current' ? pinInput : ''}
          onKeyPress={handleKeyPress}
        />
      </Box>

      <Box 
        sx={{
          position: 'absolute', width: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', p: 4, maxWidth: 400,
          transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          ...(step === 'enter_new' 
            ? { opacity: 1, pointerEvents: 'auto', transform: 'translateY(0) scale(1)' } 
            : { opacity: 0, pointerEvents: 'none', transform: 'translateY(100px) scale(0.95)' })
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 500, mb: 1, textAlign: 'center' }}>Nuevo Correo</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, textAlign: 'center' }}>Ingresa tu nueva dirección de correo de recuperación</Typography>
        
        <TextField 
          fullWidth
          label="Correo Electrónico"
          type="email"
          variant="outlined"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          sx={{ mb: 3 }}
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
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2, p: 4, textAlign: 'center',
          transition: 'opacity 0.4s ease',
          opacity: step === 'success' ? 1 : 0, pointerEvents: step === 'success' ? 'auto' : 'none'
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Enlace enviado a {emailInput}</Typography>
        <Typography variant="body1" sx={{ opacity: 0.85, mb: 2 }}>El correo actual se mantendrá hasta que confirmes el enlace.</Typography>
        <Button
          variant="contained"
          fullWidth
          onClick={onClose}
          sx={{ 
            borderRadius: '24px', padding: '12px', textTransform: 'none', fontSize: '16px',
            bgcolor: '#ffffff', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' }
          }}
        >
          Cerrar
        </Button>
      </Box>

      <LoginErrorDialog 
        open={!!errorMsg} 
        message={errorMsg} 
        onClose={() => setErrorMsg('')} 
      />
    </Box>
  );
}
