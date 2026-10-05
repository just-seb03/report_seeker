import fs from 'fs';

let c = fs.readFileSync('src/control/i18n.ts', 'utf8');

const helper = `export function getTranslatedSeverity(raw: string | undefined): string {
  if (!raw) return '';
  const lower = raw.toLowerCase();
  if (['baja', 'leve', 'low'].includes(lower)) return t.report.severityLow;
  if (['media', 'moderada', 'medium'].includes(lower)) return t.report.severityMedium;
  if (['alta', 'grave', 'high'].includes(lower)) return t.report.severityHigh;
  return raw;
}

export const TEXTS = {`;

c = c.replace('export const TEXTS = {', helper);
fs.writeFileSync('src/control/i18n.ts', c);

let n = fs.readFileSync('src/components/NotificationCard.tsx', 'utf8');
n = n.replace(/import \{ t \} from '\.\.\/control\/i18n';/, "import { t, getTranslatedSeverity } from '../control/i18n';");
n = n.replace(/\{prioridad\}/, "{getTranslatedSeverity(prioridad)}");
fs.writeFileSync('src/components/NotificationCard.tsx', n);

let r = fs.readFileSync('src/pages/InfoReport.tsx', 'utf8');
r = r.replace(/import \{ t \} from '\.\.\/control\/i18n';/, "import { t, getTranslatedSeverity } from '../control/i18n';");
r = r.replace(/\{report\.priority\}/, "{getTranslatedSeverity(report.priority)}");
fs.writeFileSync('src/pages/InfoReport.tsx', r);

console.log('Fixed translations');
