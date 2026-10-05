/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : PinPad.tsx                                                       *
 *                                                                                             *
 *              Programador :Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 03 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización :04 de Octubre de 2026 [SA]                                            *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   PinPad -- Componente de teclado numérico con feedback táctil.                             *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import BackspaceOutlinedIcon from '@mui/icons-material/BackspaceOutlined';
import { Box, Typography, IconButton } from '@mui/material';

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
    return Array.from({ length: maxLength }).map((_, i) => {
      const isFilled = i < currentValue.length;
      return (
        <Box
          key={i}
          sx={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            border: '1.5px solid',
            borderColor: isFilled ? 'primary.main' : 'text.secondary',
            backgroundColor: isFilled ? 'primary.main' : 'transparent',
            transform: isFilled ? 'scale(1.15)' : 'scale(1)',
            transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      );
    });
  };

  return (
    <Box className={className} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 340, mx: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 5, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 500, mb: 1, color: 'text.primary', letterSpacing: '-0.01em' }}>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          {subtitle}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          {renderDots()}
        </Box>
      </Box>
      
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '16px 32px', 
          width: '100%' 
        }}
      >
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <IconButton 
            key={num} 
            onClick={() => handleTouch(num)}
            sx={{ 
              width: 76, 
              height: 76, 
              fontSize: 32, 
              fontWeight: 300, 
              color: 'text.primary',
              mx: 'auto'
            }}
          >
            {num}
          </IconButton>
        ))}
        <Box sx={{ visibility: 'hidden' }} />
        <IconButton 
          onClick={() => handleTouch('0')}
          sx={{ 
            width: 76, 
            height: 76, 
            fontSize: 32, 
            fontWeight: 300, 
            color: 'text.primary',
            mx: 'auto'
          }}
        >
          0
        </IconButton>
        <IconButton 
          onClick={() => handleTouch('backspace')} 
          aria-label="Borrar"
          sx={{ 
            width: 76, 
            height: 76, 
            color: 'text.primary',
            mx: 'auto'
          }}
        >
          <BackspaceOutlinedIcon fontSize="large" />
        </IconButton>
      </Box>
    </Box>
  );
}
