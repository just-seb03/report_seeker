import { Avatar, Typography, IconButton, Badge, CircularProgress, Box } from '@mui/material';
import AccountCircleOutlined from '@mui/icons-material/AccountCircleOutlined';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';

interface ProfileHeaderProps {
    profileName: string;
    profilePhoto?: string | null;
    isUpdatingPhoto?: boolean;
    onEditPhoto?: () => void;
}

export default function ProfileHeader({ profileName, profilePhoto, isUpdatingPhoto, onEditPhoto }: ProfileHeaderProps) {
    return (
        <>
            <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                    <IconButton 
                        onClick={onEditPhoto} 
                        disabled={isUpdatingPhoto}
                        sx={{ 
                            bgcolor: 'primary.main', 
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' },
                            boxShadow: 2,
                            width: 32,
                            height: 32
                        }}
                    >
                        <PhotoCameraRoundedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                }
                sx={{ mb: 2 }}
            >
                <Box sx={{ position: 'relative' }}>
                    <Avatar 
                        src={profilePhoto || undefined}
                        sx={{ 
                            width: 100, 
                            height: 100, 
                            backgroundColor: 'background.paper', 
                            color: 'primary.main',
                            boxShadow: 2,
                            opacity: isUpdatingPhoto ? 0.5 : 1
                        }}
                    >
                        {!profilePhoto && <AccountCircleOutlined sx={{ fontSize: 60 }} />}
                    </Avatar>
                    {isUpdatingPhoto && (
                        <CircularProgress
                            size={40}
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                marginTop: '-20px',
                                marginLeft: '-20px',
                            }}
                        />
                    )}
                </Box>
            </Badge>
            
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                {profileName}
            </Typography>
        </>
    );
}
