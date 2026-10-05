/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : Summary.tsx                                                      *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 05 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 05 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   Summary -- Pantalla exclusiva para prevencionistas donde podrán visualizar el resumen de  *
 *            riesgos reportados por todos los trabajadores.                                   *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Box, CircularProgress } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import GlobalTopBar from '../components/GlobalTopBar';
import RiskDonutChart from '../components/RiskDonutChart';
import TopLocationsWidget from '../components/TopLocationsWidget';
import TopUsersWidget from '../components/TopUsersWidget';
import SmoothScrollContainer from '../components/SmoothScrollContainer';
import DateFilterWidget, { type DateFilterType, type DateRange } from '../components/DateFilterWidget';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useSummary } from '../control/useSummary';
import { t } from '../control/i18n';

export default function Summary() {
  const [filterType, setFilterType] = useState<DateFilterType>('all');
  const [customRange, setCustomRange] = useState<DateRange>({ from: '', to: '' });

  const { data, loading } = useSummary(filterType, customRange);
  const [showArrow, setShowArrow] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    if (scrollRef.current) {
      const target = scrollRef.current;
      // Consideramos que llegó al final si está a menos de 20px del límite inferior
      const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 20;
      setShowArrow(!isAtBottom);
    }
  };

  useEffect(() => {
    if (!loading) {
      // Un pequeño retraso para asegurar que el DOM dibujó los componentes
      const timeoutId = setTimeout(checkScroll, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [loading, data]);

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'background.default', height: '100%', overflow: 'hidden', pb: 'calc(80px + env(safe-area-inset-bottom))', position: 'relative' }}>
      <GlobalTopBar title={t.summary.title} />
      
      {loading ? (
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <SmoothScrollContainer 
          ref={scrollRef} 
          onScroll={checkScroll} 
          sx={{ pt: 'calc(80px + env(safe-area-inset-top))', pb: 4 }}
        >
          <DateFilterWidget 
            currentFilter={filterType}
            customRange={customRange}
            onChange={(newFilter, newRange) => {
              setFilterType(newFilter);
              if (newRange) setCustomRange(newRange);
            }}
          />

          <RiskDonutChart data={data} />
          
          <TopLocationsWidget locations={data.topLocations} />

          <TopUsersWidget users={data.topUsers} />
        </SmoothScrollContainer>
      )}

      {!loading && showArrow && (
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 'calc(80px + env(safe-area-inset-bottom) + 4px)', 
            left: 0, 
            right: 0, 
            display: 'flex', 
            justifyContent: 'center', 
            pointerEvents: 'none',
            zIndex: 10
          }}
        >
          <KeyboardArrowDownIcon 
            sx={{ 
              fontSize: 32, 
              color: 'text.disabled', 
              '@keyframes summaryBounceSwipe': {
                '0%': { transform: 'translateY(0)', animationTimingFunction: 'ease-in' },
                '15%': { transform: 'translateY(8px)', animationTimingFunction: 'ease-out' },
                '100%': { transform: 'translateY(0)' }
              },
              animation: 'summaryBounceSwipe 2s infinite' 
            }} 
          />
        </Box>
      )}
    </Box>
  );
}
