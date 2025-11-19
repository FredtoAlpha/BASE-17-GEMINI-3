/**
 * ===================================================================
 * 🆔 GÉNÉRATEUR D'IDENTIFIANTS - VERSION ADAPTATIVE N-1
 * ===================================================================
 * Scanne les onglets SOURCE adaptés au NIVEAU en cours.
 * Génère les IDs au format : [NOM_SOURCE][1000 + INDEX]
 *
 * LOGIQUE N-1 ADAPTATIVE:
 * - Si répartition 5° → sources = 6°1, 6°2, 6°3 (classes 6e)
 * - Si répartition 6° → sources = ECOLE°1, ECOLE°2 (écoles primaires)
 * - Si répartition 4° → sources = 5°1, 5°2 (classes 5e)
 * - Etc.
 *
 * Exemples d'ID: 6°11001, 6°21002, ECOLE°11001, ECOLE°21002
 */

/**
 * Détermine le préfixe source en fonction du niveau destination
 * (même logique que dans Initialisation.gs)
 */
function determinerPrefixeSourceGeneration(niveau) {
  switch (String(niveau).trim()) {
    case "6°": case "6e": case "CM2": return "ECOLE";
    case "5°": case "5e": return "6°";
    case "4°": case "4e": return "5°";
    case "3°": case "3e": return "4°";
    default: return null;
  }
}

function genererNomPrenomEtID() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  // 1️⃣ LIRE LE NIVEAU DEPUIS _CONFIG
  let niveau = null;
  try {
    const configSheet = ss.getSheetByName('_CONFIG');
    if (configSheet) {
      const configData = configSheet.getDataRange().getValues();
      // Chercher la ligne "NIVEAU"
      for (let i = 0; i < configData.length; i++) {
        if (String(configData[i][0]).trim().toUpperCase() === 'NIVEAU') {
          niveau = String(configData[i][1]).trim();
          break;
        }
      }
    }
  } catch (e) {
    Logger.log(`Erreur lecture _CONFIG: ${e.message}`);
  }

  if (!niveau) {
    ui.alert(`❌ Niveau non trouvé dans _CONFIG! Initialisez d'abord le système.`);
    return;
  }

  Logger.log(`📊 Génération IDs pour niveau ${niveau}`);

  // 2️⃣ DÉTERMINER LES SOURCES ADAPTÉES AU NIVEAU
  const prefixeSource = determinerPrefixeSourceGeneration(niveau);
  if (!prefixeSource) {
    ui.alert(`❌ Niveau non supporté: ${niveau}`);
    return;
  }

  // 3️⃣ FILTRER LES ONGLETS SOURCES
  // Pattern: PREFIXE°CHIFFRE
  const sourcePattern = new RegExp(`^${prefixeSource}°\\d+$`);
  const sheets = ss.getSheets().filter(s => {
    const name = s.getName();

    // Doit matcher le pattern PRÉFIXE°CHIFFRE
    if (!sourcePattern.test(name)) return false;

    // Exclure système
    if (name.toUpperCase().startsWith('_')) return false;

    // Exclure interfaces
    const upper = name.toUpperCase();
    if (upper === 'ACCUEIL' || upper === 'CONSOLIDATION') return false;

    // Exclure résultats
    if (upper.endsWith('TEST') || upper.endsWith('FIN') || upper.endsWith('DEF') || upper.endsWith('CACHE')) return false;

    return true;
  });

  if (sheets.length === 0) {
    ui.alert(`⚠️ Aucun onglet source trouvé au format ${prefixeSource}°X !`);
    return;
  }

  Logger.log(`✅ ${sheets.length} onglets sources détectés: ${sheets.map(s => s.getName()).join(', ')}`);

  // 4️⃣ TRAITEMENT ROBUSTE
  let totalUpdated = 0;

  sheets.forEach(sheet => {
    const name = sheet.getName();
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const colID = headers.indexOf('ID_ELEVE');
    const colNom = headers.indexOf('NOM');
    const colPrenom = headers.indexOf('PRENOM');
    const colNomPrenom = headers.indexOf('NOM_PRENOM');

    if (colNom === -1 || colPrenom === -1) return;

    const prefix = name.trim();
    let countInSheet = 0;

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const nom = String(row[colNom] || '').trim();
      const prenom = String(row[colPrenom] || '').trim();
      let currentId = colID > -1 ? String(row[colID] || '').trim() : '';

      if (!nom && !prenom) continue;

      // A. Concaténation NOM_PRENOM
      if (colNomPrenom > -1) {
        const fullName = `${nom} ${prenom}`.trim();
        if (String(row[colNomPrenom] || '').trim() !== fullName) {
          sheet.getRange(i + 1, colNomPrenom + 1).setValue(fullName);
        }
      }

      // B. Génération ID
      if (currentId === '') {
        // Format: PRÉFIXE + (1000 + index) → Ex: 6°11001, ECOLE°51002
        const suffix = (1000 + countInSheet + 1).toString();
        currentId = `${prefix}${suffix}`;

        if (colID > -1) {
          sheet.getRange(i + 1, colID + 1).setValue(currentId);
        }
      }

      countInSheet++;
      totalUpdated++;
    }

    Logger.log(`✅ ${name} : ${countInSheet} élèves traités (Format ${prefix}1xxx).`);
  });

  const msg = `✅ IDs générés pour ${totalUpdated} élèves\ndans ${sheets.length} sources (${prefixeSource}°X)\nNiveau: ${niveau}`;
  ui.alert(msg);
  Logger.log(msg);
}

// Wrapper Console V3
function v3_genererNomPrenomEtID() {
  try {
    genererNomPrenomEtID();
    return { success: true, message: "IDs et noms générés (Adaptatif N-1)" };
  } catch (e) {
    Logger.log(`ERREUR genererNomPrenomEtID: ${e.toString()}`);
    return { success: false, error: e.toString() };
  }
}
