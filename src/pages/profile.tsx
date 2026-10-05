/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : profile.tsx                                                   *
 *                                                                                             *
 *              Programador :Cristian Vega                   *
 *                                                                                             *
 *          Fecha de Inicio : 01 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización :04 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   Profile -- Componente visual del perfil que muestra datos estáticos del usuario actual.   *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { useState, useEffect } from 'react';
import AccountCircleOutlined from '@mui/icons-material/AccountCircleOutlined';
import BadgeOutlined from '@mui/icons-material/BadgeOutlined';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import { Box, Typography, Button, Card, List, ListItem, ListItemIcon, ListItemText, Avatar } from '@mui/material';
import { getCurrentUser, logout, type Trabajador } from '../control/authControl';
import GlobalTopBar from '../components/GlobalTopBar';
import { t } from '../control/i18n';

interface ProfileProps {
	onSettingsClick?: () => void;
}

export default function Profile({ onSettingsClick }: ProfileProps) {
	const [user, setUser] = useState<Trabajador | null>(getCurrentUser());

	useEffect(() => {
		const handleUserUpdate = (e: any) => {
			setUser(e.detail);
		};
		window.addEventListener('user_updated', handleUserUpdate);
		return () => window.removeEventListener('user_updated', handleUserUpdate);
	}, []);

	const profileName = user?.nombre || t.profile.unknownUser;

	const profileDetails = [
		{ label: t.profile.emailLabel, value: user?.email || t.profile.noEmail, Icon: EmailOutlined },
		{ label: t.profile.userIdLabel, value: user?.trabajador_id.toString() || t.profile.noUserId, Icon: BadgeOutlined },
	];

	return (
		<Box sx={{ minHeight: '100%', backgroundColor: 'background.default', pb: 12 }}>
      <GlobalTopBar title={t.profile.title} />
			<Box sx={{ px: 3, pt: 14, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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

				<Card sx={{ width: '100%' }}>
          <List disablePadding>
					  {profileDetails.map(({ label, value, Icon }, index) => (
						  <ListItem 
                key={label} 
                divider={index < profileDetails.length - 1}
                sx={{ py: 2 }}
              >
                <ListItemIcon sx={{ color: 'primary.main' }}>
                  <Icon />
                </ListItemIcon>
                <ListItemText 
                  primary={<Typography variant="caption" color="text.secondary">{label}</Typography>} 
                  secondary={<Typography variant="body1" color="text.primary" sx={{ fontWeight: 500 }}>{value}</Typography>} 
                />
						  </ListItem>
					  ))}
          </List>
				</Card>
			</Box>
		</Box>
	);
}
