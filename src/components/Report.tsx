import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { AddPhotoAlternateOutlined, DeleteOutlined } from '@mui/icons-material';
import './Report.css';

export default function Report() {
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
  };

  const handleRemoveImage = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  return (
    <main className="report-screen">
      <div className="report-content">
        <header className="report-intro">
          <h1>Reportar</h1>
          <p>Describe la situación y adjunta una fotografía.</p>
        </header>

        <section className="report-field">
          <label className="report-label" htmlFor="report-image">Fotografía</label>
          <label className={`report-upload${imagePreview ? ' has-image' : ''}`} htmlFor="report-image">
            {imagePreview ? (
              <img className="report-image-preview" src={imagePreview} alt="Vista previa de la evidencia" />
            ) : (
              <>
                <span className="report-upload-icon"><AddPhotoAlternateOutlined /></span>
                <span className="report-upload-title">Añadir fotografía</span>
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

        <section className="report-field">
          <label className="report-label" htmlFor="report-description">Descripción</label>
          <textarea
            id="report-description"
            className="report-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Escribe lo que observaste..."
            maxLength={1000}
            rows={5}
          />
          <div className="report-character-count" aria-live="polite">{description.length} / 1000</div>
        </section>
      </div>
    </main>
  );
}