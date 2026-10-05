import fs from 'fs';
import path from 'path';

function addImport(content, importStatement) {
  if (content.includes(importStatement)) return content;
  const importMatches = [...content.matchAll(/^import .*;$/gm)];
  if (importMatches.length > 0) {
    const lastImport = importMatches[importMatches.length - 1];
    const insertPos = lastImport.index + lastImport[0].length;
    return content.slice(0, insertPos) + '\n' + importStatement + content.slice(insertPos);
  }
  return importStatement + '\n' + content;
}

const filesToUpdate = {
  'src/pages/Login.tsx': [
    { search: '<Typography variant="h3" sx={{ fontWeight: 400, letterSpacing: 2 }}>Bienvenido</Typography>', replace: '<Typography variant="h3" sx={{ fontWeight: 400, letterSpacing: 2 }}>{t.login.welcome}</Typography>' },
    { search: 'title="Ingrese su ID de trabajador"', replace: 'title={t.login.step1Title}' },
    { search: 'subtitle="5 dígitos"', replace: 'subtitle={t.login.step1Subtitle}' },
    { search: 'title="Ingrese su PIN"', replace: 'title={t.login.step2Title}' },
    { importStmt: "import { t } from '../control/i18n';" }
  ],
  'src/pages/InfoReport.tsx': [
    { search: 'Detalle del Reporte</Typography>', replace: '{t.infoReport.title}</Typography>' },
    { search: 'Fotografía</Typography>', replace: '{t.infoReport.photoSection}</Typography>' },
    { search: 'Detalles</Typography>', replace: '{t.infoReport.detailsSection}</Typography>' },
    { search: 'Descripción</Typography>', replace: '{t.infoReport.descriptionSection}</Typography>' },
    { search: 'ID del Reporte</Typography>', replace: '{t.infoReport.infoId}</Typography>' },
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
      const depth = filePath.split('/').length - 2;
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
