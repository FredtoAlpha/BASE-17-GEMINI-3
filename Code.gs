/**
 * ===================================================================
 * 🚀 BASE-17 ULTIMATE - POINT D'ENTRÉE PRINCIPAL
 * ===================================================================
 * Ce fichier contient SEULEMENT:
 * - Menu Google Sheets (onOpen)
 * - Accès Web (doGet)
 * - Lanceurs d'interfaces (modales)
 *
 * TOUTE LA LOGIQUE MÉTIER EST DANS LES BACKEND MODULES:
 * - Backend_Eleves.gs         (Gestion données élèves)
 * - Backend_Finalisation.gs   (Formatage onglets FIN)
 * - Backend_Groupes.gs        (Module Groupes V4)
 * - Phase4_Ultimate.gs        (Moteur Asymmetric Weighting)
 * - LEGACY_Pipeline.gs        (Pipeline classique)
 * - OPTI_Pipeline_Independent.gs (Pipeline OPTI)
 *
 * ⚠️ ZONE INTERDITE: Ne pas ajouter de logique métier ici!
 * Les doublons créent des erreurs "Duplicate function".
 *
 * Version: 3.4 (NETTOYÉ - Zéro Doublons)
 * Date: 19/11/2025
 * ===================================================================
 */

// ===================================================================
// 1. MENU GOOGLE SHEETS
// ===================================================================

function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    Logger.log('📋 onOpen() démarré');

    // ========== MENU CONSOLE (V3 + Outils) ==========
    ui.createMenu('🎯 CONSOLE')
      .addItem('🚀 Console de Pilotage V3 (EXPERT)', 'ouvrirConsolePilotageV3')
      .addSeparator()
      .addItem('⚙️ Configuration Structure', 'ouvrirConfigurationStructure')
      .addItem('⚙️ Configuration Complète', 'ouvrirConfigurationComplete')
      .addSeparator()
      .addItem('🔓 Déverrouiller _STRUCTURE', 'deverrouillerStructure')
      .addToUi();

    // ========== MENU LEGACY (Pipeline Complet) ==========
    ui.createMenu('⚙️ LEGACY')
      .addItem('📋 Voir Classes Sources (6°1, 6°2...)', 'legacy_viewSourceClasses')
      .addItem('📊 Lancer Pipeline Complet', 'legacy_runFullPipeline')
      .addSeparator()
      .addItem('⚙️ Configurer _STRUCTURE', 'legacy_openStructure')
      .addToUi();

    Logger.log('✅ Menus créés avec succès');

  } catch (error) {
    Logger.log('❌ ERREUR dans onOpen(): ' + error.toString());
  }
}

// ===================================================================
// 2. ACCÈS WEB (Web App)
// ===================================================================

/**
 * Entrée Web App - Affiche InterfaceV2 pour les profs
 */
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
 * Lance la Console de Pilotage V3
 */
function ouvrirConsolePilotageV3() {
  const html = HtmlService.createHtmlOutputFromFile('ConsolePilotageV3')
    .setWidth(1600)
    .setHeight(900);
  SpreadsheetApp.getUi().showModalDialog(html, 'Console de Pilotage V3');
}

/**
 * Lance le Configurateur de Structure
 */
function ouvrirConfigurationStructure() {
  const html = HtmlService.createHtmlOutputFromFile('ConfigurationComplete')
    .setWidth(1200)
    .setHeight(800);
  SpreadsheetApp.getUi().showModalDialog(html, 'Configuration de la Structure');
}

/**
 * Lance le Configurateur Complet
 */
function ouvrirConfigurationComplete() {
  const html = HtmlService.createHtmlOutputFromFile('ConfigurationComplete')
    .setWidth(1200)
    .setHeight(800);
  SpreadsheetApp.getUi().showModalDialog(html, 'Configuration Complète');
}

// ===================================================================
// 4. WRAPPERS LEGACY (Appels au pipeline)
// ===================================================================

