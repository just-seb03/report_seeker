import { Box, Typography } from '@mui/material';

type UserChatMessageProps = {
  text: string;
};

export default function UserChatMessage({ text }: UserChatMessageProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, px: 2 }}>
      <Box
        sx={{
          maxWidth: '80%',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: '20px',
          borderBottomRightRadius: '4px',
          p: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          animation: 'bubble-enter 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          transformOrigin: 'bottom right',
          '@keyframes bubble-enter': {
            '0%': { opacity: 0, transform: 'scale(0.8)' },
            '100%': { opacity: 1, transform: 'scale(1)' },
          },
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.4, overflowWrap: 'break-word' }}>
          {text}
        </Typography>
      </Box>
    </Box>
  );
}
