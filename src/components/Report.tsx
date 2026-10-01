import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { AddPhotoAlternateOutlined, DeleteOutlined } from '@mui/icons-material';
import './Report.css';

const severityOptions = ['Leve', 'Moderada', 'Grave'] as const;

export default function Report() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState('');
  const severityDragActive = useRef(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const image = event.target.files?.[0];
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);

    const previewUrl = image ? URL.createObjectURL(image) : null;
    previewUrlRef.current = previewUrl;
    setImagePreview(previewUrl);
    setSubmitMessage('');
  };

  const handleRemoveImage = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitMessage('Formulario validado. El envío todavía no está conectado a un servicio.');
  };

  const updateSeverityFromPointer = (clientX: number, element: HTMLDivElement) => {
    const bounds = element.getBoundingClientRect();
    const position = Math.max(0, Math.min(0.999, (clientX - bounds.left) / bounds.width));
    setSeverity(Math.floor(position * severityOptions.length));
    setSubmitMessage('');
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
  };

  return (
    <main className="report-screen">
      <div className="report-content">
        <header className="report-intro">
          <h1>Nuevo reporte</h1>
        </header>

        <form className="report-form" onSubmit={handleSubmit}>
          <section className="report-field">
            <label className="report-label" htmlFor="report-title">Título</label>
            <input
              id="report-title"
              className="report-title-input"
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setSubmitMessage('');
              }}
              placeholder="Ej. Fuga en tubería"
              maxLength={100}
              required
            />
          </section>

          <section className="report-field">
            <label className="report-label" htmlFor="report-image">Fotografía</label>
            <label className={`report-upload${imagePreview ? ' has-image' : ''}`} htmlFor="report-image">
              {imagePreview ? (
                <img className="report-image-preview" src={imagePreview} alt="Vista previa de la evidencia" />
              ) : (
                <>
                  <span className="report-upload-icon"><AddPhotoAlternateOutlined /></span>
                  <span className="report-upload-title">Añadir fotografía</span>
                  <span className="report-upload-hint">Usa la cámara o elige una imagen</span>
                </>
              )}
              <input
                ref={imageInputRef}
                id="report-image"
                className="report-file-input"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
              />
            </label>

            {imagePreview && (
              <button className="report-remove-image" type="button" onClick={handleRemoveImage}>
                <DeleteOutlined />
                Quitar imagen
              </button>
            )}
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
            <label className="report-label" htmlFor="report-description">Descripción</label>
            <textarea
              id="report-description"
              className="report-description"
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setSubmitMessage('');
              }}
              placeholder="Describe lo que observaste..."
              maxLength={1000}
              rows={5}
              required
            />
            <div className="report-character-count" aria-live="polite">{description.length} / 1000</div>
          </section>

          <button className="report-submit" type="submit">Reportar</button>
          <p className="report-submit-message" role="status">{submitMessage}</p>
        </form>
      </div>
    </main>
  );
}