/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : LoginForm.tsx                                                    *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 03 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 03 de Octubre de 2026                                            *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   LoginForm -- Componente visual reutilizable que contiene el teclado numérico interactivo  *
 *                estilo pin pad.                                                              *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useState, useEffect } from 'react';
import BackspaceOutlinedIcon from '@mui/icons-material/BackspaceOutlined';
import './LoginForm.css';

export interface LoginFormProps {
  isLoading: boolean;
  error?: string;
  onSubmit: (workerId: string, pin: string) => void;
}

export default function LoginForm({ isLoading, error, onSubmit }: LoginFormProps) {
  const [step, setStep] = useState<1 | 2>(1); // 1 = ID, 2 = PIN
  const [workerId, setWorkerId] = useState('');
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (error) {
      setShake(true);
      setPin(''); // Limpiamos el pin para que lo vuelva a ingresar
      const t = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(t);
    }
  }, [error]);

  const handlePress = (key: string) => {
    if (isLoading) return;

    if (key === 'backspace') {
      if (step === 1) {
        setWorkerId((prev) => prev.slice(0, -1));
      } else {
        if (pin.length > 0) {
          setPin((prev) => prev.slice(0, -1));
        } else {
          setStep(1); // Volver al paso 1 si borra estando el PIN vacío
        }
      }
      return;
    }

    if (step === 1) {
      if (workerId.length < 5) {
        const newVal = workerId + key;
        setWorkerId(newVal);
        if (newVal.length === 5) {
          // Esperamos un momento para que se vea el último punto antes de avanzar
          setTimeout(() => setStep(2), 150);
        }
      }
    } else {
      if (pin.length < 4) {
        const newVal = pin + key;
        setPin(newVal);
        if (newVal.length === 4) {
          onSubmit(workerId, newVal);
        }
      }
    }
  };

  const renderDots = (length: number, max: number) => {
    return Array.from({ length: max }).map((_, i) => (
      <div key={i} className={`keypad-dot ${i < length ? 'filled' : ''}`}></div>
    ));
  };

  const title = step === 1 ? 'Ingresa tu ID de trabajador' : 'Ingresa la clave de acceso de';
  const subtitle = step === 1 ? '5 dígitos' : workerId;
  const currentLength = step === 1 ? workerId.length : pin.length;
  const maxLength = step === 1 ? 5 : 4;

  return (
    <div className={`keypad-container ${shake ? 'shake' : ''}`}>
      <div className="keypad-header">
        <h2>{title}</h2>
        <p className="keypad-subtitle">{subtitle}</p>
        <div className="keypad-dots-container">
          {renderDots(currentLength, maxLength)}
        </div>
        <div className="keypad-error-placeholder">
          {error && <span className="keypad-error-msg">{error}</span>}
        </div>
      </div>
      
      <div className="keypad-grid">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button 
            key={num} 
            onClick={() => handlePress(num)} 
            disabled={isLoading} 
            className="keypad-btn"
          >
            {num}
          </button>
        ))}
        <div className="keypad-btn empty"></div>
        <button onClick={() => handlePress('0')} disabled={isLoading} className="keypad-btn">
          0
        </button>
        <button 
          onClick={() => handlePress('backspace')} 
          disabled={isLoading} 
          className="keypad-btn backspace" 
          aria-label="Borrar"
        >
          <BackspaceOutlinedIcon fontSize="large" />
        </button>
      </div>

      {isLoading && (
         <div className="keypad-loader">
           <div className="spinner"></div>
           <span>Verificando...</span>
         </div>
      )}
    </div>
  );
}
