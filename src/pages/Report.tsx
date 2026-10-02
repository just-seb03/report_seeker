import { useRef, useState, type FormEvent } from 'react';
import { saveIssueReport } from '../database';
import './Report.css';

const severityOptions = ['Leve', 'Moderada', 'Grave'] as const;

interface ReportProps {
  photo: Blob;
  photoPreviewUrl: string;
  onReportCreated: (report: { issueId: number; title: string; description: string; location: string; priority: string }) => void;
}

export default function Report({ photo, photoPreviewUrl, onReportCreated }: ReportProps) {
  const [reportUid, setReportUid] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState(0);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const severityDragActive = useRef(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setSubmitMessage('Guardando ficha...');

    try {
      const issueId = await saveIssueReport({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        priority: severityOptions[severity],
        image: photo,
      });

      onReportCreated({
        issueId,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        priority: severityOptions[severity],
      });
      setReportUid(issueId);
      setSubmitMessage(`Reporte completo guardado con UID-${issueId}.`);
    } catch (error) {
      console.error('No se pudo guardar la ficha', error);
      setSubmitMessage('No se pudo guardar el reporte. Comprueba el almacenamiento del dispositivo e inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSeverityFromPointer = (clientX: number, element: HTMLDivElement) => {
    const bounds = element.getBoundingClientRect();
    const position = Math.max(0, Math.min(0.999, (clientX - bounds.left) / bounds.width));
    setSeverity(Math.floor(position * severityOptions.length));
    setSubmitMessage('');
    setReportUid(null);
  };

  const handleSeverityPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary) return;
    severityDragActive.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateSeverityFromPointer(event.clientX, event.currentTarget);
  };

  const handleSeverityPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (severityDragActive.current) updateSeverityFromPointer(event.clientX, event.currentTarget);
  };

  const handleSeverityKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    let nextSeverity = severity;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') nextSeverity -= 1;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') nextSeverity += 1;
    else if (event.key === 'Home') nextSeverity = 0;
    else if (event.key === 'End') nextSeverity = severityOptions.length - 1;
    else return;

    event.preventDefault();
    setSeverity(Math.max(0, Math.min(severityOptions.length - 1, nextSeverity)));
    setSubmitMessage('');
    setReportUid(null);
  };

  return (
    <main className="report-screen">
      <div className="report-content">
        <header className="report-intro">
          <h1>{reportUid === null ? 'Nueva ficha' : `UID-${reportUid}`}</h1>
        </header>

        <form className="report-form" onSubmit={handleSubmit}>
          <section className="report-field">
            <input
              id="report-title"
              className="report-title-input"
              aria-label="Título del reporte"
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setSubmitMessage('');
                setReportUid(null);
              }}
              placeholder="Título"
              maxLength={100}
              required
            />
          </section>

          <section className="report-field report-severity-field">
            <label className="report-label" htmlFor="report-severity">Gravedad</label>
            <div
              id="report-severity"
              className="report-severity-pill"
              data-level={severity}
              style={{ '--severity-fill': `${((severity + 1) / severityOptions.length) * 100}%` } as React.CSSProperties}
              role="slider"
              tabIndex={0}
              aria-label="Peligrosidad del reporte"
              aria-valuemin={0}
              aria-valuemax={severityOptions.length - 1}
              aria-valuenow={severity}
              aria-valuetext={severityOptions[severity]}
              onKeyDown={handleSeverityKeyDown}
              onPointerDown={handleSeverityPointerDown}
              onPointerMove={handleSeverityPointerMove}
              onPointerUp={() => { severityDragActive.current = false; }}
              onPointerCancel={() => { severityDragActive.current = false; }}
            >
              {severityOptions.map((option, index) => (
                <span className="report-severity-segment" key={option} aria-hidden="true">
                  {option}
                  {index < severityOptions.length - 1 && <span className="report-severity-divider" />}
                </span>
              ))}
            </div>
            <p className={`report-severity-value severity-${severity}`} aria-live="polite">
              {severityOptions[severity]}
            </p>
          </section>

          <section className="report-field">
            <textarea
              id="report-description"
              className="report-description"
              aria-label="Descripción del reporte"
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setSubmitMessage('');
                setReportUid(null);
              }}
              placeholder="Descripción"
              maxLength={1000}
              rows={3}
              required
            />
            <div className="report-character-count" aria-live="polite">{description.length} / 1000</div>
          </section>

          <section className="report-field">
            <label className="report-label" htmlFor="report-location">Ubicación</label>
            <input
              id="report-location"
              className="report-location-input"
              type="text"
              value={location}
              onChange={(event) => {
                setLocation(event.target.value);
                setSubmitMessage('');
                setReportUid(null);
              }}
              placeholder="Ingresa la ubicación"
              maxLength={200}
            />
          </section>

          <section className="report-field">
            <p className="report-label">Fotografía capturada</p>
            <figure className="report-photo">
              <img className="report-image-preview" src={photoPreviewUrl} alt="Fotografía del reporte" />
            </figure>
          </section>

          <button className="report-submit" type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Reportar'}
          </button>
          <p className="report-submit-message" role="status">{submitMessage}</p>
        </form>
      </div>
    </main>
  );
}