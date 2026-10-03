import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

const requiredConfig = (
  name: string,
  value: string | undefined,
): string => {
  if (!value) {
    throw new Error(`Falta configurar ${name} en el archivo .env.local`);
  }

  return value;
};

const firebaseConfig = {
  apiKey: requiredConfig('VITE_FIREBASE_API_KEY', import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: requiredConfig(
    'VITE_FIREBASE_AUTH_DOMAIN',
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  ),
  projectId: requiredConfig('VITE_FIREBASE_PROJECT_ID', import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: requiredConfig(
    'VITE_FIREBASE_STORAGE_BUCKET',
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  ),
  messagingSenderId: requiredConfig(
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  ),
  appId: requiredConfig('VITE_FIREBASE_APP_ID', import.meta.env.VITE_FIREBASE_APP_ID),
  measurementId: requiredConfig(
    'VITE_FIREBASE_MEASUREMENT_ID',
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  ),
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const analyticsPromise = isSupported().then((supported) =>
  supported ? getAnalytics(app) : null,
);
