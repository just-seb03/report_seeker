import fs from 'fs';
import path from 'path';

function addImport(content, importStatement) {
  if (content.includes(importStatement)) return content;
  // Find last import statement
  const importMatches = [...content.matchAll(/^import .*;$/gm)];
  if (importMatches.length > 0) {
    const lastImport = importMatches[importMatches.length - 1];
    const insertPos = lastImport.index + lastImport[0].length;
    return content.slice(0, insertPos) + '\n' + importStatement + content.slice(insertPos);
  }
  return importStatement + '\n' + content;
}

const filesToUpdate = {
  'src/components/BottomNav.tsx': [
    { search: 'label="Reportar"', replace: 'label={t.home.bottomNav.report}' },
    { search: 'label="Cola"', replace: 'label={t.home.bottomNav.queue}' },
    { search: 'label="Inicio"', replace: 'label={t.home.bottomNav.home}' },
    { search: 'label="Seekie AI"', replace: 'label={t.home.bottomNav.seekie}' },
    { search: 'label="Perfil"', replace: 'label={t.home.bottomNav.profile}' },
    { importStmt: "import { t } from '../control/i18n';" }
  ],
  'src/components/HomeHeader.tsx': [
    { search: '<>Tienes<br />Reportes<br />Pendientes</>', replace: '{t.home.headerPendingReports.split("\\n").map((line, i) => <span style={{display: "block"}} key={i}>{line}</span>)}' },
    { search: '<>Hay<br />Nuevos<br />Reportes</>', replace: '{t.home.headerNewReports.split("\\n").map((line, i) => <span style={{display: "block"}} key={i}>{line}</span>)}' },
    { search: 'Todo<br />En<br />Orden', replace: '{t.home.headerAllGood.split("\\n").map((line, i) => <span style={{display: "block"}} key={i}>{line}</span>)}' },
    { search: 'label="Actualizando reportes"', replace: 'label={t.home.refreshing}' },
    { importStmt: "import { t } from '../control/i18n';" }
  ],
  'src/components/NotificationSheet.tsx': [
    { search: 'Notificaciones</Typography>', replace: '{t.home.notificationsTitle}</Typography>' },
    { search: 'Cargar más</Button>', replace: '{t.home.loadMore}</Button>' },
    { search: 'No hay más notificaciones</Typography>', replace: '{t.home.noMoreNotifications}</Typography>' },
    { importStmt: "import { t } from '../control/i18n';" }
  ],
  'src/components/RefreshIndicator.tsx': [
    { search: 'Suelta para actualizar reportes', replace: '{t.home.refreshPull}' },
    { importStmt: "import { t } from '../control/i18n';" }
  ]
};

for (const [filePath, replacements] of Object.entries(filesToUpdate)) {
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${filePath}, not found.`);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf-8');
  for (const rep of replacements) {
    if (rep.importStmt) {
      // Need correct relative path based on file depth
      const depth = filePath.split('/').length - 2; // src/components -> 2 dirs deep
      const importPath = depth === 1 ? "'./control/i18n'" : "'../control/i18n'";
      const statement = `import { t } from ${importPath};`;
      content = addImport(content, statement);
    } else {
      content = content.replaceAll(rep.search, rep.replace);
    }
  }
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
}
