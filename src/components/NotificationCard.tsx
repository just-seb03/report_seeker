import { useState } from 'react';
import { Box, Typography, Paper, Collapse } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';

interface NotificationCardProps {
  titulo: string;
  detalle: string;
  tiempo?: string;
  unread?: boolean;
  prioridad?: string;
  fecha?: string;
}

export default function NotificationCard({ 
  titulo, 
  detalle,
  tiempo = 'ahora', 
  unread = false, 
  prioridad = 'Normal', // Cambiado a 'Normal' por defecto
  fecha = '30 Sept 2026' 
}: NotificationCardProps) {
  
  const [expanded, setExpanded] = useState(false);
  const [isRead, setIsRead] = useState(!unread);

  // Evaluamos de forma segura si la prioridad es alta (ignorando mayúsculas/minúsculas)
  const isHighPriority = prioridad.toLowerCase() === 'alta';

  // Si no está leída, decidimos si el borde será rojo (#d32f2f) o negro (#000000)
  const unreadBorderColor = isHighPriority ? '#d32f2f' : '#000000';

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4, 
        // Aplicamos la condicional de color dinámico al borde
        border: !isRead ? `2px solid ${unreadBorderColor}` : '1px solid #e0e0e0', 
        backgroundColor: '#ffffff',
        overflow: 'hidden', 
        transition: 'border 0.3s ease',
      }}
    >
      <Box 
        onClick={() => {
          setExpanded(!expanded);
          if (!isRead) setIsRead(true);
        }}
        sx={{ 
          p: 2, 
          position: 'relative', 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer' 
        }}
      >
{/* Renderizado condicional del ícono */}
        {isHighPriority ? (
          <ErrorOutlinedIcon // <-- Cambio de nombre aquí
            sx={{ 
              color: !isRead ? '#d32f2f' : 'text.secondary',
              mr: 2, 
              flexShrink: 0 
            }} 
          />
        ) : (
          <InfoOutlinedIcon sx={{ color: 'text.secondary', mr: 2, flexShrink: 0 }} />
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, pr: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography 
              variant="subtitle2" 
              color="text.primary"
              sx={{ 
                fontWeight: 'bold', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden',
                WebkitMaskImage: 'linear-gradient(to right, black 70%, transparent 100%)',
                maskImage: 'linear-gradient(to right, black 70%, transparent 100%)',
                flex: 1,
                mr: 1 
              }}
            >
              {titulo}
            </Typography>
            
            <Typography 
              variant="caption" 
              sx={{ color: 'text.secondary', flexShrink: 0 }}
            >
              {tiempo}
            </Typography>
          </Box>
          
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

        <ExpandMoreIcon 
          sx={{ 
            position: 'absolute', right: 16, top: '50%', marginTop: '-12px', color: 'text.secondary',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' 
          }} 
        />
      </Box>

      <Collapse in={expanded} timeout={250} unmountOnExit>
        <Box sx={{ p: 2, pt: 0 }}>
          <Box sx={{ width: '100%', height: 160, backgroundColor: '#f5f5f5', borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2, border: '1px dashed #bdbdbd' }}>
            <InsertPhotoOutlinedIcon sx={{ fontSize: 48, color: '#bdbdbd' }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }} color="text.primary">
            {titulo}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {detalle}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: isHighPriority ? 'error.main' : 'warning.main' }}>
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