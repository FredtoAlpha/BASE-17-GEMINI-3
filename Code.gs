/**
 * ===================================================================
 * 🚀 BASE-17 ULTIMATE - POINT D'ENTRÉE PRINCIPAL (CONTROLLER)
 * ===================================================================
 * Ce fichier gère le Menu, les Accès Web et les Lanceurs d'Interfaces.
 * Toute la logique métier complexe a été déplacée dans :
 * - Backend_Eleves.gs
 * - Backend_Finalisation.gs
 * - Backend_Groupes.gs
 * - LEGACY_Pipeline.gs
 * - Phase4_Ultimate.gs
 * ===================================================================
 */

// ===================================================================
// 1. MENU GOOGLE SHEETS
// ===================================================================

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🚀 PILOTAGE CLASSE')

    // --- LE CŒUR DU SYSTÈME ---
    .addItem('📊 Ouvrir la Console V3 (Admin)', 'ouvrirConsolePilotageV3')
    .addSeparator()

    // --- LES OUTILS SATELLITES ---
    .addSubMenu(SpreadsheetApp.getUi().createMenu('🛠️ Outils Spécifiques')
        .addItem('➕ Intégrer un Nouvel Élève', 'ouvrirModuleNouvelEleve')
        .addItem('👥 Créer des Groupes (Besoins/LV)', 'ouvrirModuleGroupes'))
    .addSeparator()

    // --- MAINTENANCE ---
    .addItem('⚙️ Configuration Avancée', 'ouvrirConfigurationStructure')
    .addItem('🔓 Déverrouiller _STRUCTURE', 'deverrouillerStructure')
    .addToUi();

  Logger.log('✅ Menu V3 Ultimate chargé');
}

// ===================================================================
// 2. ACCÈS WEB (doGet) - INTERFACE PROFESSEURS
// ===================================================================
// Cette fonction gère l'accès via l'URL du script (Web App).
// Elle ouvre l'interface "Profs" (Swap) pour qu'ils ne touchent pas au tableur.

function doGet(e) {
  return HtmlService.createTemplateFromFile('InterfaceV2')
    .evaluate()
    .setTitle('Interface Répartition - Professeurs')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ===================================================================
// 3. LANCEURS D'INTERFACES (MODALES ADMIN)
// ===================================================================

/**
 * Lance la Console de Pilotage V3 (Tour de Contrôle Admin)
 */
function ouvrirConsolePilotageV3() {
  const html = HtmlService.createHtmlOutputFromFile('ConsolePilotageV3')
    .setWidth(1600)
    .setHeight(900)
    .setTitle('Console de Pilotage V3 - Expert Edition');
  SpreadsheetApp.getUi().showModalDialog(html, 'Console de Pilotage V3');
}

/**
 * Lance le Configurateur de Structure (Détail 4°4 = 6 ITA)
 */
function ouvrirConfigurationStructure() {
  const html = HtmlService.createHtmlOutputFromFile('ConfigurationComplete')
    .setWidth(1200)
    .setHeight(800)
    .setTitle('⚙️ Configuration Complète');
  SpreadsheetApp.getUi().showModalDialog(html, 'Configuration de la Structure');
}

/**
 * Lance le Module de Gestion des Groupes (V4)
 */
function ouvrirModuleGroupes() {
  const html = HtmlService.createHtmlOutputFromFile('GroupsInterfaceV4')
    .setWidth(1400)
    .setHeight(800)
    .setTitle('Gestion des Groupes');
  SpreadsheetApp.getUi().showModalDialog(html, 'Module Groupes');
}

/**
 * Lance le Module d'Intégration (Nouvel Élève)
 */
function ouvrirModuleNouvelEleve() {
  const html = HtmlService.createHtmlOutputFromFile('InterfaceV2_NewStudentModule')
    .setWidth(1000)
    .setHeight(600)
    .setTitle('Intégration Nouvel Élève');
  SpreadsheetApp.getUi().showModalDialog(html, 'Nouvel Élève');
}

// ===================================================================
// 4. FONCTIONS BACKEND & SAFETY NETS
// ===================================================================
// Ces fonctions servent de pont entre les interfaces et les moteurs.

/**
 * Wrapper pour lancer le pipeline complet (Phase 4 Console V3)
 */
function legacy_runFullPipeline() {
  if (typeof legacy_runFullPipeline_PRIME === 'function') {
    return legacy_runFullPipeline_PRIME();
  } else {
    SpreadsheetApp.getUi().alert("❌ Erreur critique : Le moteur LEGACY_Pipeline (PRIME) est introuvable.");
  }
}

/**
 * Utilitaire pour afficher les classes sources détectées
 */
function legacy_viewSourceClasses() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sourceSheets = ss.getSheets().filter(s => /^\d+°\d+$/.test(s.getName()));

  if (sourceSheets.length === 0) {
    SpreadsheetApp.getUi().alert('⚠️ Aucune classe source trouvée (Format attendu : 6°1, 5°2...).');
    return;
  }

  const classList = sourceSheets.map(s => s.getName()).join(', ');
  ss.setActiveSheet(sourceSheets[0]);
  SpreadsheetApp.getUi().alert('📋 Classes Sources détectées :\n\n' + classList);
}

/**
 * Utilitaire pour accéder rapidement à l'onglet structure
 */
function legacy_openStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('_STRUCTURE');
  if (sheet) {
    ss.setActiveSheet(sheet);
  } else {
    SpreadsheetApp.getUi().alert('⚠️ L\'onglet _STRUCTURE n\'existe pas encore. Lancez l\'initialisation.');
  }
}

/**
 * Déverrouillage d'urgence de l'onglet structure
 */
function deverrouillerStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('_STRUCTURE');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('⚠️ Onglet _STRUCTURE introuvable.');
    return;
  }

  try {
    const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
    let count = 0;
    protections.forEach(p => {
      if (p.canEdit()) { p.remove(); count++; }
    });
    SpreadsheetApp.getUi().alert(`✅ Onglet déverrouillé (${count} protections retirées).`);
  } catch (e) {
    SpreadsheetApp.getUi().alert('❌ Erreur : ' + e.toString());
  }
}

// ===================================================================
// 5. POINT D'ENTRÉE POUR TESTS & DEBUG
// ===================================================================

/**
 * Test : Charger les données élèves
 */
function testLoadStudents() {
  const ctx = { ss: SpreadsheetApp.getActiveSpreadsheet() };
  const students = loadAllStudentsData(ctx);
  Logger.log(`✅ ${students.length} élèves chargés`);
  return students;
}

/**
 * Test : Calculer les stats globales
 */
function testGlobalStats() {
  const ctx = { ss: SpreadsheetApp.getActiveSpreadsheet() };
  const students = loadAllStudentsData(ctx);
  const stats = calculateGlobalStudentStats(students);
  Logger.log(JSON.stringify(stats, null, 2));
  return stats;
}

/**
 * Test : Valider un onglet
 */
function testValidateClass() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const firstSheet = ss.getSheets()[0];
  const result = validateClassData(firstSheet.getName());
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}
