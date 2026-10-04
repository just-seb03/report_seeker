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

import { useState } from 'react';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AlternateEmailOutlinedIcon from '@mui/icons-material/AlternateEmailOutlined';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { IconButton } from '@mui/material';
import ChangePinDialog from '../components/ChangePinDialog';
import ChangeEmailDialog from '../components/ChangeEmailDialog';
import './Configuration.css';

type ConfigurationProps = {
  onBack: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onMenuStateChange?: (isOpen: boolean) => void;
};

export default function Configuration({ onBack, isDarkMode, onToggleTheme, onMenuStateChange }: ConfigurationProps) {
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);

  const handleOpenPin = () => {
    setIsPinDialogOpen(true);
    onMenuStateChange?.(true);
  };

  const handleClosePin = () => {
    setIsPinDialogOpen(false);
    onMenuStateChange?.(false);
  };

  const handleOpenEmail = () => {
    setIsEmailDialogOpen(true);
    onMenuStateChange?.(true);
  };

  const handleCloseEmail = () => {
    setIsEmailDialogOpen(false);
    onMenuStateChange?.(false);
  };

  return (
    <main className="configuration-screen">
      <IconButton className="configuration-back" aria-label="Volver a Profile" onClick={onBack}>
        <ArrowBackRoundedIcon />
      </IconButton>
      <section className="configuration-content" aria-label="Configuración">
        <header className="configuration-brand">
          <h1><span>REPORT</span><span>SEEKER</span></h1>
          <p>Versión 0.04a</p>
        </header>

        <div className="configuration-actions" aria-label="Opciones de cuenta">
          
          <div className="configuration-theme-toggle" onClick={onToggleTheme}>
            <div className={`theme-toggle-pill ${isDarkMode ? 'dark-active' : 'light-active'}`}>
              <div className="theme-toggle-thumb">
                {isDarkMode ? <DarkModeOutlinedIcon fontSize="small" /> : <LightModeOutlinedIcon fontSize="small" />}
              </div>
              <span className="theme-toggle-text">{isDarkMode ? 'Modo Oscuro' : 'Modo Claro'}</span>
            </div>
          </div>

          <button className="configuration-button" type="button" onClick={handleOpenPin}>
            <LockOutlinedIcon aria-hidden="true" />
            <span>Cambiar PIN</span>
          </button>
          <button className="configuration-button" type="button" onClick={handleOpenEmail}>
            <AlternateEmailOutlinedIcon aria-hidden="true" />
            <span>Cambiar correo de recuperación</span>
          </button>
        </div>
      </section>

      {isPinDialogOpen && <ChangePinDialog onClose={handleClosePin} />}
      {isEmailDialogOpen && <ChangeEmailDialog onClose={handleCloseEmail} />}
    </main>
  );
}
