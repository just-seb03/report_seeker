/***********************************************************************************************
 *                               C O N F I D E N T I A L  ---  M C S                           *
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : ReportProgressBar.tsx                                            *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 03 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 03 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   ReportProgressBar -- Componente visual que renderiza una barra indicadora del progreso en *
 *        el flujo de creación de un reporte.                                                  *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import './ReportProgressBar.css';
import { type ReportStep } from '../control/useReport';

const stepsOrder: ReportStep[] = ['photo', 'severity', 'description', 'location', 'title', 'summary'];

interface ReportProgressBarProps {
  currentStep: ReportStep;
}

export default function ReportProgressBar({ currentStep }: ReportProgressBarProps) {
  if (currentStep === 'ready') return null;

  const currentIndex = stepsOrder.indexOf(currentStep);

  return (
    <div className="report-progress-bar-container">
      <div className="report-progress-bar">
        {stepsOrder.map((step, index) => {
          const isActive = index <= currentIndex;
          return (
            <div
              key={step}
              className={`report-progress-segment ${isActive ? 'active' : ''}`}
            />
          );
        })}
      </div>
    </div>
  );
}
