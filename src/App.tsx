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

import { useEffect, useMemo, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { resetPushNotificationCount } from './control/systemNotificationsControl';
import { ThemeProvider, createTheme, CssBaseline, useMediaQuery } from '@mui/material';
import Home from './pages/Home';
import Login from './pages/Login';
import { getCurrentUser, logout, type Trabajador } from './control/authControl';
import {
  isPinRecoveryLink,
  savePendingNativePinRecoveryLink
} from './control/pinRecoveryControl';

import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';

type ManualThemeMode = 'system' | 'light' | 'dark';

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [manualThemeMode, setManualThemeMode] = useState<ManualThemeMode>('system');
  const [currentUser, setCurrentUser] = useState<Trabajador | null>(getCurrentUser());
  const [recoveryLinkLaunch, setRecoveryLinkLaunch] = useState(0);

  const effectiveDarkMode =
    manualThemeMode === 'system' ? prefersDarkMode : manualThemeMode === 'dark';

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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', effectiveDarkMode);
    document.body.classList.toggle('dark', effectiveDarkMode);
  }, [effectiveDarkMode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: effectiveDarkMode ? 'dark' : 'light',
          primary: {
            main: effectiveDarkMode ? '#ffffff' : '#000000',
          },
          background: {
            default: effectiveDarkMode ? '#121212' : '#f5f5f5',
            paper: effectiveDarkMode ? '#1e1e1e' : '#ffffff',
          },
          text: {
            primary: effectiveDarkMode ? '#ffffff' : '#111111',
          },
        },
        typography: {
          fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
          h3: {
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
          },
        },
      }),
    [effectiveDarkMode],
  );

  const handleToggleManualTheme = () => {
    setManualThemeMode((prev) => {
      if (prev === 'system') {
        return prefersDarkMode ? 'light' : 'dark';
      }
      return prev === 'light' ? 'dark' : 'light';
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {currentUser ? (
        <Home
          isDarkMode={effectiveDarkMode}
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
