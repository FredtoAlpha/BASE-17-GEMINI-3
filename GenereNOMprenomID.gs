/**
 * ===================================================================
 * 🆔 GÉNÉRATEUR D'IDENTIFIANTS & NOMS COMPLETS (ULTIMATE)
 * ===================================================================
 * Fonction : Scanne tous les onglets sources, concatène NOM+PRENOM
 * et génère un ID unique (ex: 60101) si absent.
 */

function genererNomPrenomEtID() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. DÉTECTION INTELLIGENTE DES ONGLETS SOURCES
  // On prend tout ce qui n'est pas un onglet système ou résultat
  const sheets = ss.getSheets().filter(s => {
    const name = s.getName();
    const isSystem = name.startsWith('_') || name === 'ACCUEIL' || name === 'CONSOLIDATION';
    const isOutput = name.endsWith('TEST') || name.endsWith('FIN') || name.endsWith('DEF');
    return !isSystem && !isOutput;
  });

  if (sheets.length === 0) {
    SpreadsheetApp.getUi().alert("⚠️ Aucun onglet source trouvé pour la génération d'IDs.");
    return;
  }

  let totalUpdated = 0;

  // 2. TRAITEMENT ONGLET PAR ONGLET
  sheets.forEach(sheet => {
    const name = sheet.getName();
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return; // Onglet vide

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // Repérage des colonnes (Tolérance aux variations de noms)
    const colID = headers.indexOf('ID_ELEVE');
    const colNom = headers.indexOf('NOM');
    const colPrenom = headers.indexOf('PRENOM');
    const colNomPrenom = headers.indexOf('NOM_PRENOM');

    if (colNom === -1 || colPrenom === -1) {
      Logger.log(`⚠️ Onglet ${name} ignoré : Colonnes NOM/PRENOM manquantes.`);
      return;
    }

    // Préfixe pour l'ID (ex: "601" pour "6°1", "502" pour "5e2")
    // On extrait les chiffres du nom de l'onglet
    const nums = name.match(/\d+/g);
    const prefix = nums ? nums.join('') : '999';

    const updates = [];
    let countInSheet = 0;

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const nom = String(row[colNom] || '').trim();
      const prenom = String(row[colPrenom] || '').trim();
      let currentId = colID > -1 ? String(row[colID] || '').trim() : '';

      // Si pas de nom/prénom, on saute
      if (!nom && !prenom) {
        updates.push(null); // Marqueur pour "ne rien toucher"
        continue;
      }

      // A. GÉNÉRATION NOM_PRENOM
      const fullName = `${nom} ${prenom}`.trim();
      if (colNomPrenom > -1) {
        sheet.getRange(i + 1, colNomPrenom + 1).setValue(fullName);
      }

      // B. GÉNÉRATION ID (Si vide)
      if (currentId === '') {
        // Format ID : [PREFIXE][INDEX] (ex: 60101, 60102...)
        // Astuce : On utilise l'index de ligne pour garantir l'unicité simple
        // ou un compteur intelligent si on veut être puriste.
        // Ici, simple et efficace :
        const suffix = (countInSheet + 1).toString().padStart(2, '0');
        currentId = `${prefix}${suffix}`;
        if (colID > -1) {
          sheet.getRange(i + 1, colID + 1).setValue(currentId);
        }
      }
      countInSheet++;
      totalUpdated++;
    }
    Logger.log(`✅ Onglet ${name} : ${countInSheet} élèves traités.`);
  });

  // 3. FEEDBACK
  const msg = `Traitement terminé !\n${totalUpdated} élèves mis à jour dans ${sheets.length} onglets.`;
  SpreadsheetApp.getUi().alert(msg);
  Logger.log(msg);
}

// Wrapper pour l'appel depuis Console V3
function v3_genererNomPrenomEtID() {
  try {
    genererNomPrenomEtID();
    return { success: true, message: "Génération des IDs et Noms terminée." };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}
