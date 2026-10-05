/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : theme.ts                                                         *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 04 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 04 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   appTheme -- Definición del tema visual global de la aplicación (colores, tipografías,     *
 *        componentes) usando Material UI.                                                     *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { createTheme, type PaletteMode } from '@mui/material';

export function createAppTheme(mode: PaletteMode) {
  const isDarkMode = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDarkMode ? '#a8c7fa' : '#0b57d0',
        contrastText: isDarkMode ? '#062e6f' : '#ffffff',
      },
      secondary: {
        main: isDarkMode ? '#c4c6d0' : '#5e5e5e',
        contrastText: '#ffffff',
      },
      error: {
        main: isDarkMode ? '#f2b8b5' : '#ba1a1a',
      },
      warning: {
        main: '#fbc02d', // Amarillo suave
        contrastText: '#000000',
      },
      success: {
        main: isDarkMode ? '#a8dab5' : '#2e7d32', // Verde
      },
      background: {
        default: isDarkMode ? '#141218' : '#f5f5f5',
        paper: isDarkMode ? '#211f26' : '#ffffff',
      },
      text: {
        primary: isDarkMode ? '#e6e1e9' : '#111111',
        secondary: isDarkMode ? '#c4c6d0' : '#5e5e5e',
      },
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.04em' },
      h2: { fontWeight: 800, letterSpacing: '-0.04em' },
      h3: {
        fontWeight: 800,
        letterSpacing: '-0.04em',
        lineHeight: 1.1,
      },
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            padding: '10px 24px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
            backgroundImage: 'none',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 28,
          },
        },
      },
    },
  });
}
