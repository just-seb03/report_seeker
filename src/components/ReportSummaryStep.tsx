/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : ReportSummaryStep.tsx                                         *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 01 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización : 02 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   ReportSummaryStep -- Componente del paso de resumen, permite revisar todos los datos      *
 *        antes de enviar.                                                                     *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

export type EditableReportStep = 'photo' | 'severity' | 'description' | 'location' | 'title';

type ReportSummaryStepProps = {
  photoUrl: string;
  severity: string;
  description: string;
  location: string;
  title: string;
  errorMessage?: string;
  isSaving: boolean;
  onEdit: (step: EditableReportStep) => void;
  onConfirm: () => void;
};

const summaryFields: { step: EditableReportStep; label: string; valueKey: 'title' | 'severity' | 'description' | 'location' }[] = [
  { step: 'title', label: 'Título', valueKey: 'title' },
  { step: 'severity', label: 'Gravedad', valueKey: 'severity' },
  { step: 'description', label: 'Descripción', valueKey: 'description' },
  { step: 'location', label: 'Ubicación', valueKey: 'location' },
];

export default function ReportSummaryStep({
  photoUrl,
  severity,
  description,
  location,
  title,
  errorMessage,
  isSaving,
  onEdit,
  onConfirm,
}: ReportSummaryStepProps) {
  const values = { title, severity, description, location };

  return (
    <section className="report-summary-step" aria-labelledby="report-summary-heading">
      <h1 className="report-step-title" id="report-summary-heading">Revisa tu reporte</h1>
      <button
        className="report-summary-photo-button"
        type="button"
        onClick={() => onEdit('photo')}
        aria-label="Editar fotografía"
      >
        <img src={photoUrl} alt="Fotografía del riesgo" />
        <span>Fotografía <EditOutlinedIcon aria-hidden="true" /></span>
      </button>
      <div className="report-summary-fields">
        {summaryFields.map(({ step, label, valueKey }) => (
          <button
            className="report-summary-row"
            key={step}
            type="button"
            onClick={() => onEdit(step)}
            aria-label={`Editar ${label.toLowerCase()}`}
          >
            <span className="report-summary-copy">
              <span className="report-summary-label">{label}</span>
              <span className="report-summary-value">{values[valueKey]}</span>
            </span>
            <EditOutlinedIcon className="report-summary-edit-icon" aria-hidden="true" />
          </button>
        ))}
      </div>
      {errorMessage && <p className="report-submit-message" role="alert">{errorMessage}</p>}
      <button className="report-step-button is-primary" type="button" onClick={onConfirm} disabled={isSaving}>
        {isSaving ? 'Guardando...' : 'Confirmar reporte'}
      </button>
    </section>
  );
}
