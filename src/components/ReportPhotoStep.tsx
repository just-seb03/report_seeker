type ReportPhotoStepProps = {
  photoUrl: string;
  isRetakingPhoto: boolean;
  onRetakePhoto: () => void;
  onConfirm: () => void;
};

export default function ReportPhotoStep({
  photoUrl,
  isRetakingPhoto,
  onRetakePhoto,
  onConfirm,
}: ReportPhotoStepProps) {
  return (
    <section className="report-photo-step" aria-labelledby="report-photo-question">
      <figure className="report-photo-confirmation">
        <img src={photoUrl} alt="Fotografía seleccionada para el reporte" />
      </figure>
      <h1 className="report-step-title" id="report-photo-question">¿Confirmas esta fotografía?</h1>
      <div className="report-step-actions">
        <button className="report-step-button" type="button" onClick={onRetakePhoto} disabled={isRetakingPhoto}>
          {isRetakingPhoto ? 'Abriendo cámara...' : 'No'}
        </button>
        <button className="report-step-button is-primary" type="button" onClick={onConfirm} disabled={isRetakingPhoto}>
          Sí
        </button>
      </div>
    </section>
  );
}