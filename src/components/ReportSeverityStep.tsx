import { useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';

type ReportSeverityStepProps = {
  severity: number;
  options: readonly string[];
  onChange: (severity: number) => void;
  onConfirm: () => void;
};

export default function ReportSeverityStep({ severity, options, onChange, onConfirm }: ReportSeverityStepProps) {
  const isDragging = useRef(false);

  const updateFromPointer = (clientX: number, element: HTMLDivElement) => {
    const bounds = element.getBoundingClientRect();
    const position = Math.max(0, Math.min(0.999, (clientX - bounds.left) / bounds.width));
    onChange(Math.floor(position * options.length));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let nextSeverity = severity;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') nextSeverity -= 1;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') nextSeverity += 1;
    else if (event.key === 'Home') nextSeverity = 0;
    else if (event.key === 'End') nextSeverity = options.length - 1;
    else return;

    event.preventDefault();
    onChange(Math.max(0, Math.min(options.length - 1, nextSeverity)));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary) return;
    isDragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event.clientX, event.currentTarget);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (isDragging.current) updateFromPointer(event.clientX, event.currentTarget);
  };

  return (
    <section className="report-severity-step" aria-labelledby="report-severity-heading">
      <h1 className="report-step-title" id="report-severity-heading">¿Define su gravedad?</h1>
      <div
        id="report-severity"
        className="report-severity-pill"
        data-level={severity}
        style={{ '--severity-fill': `${((severity + 1) / options.length) * 100}%` } as CSSProperties}
        role="slider"
        tabIndex={0}
        aria-label="Gravedad del riesgo"
        aria-valuemin={0}
        aria-valuemax={options.length - 1}
        aria-valuenow={severity}
        aria-valuetext={options[severity]}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => { isDragging.current = false; }}
        onPointerCancel={() => { isDragging.current = false; }}
      >
        {options.map((option, index) => (
          <span className="report-severity-segment" key={option} aria-hidden="true">
            {option}
            {index < options.length - 1 && <span className="report-severity-divider" />}
          </span>
        ))}
      </div>
      <p className={`report-severity-value severity-${severity}`} aria-live="polite">{options[severity]}</p>
      <button className="report-step-button is-primary" type="button" onClick={onConfirm}>Confirmar</button>
    </section>
  );
}