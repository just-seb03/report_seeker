// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { DarkMode } from '@aparajita/capacitor-dark-mode';
import './index.css';

const applyDarkMode = (dark: boolean) => {
  document.documentElement.classList.toggle('dark', dark);
  document.body.classList.toggle('dark', dark);
};

const initTheme = async () => {
  try {
    await DarkMode.init({ cssClass: 'dark' });

    const { dark } = await DarkMode.isDarkMode();
    applyDarkMode(dark);

    const listener = await DarkMode.addAppearanceListener(({ dark }) => {
      applyDarkMode(dark);
    });

    void listener;
  } catch (error) {
    console.error('Dark mode no disponible en la web o no está corriendo en Android nativo', error);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    applyDarkMode(mediaQuery.matches);

    mediaQuery.addEventListener('change', (event) => {
      applyDarkMode(event.matches);
    });
  }
};

void initTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);