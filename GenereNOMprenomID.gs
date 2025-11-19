/**
 * ===================================================================
 * 🆔 GÉNÉRATEUR D'IDENTIFIANTS - UNIVERSEL & FLEXIBLE
 * ===================================================================
 * Scanne TOUS les onglets SOURCE (peu importe le NOM ou le PRÉFIXE).
 * Génère les IDs au format historique : [NOM_SOURCE][1000 + INDEX]
 *
 * PATTERN UNIVERSEL:
 * Les sources sont TOUS les onglets au format: QUELQUECHOSE°CHIFFRE
 * - 6°1, 6°2, 6°3 (si répartition 5e)
 * - BRESSOLS°1, GAMARRA°2, COLBERT°3 (si répartition CM2)
 * - N'IMPORTE QUEL NOM°CHIFFRE
 *
 * Peu importe le contexte/niveau, le pattern EST LE MÊME.
 * Exemples d'ID: 6°11001, 6°21002, BRESSOLS°11001, GAMARRA°21002
 */

function genererNomPrenomEtID() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  // ✅ PATTERN STRICT & UNIVERSEL
  // Règle d'or: Tout ce qui finit par °CHIFFRE est une SOURCE
  // Pattern simple: /.+°\d+$/
  const sheets = ss.getSheets().filter(s => /.+°\d+$/.test(s.getName()));

  if (sheets.length === 0) {
    ui.alert(`⚠️ Aucun onglet source trouvé (format: QUELQUECHOSE°CHIFFRE)\nEx: 6°1, BRESSOLS°1, GAMARRA°2`);
    return;
  }

  Logger.log(`✅ ${sheets.length} onglets sources détectés: ${sheets.map(s => s.getName()).join(', ')}`);

  // TRAITEMENT ROBUSTE
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
        // Format historique: NOM_ONGLET + (1000 + index)
        // Ex: 6°1 → 6°11001, BRESSOLS°2 → BRESSOLS°21001
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

  const msg = `✅ IDs générés pour ${totalUpdated} élèves\ndans ${sheets.length} sources (format °CHIFFRE)`;
  ui.alert(msg);
  Logger.log(msg);
}

// Wrapper Console V3
function v3_genererNomPrenomEtID() {
  try {
    genererNomPrenomEtID();
    return { success: true, message: "IDs et noms générés (Universel)" };
  } catch (e) {
    Logger.log(`ERREUR genererNomPrenomEtID: ${e.toString()}`);
    return { success: false, error: e.toString() };
  }
}
