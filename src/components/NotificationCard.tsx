import { Box, Typography, Paper } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface NotificationCardProps {
  titulo: string;
  detalle: string;
}

export default function NotificationCard({ titulo, detalle }: NotificationCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        borderRadius: 4, 
        border: '1px solid #e0e0e0', 
        backgroundColor: '#ffffff',
      }}
    >
      <InfoOutlinedIcon sx={{ color: 'text.secondary' }} />
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} color="text.primary">
          {titulo}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {detalle}
        </Typography>
      </Box>
    </Paper>
  );
}