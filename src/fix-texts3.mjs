import fs from 'fs';

// 1. Update i18n.ts
const i18nPath = 'src/control/i18n.ts';
let i18n = fs.readFileSync(i18nPath, 'utf8');

const esAdditions = `
    notification: {
      now: 'ahora',
      unknownDate: 'Fecha desconocida',
      loadingPhoto: 'Cargando fotografía...',
      noPhoto: 'Sin fotografía asociada',
      noLocation: 'Ubicación no especificada',
      unknownWorker: 'Trabajador Desconocido',
    },
    report: {
      descHeading: 'Describe lo que has visto',
      locationHeading: '¿En dónde está localizado el riesgo?',
      titleHeading: 'Ponle un título al riesgo',
      photoYes: 'Sí',
      photoNo: 'No',
      photoOpening: 'Abriendo cámara...',
      photoConfirm: '¿Confirmas esta fotografía?',
      severityHeading: '¿Define su gravedad?',
      textSaving: 'Guardando...',
      textAccept: 'Aceptar',
`;

const enAdditions = `
    notification: {
      now: 'now',
      unknownDate: 'Unknown date',
      loadingPhoto: 'Loading photo...',
      noPhoto: 'No photo associated',
      noLocation: 'Location not specified',
      unknownWorker: 'Unknown Worker',
    },
    report: {
      descHeading: 'Describe what you saw',
      locationHeading: 'Where is the risk located?',
      titleHeading: 'Give the risk a title',
      photoYes: 'Yes',
      photoNo: 'No',
      photoOpening: 'Opening camera...',
      photoConfirm: 'Confirm this photo?',
      severityHeading: 'Define its severity?',
      textSaving: 'Saving...',
      textAccept: 'Accept',
`;

i18n = i18n.replace("    report: {", esAdditions);
i18n = i18n.replace("    report: {\n      cancelTitle: 'Cancel your report?',", enAdditions + "      cancelTitle: 'Cancel your report?',");

fs.writeFileSync(i18nPath, i18n);

function replaceInFile(filePath, replacements, addImport = true) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (addImport && !content.includes("import { t } from '../control/i18n';") && !content.includes("import { t,")) {
    content = content.replace("import { ", "import { t } from '../control/i18n';\nimport { ");
  }
  for (const [search, replace] of replacements) {
    content = content.split(search).join(replace);
  }
  fs.writeFileSync(filePath, content);
}

replaceInFile('src/components/NotificationCard.tsx', [
  ["import { t } from '../control/i18n';", "import { t, currentLanguage } from '../control/i18n';"],
  ["return 'ahora'", "return t.notification.now"],
  ["return 'Fecha desconocida'", "return t.notification.unknownDate"],
  ["'es-CL'", "currentLanguage === 'en' ? 'en-US' : 'es-CL'"],
  ["'Cargando fotografía...' : 'Sin fotografía asociada'", "t.notification.loadingPhoto : t.notification.noPhoto"],
  ["'Ubicación no especificada'", "t.notification.noLocation"],
  ["'Trabajador Desconocido'", "t.notification.unknownWorker"]
]);

replaceInFile('src/pages/Report.tsx', [
  ['Describe lo que has visto', '{t.report.descHeading}'],
  ['Escribe la descripción', '{t.report.descPlaceholder}'],
  ['¿En dónde está localizado el riesgo?', '{t.report.locationHeading}'],
  ['Ingresa la ubicación', '{t.report.locationPlaceholder}'],
  ['Ponle un título al riesgo', '{t.report.titleHeading}'],
  ['Escribe un título', '{t.report.titlePlaceholder}']
]);

replaceInFile('src/control/useReport.ts', [
  ["const severityOptions = ['Leve', 'Moderada', 'Grave'] as const;", "const getSeverityOptions = () => [t.report.severityLow, t.report.severityMedium, t.report.severityHigh];"]
]);
replaceInFile('src/control/useReport.ts', [
  ["severityOptions[severity]", "getSeverityOptions()[severity]"],
  ["const {", "const severityOptions = getSeverityOptions();\n  const {"]
], false);

replaceInFile('src/components/ReportSeverityStep.tsx', [
  ["Confirmar", "{t.common.confirm}"]
]);

console.log('Translations applied successfully!');
