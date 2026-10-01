import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { AddPhotoAlternateOutlined, DeleteOutlined } from '@mui/icons-material';
import { saveIssueReport } from '../database';
import './Report.css';

const severityOptions = ['Leve', 'Moderada', 'Grave'] as const;

export default function Report() {
  const [reportUid, setReportUid] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
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
    setImageFile(image ?? null);
    setSubmitMessage('');
    setReportUid(null);
  };

  const handleRemoveImage = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setImagePreview(null);
    setImageFile(null);
    setSubmitMessage('');
    setReportUid(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setSubmitMessage('Guardando ficha...');

    try {
      const issueId = await saveIssueReport({
        title: title.trim(),
        description: description.trim(),
        priority: severityOptions[severity],
        image: imageFile,
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
            <label className={`report-upload${imagePreview ? ' has-image' : ''}`} htmlFor="report-image">
              {imagePreview ? (
                <img className="report-image-preview" src={imagePreview} alt="Vista previa de la evidencia" />
              ) : (
                <>
                  <span className="report-upload-icon"><AddPhotoAlternateOutlined /></span>
                  <span className="report-upload-title">Fotografía</span>
                  <span className="report-upload-hint">Toca para añadir una imagen</span>
                </>
              )}
              <input
                ref={imageInputRef}
                id="report-image"
                className="report-file-input"
                type="file"
                accept="image/*"
                capture="environment"
                aria-label="Añadir fotografía"
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

          <button className="report-submit" type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Reportar'}
          </button>
          <p className="report-submit-message" role="status">{submitMessage}</p>
        </form>
      </div>
    </main>
  );
}