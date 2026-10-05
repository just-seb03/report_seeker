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
  'src/pages/Report.tsx': [
    { search: 'label="Tomar foto"', replace: 'label={t.report.step1}' },
    { search: 'label="Ubicación"', replace: 'label={t.report.step2}' },
    { search: 'label="Gravedad"', replace: 'label={t.report.step3}' },
    { search: 'label="Descripción"', replace: 'label={t.report.step4}' },
    { search: 'label="Prioridad"', replace: 'label={t.report.step5}' },
    { search: 'label="Resumen"', replace: 'label={t.report.step6}' },
    { importStmt: "import { t } from '../control/i18n';" }
  ],
  'src/components/ReportCancelDialog.tsx': [
    { search: '¿Cancelar reporte?</Typography>', replace: '{t.report.cancelTitle}</Typography>' },
    { search: 'Se perderán todos los datos ingresados y la foto tomada. Esta acción no se puede deshacer.</Typography>', replace: '{t.report.cancelDesc}</Typography>' },
    { search: 'Sí, descartar</Button>', replace: '{t.report.cancelConfirm}</Button>' },
    { search: 'Continuar reporte</Button>', replace: '{t.report.cancelKeep}</Button>' },
    { importStmt: "import { t } from '../control/i18n';" }
  ],
  'src/components/ReportPhotoStep.tsx': [
    { search: 'Volver a tomar foto', replace: '{t.report.retakePhoto}' },
    { search: 'Continuar', replace: '{t.report.continueBtn}' },
    { importStmt: "import { t } from '../control/i18n';" }
  ],
  'src/components/ReportLocationStep.tsx': [
    { search: 'Ubicación</Typography>', replace: '{t.report.step2}</Typography>' },
    { search: 'Describe el lugar exacto del hallazgo</Typography>', replace: '{t.report.locationDesc}</Typography>' },
    { search: 'Ej: Sector Norte, Nivel 4, Galería B', replace: '{t.report.locationPlaceholder}' },
    { search: '>Volver<', replace: '>{t.common.back}<' },
    { search: '>Continuar<', replace: '>{t.report.continueBtn}<' },
    { importStmt: "import { t } from '../control/i18n';" }
  ],
  'src/components/ReportSeverityStep.tsx': [
    { search: 'Gravedad</Typography>', replace: '{t.report.step3}</Typography>' },
    { search: 'Baja</Typography>', replace: '{t.report.severityLow}</Typography>' },
    { search: 'Media</Typography>', replace: '{t.report.severityMedium}</Typography>' },
    { search: 'Alta</Typography>', replace: '{t.report.severityHigh}</Typography>' },
    { search: 'Crítica</Typography>', replace: '{t.report.severityCritical}</Typography>' },
    { search: 'No requiere atención inmediata. Ej: Limpieza menor, pintura descascarada.</Typography>', replace: '{t.report.severityLowDesc}</Typography>' },
    { search: 'Atención pronta. Ej: Fuga menor de agua, herramienta desgastada.</Typography>', replace: '{t.report.severityMediumDesc}</Typography>' },
    { search: 'Atención urgente. Ej: Falla en equipo importante, cable expuesto.</Typography>', replace: '{t.report.severityHighDesc}</Typography>' },
    { search: 'Peligro inminente. Ej: Derrumbe parcial, fuga de gas, fuego.</Typography>', replace: '{t.report.severityCriticalDesc}</Typography>' },
    { search: '>Volver<', replace: '>{t.common.back}<' },
    { search: '>Continuar<', replace: '>{t.report.continueBtn}<' },
    { importStmt: "import { t } from '../control/i18n';" }
  ],
  'src/components/ReportTextStep.tsx': [
    { search: 'Descripción</Typography>', replace: '{t.report.step4}</Typography>' },
    { search: 'Ej: Falla en bomba hidráulica', replace: '{t.report.titlePlaceholder}' },
    { search: 'Describe el problema con el mayor detalle posible...', replace: '{t.report.descPlaceholder}' },
    { search: '>Volver<', replace: '>{t.common.back}<' },
    { search: '>Continuar<', replace: '>{t.report.continueBtn}<' },
    { importStmt: "import { t } from '../control/i18n';" }
  ],
  'src/components/ReportPriorityStep.tsx': [
    { search: 'Prioridad</Typography>', replace: '{t.report.step5}</Typography>' },
    { search: 'Rutina</Typography>', replace: '{t.report.priorityRoutine}</Typography>' },
    { search: 'Importante</Typography>', replace: '{t.report.priorityImportant}</Typography>' },
    { search: 'Urgente</Typography>', replace: '{t.report.priorityUrgent}</Typography>' },
    { search: 'Emergencia</Typography>', replace: '{t.report.priorityEmergency}</Typography>' },
    { search: '>Volver<', replace: '>{t.common.back}<' },
    { search: '>Continuar<', replace: '>{t.report.continueBtn}<' },
    { importStmt: "import { t } from '../control/i18n';" }
  ],
  'src/components/ReportSummaryStep.tsx': [
    { search: 'Resumen del Reporte</Typography>', replace: '{t.report.summaryTitle}</Typography>' },
    { search: 'Fotografía</Typography>', replace: '{t.report.summaryPhoto}</Typography>' },
    { search: 'Ubicación</Typography>', replace: '{t.report.summaryLocation}</Typography>' },
    { search: 'Gravedad</Typography>', replace: '{t.report.summarySeverity}</Typography>' },
    { search: 'Prioridad</Typography>', replace: '{t.report.summaryPriority}</Typography>' },
    { search: 'Descripción detallada</Typography>', replace: '{t.report.summaryDesc}</Typography>' },
    { search: '>Volver<', replace: '>{t.common.back}<' },
    { search: '>Finalizar<', replace: '>{t.report.finishBtn}<' },
    { search: '>Creando...<', replace: '>{t.report.creatingBtn}<' },
    { importStmt: "import { t } from '../control/i18n';" }
  ],
  'src/components/ReportReadyStep.tsx': [
    { search: '¡Reporte Listo!</Typography>', replace: '{t.report.readyTitle}</Typography>' },
    { search: 'Tu reporte ha sido enviado y registrado correctamente en el sistema.</Typography>', replace: '{t.report.readyDescOnline}</Typography>' },
    { search: 'No tienes conexión a internet. Tu reporte ha sido guardado en la cola local y se sincronizará automáticamente cuando recuperes la conexión.</Typography>', replace: '{t.report.readyDescOffline}</Typography>' },
    { search: '>Volver al Inicio<', replace: '>{t.report.readyBtnOnline}<' },
    { search: '>Ver Cola de Pendientes<', replace: '>{t.report.readyBtnOffline}<' },
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
