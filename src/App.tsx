/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : App.tsx                                                       *
 *                                                                                             *
 *              Programador :Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 29 de Septiembre de 2026                                      *
 *                                                                                             *
 *     Última Actualización :04 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   App -- Componente principal de la aplicación; maneja temas, sesión y enlaces de           *
 *          recuperación de PIN y cambio de correo recibidos por Android.                     *
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
import {
  isEmailChangeLink,
  savePendingNativeEmailChangeLink
} from './control/emailChangeControl';

import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';

function App() {
  const [currentUser, setCurrentUser] = useState<Trabajador | null>(getCurrentUser());
  const [actionLinkLaunch, setActionLinkLaunch] = useState(0);

  useEffect(() => {
    let handledActionUrl = '';
    const handleActionLink = (url: string) => {
      if (url === handledActionUrl) return;

      if (isEmailChangeLink(url)) {
        savePendingNativeEmailChangeLink(url);
      } else if (isPinRecoveryLink(url)) {
        savePendingNativePinRecoveryLink(url);
      } else {
        return;
      }

      handledActionUrl = url;
      logout();
      setActionLinkLaunch((launch) => launch + 1);
    };

    const handleLanguageChange = () => {
      // Forzar un re-render global sin desmontar los componentes
      setActionLinkLaunch(l => l + 1);
    };
    window.addEventListener('languagechange', handleLanguageChange);

    resetPushNotificationCount();
    const sub = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) resetPushNotificationCount();
    });
    const actionLinkSub = CapacitorApp.addListener('appUrlOpen', ({ url }) => {
      handleActionLink(url);
    });

    const handleLogout = () => setCurrentUser(null);
    window.addEventListener('user_logout', handleLogout);

    const currentUrl = window.location.href;
    if (isEmailChangeLink(currentUrl) || isPinRecoveryLink(currentUrl)) {
      logout();
    }

    void CapacitorApp.getLaunchUrl()
      .then((launchUrl) => {
        if (launchUrl?.url) handleActionLink(launchUrl.url);
      })
      .catch((error: unknown) => {
        console.error('No se pudo recuperar el enlace con el que se abrió la aplicación:', error);
      });

    return () => {
      sub.then(listener => listener.remove());
      actionLinkSub.then(listener => listener.remove());
      window.removeEventListener('user_logout', handleLogout);
      window.removeEventListener('languagechange', handleLanguageChange);
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
          key={actionLinkLaunch}
          onLoginSuccess={(user) => setCurrentUser(user)}
        />
      )}
    </ThemeProvider>
  );
}

export default App;
