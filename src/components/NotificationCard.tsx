import { useState } from 'react';
import { Box, Typography, Paper, Collapse } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';

interface NotificationCardProps {
  titulo: string;
  detalle: string;
  prioridad?: string;
  fecha?: string;
}

export default function NotificationCard({ 
  titulo, 
  detalle, 
  prioridad = 'Alta', 
  fecha = '29 Sept 2026' 
}: NotificationCardProps) {
  
  const [expanded, setExpanded] = useState(false);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4, 
        border: '1px solid #e0e0e0', 
        backgroundColor: '#ffffff',
        overflow: 'hidden', 
        // ELIMINADA la transición global para que deje de ir lento
      }}
    >
      {/* ZONA SUPERIOR CLICKEABLE */}
      <Box 
        onClick={() => setExpanded(!expanded)}
        sx={{
          p: 2, 
          position: 'relative', // Necesario para fijar la flecha de forma absoluta
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
        }}
      >
        {/* Ícono de la izquierda (fijo) */}
        <InfoOutlinedIcon sx={{ color: 'text.secondary', mr: 2, flexShrink: 0 }} />
        
        {/* Contenedor de Texto con efecto de Desvanecimiento */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          flex: 1, 
          minWidth: 0, // Crítico para que el texto respete los márgenes
          pr: 4, // Padding derecho para dejarle espacio a la flecha
        }}>
          <Typography 
            variant="subtitle2" 
            color="text.primary"
            sx={{ 
              fontWeight: 'bold', 
              whiteSpace: 'nowrap', // Obliga al texto a estar en 1 sola línea
              overflow: 'hidden',
              // Efecto de transparencia (100% visible hasta el 80% del ancho, luego se desvanece a transparente)
              WebkitMaskImage: 'linear-gradient(to right, black 80%, transparent 100%)',
              maskImage: 'linear-gradient(to right, black 80%, transparent 100%)'
            }}
          >
            {titulo}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              whiteSpace: 'nowrap', 
              overflow: 'hidden',
              WebkitMaskImage: 'linear-gradient(to right, black 80%, transparent 100%)',
              maskImage: 'linear-gradient(to right, black 80%, transparent 100%)'
            }}
          >
            {detalle}
          </Typography>
        </Box>

        {/* FLECHA FIJA ANIMADA */}
        <ExpandMoreIcon 
          sx={{ 
            position: 'absolute',
            right: 16, // Siempre pegada a 16px del borde derecho
            top: '50%',
            marginTop: '-12px', // La centra verticalmente perfecto
            color: 'text.secondary',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            // Animación exclusiva solo para la flecha, más rápida (0.2s) para que se sienta fluido
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' 
          }} 
        />
      </Box>

      {/* CONTENIDO DESPLEGABLE */}
      {/* timeout fijo (250ms) ayuda a mejorar el rendimiento en móviles de gama media */}
      <Collapse in={expanded} timeout={250} unmountOnExit>
        <Box sx={{ p: 2, pt: 0 }}>
          
          <Box 
            sx={{ 
              width: '100%', 
              height: 160, 
              backgroundColor: '#f5f5f5', 
              borderRadius: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mb: 2,
              border: '1px dashed #bdbdbd'
            }}
          >
            <InsertPhotoOutlinedIcon sx={{ fontSize: 48, color: '#bdbdbd' }} />
          </Box>
          
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }} color="text.primary">
            {titulo}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {detalle}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 'bold', 
                color: prioridad.toLowerCase() === 'alta' ? 'error.main' : 'warning.main' 
              }}
            >
              Prioridad: {prioridad}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {fecha}
            </Typography>
          </Box>

        </Box>
      </Collapse>
    </Paper>
  );
}