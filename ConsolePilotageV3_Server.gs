/**
 * ===================================================================
 * 🔌 BACKEND CONSOLE V3 (Adaptateurs)
 * ===================================================================
 */

// --- PHASE 1 : INITIALISATION (VERSION DÉBRIDÉE) ---

function v3_runInitializationWithForm(formData) {
  try {
    const config = getConfig();

    // 1. Vérification Mdp
    if (formData.adminPassword !== config.ADMIN_PASSWORD) {
      return { success: false, error: "Mot de passe incorrect" };
    }

    // 2. Validation Souple (Accepte "5e", "CM2"...)
    if (!formData.niveau || formData.niveau.trim() === "") {
      return { success: false, error: "Niveau scolaire requis." };
    }
    // On a supprimé le bloc 'niveauxValides.includes' qui vous bloquait !

    if (formData.nbSources < 1 || formData.nbSources > 30) {
      return { success: false, error: "Nb Sources invalide (1-30)" };
    }

    if (formData.nbDest < 1 || formData.nbDest > 20) {
      return { success: false, error: "Nb Destinations invalide (1-20)" };
    }

    // 3. Nettoyage
    const lv2Array = nettoyerListeInput(formData.lv2);
    const optArray = nettoyerListeInput(formData.opt);

    Logger.log(`INIT V3: Niveau="${formData.niveau}", Src=${formData.nbSources}`);

    // 4. Lancement Moteur
    // Cela va créer les onglets : ECOLE1... (si 6°) ou 6°1... (si 5°)
    initialiserSysteme(formData.niveau, formData.nbSources, formData.nbDest, lv2Array, optArray);

    return { success: true, message: `Architecture créée pour le niveau ${formData.niveau}` };

  } catch (e) {
    Logger.log("Erreur Init: " + e.toString());
    return { success: false, error: e.toString() };
  }
}

// --- AUTRES WRAPPERS (Pas de changement critique) ---

function v3_runDiagnostics() {
  try {
    return runGlobalDiagnostics();
  } catch (e) {
    return [{status:'error', message: e.toString()}];
  }
}

function v3_runGeneration() {
  try {
    legacy_runFullPipeline();
    return { success: true };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function v3_runOptimization() {
  try {
    showOptimizationPanel();
    return { success: true };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function v3_setBridgeContext(mode, src) {
  return setBridgeContext(mode, src);
}

function v3_finalizeProcess() {
  return finalizeProcess();
}

function v3_getStructureInfo() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('_STRUCTURE');
    if (!sheet) return { success: false, error: "_STRUCTURE manquant" };

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: true, totalPlaces: 0, nbClasses: 0 };

    const data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
    let total = 0;
    let classes = 0;

    data.forEach(r => {
      if(r[0]) { // Si nom de classe présent
         total += (parseInt(r[1]) || 0); // Effectif
         classes++;
      }
    });
    return { success: true, totalPlaces: total, nbClasses: classes };

  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function v3_getMetrics() {
  // Version simple et robuste pour éviter les erreurs
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const cSheet = ss.getSheetByName('CONSOLIDATION');
    const stCount = cSheet ? Math.max(0, cSheet.getLastRow() - 1) : 0;

    const structSheet = ss.getSheetByName('_STRUCTURE');
    const clCount = structSheet ? Math.max(0, structSheet.getLastRow() - 1) : 0;

    return { students: stCount, classes: clCount, sources: 0, destinations: 0 };
  } catch(e) {
    return { students:0, classes:0 };
  }
}
