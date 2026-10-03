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
 *     Última Actualización : 02 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   App -- Componente principal de la aplicación, provee el contexto global y manejo de       *
 *        temas.                                                                               *
 *   handleToggleManualTheme -- Alterna manualmente el tema visual (claro/oscuro) de la        *
 *        interfaz.                                                                            *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useEffect, useMemo, useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, useMediaQuery } from '@mui/material';
import Home from './pages/Home';

import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';

type ManualThemeMode = 'system' | 'light' | 'dark';

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [manualThemeMode, setManualThemeMode] = useState<ManualThemeMode>('system');

  const effectiveDarkMode =
    manualThemeMode === 'system' ? prefersDarkMode : manualThemeMode === 'dark';

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
      <Home
        isDarkMode={effectiveDarkMode}
        onToggleManualTheme={handleToggleManualTheme}
      />
    </ThemeProvider>
  );
}

export default App;
