import fs from 'fs';

const files = [
  'src/components/SeekieAIInputBox.tsx',
  'src/components/SyncErrorDialog.tsx',
  'src/components/SyncQueueButton.tsx',
  'src/pages/Report.tsx'
];

for (const file of files) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/import\s+\{\s*t\s*\}\s+from\s+['"]\.\.\/control\/i18n['"];?\r?\n?/g, '');
  c = c.replace(/import\s+\{\s*t\s*\}\s+from\s+['"]\.\.\/\.\.\/control\/i18n['"];?\r?\n?/g, '');
  fs.writeFileSync(file, c);
}
console.log('Unused imports removed');
