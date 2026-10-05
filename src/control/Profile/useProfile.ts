import { useState, useEffect } from 'react';
import { getCurrentUser, type Trabajador } from '../global/authControl';

export function useProfile() {
	const [user, setUser] = useState<Trabajador | null>(getCurrentUser());

	useEffect(() => {
		const handleUserUpdate = (e: any) => {
			setUser(e.detail);
		};
		window.addEventListener('user_updated', handleUserUpdate);
		return () => window.removeEventListener('user_updated', handleUserUpdate);
	}, []);

	return { user };
}
