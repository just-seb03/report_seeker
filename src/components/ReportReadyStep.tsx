import { useEffect, useState, type AnimationEvent } from 'react';

type ReportReadyStepProps = {
  onComplete: () => void;
};

export default function ReportReadyStep({ onComplete }: ReportReadyStepProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setIsExiting(true), 1600);
    return () => window.clearTimeout(exitTimer);
  }, []);

  const handleAnimationEnd = (event: AnimationEvent<HTMLElement>) => {
    if (isExiting && event.target === event.currentTarget) onComplete();
  };

  return (
    <section
      className={`report-ready-step${isExiting ? ' is-exiting' : ''}`}
      role="status"
      aria-live="polite"
      onAnimationEnd={handleAnimationEnd}
    >
      <h1>Reporte Listo Para Subir</h1>
    </section>
  );
}