import fs from 'fs';

let content = fs.readFileSync('src/control/i18n.ts', 'utf8');

// The file has two sync blocks at the start due to my bad replace. Let's fix that.
// It looks like this:
/*
    sync: {
      syncing: 'Sincronizando...',
      syncQueue: 'Sincronizar Cola',
      errorTitle: 'Problema de Conexión',
      understood: 'Entendido'
    },

    sync: {
      syncing: 'Syncing...',
      syncQueue: 'Sync Queue',
      errorTitle: 'Connection Problem',
      understood: 'Understood'
    },
    common: {
*/

const badBlock = `
    sync: {
      syncing: 'Sincronizando...',
      syncQueue: 'Sincronizar Cola',
      errorTitle: 'Problema de Conexión',
      understood: 'Entendido'
    },

    sync: {
      syncing: 'Syncing...',
      syncQueue: 'Sync Queue',
      errorTitle: 'Connection Problem',
      understood: 'Understood'
    },`;

const fixedEsBlock = `
    sync: {
      syncing: 'Sincronizando...',
      syncQueue: 'Sincronizar Cola',
      errorTitle: 'Problema de Conexión',
      understood: 'Entendido'
    },`;

content = content.replace(badBlock, fixedEsBlock);

// Now we need to add the English sync block right after en: {
const enBlock = `
  en: {
    sync: {
      syncing: 'Syncing...',
      syncQueue: 'Sync Queue',
      errorTitle: 'Connection Problem',
      understood: 'Understood'
    },`;

content = content.replace("  en: {", enBlock);

fs.writeFileSync('src/control/i18n.ts', content);
console.log('Fixed i18n.ts');
