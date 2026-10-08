import { useState } from 'react';
import { updateUserLocal } from '../global/authControl';
import { useAppStore } from '../../store/useAppStore';
import { captureReportPhoto } from '../Home/cameraControl';
import { insertOrUpdateTrabajadorLocal } from '../../database';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export function useProfile() {
	const user = useAppStore(state => state.currentUser);
	const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);

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
