import fs from 'fs';

// 1. Update i18n.ts
const i18nPath = 'src/control/i18n.ts';
let i18n = fs.readFileSync(i18nPath, 'utf8');

const esAdditions = `
    infoReport: {
      subtitle: 'Reporte de riesgo',
      noPhotoInfo: 'Este reporte no tiene fotografía',
      noLocationInfo: 'No especificada',
      noDescriptionInfo: 'Sin descripción',
`;

const enAdditions = `
    infoReport: {
      subtitle: 'Risk report',
      noPhotoInfo: 'This report has no photo',
      noLocationInfo: 'Not specified',
      noDescriptionInfo: 'No description',
`;

i18n = i18n.replace("    infoReport: {", esAdditions);
i18n = i18n.replace("    infoReport: {\n      title: 'Report Details',", enAdditions + "      title: 'Report Details',");

fs.writeFileSync(i18nPath, i18n);

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [search, replace] of replacements) {
    content = content.split(search).join(replace);
  }
  fs.writeFileSync(filePath, content);
}

replaceInFile('src/pages/InfoReport.tsx', [
  ['Reporte de riesgo', '{t.infoReport.subtitle}'],
  ['Cargando fotografía...', '{t.notification.loadingPhoto}'],
  ['Este reporte no tiene fotografía', '{t.infoReport.noPhotoInfo}'],
  ['>Gravedad<', '>{t.infoReport.infoSeverity}<'],
  ['>Ubicación<', '>{t.infoReport.infoLocation}<'],
  ["'No especificada'", "t.infoReport.noLocationInfo"],
  ["'Sin descripción'", "t.infoReport.noDescriptionInfo"],
  ["'Trabajador Desconocido'", "t.notification.unknownWorker"]
]);

console.log('Translations applied successfully!');
