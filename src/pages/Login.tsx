/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : Login.tsx                                                        *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 03 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 05 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   Login -- Componente orquestador del ingreso, que delega a EmailChangeFlow o               *
 *            PinRecoveryFlow según el estado o enlace activo.                                 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useState } from 'react';
import { type Trabajador } from '../control/authControl';
import { useIntroFlow } from '../control/useIntroFlow';
import {
  getPendingNativeEmailChangeLink,
  isEmailChangeLink,
} from '../control/emailChangeControl';
import {
  getPendingNativePinRecoveryLink,
  isPinRecoveryLink,
} from '../control/pinRecoveryControl';

import { Box, Button, Typography } from '@mui/material';
import PinPad from '../components/PinPad';
import LoginErrorDialog from '../components/LoginErrorDialog';
import { t } from '../control/i18n';

import EmailChangeFlow from '../components/EmailChangeFlow';
import PinRecoveryFlow from '../components/PinRecoveryFlow';

interface LoginProps {
  onLoginSuccess: (user: Trabajador) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [emailChangeActionUrl] = useState(() => {
    const pendingNativeLink = getPendingNativeEmailChangeLink();
    if (isEmailChangeLink(pendingNativeLink)) return pendingNativeLink;
    return isEmailChangeLink(window.location.href) ? window.location.href : '';
  });
  const openedFromEmailChangeLink = Boolean(emailChangeActionUrl);

  const [recoveryActionUrl] = useState(() => {
    if (openedFromEmailChangeLink) return '';
    const pendingNativeLink = getPendingNativePinRecoveryLink();
    return isPinRecoveryLink(pendingNativeLink) ? pendingNativeLink : window.location.href;
  });
  
  const [openedFromRecoveryLink] = useState(
    () => !openedFromEmailChangeLink && isPinRecoveryLink(recoveryActionUrl)
  );

  const [isRecoveryOpen, setIsRecoveryOpen] = useState(openedFromRecoveryLink);

  const {
    step,
    workerId,
    pin,
    isErrorDialogVisible,
    errorMessage,
    handleIdKeyPress,
    handlePinKeyPress,
    closeErrorDialog
  } = useIntroFlow(onLoginSuccess, openedFromRecoveryLink);

  if (openedFromEmailChangeLink) {
    return <EmailChangeFlow />;
  }

  return (
    <Box 
      sx={{ 
        position: 'absolute', 
        inset: 0, 
        zIndex: 5, 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: 'background.default'
      }}
    >
      <Box sx={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        
        {/* Paso: Bienvenida */}
        <Box 
          sx={{
            position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center',
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            ...(step === 'welcome' 
              ? { opacity: 1, transform: 'translateY(0) scale(1)', pointerEvents: 'auto' } 
              : { opacity: 0, transform: 'translateY(-40px) scale(0.95)', pointerEvents: 'none' })
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 400, letterSpacing: 2 }}>{t.login.welcome}</Typography>
        </Box>

        {/* Paso: Ingreso de ID */}
        <Box 
          sx={{
            position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center',
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            ...(step === 'id_input' && !isRecoveryOpen 
              ? { opacity: 1, transform: 'translateX(0) scale(1)', pointerEvents: 'auto' } 
              : step === 'welcome' || isRecoveryOpen
                ? { opacity: 0, transform: 'translateX(100px) scale(0.95)', pointerEvents: 'none' }
                : { opacity: 0, transform: 'translateX(-100px) scale(0.95)', pointerEvents: 'none' })
          }}
        >
          <PinPad
            title={t.login.step1Title}
            subtitle={t.login.step1Subtitle}
            maxLength={5}
            currentValue={workerId}
            onKeyPress={handleIdKeyPress}
          />
        </Box>

        {/* Paso: Ingreso de PIN */}
        <Box 
          sx={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            ...(step === 'pin_input' && !isRecoveryOpen 
              ? { opacity: 1, transform: 'translateX(0) scale(1)', pointerEvents: 'auto' } 
              : step === 'welcome' || step === 'id_input' || isRecoveryOpen
                ? { opacity: 0, transform: 'translateX(100px) scale(0.95)', pointerEvents: 'none' }
                : { opacity: 0, transform: 'translateX(-100px) scale(0.95)', pointerEvents: 'none' })
          }}
        >
          <PinPad
            title={t.login.step2Title}
            subtitle={workerId}
            maxLength={4}
            currentValue={pin}
            onKeyPress={handlePinKeyPress}
          />
          <Button
            variant="text"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => setIsRecoveryOpen(true)}
          >
            Olvidé mi PIN
          </Button>
        </Box>

        {/* Flujo de Recuperación de PIN superpuesto */}
        <PinRecoveryFlow 
          initialWorkerId={workerId}
          isVisible={isRecoveryOpen}
          onClose={() => setIsRecoveryOpen(false)}
        />

      </Box>

      {/* Pantalla negra de carga que cubre todo y se desvanece suavemente */}
      <Box 
        sx={{
          position: 'absolute', inset: 0, zIndex: 10, bgcolor: '#121212',
          transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          ...(step === 'loading' || step === 'black_screen' 
            ? { opacity: 1, pointerEvents: 'auto' } 
            : { opacity: 0, pointerEvents: 'none' })
        }}
      />

      <LoginErrorDialog
        open={isErrorDialogVisible}
        message={errorMessage}
        onClose={closeErrorDialog}
      />
    </Box>
  );
}
