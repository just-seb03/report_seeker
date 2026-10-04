/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : Configuration.tsx                                             *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 02 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización : 02 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   Configuration -- Componente visual para las opciones de configuración y perfil.           *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useState, useEffect } from 'react';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AlternateEmailOutlinedIcon from '@mui/icons-material/AlternateEmailOutlined';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { IconButton, Box, Typography, Button, AppBar, Toolbar, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper } from '@mui/material';
import ChangePinDialog from '../components/ChangePinDialog';
import ChangeEmailDialog from '../components/ChangeEmailDialog';

type ConfigurationProps = {
  onBack: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  configMenuState: 'none' | 'pin' | 'email';
  setConfigMenuState: (state: 'none' | 'pin' | 'email') => void;
};

export default function Configuration({ onBack, isDarkMode, onToggleTheme, configMenuState, setConfigMenuState }: ConfigurationProps) {
  const [renderPin, setRenderPin] = useState(configMenuState === 'pin');
  const [renderEmail, setRenderEmail] = useState(configMenuState === 'email');

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (configMenuState === 'pin') {
      setRenderPin(true);
    } else if (renderPin) {
      timeout = setTimeout(() => setRenderPin(false), 350);
    }
    return () => clearTimeout(timeout);
  }, [configMenuState, renderPin]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (configMenuState === 'email') {
      setRenderEmail(true);
    } else if (renderEmail) {
      timeout = setTimeout(() => setRenderEmail(false), 350);
    }
    return () => clearTimeout(timeout);
  }, [configMenuState, renderEmail]);

  const handleOpenPin = () => setConfigMenuState('pin');
  const handleClosePin = () => setConfigMenuState('none');
  const handleOpenEmail = () => setConfigMenuState('email');
  const handleCloseEmail = () => setConfigMenuState('none');

  return (
    <Box sx={{ height: '100%', backgroundColor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={onBack} aria-label="Volver a Profile" sx={{ mr: 2 }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Configuración
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3, flex: 1 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 2 }}>
            REPORT<Box component="span" sx={{ color: 'text.primary' }}>SEEKER</Box>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Versión 0.04a
          </Typography>
        </Box>

        <Paper sx={{ overflow: 'hidden' }}>
          <List disablePadding>
            <ListItem disablePadding divider>
              <ListItemButton onClick={onToggleTheme} sx={{ py: 2 }}>
                <ListItemIcon sx={{ color: 'primary.main' }}>
                  {isDarkMode ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
                </ListItemIcon>
                <ListItemText 
                  primary="Tema de la Aplicación" 
                  secondary={isDarkMode ? 'Modo Oscuro' : 'Modo Claro'} 
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding divider>
              <ListItemButton onClick={handleOpenPin} sx={{ py: 2 }}>
                <ListItemIcon sx={{ color: 'primary.main' }}>
                  <LockOutlinedIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Cambiar PIN" 
                  secondary="Actualiza tu código de acceso"
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={handleOpenEmail} sx={{ py: 2 }}>
                <ListItemIcon sx={{ color: 'primary.main' }}>
                  <AlternateEmailOutlinedIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Cambiar correo de recuperación" 
                  secondary="Actualiza el email asociado a tu cuenta"
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Paper>
      </Box>

      {renderPin && <ChangePinDialog onClose={handleClosePin} isClosing={configMenuState !== 'pin'} />}
      {renderEmail && <ChangeEmailDialog onClose={handleCloseEmail} isClosing={configMenuState !== 'email'} />}
    </Box>
  );
}
