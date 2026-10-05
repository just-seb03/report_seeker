/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : LoginForm.tsx                                                    *
 *                                                                                             *
 *              Programador :Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 03 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización :04 de Octubre de 2026 [SA]                                            *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   LoginForm -- Componente visual reutilizable que contiene el teclado numérico interactivo  *
 *                estilo pin pad.                                                              *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import BackspaceOutlinedIcon from '@mui/icons-material/BackspaceOutlined';
import { t } from '../../control/global/i18n';

export interface LoginFormProps {
  isLoading: boolean;
  error?: string;
  onSubmit: (workerId: string, pin: string) => void;
}

export default function LoginForm({ isLoading, error, onSubmit }: LoginFormProps) {
  const [step, setStep] = useState<1 | 2>(1); // 1 = ID, 2 = PIN
  const [workerId, setWorkerId] = useState('');
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (error) {
      setShake(true);
      setPin(''); // Limpiamos el pin para que lo vuelva a ingresar
      const t = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(t);
    }
  }, [error]);

  const handlePress = (key: string) => {
    if (isLoading) return;

    if (key === 'backspace') {
      if (step === 1) {
        setWorkerId((prev: string) => prev.slice(0, -1));
      } else {
        if (pin.length > 0) {
          setPin((prev: string) => prev.slice(0, -1));
        } else {
          setStep(1); // Volver al paso 1 si borra estando el PIN vacío
        }
      }
      return;
    }

    if (step === 1) {
      if (workerId.length < 5) {
        const newVal = workerId + key;
        setWorkerId(newVal);
        if (newVal.length === 5) {
          // Esperamos un momento para que se vea el último punto antes de avanzar
          setTimeout(() => setStep(2), 150);
        }
      }
    } else {
      if (pin.length < 4) {
        const newVal = pin + key;
        setPin(newVal);
        if (newVal.length === 4) {
          onSubmit(workerId, newVal);
        }
      }
    }
  };
  const title = step === 1 ? t.login.step1Title : t.login.step2Title;
  const subtitle = step === 1 ? t.login.step1Subtitle : workerId;
  const currentLength = step === 1 ? workerId.length : pin.length;
  const maxLength = step === 1 ? 5 : 4;

  return (
    <Box 
      sx={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 340, mx: 'auto',
        animation: shake ? 'shake-anim 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both' : 'none'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 5, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>{title}</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, letterSpacing: 1 }}>{subtitle}</Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          {Array.from({ length: maxLength }).map((_, i) => (
            <Box
              key={i}
              sx={{
                width: 14, height: 14, borderRadius: '50%',
                border: '1.5px solid',
                borderColor: i < currentLength ? 'primary.main' : 'text.disabled',
                bgcolor: i < currentLength ? 'primary.main' : 'transparent',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: i < currentLength ? 'scale(1.1)' : 'scale(1)'
              }}
            />
          ))}
        </Box>
        <Box sx={{ height: 24, mt: 2, display: 'flex', alignItems: 'center' }}>
          {error && <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 500 }}>{error}</Typography>}
        </Box>
      </Box>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px', width: '100%' }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <Box
            component="button"
            key={num}
            onClick={() => handlePress(num)}
            disabled={isLoading}
            sx={{
              background: 'transparent', border: 'none', borderRadius: '50%',
              height: 72, width: 72, fontSize: 32, fontWeight: 300, color: 'text.primary',
              cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', mx: 'auto',
              transition: 'background-color 0.15s ease', WebkitTapHighlightColor: 'transparent',
              '&:active:not(:disabled)': { bgcolor: 'action.selected' }
            }}
          >
            {num}
          </Box>
        ))}
        <Box sx={{ visibility: 'hidden' }} />
        <Box
          component="button"
          onClick={() => handlePress('0')}
          disabled={isLoading}
          sx={{
            background: 'transparent', border: 'none', borderRadius: '50%',
            height: 72, width: 72, fontSize: 32, fontWeight: 300, color: 'text.primary',
            cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', mx: 'auto',
            transition: 'background-color 0.15s ease', WebkitTapHighlightColor: 'transparent',
            '&:active:not(:disabled)': { bgcolor: 'action.selected' }
          }}
        >
          0
        </Box>
        <Box
          component="button"
          onClick={() => handlePress('backspace')}
          disabled={isLoading}
          aria-label="Borrar"
          sx={{
            background: 'transparent', border: 'none', borderRadius: '50%',
            height: 72, width: 72, color: 'text.primary',
            cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', mx: 'auto',
            transition: 'background-color 0.15s ease', WebkitTapHighlightColor: 'transparent',
            '&:active:not(:disabled)': { bgcolor: 'action.selected' }
          }}
        >
          <BackspaceOutlinedIcon fontSize="large" />
        </Box>
      </Box>

      {isLoading && (
        <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 1.5, color: 'primary.main', fontWeight: 500, animation: 'fade-in 0.3s ease' }}>
          <CircularProgress size={20} color="inherit" thickness={4} />
          <Typography component="span" variant="body2" sx={{ fontWeight: 500 }}>{t.login.loading}</Typography>
        </Box>
      )}
    </Box>
  );
}
