import { Avatar, Typography } from '@mui/material';
import AccountCircleOutlined from '@mui/icons-material/AccountCircleOutlined';

interface ProfileHeaderProps {
    profileName: string;
}

export default function ProfileHeader({ profileName }: ProfileHeaderProps) {
    return (
        <>
            <Avatar 
                sx={{ 
                    width: 100, 
                    height: 100, 
                    backgroundColor: 'background.paper', 
                    color: 'primary.main',
                    boxShadow: 2,
                    mb: 2
                }}
            >
                <AccountCircleOutlined sx={{ fontSize: 60 }} />
            </Avatar>
            
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                {profileName}
            </Typography>
        </>
    );
}
