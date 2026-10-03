/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : LoginForm.tsx                                                    *
 *                                                                                             *
 *              Programador : Sebastian Arredondo, Maximiliano Cantuarias, Cristian Vega       *
 *                                                                                             *
 *          Fecha de Inicio : 03 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 03 de Octubre de 2026                                            *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   LoginForm -- Componente visual reutilizable que contiene el formulario de acceso,         *
 *                adaptable al modo oscuro/claro y optimizado para teclado numérico.           *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import React, { useState } from 'react';
import './LoginForm.css';

export interface LoginFormProps {
  isLoading: boolean;
  error?: string;
  onSubmit: (workerId: string, pin: string) => void;
}

export default function LoginForm({ isLoading, error, onSubmit }: LoginFormProps) {
  const [workerId, setWorkerId] = useState('');
  const [pin, setPin] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(workerId, pin);
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {error && <div className="login-error-alert">{error}</div>}
      
      <div className="login-input-group">
        <label htmlFor="workerId">ID de Trabajador (5 dígitos)</label>
        <input
          id="workerId"
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          value={workerId}
          onChange={(e) => setWorkerId(e.target.value)}
          required
          autoComplete="off"
          disabled={isLoading}
        />
      </div>

      <div className="login-input-group">
        <label htmlFor="pin">PIN de Seguridad</label>
        <input
          id="pin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          required
          autoComplete="off"
          disabled={isLoading}
        />
      </div>

      <button 
        type="submit" 
        className="login-submit-btn"
        disabled={isLoading || workerId.trim() === '' || pin.trim() === ''}
      >
        {isLoading ? <div className="login-spinner"></div> : 'Iniciar Sesión'}
      </button>
    </form>
  );
}
