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
import GlobalTopBar from '../components/global/GlobalTopBar';
import RiskDonutChart from '../components/Summary/RiskDonutChart';
import TopLocationsWidget from '../components/Summary/TopLocationsWidget';
import TopUsersWidget from '../components/Summary/TopUsersWidget';
import SmoothScrollContainer from '../components/Summary/SmoothScrollContainer';
import DateFilterWidget, { type DateFilterType, type DateRange } from '../components/Summary/DateFilterWidget';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useSummary } from '../control/Summary/useSummary';
import { t } from '../control/global/i18n';

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
          sx={{ 
            pb: 4,
            '& .summary-stagger': {
              animation: 'summaryFadeInUp 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) backwards'
            },
            '@keyframes summaryFadeInUp': {
              '0%': { opacity: 0, transform: 'translateY(30px) scale(0.98)' },
              '100%': { opacity: 1, transform: 'translateY(0) scale(1)' }
            }
          }}
        >
          {/* Spacer dinámico que toma el lugar del padding-top y permite scrollear hacia la zona del fade superior */}
          <Box sx={{ height: 'calc(80px + env(safe-area-inset-top))', flexShrink: 0, width: '100%' }} />

          <Box className="summary-stagger" sx={{ animationDelay: '0ms' }}>
            <DateFilterWidget 
              currentFilter={filterType}
              customRange={customRange}
              onChange={(newFilter, newRange) => {
                setFilterType(newFilter);
                if (newRange) setCustomRange(newRange);
              }}
            />
          </Box>

          <Box className="summary-stagger" sx={{ animationDelay: '150ms' }}>
            <RiskDonutChart data={data} />
          </Box>
          
          <Box className="summary-stagger" sx={{ animationDelay: '300ms' }}>
            <TopLocationsWidget locations={data.topLocations} />
          </Box>

          <Box className="summary-stagger" sx={{ animationDelay: '450ms' }}>
            <TopUsersWidget users={data.topUsers} />
          </Box>
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
