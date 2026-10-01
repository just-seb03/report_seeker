import './profile.css';

const profileDetails = [
	{ label: 'Nombre completo', value: 'Sebastian Arredondo Vega Cantuarias' },
	{ label: 'Teléfono', value: '+56 9 6234 8170' },
	{ label: 'Correo', value: 'bastian.vegag@gmail.cl' },
];

export default function Profile() {
	return (
		<main className="profile-screen">
			<section className="profile-content" aria-labelledby="profile-title">
				<h1 id="profile-title">Perfil</h1>
				<dl className="profile-details">
					{profileDetails.map(({ label, value }) => (
						<div className="profile-detail" key={label}>
							<dt>{label}</dt>
							<dd>{value}</dd>
						</div>
					))}
				</dl>
			</section>
		</main>
	);
}
