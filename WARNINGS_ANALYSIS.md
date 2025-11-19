# Référence des avertissements de la console Google Sheets

Ce document décrit les avertissements et erreurs observés dans la console du navigateur lors du chargement d'une feuille de calcul Google intégrant des modules complémentaires Apps Script. Chaque section reprend le message (ou une version abrégée), explique pourquoi le navigateur l'affiche, indique s'il faut agir et précise le sous-système concerné.

## 1. `sandbox` avec `allow-scripts` et `allow-same-origin`

```
An iframe which has both allow-scripts and allow-same-origin for its sandbox attribute can escape its sandboxing.
```

* **Source** : avertissement de sécurité Chromium pour les iframes sandboxées.
* **Signification** : combiner `allow-scripts` et `allow-same-origin` supprime l'isolation d'origine ; l'iframe peut exécuter du JavaScript et lire/écrire les cookies et le stockage comme si elle était la page parente. Une frame malveillante pourrait ainsi sortir du bac à sable via `window.top` ou un stockage partagé.
* **Action** : acceptable si le contenu est de confiance (ici, une interface Apps Script hébergée par Google). Si un véritable bac à sable est requis, supprimez l'un des deux indicateurs ou hébergez l'UI sur une autre origine.

## 2. `Unrecognized feature: ...`

```
Unrecognized feature: 'ambient-light-sensor'.
Unrecognized feature: 'speaker'.
Unrecognized feature: 'vibrate'.
Unrecognized feature: 'vr'.
```

* **Source** : analyse du Feature Policy (devenu Permission Policy).
* **Signification** : l'attribut `allow="..."` d'une iframe mentionne des capacités non reconnues par le navigateur (par exemple Safari ne connaît pas `ambient-light-sensor`). Le navigateur consigne ces jetons inconnus mais les ignore.
* **Action** : aucune. Google Sheets envoie un superset de fonctionnalités pour être compatible avec les versions plus récentes de Chromium.

## 3. Content-Security-Policy (CSP) en mode report-only

```
Framing 'https://<apps-script>.googleusercontent.com/' violates the following report-only Content Security Policy directive: "frame-ancestors 'self'". The violation has been logged, but no further action has been taken.
```

* **Source** : enforcement CSP en mode « report-only ».
* **Signification** : les applications Apps Script déclarent `frame-ancestors 'self'`, mais Sheets les affiche temporairement dans un panneau intégré. Comme la directive est seulement en « report-only », le navigateur enregistre l'événement mais autorise l'affichage.
* **Action** : aucune pour les utilisateurs finaux. Google exploite ces rapports pour auditer les scénarios d'intégration.

## 4. Avertissement accessibilité sur `aria-hidden`

```
Blocked aria-hidden on an element because its descendant retained focus...
```

* **Source** : API Accessibilité de Chrome.
* **Signification** : un modal ou un panneau a défini `aria-hidden="true"` alors qu'un descendant conservait encore le focus clavier. Masquer un contenu focalisé le rend inaccessible aux technologies d'assistance, donc le navigateur bloque l'attribut et affiche un avertissement.
* **Action** : lors du développement de boîtes de dialogue, appelez `.blur()` sur l'élément focalisé (ou utilisez l'attribut `inert`) avant d'appliquer `aria-hidden`.

## 5. Ressources préchargées non utilisées rapidement

```
The resource ... was preloaded using link preload but not used within a few seconds from the window's load event.
```

* **Source** : audit de performance Chrome.
* **Signification** : `link rel="preload"` vise des scripts de panneaux complémentaires (par ex. `waffle_js_prod_add_ons_app_finder_populator__fr.js`). Si le script n'est pas exécuté peu après l'événement `load`, Chrome signale que le préchargement peut gaspiller de la bande passante.
* **Action** : rien à faire pour le code géré par Google. Pour une page personnalisée, vérifiez que chaque preload possède le bon attribut `as` et est utilisé rapidement.

## 6. 404 sur `wardeninit`

```
POST https://docs.google.com/wardeninit ... 404 (Not Found)
```

* **Source** : bootstrap « Warden », système interne anti-abus de Google.
* **Signification** : certains clusters géographiques désactivent ce point de terminaison ; Sheets reçoit donc un `404` mais se rabat aussitôt sur des politiques en cache. La console enregistre le message, l'éditeur continue de fonctionner.
* **Action** : aucune, sauf si vous contrôlez l'infrastructure Google.

## 7. Journaux d'état réseau / traces de requêtes

```
Net state changed from IDLE to BUSY
...
ot { Symbol(): Array(10), ... }
```

* **Source** : journalisation de debug dans les bundles minifiés `waffle_js` de Google.
* **Signification** : traces informatives pour les files d'attente RPC asynchrones. Il ne s'agit pas d'avertissements ni d'erreurs.

## 8. Avertissements divers liés aux iframes Apps Script

```
userCodeAppPanel?... Unrecognized feature ...
iframedAppPanel?... Unrecognized feature ...
```

* **Source** : identique à la section 2 mais émis par d'autres URL (dialogues Apps Script, fenêtres OAuth, etc.).
* **Action** : aucune.

## 9. Note accessibilité sur `docs-sheet-menu-button`

* Les nœuds DOM cités (`docs-sheet-menu-button`, `waffle-rich-text-editor`) indiquent que l'avertissement apparaît lorsqu'on ouvre le menu de dépassement des onglets alors qu'un autre élément conserve le focus.
* Sheets applique `aria-hidden="true"` pour masquer temporairement la grille principale quand une boîte de dialogue est ouverte ; Chrome impose alors les règles de gestion du focus et déclenche l'avertissement en cas de conflit.

## 10. Synthèse de sévérité

| Catégorie | Sévérité | Raison |
| --- | --- | --- |
| Avertissement sandbox | Faible (informationnel) | Attendu quand un iframe de confiance doit disposer des deux privilèges. |
| Fonctionnalités non reconnues | Nulle | Le navigateur ignore simplement les jetons non pris en charge. |
| CSP report-only | Nulle | Journalisation uniquement. |
| Accessibilité (`aria-hidden`) | Moyenne (UI custom) | Signale un bug de gestion du focus dans une boîte de dialogue personnalisée ; à corriger si cela survient dans votre code. |
| Preload inutilisé | Faible | Indice d'optimisation ; Google contrôle ces ressources. |
| 404 `wardeninit` | Nulle | Bascule automatique sur un fallback. |

Pour des modules complémentaires tiers, concentrez-vous sur la résolution de l'avertissement accessibilité (assurez-vous qu'aucun élément masqué via `aria-hidden` n'est focalisé) et reconsidérez les indicateurs de sandbox si du contenu non fiable est embarqué. Les autres messages sont informatifs et peuvent généralement être ignorés.
