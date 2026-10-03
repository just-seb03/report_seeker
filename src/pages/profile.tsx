/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : profile.tsx                                                   *
 *                                                                                             *
 *              Programador : Sebastian Arredondo, Maximiliano Cantuarias                   *
 *                                                                                             *
 *          Fecha de Inicio : 01 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización : 03 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   Profile -- Componente visual del perfil que muestra datos estáticos del usuario actual.   *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import AccountCircleOutlined from '@mui/icons-material/AccountCircleOutlined';
import BadgeOutlined from '@mui/icons-material/BadgeOutlined';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import './profile.css';
import { getCurrentUser, logout } from '../control/authControl';

interface ProfileProps {
	onSettingsClick?: () => void;
}

export default function Profile({ onSettingsClick }: ProfileProps) {
	const user = getCurrentUser();
	const profileName = user?.nombre || 'Usuario Desconocido';

	const profileDetails = [
		{ label: 'Correo', value: user?.email || 'Sin correo', Icon: EmailOutlined },
		{ label: 'ID de usuario', value: user?.trabajador_id.toString() || 'No asignado', Icon: BadgeOutlined },
	];

	return (
		<main className="profile-screen">
			<div className="profile-banner" aria-hidden="true" />
			<section className="profile-content" aria-labelledby="profile-title">
				<div className="profile-avatar" aria-hidden="true">
					<AccountCircleOutlined />
				</div>
				<h1 id="profile-title">{profileName}</h1>

				<div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
					<button className="profile-settings" type="button" onClick={onSettingsClick}>
						<SettingsOutlined />
						Configuración
					</button>
					<button
						className="profile-settings"
						type="button"
						onClick={() => logout()}
						style={{ color: '#ff6b6b', borderColor: '#ff6b6b' }}
					>
						<LogoutOutlined />
						Cerrar Sesión
					</button>
				</div>

				<section className="profile-info" aria-label="Información del usuario">
					{profileDetails.map(({ label, value, Icon }) => (
						<div className="profile-info-row" key={label}>
							<div className="profile-info-icon" aria-hidden="true"><Icon /></div>
							<div className="profile-info-copy">
								<span className="profile-info-label">{label}</span>
								<span className="profile-info-value">{value}</span>
							</div>
						</div>
					))}
				</section>
			</section>
		</main>
	);
}