/**
 * Lance le pipeline LEGACY complet
 * APPELÉ PAR: Menu "⚙️ LEGACY" → "Lancer Pipeline Complet"
 * EXÉCUTE: LEGACY_Pipeline.gs → Phase4_Ultimate.gs
 */
function legacy_runFullPipeline() {
  if (typeof legacy_runFullPipeline_PRIME === 'function') {
    return legacy_runFullPipeline_PRIME();
  } else {
    SpreadsheetApp.getUi().alert('❌ Erreur: Moteur LEGACY_Pipeline.gs non trouvé.');
  }
}

/**
 * Affiche les classes sources détectées
 * Format attendu: 6°1, 5°2, 4°3, etc.
 */
function legacy_viewSourceClasses() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sourceSheets = ss.getSheets().filter(s => /^\d+°\d+$/.test(s.getName()));

  if (sourceSheets.length === 0) {
    SpreadsheetApp.getUi().alert('⚠️ Aucune classe source trouvée.\n\nFormat attendu: 6°1, 5°2, 4°3, etc.');
    return;
  }

  const classList = sourceSheets.map(s => s.getName()).join(', ');
  ss.setActiveSheet(sourceSheets[0]);
  SpreadsheetApp.getUi().alert(`📋 Classes Sources trouvées:\n\n${classList}`);
}

/**
 * Ouvre l'onglet _STRUCTURE
 */
function legacy_openStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('_STRUCTURE');

  if (sheet) {
    ss.setActiveSheet(sheet);
    SpreadsheetApp.getUi().alert('⚙️ Onglet _STRUCTURE ouvert.');
  } else {
    SpreadsheetApp.getUi().alert('⚠️ Onglet _STRUCTURE non trouvé.');
  }
}

/**
 * Déverrouille l'onglet _STRUCTURE en urgence
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
    let removed = 0;
    protections.forEach(p => {
      if (p.canEdit()) {
        p.remove();
        removed++;
      }
    });
    SpreadsheetApp.getUi().alert(`✅ Onglet déverrouillé (${removed} protections retirées).`);
  } catch (e) {
    SpreadsheetApp.getUi().alert(`❌ Erreur: ${e.toString()}`);
  }
}

// ===================================================================
// 5. FONCTIONS DE TEST (DEBUG UNIQUEMENT)
// ===================================================================

/**
 * Test: Afficher la structure du projet
 */
function testProjectStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  Logger.log('=== STRUCTURE DU PROJET ===');
  Logger.log(`Nom: ${ss.getName()}`);
  Logger.log(`Onglets (${ss.getSheets().length}):`);
  ss.getSheets().forEach(s => {
    Logger.log(`  - ${s.getName()}`);
  });
  Logger.log('=== FIN ===');
}

/**
 * Test: Vérifier les pipelines
 */
function testPipelines() {
  Logger.log('=== VÉRIFICATION PIPELINES ===');
  Logger.log(`legacy_runFullPipeline_PRIME: ${typeof legacy_runFullPipeline_PRIME}`);
  Logger.log(`Phase4_Ultimate_Run: ${typeof Phase4_Ultimate_Run}`);
  Logger.log(`loadAllStudentsData: ${typeof loadAllStudentsData}`);
  Logger.log(`finalizeClasses: ${typeof finalizeClasses}`);
  Logger.log('=== FIN ===');
}

// ===================================================================
// ⚠️ ZONE INTERDITE - NE PAS AJOUTER DE CODE MÉTIER ICI
// ===================================================================
// Les doublons de fonctions causent:
// - "Duplicate function definition" à la compilation
// - Erreurs à l'exécution
//
// Si vous avez besoin d'ajouter une fonction:
// 1. Vérifiez qu'elle n'existe pas dans Backend_*.gs
// 2. Si elle existe, modifiez-la là-bas
// 3. Si elle est nouvelle, créez un nouveau module (ex: Module_NouveauTrucs.gs)
//
// Ce fichier doit rester < 250 lignes.
// ===================================================================
