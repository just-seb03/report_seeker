/***********************************************************************************************
 *                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : Profile.tsx                                                      *
 *                                                                                             *
 *              Programador : Cristian Vega                                                    *
 *                                                                                             *
 *          Fecha de Inicio : 01 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 05 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   Profile -- Componente visual del perfil que muestra datos estáticos del usuario actual.   *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Box } from '@mui/material';
import BadgeOutlined from '@mui/icons-material/BadgeOutlined';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import GlobalTopBar from '../components/global/GlobalTopBar';
import { t } from '../control/global/i18n';
import { useProfile } from '../control/Profile/useProfile';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileActions from '../components/Profile/ProfileActions';
import ProfileDetails from '../components/Profile/ProfileDetails';

interface ProfileProps {
	onSettingsClick?: () => void;
}

export default function Profile({ onSettingsClick }: ProfileProps) {
	const { user } = useProfile();

	const profileName = user?.nombre || t.profile.unknownUser;

	const profileDetails = [
		{ label: t.profile.emailLabel, value: user?.email || t.profile.noEmail, Icon: EmailOutlined },
		{ label: t.profile.userIdLabel, value: user?.trabajador_id.toString() || t.profile.noUserId, Icon: BadgeOutlined },
	];

	return (
		<Box sx={{ minHeight: '100%', backgroundColor: 'background.default', pb: 12 }}>
			<GlobalTopBar title={t.profile.title} />
			<Box sx={{ px: 3, pt: 14, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
				<ProfileHeader profileName={profileName} />
				<ProfileActions onSettingsClick={onSettingsClick} />
				<ProfileDetails details={profileDetails} />
			</Box>
		</Box>
	);
}
