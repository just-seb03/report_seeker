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
        borderRadius: 6, // 24px
        boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
        px: 4,
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        {title}
      </Typography>
    </Box>
  );
}
