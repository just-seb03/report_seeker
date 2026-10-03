/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : ReportReadyStep.tsx                                           *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 01 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización : 02 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   ReportReadyStep -- Componente del paso final, confirmando que el reporte se ha guardado   *
 *        exitosamente.                                                                        *
 *   handleAnimationEnd -- Ejecuta acciones (como navegar al inicio) tras finalizar una        *
 *        animación de la interfaz.                                                            *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useEffect, useState, type AnimationEvent } from 'react';

type ReportReadyStepProps = {
  onComplete: () => void;
};

export default function ReportReadyStep({ onComplete }: ReportReadyStepProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setIsExiting(true), 1600);
    return () => window.clearTimeout(exitTimer);
  }, []);

  const handleAnimationEnd = (event: AnimationEvent<HTMLElement>) => {
    if (isExiting && event.target === event.currentTarget) onComplete();
  };

  return (
    <section
      className={`report-ready-step${isExiting ? ' is-exiting' : ''}`}
      role="status"
      aria-live="polite"
      onAnimationEnd={handleAnimationEnd}
    >
      <h1>Reporte Listo Para Subir</h1>
    </section>
  );
}
