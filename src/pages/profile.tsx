import AccountCircleOutlined from '@mui/icons-material/AccountCircleOutlined';
import BadgeOutlined from '@mui/icons-material/BadgeOutlined';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import './profile.css';

const profileName = 'Sebastian Arredondo Vega Cantuarias';
const profileDetails = [
	{ label: 'Teléfono', value: '+56 9 6234 8170', Icon: PhoneOutlined },
	{ label: 'Correo', value: 'bastian.vegag@gmail.cl', Icon: EmailOutlined },
	{ label: 'ID de usuario', value: 'No asignado', Icon: BadgeOutlined },
];

export default function Profile() {
	return (
		<main className="profile-screen">
			<div className="profile-banner" aria-hidden="true" />
			<section className="profile-content" aria-labelledby="profile-title">
				<div className="profile-avatar" aria-hidden="true">
					<AccountCircleOutlined />
				</div>
				<h1 id="profile-title">{profileName}</h1>
				<button className="profile-settings" type="button">
					<SettingsOutlined />
					Configuración
				</button>
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
