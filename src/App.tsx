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

import { useEffect, useMemo, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { useAppStore } from './store/useAppStore';
import { resetPushNotificationCount } from './control/global/systemNotificationsControl';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Home from './pages/Home';
import Login from './pages/Login';
import { logout } from './control/global/authControl';
import {
  isPinRecoveryLink,
  savePendingNativePinRecoveryLink
} from './control/global/pinRecoveryControl';
import { createAppTheme } from './control/global/theme';
import {
  isEmailChangeLink,
  savePendingNativeEmailChangeLink
} from './control/global/emailChangeControl';

import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';

function App() {
  const currentUser = useAppStore(state => state.currentUser);
  const setCurrentUser = useAppStore(state => state.setCurrentUser);
  const isDarkMode = useAppStore(state => state.isDarkMode);
  const toggleDarkMode = useAppStore(state => state.toggleDarkMode);
  
  const [actionLinkLaunch, setActionLinkLaunch] = useState(0);

  const appTheme = useMemo(
    () => createAppTheme(isDarkMode ? 'dark' : 'light'),
    [isDarkMode],
  );

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

    resetPushNotificationCount();
    const sub = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) resetPushNotificationCount();
    });
    const actionLinkSub = CapacitorApp.addListener('appUrlOpen', ({ url }) => {
      handleActionLink(url);
    });

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
    };
  }, []);

  useEffect(() => {
    const mode = isDarkMode ? 'dark' : 'light';
    window.localStorage.setItem('report-seeker-theme', mode);
    document.documentElement.style.colorScheme = mode;
    document.documentElement.style.setProperty('--app-background', appTheme.palette.background.default);
    document.documentElement.style.setProperty('--app-text', appTheme.palette.text.primary);
  }, [appTheme, isDarkMode]);

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      {currentUser ? (
        <Home
          isDarkMode={isDarkMode}
          onToggleManualTheme={toggleDarkMode}
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
