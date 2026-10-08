/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : i18n.ts                                                          *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 04 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 07 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   Módulo de internacionalización refactorizado utilizando i18next.                          *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import { useAppStore, type Language } from '../../store/useAppStore';
import esJson from '../../../public/locales/es/translation.json';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'es',
    lng: localStorage.getItem('appLanguage') || 'es',
    interpolation: { escapeValue: false },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    react: {
      useSuspense: false // Evita crashear componentes que no usan Suspense
    }
  });

export function getTranslatedSeverity(raw: string | undefined): string {
  if (!raw) return '';
  const lower = raw.toLowerCase();
  if (['baja', 'leve', 'low'].includes(lower)) return i18n.t('report.severityLow');
  if (['media', 'moderada', 'medium'].includes(lower)) return i18n.t('report.severityMedium');
  if (['alta', 'grave', 'high'].includes(lower)) return i18n.t('report.severityHigh');
  return raw;
}

export function setLanguage(lang: Language) {
  i18n.changeLanguage(lang).then(() => {
    useAppStore.getState().setLanguage(lang);
  });
}

// Variable expuesta por compatibilidad retroactiva
export const currentLanguage: string = i18n.language || 'es';

/**
 * Proxy Wrapper (Capa de Compatibilidad Retroactiva).
 * Permite que todos los componentes que aún utilizan `t.modulo.llave` 
 * sigan funcionando sin modificar 30 archivos, delegando la llamada a i18n.t().
 */
export const t = new Proxy({} as any, {
  get(_target, prop) {
    return new Proxy({}, {
      get(_subTarget, subProp) {
        return i18n.t(`${String(prop)}.${String(subProp)}`);
      }
    });
  }
}) as unknown as typeof esJson;
