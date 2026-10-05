import fs from 'fs';
import path from 'path';

// 1. Update i18n.ts
const i18nPath = 'src/control/i18n.ts';
let i18n = fs.readFileSync(i18nPath, 'utf8');

const esAdditions = `
    changePin: {
      confirmTitle: 'Confirma tu PIN actual',
      confirmSubtitle: 'Para continuar, verifica tu identidad',
      newTitle: 'Ingresa tu nuevo PIN',
      newSubtitle: '4 dígitos',
      success: 'PIN actualizado con éxito',
      errorIncorrect: 'PIN actual incorrecto',
    },
    changeEmail: {
      confirmTitle: 'Confirma tu PIN',
      confirmSubtitle: 'Para cambiar el correo, verifica tu identidad',
      newTitle: 'Nuevo Correo',
      newSubtitle: 'Ingresa tu nueva dirección de correo de recuperación',
      emailLabel: 'Correo Electrónico',
      updateBtn: 'Actualizar Correo',
      invalidFormat: 'Formato de correo inválido',
      successSent: 'Enlace enviado a',
      successDesc: 'El correo actual se mantendrá hasta que confirmes el enlace.',
    },
    sync: {
      syncing: 'Sincronizando...',
    },`;

const enAdditions = `
    changePin: {
      confirmTitle: 'Confirm your current PIN',
      confirmSubtitle: 'To continue, verify your identity',
      newTitle: 'Enter your new PIN',
      newSubtitle: '4 digits',
      success: 'PIN updated successfully',
      errorIncorrect: 'Incorrect current PIN',
    },
    changeEmail: {
      confirmTitle: 'Confirm your PIN',
      confirmSubtitle: 'To change email, verify your identity',
      newTitle: 'New Email',
      newSubtitle: 'Enter your new recovery email address',
      emailLabel: 'Email Address',
      updateBtn: 'Update Email',
      invalidFormat: 'Invalid email format',
      successSent: 'Link sent to',
      successDesc: 'Current email will be kept until you confirm the link.',
    },
    sync: {
      syncing: 'Syncing...',
    },`;

// Inject into ES
i18n = i18n.replace("step2Title: 'Ingresa la clave de acceso de',", "forgotPin: 'Olvidé mi PIN',\n      step2Title: 'Ingresa la clave de acceso de',");
i18n = i18n.replace("config: {", esAdditions + "\n    config: {");

// Inject into EN
i18n = i18n.replace("step2Title: 'Enter access code for',", "forgotPin: 'Forgot my PIN',\n      step2Title: 'Enter access code for',");
i18n = i18n.replace("    config: {\n      title: 'Settings',", enAdditions + "\n    config: {\n      title: 'Settings',");

fs.writeFileSync(i18nPath, i18n);

function replaceInFile(filePath, replacements, addImport = true) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (addImport && !content.includes("import { t } from '../control/i18n';") && !content.includes("import { t,")) {
    content = content.replace("import { ", "import { t } from '../control/i18n';\nimport { ");
  }
  for (const [search, replace] of replacements) {
    content = content.split(search).join(replace);
  }
  fs.writeFileSync(filePath, content);
}

replaceInFile('src/components/ChangePinDialog.tsx', [
  ["'PIN actual incorrecto'", "t.changePin.errorIncorrect"],
  ['Confirma tu PIN actual', '{t.changePin.confirmTitle}'],
  ['Para continuar, verifica tu identidad', '{t.changePin.confirmSubtitle}'],
  ['Ingresa tu nuevo PIN', '{t.changePin.newTitle}'],
  ['4 dígitos', '{t.changePin.newSubtitle}'],
  ['PIN actualizado con éxito', '{t.changePin.success}']
]);

replaceInFile('src/components/ChangeEmailDialog.tsx', [
  ["'PIN actual incorrecto'", "t.changePin.errorIncorrect"],
  ["'Formato de correo inválido'", "t.changeEmail.invalidFormat"],
  ['Confirma tu PIN', '{t.changeEmail.confirmTitle}'],
  ['Para cambiar el correo, verifica tu identidad', '{t.changeEmail.confirmSubtitle}'],
  ['Nuevo Correo', '{t.changeEmail.newTitle}'],
  ['Ingresa tu nueva dirección de correo de recuperación', '{t.changeEmail.newSubtitle}'],
  ['label="Correo Electrónico"', 'label={t.changeEmail.emailLabel}'],
  ['Actualizar Correo', '{t.changeEmail.updateBtn}'],
  ['Enlace enviado a ', '{t.changeEmail.successSent} '],
  ['El correo actual se mantendrá hasta que confirmes el enlace.', '{t.changeEmail.successDesc}']
]);

replaceInFile('src/components/ReportPhotoStep.tsx', [
  ['>Sí<', '>{t.report.photoYes}<'],
  ['>No<', '>{t.report.photoNo}<']
]);

replaceInFile('src/components/SeekieAIInputBox.tsx', [
  ['Escribe tu mensaje...', '{t.seekie.inputPlaceholder}']
]);

replaceInFile('src/components/SeekieAIChatArea.tsx', [
  ['Escribe tu mensaje...', '{t.seekie.inputPlaceholder}']
]);

replaceInFile('src/components/LoginForm.tsx', [
  ['Olvidé mi PIN', '{t.login.forgotPin}']
]);

replaceInFile('src/components/SyncQueueButton.tsx', [
  ['Sincronizar pendientes', '{t.queue.syncButton}'],
  ['Sincronizando...', '{t.sync.syncing}']
]);

replaceInFile('src/components/SyncErrorDialog.tsx', [
  ['Error de Sincronización', '{t.login.syncErrorTitle}'],
  ['No tienes conexión a internet y tus datos locales no están disponibles o están desactualizados. Conéctate a internet para iniciar sesión de forma segura.', '{t.login.syncErrorDesc}'],
  ['Reintentar', '{t.common.retry}'],
  ['Cerrar', '{t.common.close}']
]);

console.log('Translations applied successfully!');
