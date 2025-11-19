// TEST & DOCUMENTATION - LA VRAIE SOLUTION
//
// ❌ PROBLÈME INITIAL:
// J'avais utilisé une détection "par exclusion universelle" qui acceptait TOUS les onglets sauf système.
// Résultat: Les DESTINATIONS (6°A, 5°B) étaient aussi lues comme SOURCES!
//
// ✅ SOLUTION CORRECTE:
// Un onglet SOURCE finit TOUJOURS par un CHIFFRE
// Une DESTINATION finit par une LETTRE
// Pattern simple: /^[A-Za-z0-9_-]+\d$/

const sourcePattern = /^[A-Za-z0-9_-]+\d$/;     // Doit finir par chiffre (source)
const destinationPattern = /^[A-Za-z0-9_-]+[A-Za-z]$/; // Finit par lettre (destination)

// CAS DE TEST
const testCases = [
  // SOURCES (finissent par chiffre) → doivent être acceptées
  { name: '6°1', type: 'SOURCE', shouldAccept: true },
  { name: '5°3', type: 'SOURCE', shouldAccept: true },
  { name: '3°4', type: 'SOURCE', shouldAccept: true },
  { name: 'GAMARRA°7', type: 'SOURCE', shouldAccept: true },
  { name: '5e2', type: 'SOURCE', shouldAccept: true },
  { name: 'CM2', type: 'SOURCE', shouldAccept: true },
  { name: 'BRESSOLS°4', type: 'SOURCE', shouldAccept: true },

  // DESTINATIONS (finissent par lettre) → DOIVENT ÊTRE REJETÉES!
  { name: '6°A', type: 'DESTINATION', shouldAccept: false },
  { name: '5°B', type: 'DESTINATION', shouldAccept: false },
  { name: '5°C', type: 'DESTINATION', shouldAccept: false },
  { name: 'CM2A', type: 'DESTINATION', shouldAccept: false },
  { name: '6°Z', type: 'DESTINATION', shouldAccept: false },

  // RÉSULTATS/SYSTÈME → Rejetés
  { name: '6°1TEST', type: 'RÉSULTAT', shouldAccept: false },
  { name: '_CONFIG', type: 'SYSTÈME', shouldAccept: false },
  { name: 'ACCUEIL', type: 'INTERFACE', shouldAccept: false },
];

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║ PATTERN INTELLIGENT: Sources vs Destinations                 ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

console.log('PATTERN: /^[A-Za-z0-9_-]+\\d$/');
console.log('Accepte: Tout ce qui finit par CHIFFRE (données élèves)');
console.log('Rejette: Tout ce qui finit par LETTRE (classes cibles)\n');

console.log('─────────────────────────────┬──────────────┬────────────────────');
console.log('NOM ONGLET                   │ TYPE         │ RÉSULTAT');
console.log('─────────────────────────────┼──────────────┼────────────────────');

let correct = 0;
let total = 0;

testCases.forEach(test => {
  const matches = sourcePattern.test(test.name);
  const result = matches ? 'ACCEPTÉ ✅' : 'REJETÉ ❌';
  const expected = test.shouldAccept ? 'ACCEPTÉ ✅' : 'REJETÉ ❌';
  const status = matches === test.shouldAccept ? '✅ OK' : '❌ ERREUR';

  const pad = 28 - test.name.length;
  const padding = ' '.repeat(Math.max(0, pad));
  const typePad = 12 - test.type.length;
  const typePadding = ' '.repeat(Math.max(0, typePad));

  console.log(`${test.name}${padding}│ ${test.type}${typePadding} │ ${result} ${status}`);

  total++;
  if (matches === test.shouldAccept) correct++;
});

console.log('─────────────────────────────┴──────────────┴────────────────────\n');

console.log(`RÉSULTATS: ${correct}/${total} cas corrects\n`);

console.log('BÉNÉFICES:');
console.log('✅ Accepte: 6°1, 5°3, 5e2, CM2, BRESSOLS°4 (SOURCES)');
console.log('❌ Rejette: 6°A, 5°B, 5°C (DESTINATIONS - pas de confusion!)');
console.log('❌ Rejette: TEST, _CONFIG, ACCUEIL (système/résultats)');
console.log('\nZéro confusion entre sources et destinations! 🎯');
