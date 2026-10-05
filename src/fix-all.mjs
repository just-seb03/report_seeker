import fs from 'fs';

// 1. i18n
const i18nPath = 'src/control/i18n.ts';
let i18n = fs.readFileSync(i18nPath, 'utf8');

const esSync = `
    sync: {
      syncing: 'Sincronizando...',
      syncQueue: 'Sincronizar Cola',
      errorTitle: 'Problema de Conexión',
      understood: 'Entendido'
    },
    common: {`;

const enSync = `
    sync: {
      syncing: 'Syncing...',
      syncQueue: 'Sync Queue',
      errorTitle: 'Connection Problem',
      understood: 'Understood'
    },
    common: {`;

i18n = i18n.replace("    common: {", esSync);
i18n = i18n.replace("    common: {", enSync);
fs.writeFileSync(i18nPath, i18n);

// Function to replace
function replaceInFile(filePath, replacements, addImport = true) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (addImport && !content.includes("import { t } from '../control/i18n';") && !content.includes("import { t,")) {
    content = content.replace(/import \{.*\} from '@mui\/material';/, "import { t } from '../control/i18n';\n$&");
  }
  for (const [search, replace] of replacements) {
    // replace all occurrences of search
    content = content.split(search).join(replace);
  }
  fs.writeFileSync(filePath, content);
}

replaceInFile('src/components/SeekieAIInputBox.tsx', [
  ['placeholder="Pregúntale a Seekie AI..."', 'placeholder={t.seekie.inputPlaceholder}']
]);

replaceInFile('src/components/SyncQueueButton.tsx', [
  ["'{t.sync.syncing}'", "t.sync.syncing"],
  ["'Sincronizar Cola'", "t.sync.syncQueue"]
]);

replaceInFile('src/components/SyncErrorDialog.tsx', [
  ['Problema de Conexión', '{t.sync.errorTitle}'],
  ['Entendido', '{t.sync.understood}']
]);

replaceInFile('src/pages/Report.tsx', [
  ['"{t.report.descHeading}"', '{t.report.descHeading}'],
  ['"{t.report.descPlaceholder}"', '{t.report.descPlaceholder}'],
  ['"{t.report.locationHeading}"', '{t.report.locationHeading}'],
  ['"{t.report.locationPlaceholder}"', '{t.report.locationPlaceholder}'],
  ['"{t.report.titleHeading}"', '{t.report.titleHeading}'],
  ['"{t.report.titlePlaceholder}"', '{t.report.titlePlaceholder}']
], true);
// Add import to Report.tsx manually if needed
let reportContent = fs.readFileSync('src/pages/Report.tsx', 'utf8');
if (!reportContent.includes("import { t } from '../control/i18n';")) {
  reportContent = reportContent.replace("import { Box } from '@mui/material';", "import { Box } from '@mui/material';\nimport { t } from '../control/i18n';");
  fs.writeFileSync('src/pages/Report.tsx', reportContent);
}

replaceInFile('src/components/ChangePinDialog.tsx', [
  ['"{t.changePin.confirmTitle}"', '{t.changePin.confirmTitle}'],
  ['"{t.changePin.confirmSubtitle}"', '{t.changePin.confirmSubtitle}'],
  ['"{t.changePin.newTitle}"', '{t.changePin.newTitle}'],
  ['"{t.changePin.newSubtitle}"', '{t.changePin.newSubtitle}']
], false);

replaceInFile('src/components/ChangeEmailDialog.tsx', [
  ['"{t.changeEmail.confirmTitle}"', '{t.changeEmail.confirmTitle}'],
  ['"{t.changeEmail.confirmSubtitle}"', '{t.changeEmail.confirmSubtitle}'],
  ['"{t.changeEmail.newTitle}"', '{t.changeEmail.newTitle}'],
  ['"{t.changeEmail.newSubtitle}"', '{t.changeEmail.newSubtitle}']
], false);

replaceInFile('src/components/ReportPhotoStep.tsx', [
  ['Sí', '{t.report.photoYes}']
], false);

console.log('Fixed');
