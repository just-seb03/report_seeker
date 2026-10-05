/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : i18n.ts                                                          *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 04 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 04 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   getTranslatedSeverity -- Traduce un nivel de gravedad en bruto al texto localizado        *
 *        correspondiente.                                                                     *
 *   setLanguage -- Cambia el idioma actual de la aplicación y dispara un evento para          *
 *        actualizar la interfaz.                                                              *
 *   t -- Objeto Proxy que proporciona acceso reactivo a los textos localizados según el       *
 *        idioma seleccionado.                                                                 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

export function getTranslatedSeverity(raw: string | undefined): string {
  if (!raw) return '';
  const lower = raw.toLowerCase();
  if (['baja', 'leve', 'low'].includes(lower)) return t.report.severityLow;
  if (['media', 'moderada', 'medium'].includes(lower)) return t.report.severityMedium;
  if (['alta', 'grave', 'high'].includes(lower)) return t.report.severityHigh;
  return raw;
}

export const TEXTS = {
  es: {

    sync: {
      syncing: 'Sincronizando...',
      syncQueue: 'Sincronizar Cola',
      errorTitle: 'Problema de Conexión',
      understood: 'Entendido',
      noInternet: 'No hay conexión a internet disponible para sincronizar los reportes.',
      syncFailed: 'Ocurrió un error al intentar sincronizar la cola. Por favor, inténtalo de nuevo más tarde.'
    },
    common: {
      loading: 'Cargando...',
      cancel: 'Cancelar',
      save: 'Guardar',
      confirm: 'Confirmar',
      back: 'Volver',
      error: 'Error',
      success: 'Éxito',
      retry: 'Reintentar',
      close: 'Cerrar',
      yes: 'Sí',
      no: 'No',
    },
    login: {
      welcome: 'Bienvenido',
      title: 'Identifícate',
      subtitle: 'Ingresa tu RUN y PIN para continuar',
      runPlaceholder: 'Ingresa tu RUN (Ej: 12345678-9)',
      pinPlaceholder: 'PIN (4 dígitos)',
      loginButton: 'Ingresar',
      errorEmptyFields: 'Por favor, completa todos los campos.',
      errorInvalidRun: 'El RUN ingresado no es válido.',
      errorInvalidPin: 'El PIN debe tener 4 dígitos.',
      errorAuthFailed: 'RUN o PIN incorrecto. Intenta nuevamente.',
      loading: 'Verificando...',
      updatePinPrompt: 'Actualiza tu PIN',
      updatePinDesc: 'Tu PIN actual es el por defecto (1234). Por seguridad, debes cambiarlo para continuar.',
      newPin: 'Nuevo PIN (4 dígitos)',
      confirmPin: 'Confirmar PIN',
      updateButton: 'Actualizar PIN',
      errorPinMismatch: 'Los PINs no coinciden.',
      syncErrorTitle: 'Error de Sincronización',
      syncErrorDesc: 'No tienes conexión a internet y tus datos locales no están disponibles o están desactualizados. Conéctate a internet para iniciar sesión de forma segura.',
      step1Title: 'Ingresa tu ID de trabajador',
      forgotPin: 'Olvidé mi PIN',
      step2Title: 'Ingresa la clave de acceso de',
      step1Subtitle: '5 dígitos',
    },
    home: {
      headerPendingReports: 'Tienes\nReportes\nPendientes',
      headerNewReports: 'Hay\nNuevos\nReportes',
      headerAllGood: 'Todo\nEn\nOrden',
      refreshPull: 'Suelta para actualizar reportes',
      refreshing: 'Actualizando reportes',
      notificationsTitle: 'Notificaciones',
      loadMore: 'Cargar más',
      noMoreNotifications: 'No hay más notificaciones',
      bottomNav: {
        home: 'Inicio',
        queue: 'Cola',
        report: 'Reportar',
        seekie: 'Seekie',
        profile: 'Perfil',
        sumario: 'Sumario'
      }
    },
    queue: {
      title: 'Cola',
      emptyState: 'No hay reportes pendientes.',
      syncButton: 'Sincronizar reportes pendientes',
      noLocation: 'Sin ubicación',
    },
    summary: {
      title: 'Sumario',
      underConstruction: 'Esta pantalla está en construcción. Próximamente verás aquí el sumario de riesgos (Exclusivo Prevencionistas).',
      totalReports: 'Reportes Totales',
      highRisk: 'Grave',
      mediumRisk: 'Moderado',
      lowRisk: 'Leve'
    },
    profile: {
      title: 'Perfil',
      unknownUser: 'Usuario Desconocido',
      emailLabel: 'Correo',
      noEmail: 'Sin correo',
      userIdLabel: 'ID de usuario',
      noUserId: 'No asignado',
      settingsBtn: 'Configuración',
      logoutBtn: 'Cerrar Sesión',
    },
    
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
    config: {
      title: 'Configuración',
      appTheme: 'Tema de la Aplicación',
      darkMode: 'Modo Oscuro',
      lightMode: 'Modo Claro',
      changePin: 'Cambiar PIN',
      changePinDesc: 'Actualiza tu código de acceso',
      changeEmail: 'Cambiar correo de recuperación',
      changeEmailDesc: 'Actualiza el email asociado a tu cuenta',
      language: 'Idioma',
      langEs: 'Español',
      langEn: 'Inglés',
      version: 'Versión',
    },

    notification: {
      now: 'ahora',
      unknownDate: 'Fecha desconocida',
      loadingPhoto: 'Cargando fotografía...',
      noPhoto: 'Sin fotografía asociada',
      noLocation: 'Ubicación no especificada',
      unknownWorker: 'Trabajador Desconocido',
    },
    report: {
      photoConfirm: '¿Confirmas esta fotografía?',
      photoOpening: 'Abriendo cámara...',
      photoNo: 'No',
      photoYes: 'Sí',
      severityHeading: '¿Define su gravedad?',
      textSaving: 'Guardando...',
      textAccept: 'Aceptar',
      descHeading: 'Describe lo que has visto',
      locationHeading: '¿En dónde está localizado el riesgo?',
      titleHeading: 'Ponle un título al riesgo',

      cancelTitle: '¿Desea cancelar su reporte?',
      cancelDesc: 'Si sale ahora, perderá la información ingresada hasta este paso.',
      cancelConfirm: 'Salir',
      cancelKeep: 'Cancelar',
      step1: 'Tomar foto',
      step2: 'Ubicación',
      step3: 'Gravedad',
      severityConfirm: 'Confirmar',
      step4: 'Descripción',
      step5: 'Prioridad',
      step6: 'Resumen',
      retakePhoto: 'Volver a tomar foto',
      continueBtn: 'Continuar',
      finishBtn: 'Finalizar',
      creatingBtn: 'Creando...',
      titlePlaceholder: 'Ej: Falla en bomba hidráulica',
      descPlaceholder: 'Describe el problema con el mayor detalle posible...',
      locationDesc: 'Describe el lugar exacto del hallazgo',
      locationPlaceholder: 'Ej: Sector Norte, Nivel 4, Galería B',
      severityLow: 'Baja',
      severityMedium: 'Media',
      severityHigh: 'Alta',
      severityCritical: 'Crítica',
      severityLowDesc: 'No requiere atención inmediata. Ej: Limpieza menor, pintura descascarada.',
      severityMediumDesc: 'Atención pronta. Ej: Fuga menor de agua, herramienta desgastada.',
      severityHighDesc: 'Atención urgente. Ej: Falla en equipo importante, cable expuesto.',
      severityCriticalDesc: 'Peligro inminente. Ej: Derrumbe parcial, fuga de gas, fuego.',
      priorityRoutine: 'Rutina',
      priorityImportant: 'Importante',
      priorityUrgent: 'Urgente',
      priorityEmergency: 'Emergencia',
      priorityRoutineDesc: 'Mantenimiento preventivo programable',
      priorityImportantDesc: 'Debe atenderse en el próximo turno',
      priorityUrgentDesc: 'Atención inmediata requerida',
      priorityEmergencyDesc: 'Detener operaciones, riesgo fatal',
      summaryTitle: 'Resumen del Reporte',
      summaryPhoto: 'Fotografía',
      summaryLocation: 'Ubicación',
      summarySeverity: 'Gravedad',
      summaryPriority: 'Prioridad',
      summaryDesc: 'Descripción detallada',
      reviewReport: 'Revisa tu reporte',
      confirmReport: 'Confirmar reporte',
      readyTitle: 'Reporte Listo Para Subir',
      readyDescOnline: 'Tu reporte ha sido enviado y registrado correctamente en el sistema.',
      readyDescOffline: 'No tienes conexión a internet. Tu reporte ha sido guardado en la cola local y se sincronizará automáticamente cuando recuperes la conexión.',
      readyBtnOnline: 'Volver al Inicio',
      readyBtnOffline: 'Ver Cola de Pendientes',
    },

    infoReport: {
      subtitle: 'Reporte de riesgo',
      noPhotoInfo: 'Este reporte no tiene fotografía',
      noLocationInfo: 'No especificada',
      noDescriptionInfo: 'Sin descripción',

      title: 'Detalle del Reporte',
      photoSection: 'Fotografía',
      detailsSection: 'Detalles',
      descriptionSection: 'Descripción',
      infoSeverity: 'Gravedad',
      infoPriority: 'Prioridad',
      infoLocation: 'Ubicación',
      infoDate: 'Fecha y Hora',
      infoId: 'ID del Reporte',
    },
    seekie: {
      title: 'Seekie',
      greeting: 'Hola, soy',
      aiName: 'Seekie AI',
      help: '¿En qué te puedo ayudar hoy?',
      dummyResponse: 'Hola, aun no existo, asi que esto es solo una prueba de componentes.',
      inputPlaceholder: 'Escribe tu mensaje...',
    }
  },

  en: {
    sync: {
      syncing: 'Syncing...',
      syncQueue: 'Sync Queue',
      errorTitle: 'Connection Problem',
      understood: 'Understood',
      noInternet: 'No internet connection available to sync reports.',
      syncFailed: 'An error occurred while trying to sync the queue. Please try again later.'
    },
    common: {
      loading: 'Loading...',
      cancel: 'Cancel',
      save: 'Save',
      confirm: 'Confirm',
      back: 'Back',
      error: 'Error',
      success: 'Success',
      retry: 'Retry',
      close: 'Close',
      yes: 'Yes',
      no: 'No',
    },
    login: {
      welcome: 'Welcome',
      title: 'Identify Yourself',
      subtitle: 'Enter your RUN and PIN to continue',
      runPlaceholder: 'Enter your RUN (e.g. 12345678-9)',
      pinPlaceholder: 'PIN (4 digits)',
      loginButton: 'Login',
      errorEmptyFields: 'Please fill in all fields.',
      errorInvalidRun: 'The entered RUN is invalid.',
      errorInvalidPin: 'The PIN must be 4 digits long.',
      errorAuthFailed: 'Incorrect RUN or PIN. Please try again.',
      loading: 'Verifying...',
      updatePinPrompt: 'Update your PIN',
      updatePinDesc: 'Your current PIN is the default (1234). For security, you must change it to continue.',
      newPin: 'New PIN (4 digits)',
      confirmPin: 'Confirm PIN',
      updateButton: 'Update PIN',
      errorPinMismatch: 'PINs do not match.',
      syncErrorTitle: 'Sync Error',
      syncErrorDesc: 'You have no internet connection and your local data is unavailable or outdated. Connect to the internet to log in securely.',
      step1Title: 'Enter your worker ID',
      forgotPin: 'Forgot my PIN',
      step2Title: 'Enter access code for',
      step1Subtitle: '5 digits',
    },
    home: {
      headerPendingReports: 'You Have\nPending\nReports',
      headerNewReports: 'There Are\nNew\nReports',
      headerAllGood: 'Everything\nLooks\nGood',
      refreshPull: 'Release to refresh reports',
      refreshing: 'Refreshing reports',
      notificationsTitle: 'Notifications',
      loadMore: 'Load more',
      noMoreNotifications: 'No more notifications',
      bottomNav: {
        home: 'Home',
        queue: 'Queue',
        report: 'Report',
        seekie: 'Seekie',
        profile: 'Profile',
        sumario: 'Summary'
      }
    },
    queue: {
      title: 'Queue',
      emptyState: 'No pending reports.',
      syncButton: 'Sync pending reports',
      noLocation: 'No location',
    },
    summary: {
      title: 'Summary',
      underConstruction: 'This screen is under construction. You will soon see the risk summary here (Exclusive for Preventionists).',
      totalReports: 'Total Reports',
      highRisk: 'High',
      mediumRisk: 'Medium',
      lowRisk: 'Low'
    },
    profile: {
      title: 'Profile',
      unknownUser: 'Unknown User',
      emailLabel: 'Email',
      noEmail: 'No email',
      userIdLabel: 'User ID',
      noUserId: 'Not assigned',
      settingsBtn: 'Settings',
      logoutBtn: 'Logout',
    },

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
    config: {
      title: 'Settings',
      appTheme: 'App Theme',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      changePin: 'Change PIN',
      changePinDesc: 'Update your access code',
      changeEmail: 'Change recovery email',
      changeEmailDesc: 'Update the email linked to your account',
      language: 'Language',
      langEs: 'Spanish',
      langEn: 'English',
      version: 'Version',
    },

    notification: {
      now: 'now',
      unknownDate: 'Unknown date',
      loadingPhoto: 'Loading photo...',
      noPhoto: 'No photo associated',
      noLocation: 'Location not specified',
      unknownWorker: 'Unknown Worker',
    },
    report: {
      photoConfirm: 'Confirm this photo?',
      photoOpening: 'Opening camera...',
      photoNo: 'No',
      photoYes: 'Yes',
      severityHeading: 'Define its severity?',
      textSaving: 'Saving...',
      textAccept: 'Accept',
      descHeading: 'Describe what you saw',
      locationHeading: 'Where is the risk located?',
      titleHeading: 'Give the risk a title',
      cancelTitle: 'Cancel your report?',
      cancelDesc: 'If you leave now, you will lose the information entered up to this step.',
      cancelConfirm: 'Exit',
      cancelKeep: 'Cancel',
      step1: 'Take photo',
      step2: 'Location',
      step3: 'Severity',
      severityConfirm: 'Confirm',
      step4: 'Description',
      step5: 'Priority',
      step6: 'Summary',
      retakePhoto: 'Retake photo',
      continueBtn: 'Continue',
      finishBtn: 'Finish',
      creatingBtn: 'Creating...',
      titlePlaceholder: 'e.g. Hydraulic pump failure',
      descPlaceholder: 'Describe the problem in as much detail as possible...',
      locationDesc: 'Describe the exact location of the finding',
      locationPlaceholder: 'e.g. North Sector, Level 4, Gallery B',
      severityLow: 'Low',
      severityMedium: 'Medium',
      severityHigh: 'High',
      severityCritical: 'Critical',
      severityLowDesc: 'No immediate attention required. e.g. Minor cleaning, peeling paint.',
      severityMediumDesc: 'Prompt attention. e.g. Minor water leak, worn tool.',
      severityHighDesc: 'Urgent attention. e.g. Important equipment failure, exposed wire.',
      severityCriticalDesc: 'Imminent danger. e.g. Partial collapse, gas leak, fire.',
      priorityRoutine: 'Routine',
      priorityImportant: 'Important',
      priorityUrgent: 'Urgent',
      priorityEmergency: 'Emergency',
      priorityRoutineDesc: 'Programmable preventive maintenance',
      priorityImportantDesc: 'Must be addressed in the next shift',
      priorityUrgentDesc: 'Immediate attention required',
      priorityEmergencyDesc: 'Stop operations, fatal risk',
      summaryTitle: 'Report Summary',
      summaryPhoto: 'Photo',
      summaryLocation: 'Location',
      summarySeverity: 'Severity',
      summaryPriority: 'Priority',
      summaryDesc: 'Detailed description',
      reviewReport: 'Review your report',
      confirmReport: 'Confirm report',
      readyTitle: 'Report Ready to Upload',
      readyDescOnline: 'Your report has been successfully sent and registered in the system.',
      readyDescOffline: 'No internet connection. Your report has been saved to the local queue and will sync automatically when you regain connection.',
      readyBtnOnline: 'Back to Home',
      readyBtnOffline: 'View Pending Queue',
    },

    infoReport: {
      subtitle: 'Risk report',
      noPhotoInfo: 'This report has no photo',
      noLocationInfo: 'Not specified',
      noDescriptionInfo: 'No description',
      title: 'Report Details',
      photoSection: 'Photo',
      detailsSection: 'Details',
      descriptionSection: 'Description',
      infoSeverity: 'Severity',
      infoPriority: 'Priority',
      infoLocation: 'Location',
      infoDate: 'Date and Time',
      infoId: 'Report ID',
    },
    seekie: {
      title: 'Seekie',
      greeting: 'Hi, I am',
      aiName: 'Seekie AI',
      help: 'How can I help you today?',
      dummyResponse: 'Hello, I do not exist yet, so this is just a component test.',
      inputPlaceholder: 'Type your message...',
    }
  }
};

export type Language = 'es' | 'en';

export let currentLanguage: Language = (localStorage.getItem('appLanguage') as Language) || 'es';

export function setLanguage(lang: Language) {
  currentLanguage = lang;
  localStorage.setItem('appLanguage', lang);
  window.dispatchEvent(new Event('languagechange'));
}

export const t = new Proxy(TEXTS['es'], {
  get(_target, prop) {
    return TEXTS[currentLanguage][prop as keyof typeof TEXTS['es']];
  }
});
