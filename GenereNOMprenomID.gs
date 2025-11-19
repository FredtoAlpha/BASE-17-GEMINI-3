/**
 * ===================================================================
 * 🆔 GÉNÉRATEUR D'IDENTIFIANTS UNIVERSEL
 * ===================================================================
 * Scanne TOUS les onglets sources (peu importe le format : 6°1, 5e2, CM2)
 * Génère les IDs au format historique : [NOM_ONGLET][1000 + INDEX]
 * Exemples: 6°51001, 5e21001, CM21001, BRESSOLS°51001
 *
 * Principe: DÉTECTION PAR EXCLUSION (prendre tout sauf système/résultats)
 */

function genererNomPrenomEtID() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  // ✅ PATTERN INTELLIGENT: Doit finir par un chiffre (source, pas destination)
  // Sources: 6°1, 5e2, CM2, BRESSOLS°4 ✅
  // Destinations: 6°A, 5°B, 5°C ❌ (lettre à la fin)
  const sheets = ss.getSheets().filter(s => {
    const name = s.getName();

    // 1. Doit finir par un chiffre
    if (!/^[A-Za-z0-9_-]+\d$/.test(name)) return false;

    // 2. Exclure onglets système
    if (name.toUpperCase().startsWith('_')) return false;

    // 3. Exclure interfaces
    const upper = name.toUpperCase();
    if (upper === 'ACCUEIL' || upper === 'CONSOLIDATION') return false;

    // 4. Exclure résultats
    if (upper.endsWith('TEST') || upper.endsWith('FIN') || upper.endsWith('DEF') || upper.endsWith('CACHE')) return false;

    return true;
  });

  if (sheets.length === 0) {
    ui.alert(`⚠️ Aucun onglet source trouvé. Vérifiez vos données.`);
    return;
  }

  // TRAITEMENT ROBUSTE
  let totalUpdated = 0;

  sheets.forEach(sheet => {
    const name = sheet.getName(); // Ex: "6°5", "5e2", "CM2", "BRESSOLS°4"
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const colID = headers.indexOf('ID_ELEVE');
    const colNom = headers.indexOf('NOM');
    const colPrenom = headers.indexOf('PRENOM');
    const colNomPrenom = headers.indexOf('NOM_PRENOM');

    if (colNom === -1 || colPrenom === -1) return;

    // Le préfixe est le nom de l'onglet tel quel (universel)
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
        if (String(row[colNomPrenom]) !== fullName) {
             sheet.getRange(i + 1, colNomPrenom + 1).setValue(fullName);
        }
      }

      // B. Génération ID (Format universel: prefix + base1000)
      if (currentId === '') {
        // Format historique robuste: NomClasse + 1000 + index
        // Ex: 6°5 -> 6°51001, CM2 -> CM21001
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

  ui.alert(`✅ IDs générés pour ${totalUpdated} élèves dans ${sheets.length} onglets.`);
}

// Wrapper Console V3
function v3_genererNomPrenomEtID() {
  try { genererNomPrenomEtID(); return { success: true, message: "IDs et Noms générés (Format Standard)" };  }
  catch (e) { return { success: false, error: e.toString() }; }
}
