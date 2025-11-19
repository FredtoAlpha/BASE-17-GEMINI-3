/**
 * ===================================================================
 * 🆔 GÉNÉRATEUR D'IDENTIFIANTS (Format Historique & Compatible)
 * ===================================================================
 * Scanne les onglets sources et génère les IDs au format :
 * [NOM_ONGLET][1000 + INDEX] -> Ex: 6°51001 ou BRESSOLS°51001
 * Ce format texte est CRITIQUE pour la compatibilité du système.
 *
 * Pattern accepté : 6°1, 3°5, BRESSOLS°4, GAMARRA°7, etc.
 * (Toujours avec le ° - jamais sans)
 */

function genererNomPrenomEtID() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  // PATTERN UNIVERSEL - Onglets sources TOUJOURS avec le °
  // Accepte: 6°1, 3°5, BRESSOLS°4, GAMARRA°7, etc.
  const sourcePattern = /^[A-Za-z0-9_-]+°\d+$/;

  const sheets = ss.getSheets().filter(s => {
    const name = s.getName();
    // Exclusions de sécurité
    if (name.startsWith('_') || name === 'ACCUEIL' || name === 'CONSOLIDATION') return false;
    if (name.endsWith('TEST') || name.endsWith('FIN') || name.endsWith('DEF')) return false;

    // Filtre : doit matcher le pattern universel des onglets sources
    return sourcePattern.test(name);
  });

  if (sheets.length === 0) {
    ui.alert(`⚠️ Aucun onglet source trouvé (ex: 6°1, 3°5, BRESSOLS°4).`);
    return;
  }

  // 3. TRAITEMENT (Retour au format ID Historique)
  let totalUpdated = 0;

  sheets.forEach(sheet => {
    const name = sheet.getName(); // Ex: "6°5"
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const colID = headers.indexOf('ID_ELEVE');
    const colNom = headers.indexOf('NOM');
    const colPrenom = headers.indexOf('PRENOM');
    const colNomPrenom = headers.indexOf('NOM_PRENOM');

    if (colNom === -1 || colPrenom === -1) return;

    // ✅ RETOUR AU FORMAT HISTORIQUE
    // Le préfixe est littéralement le nom de l'onglet (avec le °)
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
        // On écrit seulement si vide ou différent (optimisation)
        if (String(row[colNomPrenom]) !== fullName) {
             sheet.getRange(i + 1, colNomPrenom + 1).setValue(fullName);
        }
      }

      // B. Génération ID (Format 6°51001)
      if (currentId === '') {
        // Base 1000 pour éviter les confusions avec des chiffres simples
        // Ex: 1er élève -> 1001
        const suffix = (1000 + countInSheet + 1).toString();

        // Résultat: "6°5" + "1001" = "6°51001"
        currentId = `${prefix}${suffix}`;

        if (colID > -1) {
            sheet.getRange(i + 1, colID + 1).setValue(currentId);
        }
      }
      countInSheet++;
      totalUpdated++;
    }
    Logger.log(`✅ ${name} : IDs format '${prefix}1xxx' appliqués.`);
  });

  ui.alert(`✅ IDs générés (Format Historique) pour ${totalUpdated} élèves.`);
}

// Wrapper Console V3
function v3_genererNomPrenomEtID() {
  try { genererNomPrenomEtID(); return { success: true, message: "IDs et Noms générés (Format Standard)" };  }
  catch (e) { return { success: false, error: e.toString() }; }
}
