---
name: angular-components-extract
---

# Adapter source `angular-components` — écrire les scénarios Gherkin à partir du code Angular

Tu **génères** les scénarios de test à partir du **code** (composants Angular, templates,
routing, services), et tu émets `pipeline/pivot.json` (conforme à `engine/contracts/pivot.schema.json`)
+ les `.feature` annotés. Tu ne devines pas côté aval : le pivot porte les sélecteurs.

Tu ne génères PAS de code applicatif et ne modifies PAS les composants — tu lis, tu déduis, tu écris des `.feature` + le pivot.

## Étape -1 — Mode d'exécution

Chercher `.shugyo.yaml` (jusqu'à 5 niveaux). Si présent → **mode orchestré**, lire :
- `paths.front_root`, `paths.app_root` (défaut `src/app`), `paths.routing_file` (optionnel)
- `scope` (optionnel — cf. Étape 1)
- `gherkin.pivot_json_output` (défaut `pipeline/pivot.json`), `paths.features_output_dir`

Sinon → **mode interactif** : demander `front_root`, `app_root`, et le scope éventuel.

## Étape 1 — Résoudre le périmètre (scope)

Lire le bloc `scope:` (cf. `engine/contracts/_pipeline-context-schema.md`). Cet adapter accepte
`scope.selector ∈ { routes, component }` (déclaré dans `manifest.scope_selectors`) :

- `selector: routes` + `include: ["/orders", …]` → ces routes, **+ leurs routes enfants** si
  `recurse_children: true` (défaut).
- `selector: component` + `include: ["MesDossiersComponent", …]` → ces composants comme racines.
- **Aucun `scope:`** → périmètre = **tout l'app**.

Le périmètre **borne l'analyse de l'Étape 2** (on ne couvre que les routes/composants inclus).

## Étape 2 — Analyser le code (déléguer au skill `cypress-analyze-source`)

**Ne réimplémente PAS la découverte.** Exécute le skill **`cypress-analyze-source`**, qui fait déjà,
et mieux :
- détection d'architecture + **découverte récursive des routes** (y compris lazy-loaded) ;
- recensement des **appels HTTP** par page (avec localisation des params URL vs body, pour les intercepts) ;
- repérage des **données de test** disponibles (mocks/stubs/InMemory) ;
- rédaction des **scénarios Gherkin brouillon** dérivés du code (avec l'avertissement « reflète le code, pas la spec »).

Contraindre son analyse au **périmètre** de l'Étape 1 (ne traiter que les routes/composants inclus).
Récupérer : carte des routes, éléments testables par composant, appels HTTP, scénarios rédigés.

> **Division du travail** : `cypress-analyze-source` = l'analyse + la rédaction Gherkin (le « cerveau ») ;
> cet adapter = **structurer** ce résultat dans le contrat `pivot.json`, honorer le scope, le mode
> orchestré et le return-block. Aucune logique de découverte dupliquée ici.

## Étape 3 — Structurer le résultat en `pivot.json`

Mapper la sortie de `cypress-analyze-source` vers le pivot :

- **`steps[]`** : un par composant/page (slug = kebab, label = titre humain).
- **`fields[]`** : un par élément testable. `render.selector` = **détecter la convention de sélecteur
  réellement utilisée dans les templates**, par ordre de préférence :
  1. l'attribut `data-*` de test du projet **quel qu'il soit** — repérer celui qui est employé
     (`data-selector`, `data-test`, `data-testid`, `data-cy`…). **NE PAS présumer `data-testid`** :
     certains projets utilisent une autre convention (`data-selector`, `data-cy`…).
  2. `#id` si stable (rejeter les id interpolés `id="ag-{{idx}}"`) ;
  3. `[formControlName=…]` pour un champ de formulaire réactif ;
  4. pour un **bouton/lien** sans attribut ni id stable, un **sélecteur textuel** sur le libellé
     visible (`cy.contains('Se connecter')`) — plus robuste qu'une balise ambiguë (`button`,
     `a[routerLink]`) quand plusieurs éléments similaires coexistent ;
  5. en tout dernier recours, balise + classe + `# TODO(testid)` dans le `.feature`.

> **Constat terrain** : sur un projet **sans convention de test-id**, les sélecteurs de boutons/liens
> restent fragiles. Le meilleur remède est en amont : le `setup` du target peut proposer d'**ajouter
> des `data-*`** aux éléments clés. À défaut, privilégier le sélecteur textuel (point 4).
  Le sélecteur est consommé **tel quel** par le target. `render.interaction_method` déduit du type d'élément :
  | Élément template | interaction_method |
  |---|---|
  | `<input>` / `<textarea>` | `type` |
  | `<button>`, `(click)` | `click` |
  | `<select>` | `select` |
  | `[routerLink]` / navigation | `navigate` |
  | `<a>` lien | `click` |
  `fixture_field_path` : `[technical_name].value` par défaut.
- **`scenarios_index[]`** + `.feature` (ceux rédigés par le skill), catégorie déduite :
  `nominal` / `conditionnel` (`@if`/`*ngIf`) / `liste` (`@for`/`*ngFor`) / `navigation` (`routerLink`).
  Les **appels HTTP** recensés par le skill → annotations `# intercept-required:` sur les scénarios concernés.
- **`scenarios_to_generate`** : compteurs par catégorie.

Chaque scénario porte les annotations : `# composant:`, `# selector:`, `# route:` (si nav),
`# intercept-required:` (si HTTP), `# [CATEGORY]`, `# champ:` (cf. `annotations.md` + `engine/contracts/_annotations-base.md`).

> ⚠️ **Phrasé des steps (piège Cucumber vérifié en run réel)** : le **texte des steps Gherkin** ne
> doit PAS contenir de caractères spéciaux aux Cucumber Expressions — surtout `/` (une URL comme
> `/api/users` casse le parsing : *« Cucumber Expression has a problem »*), ni `( ) { }`. Mets
> l'endpoint dans l'**annotation** `# intercept-required: GET /api/users`, et phrase le step sans URL
> (ex. « l'API renvoie deux utilisateurs », pas « l'API GET /api/users renvoie deux utilisateurs »).

## Étape 4 — Validation & retour

Valider le pivot produit contre `engine/contracts/pivot.schema.json` et les invariants
(cf. `engine/contracts/_pivot-json-format.md`). Terminer par le bloc
`===PIPELINE-RETURN-START=== … ===PIPELINE-RETURN-END===` (`agent: "angular-components-extract"`,
`artifacts.pivot_file`, `artifacts.scope` = périmètre résolu, `artifacts.scenarios_count`,
`warnings` pour chaque `# TODO(testid)` émis).
