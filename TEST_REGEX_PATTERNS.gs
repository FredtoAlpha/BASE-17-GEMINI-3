// TEST & DOCUMENTATION DES APPROCHES DE DÉTECTION D'ONGLETS SOURCES
//
// ANCIENNES APPROCHES (Basées sur des patterns regex):
// ─────────────────────────────────────────────────────
// Ces approches étaient trop restrictives et failaient avec des formats non-conventionnels

// Pattern strict (6°1 uniquement)
const strictPattern = /^\d+°\d+$/;

// Pattern avec ECOLE support
const ecoleSupportPattern = /^(ECOLE\d+|[A-Za-z0-9_-]+°\d+)$/;

// Pattern universel (°-obligatoire)
const universalPattern = /^[A-Za-z0-9_-]+°\d+$/;

//
// NOUVELLE APPROCHE (Détection par exclusion) ✅ RECOMMANDÉE
// ────────────────────────────────────────────────────────────
// Accepte TOUS les onglets SAUF ceux qui sont système/résultats.
// C'est plus flexible et future-proof.

function isSourceSheet(name) {
  const upper = name.toUpperCase();

  // Exclure les onglets système (commencent par _)
  if (upper.startsWith('_')) return false;

  // Exclure les interfaces
  if (upper === 'ACCUEIL' || upper === 'CONSOLIDATION') return false;

  // Exclure les résultats/outputs
  if (upper.endsWith('TEST') || upper.endsWith('FIN') || upper.endsWith('DEF') || upper.endsWith('CACHE')) return false;

  return true; // Tout le reste est une source
}

// CAS DE TEST
const testCases = [
  '6°1',        // ✅ Format standard
  '5°3',        // ✅ Format standard
  '3°4',        // ✅ Format standard
  'GAMARRA°7',  // ✅ Nom personnalisé
  '4°2',        // ✅ Format standard
  'ECOLE°1',    // ✅ ECOLE avec °
  'ECOLE1',     // ✅ ECOLE sans ° (now accepted by exclusion!)
  'COLBERT°5',  // ✅ Autre nom personnalisé
  '5e1',        // ✅ Format alternatif (NEW!)
  'CM2',        // ✅ Format primaire (NEW!)
  'MONCLASS',   // ✅ N'importe quel nom (NEW!)
  '6°1TEST',    // ❌ TEST → exclure
  '6°1DEF',     // ❌ DEF → exclure
  '6°1CACHE',   // ❌ CACHE → exclure
  'TEST',       // ❌ TEST → exclure
  '_CONFIG',    // ❌ Config sheet → exclure
  '_STRUCTURE', // ❌ Structure sheet → exclure
  'ACCUEIL',    // ❌ Interface → exclure
  'CONSOLIDATION', // ❌ Interface → exclure
];

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║ TEST DES APPROCHES DE DÉTECTION - PATTERNS vs EXCLUSION   ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('APPROCHE ANCIENNE: Pattern regex (trop restrictif)');
console.log('APPROCHE NOUVELLE: Détection par exclusion (flexible & robust)\n');

console.log('─────────────────────────────┬─────────┬──────────────────────');
console.log('NOM ONGLET                   │ PATTERN │ EXCLUSION (NEW)');
console.log('─────────────────────────────┼─────────┼──────────────────────');

testCases.forEach(testCase => {
  const matchStrict = strictPattern.test(testCase);
  const matchUniversal = universalPattern.test(testCase);
  const isSource = isSourceSheet(testCase);

  const pad = 28 - testCase.length;
  const padding = ' '.repeat(Math.max(0, pad));

  const pattern = matchUniversal ? '  ✅   ' : '  ❌   ';
  const exclusion = isSource ? '     ✅ SOURCE' : '     ❌ EXCLURE';

  console.log(`${testCase}${padding}│${pattern}│${exclusion}`);
});

console.log('─────────────────────────────┴─────────┴──────────────────────\n');

console.log('RÉSUMÉ:');
console.log('✅ Pattern universel: Accepte tout avec ° sauf TEST/DEF/FIN/CACHE');
console.log('✅ Exclusion (NEW): Accepte TOUS les noms, exclut seulement système');
console.log('\nRECOMMANDATION: Utiliser EXCLUSION (plus flexible)');
console.log('Fichiers impactés: Backend_Eleves.gs, GenereNOMprenomID.gs, COMPTER.gs, etc.');
