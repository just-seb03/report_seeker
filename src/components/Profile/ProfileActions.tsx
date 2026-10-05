import { Box, Button } from '@mui/material';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import { logout } from '../../control/global/authControl';
import { t } from '../../control/global/i18n';

interface ProfileActionsProps {
    onSettingsClick?: () => void;
}

export default function ProfileActions({ onSettingsClick }: ProfileActionsProps) {
    return (
        <Box sx={{ display: 'flex', gap: 2, mb: 4, width: '100%', justifyContent: 'center' }}>
            <Button 
                variant="contained" 
                color="primary" 
                startIcon={<SettingsOutlined />}
                onClick={onSettingsClick}
                sx={{ flex: 1, maxWidth: 200 }}
            >
                {t.profile.settingsBtn}
            </Button>
            <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutOutlined />}
                onClick={() => logout()}
                sx={{ flex: 1, maxWidth: 200 }}
            >
                {t.profile.logoutBtn}
            </Button>
        </Box>
    );
}
