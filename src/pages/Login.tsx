/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : Login.tsx                                                        *
 *                                                                                             *
 *              Programador : Sebastian Arredondo, Maximiliano Cantuarias, Cristian Vega       *
 *                                                                                             *
 *          Fecha de Inicio : 03 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 03 de Octubre de 2026    [SA]                                        *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   Login -- Página principal de acceso, maneja la validación e integración con Firebase.     *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useState } from 'react';
import { loginWithFirebase, seedTrabajadores, type Trabajador } from '../control/authControl';
import LoginForm from '../components/LoginForm';
import './Login.css';

interface LoginProps {
  onLoginSuccess: (user: Trabajador) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (workerId: string, pin: string) => {
    setError('');

    const numId = parseInt(workerId, 10);
    if (isNaN(numId)) {
      setError('El ID debe ser numérico.');
      return;
    }

    setIsLoading(true);
    try {
      let user = await loginWithFirebase(numId, pin);

      // Semilla para desarrollo: si no entra a la primera, poblar bd y probar otra vez
      if (!user && numId === 10482) {
        await seedTrabajadores();
        user = await loginWithFirebase(numId, pin);
      }

      if (user) {
        onLoginSuccess(user);
      } else {
        setError('ID de trabajador o PIN incorrectos.');
      }
    } catch (err) {
      setError('Error de conexión al validar credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-screen">
      <section className="login-content">
        <h1>Iniciar Sesión</h1>

        <LoginForm
          isLoading={isLoading}
          error={error}
          onSubmit={handleLogin}
        />
      </section>
    </main>
  );
}
