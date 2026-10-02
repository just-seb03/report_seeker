import type { FormEvent } from 'react';

type ReportTextStepProps = {
  field: 'description' | 'location' | 'title';
  heading: string;
  value: string;
  placeholder: string;
  maxLength: number;
  multiline?: boolean;
  errorMessage?: string;
  isBusy?: boolean;
  onChange: (value: string) => void;
  onConfirm: () => void;
};

export default function ReportTextStep({
  field,
  heading,
  value,
  placeholder,
  maxLength,
  multiline = false,
  errorMessage,
  isBusy = false,
  onChange,
  onConfirm,
}: ReportTextStepProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onConfirm();
  };

  return (
    <section className="report-text-step" aria-labelledby={`report-${field}-heading`}>
      <h1 className="report-step-title" id={`report-${field}-heading`}>{heading}</h1>
      <form className="report-step-form" autoComplete="off" onSubmit={handleSubmit}>
        {multiline ? (
          <textarea
            id={`report-${field}`}
            className="report-description"
            aria-label={heading}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={5}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            required
            autoFocus
          />
        ) : (
          <input
            id={`report-${field}`}
            className={field === 'location' ? 'report-location-input' : 'report-title-input'}
            aria-label={heading}
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            required
            autoFocus
          />
        )}
        {multiline && <div className="report-character-count" aria-live="polite">{value.length} / {maxLength}</div>}
        {errorMessage && <p className="report-submit-message" role="alert">{errorMessage}</p>}
        <button className="report-step-button is-primary" type="submit" disabled={!value.trim() || isBusy}>
          {isBusy ? 'Guardando...' : 'Aceptar'}
        </button>
      </form>
    </section>
  );
}