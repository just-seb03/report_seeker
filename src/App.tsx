/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : App.tsx                                                       *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 29 de Septiembre de 2026                                      *
 *                                                                                             *
 *     Última Actualización : 04 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   App -- Componente principal de la aplicación; maneja temas, sesión y enlaces de           *
 *          recuperación PIN recibidos por Android.                                            *
 *   handleToggleManualTheme -- Alterna manualmente el tema visual (claro/oscuro) de la        *
 *        interfaz.                                                                            *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useEffect, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { resetPushNotificationCount } from './control/systemNotificationsControl';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Home from './pages/Home';
import Login from './pages/Login';
import { getCurrentUser, logout, type Trabajador } from './control/authControl';
import {
  isPinRecoveryLink,
  savePendingNativePinRecoveryLink
} from './control/pinRecoveryControl';
import { appTheme } from './control/theme';

import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';

function App() {
  const [currentUser, setCurrentUser] = useState<Trabajador | null>(getCurrentUser());
  const [recoveryLinkLaunch, setRecoveryLinkLaunch] = useState(0);

  useEffect(() => {
    resetPushNotificationCount();
    const sub = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) resetPushNotificationCount();
    });
    const recoveryLinkSub = CapacitorApp.addListener('appUrlOpen', ({ url }) => {
      if (!isPinRecoveryLink(url)) return;

      savePendingNativePinRecoveryLink(url);
      logout();
      setRecoveryLinkLaunch((launch) => launch + 1);
    });

    const handleLogout = () => setCurrentUser(null);
    window.addEventListener('user_logout', handleLogout);

    return () => {
      sub.then(listener => listener.remove());
      recoveryLinkSub.then(listener => listener.remove());
      window.removeEventListener('user_logout', handleLogout);
    };
  }, []);

  const handleToggleManualTheme = () => {
    // Disabled for now, as requested.
  };

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      {currentUser ? (
        <Home
          isDarkMode={false}
          onToggleManualTheme={handleToggleManualTheme}
        />
      ) : (
        <Login
          key={recoveryLinkLaunch}
          onLoginSuccess={(user) => setCurrentUser(user)}
        />
      )}
    </ThemeProvider>
  );
}

export default App;
