import fs from 'fs';
const i18nPath = 'src/control/i18n.ts';
let content = fs.readFileSync(i18nPath, 'utf8');

// Remove duplicate lines from i18n.ts in report:
const duplicates = [
  "      photoConfirm: '¿Confirmas esta fotografía?',\n",
  "      photoOpening: 'Abriendo cámara...',\n",
  "      photoNo: 'No',\n",
  "      photoYes: 'Sí',\n",
  "      severityHeading: '¿Define su gravedad?',\n",
  "      textSaving: 'Guardando...',\n",
  "      textAccept: 'Aceptar',\n",
  "      photoConfirm: 'Confirm this photo?',\n",
  "      photoOpening: 'Opening camera...',\n",
  "      photoNo: 'No',\n",
  "      photoYes: 'Yes',\n",
  "      severityHeading: 'Define its severity?',\n",
  "      textSaving: 'Saving...',\n",
  "      textAccept: 'Accept',\n"
];

for (const dup of duplicates) {
  content = content.replace(dup, ""); // Removes only the first occurrence!
}

fs.writeFileSync(i18nPath, content);
console.log("Removed duplicates");
