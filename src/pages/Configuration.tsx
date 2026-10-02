import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AlternateEmailOutlinedIcon from '@mui/icons-material/AlternateEmailOutlined';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { IconButton } from '@mui/material';
import './Configuration.css';

type ConfigurationProps = {
  onBack: () => void;
};

export default function Configuration({ onBack }: ConfigurationProps) {
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
          <button className="configuration-button" type="button">
            <LockOutlinedIcon aria-hidden="true" />
            <span>Cambiar PIN</span>
          </button>
          <button className="configuration-button" type="button">
            <AlternateEmailOutlinedIcon aria-hidden="true" />
            <span>Cambiar correo de recuperación</span>
          </button>
          <button className="configuration-button configuration-logout" type="button">
            <LogoutOutlinedIcon aria-hidden="true" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </section>
    </main>
  );
}