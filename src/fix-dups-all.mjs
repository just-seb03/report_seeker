import fs from 'fs';
let c = fs.readFileSync('src/control/i18n.ts', 'utf8');

c = c.replace(/      photoConfirm: '¿Confirmas esta fotografía\?',\n/g, "");
c = c.replace(/      photoOpening: 'Abriendo cámara\.\.\.',\n/g, "");
c = c.replace(/      photoNo: 'No',\n/g, "");
c = c.replace(/      photoYes: 'Sí',\n/g, "");
c = c.replace(/      severityHeading: '¿Define su gravedad\?',\n/g, "");
c = c.replace(/      textSaving: 'Guardando\.\.\.',\n/g, "");
c = c.replace(/      textAccept: 'Aceptar',\n/g, "");

c = c.replace(/      photoConfirm: 'Confirm this photo\?',\n/g, "");
c = c.replace(/      photoOpening: 'Opening camera\.\.\.',\n/g, "");
c = c.replace(/      photoNo: 'No',\n/g, "");
c = c.replace(/      photoYes: 'Yes',\n/g, "");
c = c.replace(/      severityHeading: 'Define its severity\?',\n/g, "");
c = c.replace(/      textSaving: 'Saving\.\.\.',\n/g, "");
c = c.replace(/      textAccept: 'Accept',\n/g, "");

// Re-add the proper versions at the top of the report section
const esReportHeader = `    report: {
      photoConfirm: '¿Confirmas esta fotografía?',
      photoOpening: 'Abriendo cámara...',
      photoNo: 'No',
      photoYes: 'Sí',
      severityHeading: '¿Define su gravedad?',
      textSaving: 'Guardando...',
      textAccept: 'Aceptar',`;
      
const enReportHeader = `    report: {
      photoConfirm: 'Confirm this photo?',
      photoOpening: 'Opening camera...',
      photoNo: 'No',
      photoYes: 'Yes',
      severityHeading: 'Define its severity?',
      textSaving: 'Saving...',
      textAccept: 'Accept',`;

c = c.replace("    report: {", esReportHeader);
c = c.replace("    report: {\n      descHeading: 'Describe what you saw',", enReportHeader + "\n      descHeading: 'Describe what you saw',");

fs.writeFileSync('src/control/i18n.ts', c);
