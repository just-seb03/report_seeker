/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : PinPad.tsx                                                       *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 03 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 03 de Octubre de 2026                                            *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   PinPad -- Componente de teclado numérico con feedback táctil.                             *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import BackspaceOutlinedIcon from '@mui/icons-material/BackspaceOutlined';
import './PinPad.css';

export interface PinPadProps {
  title: string;
  subtitle: string;
  maxLength: number;
  currentValue: string;
  onKeyPress: (key: string) => void;
  className?: string;
}

export default function PinPad({ title, subtitle, maxLength, currentValue, onKeyPress, className = '' }: PinPadProps) {
  
  const handleTouch = (key: string) => {
    onKeyPress(key);
  };

  const renderDots = () => {
    return Array.from({ length: maxLength }).map((_, i) => (
      <div key={i} className={`pinpad-dot ${i < currentValue.length ? 'filled' : ''}`}></div>
    ));
  };

  return (
    <div className={`pinpad-container ${className}`}>
      <div className="pinpad-header">
        <h2 className="pinpad-title">{title}</h2>
        <p className="pinpad-subtitle">{subtitle}</p>
        <div className="pinpad-dots-container">
          {renderDots()}
        </div>
      </div>
      
      <div className="pinpad-grid">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button 
            key={num} 
            onClick={() => handleTouch(num)}
            className="pinpad-btn"
          >
            {num}
          </button>
        ))}
        <div className="pinpad-btn empty"></div>
        <button onClick={() => handleTouch('0')} className="pinpad-btn">
          0
        </button>
        <button 
          onClick={() => handleTouch('backspace')} 
          className="pinpad-btn backspace" 
          aria-label="Borrar"
        >
          <BackspaceOutlinedIcon fontSize="large" />
        </button>
      </div>
    </div>
  );
}
