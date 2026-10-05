import { Box, Typography } from '@mui/material';

interface GlobalTopBarProps {
  title: string;
}

export default function GlobalTopBar({ title }: GlobalTopBarProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 'max(16px, env(safe-area-inset-top))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        backgroundColor: 'background.paper',
        borderRadius: 4, // 16px
        boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
        px: 6,
        py: 0.75,
        minWidth: 160,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main', textTransform: 'uppercase', letterSpacing: 1 }}>
        {title}
      </Typography>
    </Box>
  );
}
