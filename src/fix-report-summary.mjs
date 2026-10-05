import fs from 'fs';
let c = fs.readFileSync('src/components/ReportSummaryStep.tsx', 'utf8');

c = c.replace(/const summaryFields: \{ step: EditableReportStep; label: string; valueKey: 'title' \| 'severity' \| 'description' \| 'location' \}.*?\n];/s, `const getSummaryFields = (): { step: EditableReportStep; label: string; valueKey: 'title' | 'severity' | 'description' | 'location' }[] => [
  { step: 'title', label: t.report.titleHeading, valueKey: 'title' },
  { step: 'severity', label: t.report.summarySeverity, valueKey: 'severity' },
  { step: 'description', label: t.report.summaryDesc, valueKey: 'description' },
  { step: 'location', label: t.report.summaryLocation, valueKey: 'location' },
];`);

c = c.replace(/const values = \{ title, severity, description, location \};/, `const values = { title, severity, description, location };\n  const summaryFields = getSummaryFields();`);

c = c.replace(/Revisa tu reporte/, '{t.report.reviewReport}');
c = c.replace(/\{isSaving \? 'Guardando...' : 'Confirmar reporte'\}/, '{isSaving ? t.report.textSaving : t.report.confirmReport}');

fs.writeFileSync('src/components/ReportSummaryStep.tsx', c);
console.log('Fixed ReportSummaryStep.tsx');
