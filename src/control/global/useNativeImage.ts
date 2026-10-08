import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

/**
 * Hook para centralizar la conversión de rutas nativas a URLs usables en la web (<img src>).
 * @param rawUrl La ruta cruda que puede ser un 'file://' nativo o una URL web normal.
 * @returns La ruta procesada y lista para renderizarse en el DOM.
 */
export function useNativeImage(rawUrl: string | null | undefined): string | null | undefined {
  const [displayUrl, setDisplayUrl] = useState<string | null | undefined>(rawUrl);

  useEffect(() => {
    if (!rawUrl) {
      setDisplayUrl(rawUrl);
      return;
    }

    if (rawUrl.startsWith('file://') && Capacitor.isNativePlatform()) {
      setDisplayUrl(Capacitor.convertFileSrc(rawUrl));
    } else {
      setDisplayUrl(rawUrl);
    }
  }, [rawUrl]);

  return displayUrl;
}
