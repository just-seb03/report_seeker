/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : useSwipeGesture.ts                                               *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 07 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 07 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   useSwipeGesture -- Hook que aísla y maneja la física táctil y gestos del Home.            *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useState, useRef, useCallback } from 'react';

export function useSwipeGesture() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStart = useRef<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const handleCollapse = useCallback(() => {
    setIsExpanded(false);
    if (listRef.current) listRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    touchStart.current = clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (touchStart.current === null) return;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;
    const deltaY = touchStart.current - clientY;

    if (!isExpanded && deltaY > 40) {
      setIsExpanded(true);
    } else if (isExpanded && deltaY < -40 && listRef.current && listRef.current.scrollTop <= 0) {
      setIsExpanded(false); 
    }

    touchStart.current = null;
  }, [isExpanded]);

  return {
    isExpanded,
    pullDistance,
    listRef,
    setPullDistance,
    handleCollapse,
    handleTouchStart,
    handleTouchEnd,
  };
}
