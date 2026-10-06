import { useState, useEffect } from 'react';
import { getCurrentUser, updateUserLocal, type Trabajador } from '../global/authControl';
import { captureReportPhoto } from '../Home/cameraControl';
import { insertOrUpdateTrabajadorLocal } from '../../database';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export function useProfile() {
	const [user, setUser] = useState<Trabajador | null>(getCurrentUser());
	const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);

	useEffect(() => {
		const handleUserUpdate = (e: any) => {
			setUser(e.detail);
		};
		window.addEventListener('user_updated', handleUserUpdate);
		return () => window.removeEventListener('user_updated', handleUserUpdate);
	}, []);

	const updateProfilePicture = async () => {
		if (!user) return;
		setIsUpdatingPhoto(true);
		try {
			const photo = await captureReportPhoto();
			if (!photo || !photo.blob) return;

			// Convert blob to base64
			const base64Url = await new Promise<string>((resolve, reject) => {
				const reader = new FileReader();
				reader.onloadend = () => resolve(reader.result as string);
				reader.onerror = reject;
				reader.readAsDataURL(photo.blob);
			});

			const updatedUser = { ...user, foto_url: base64Url };

			// Update Firestore
			await updateDoc(doc(db, 'trabajadores', user.trabajador_id.toString()), {
				foto_url: base64Url
			});

			// Update SQLite
			await insertOrUpdateTrabajadorLocal(updatedUser);

			// Update global local storage / React state
			updateUserLocal(updatedUser);
		} catch (error) {
			console.error('Error updating profile picture:', error);
			alert('No se pudo actualizar la foto de perfil.');
		} finally {
			setIsUpdatingPhoto(false);
		}
	};

	return { user, isUpdatingPhoto, updateProfilePicture };
}
