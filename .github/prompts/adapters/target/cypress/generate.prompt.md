---
name: cypress-generate
---

# Adapter target `cypress` — implémenter les scénarios (step defs Cypress réels)

Tu **implémentes** les `.feature` en step definitions Cypress + Cucumber **exécutables**, en
consommant le `pivot.json` : chaque `fields[].render.selector` + `interaction_method` te donne
la vraie commande `cy` — **tu ne devines pas les sélecteurs**. Cible : projet Angular ou React
(sans dépendance à une librairie de composants). Tu ne lances PAS Cypress (c'est le step `run`).

## Étape -1 — Mode orchestré

Détecter `.shugyo.yaml` (cf. `engine/contracts/_pipeline-context-schema.md`). Lire :
- `paths.front_root`, `paths.features_output_dir`, `paths.steps_output_dir`
- `pivot` : `gherkin.pivot_json_output ?? "pipeline/pivot.json"`
- `cypress.cypress_config_file`, `run.command`

## Étape 1 — Charger le pivot

Lire le pivot. Sections utilisées :
- `fields[]` → `technical_name`, `render.selector`, `render.interaction_method`, `fixture_field_path`
- `steps[]` → regroupement (un dossier / fichier de steps par step)
- `scenarios_index[]` → `feature_file`, `covers_field`, `category` (pilote la forme de l'assertion)

Si `fields[]` est vide (ex. source `manual-feature`) → générer un squelette depuis les phrases
Gherkin avec un `// TODO(selector)` par step, et le signaler en warning.

## Étape 2 — Générer les step definitions (convention projet)

Pour chaque `step` du pivot, sous `{steps_output_dir}/{step.slug}/`, produire le trio :

- **`{step.slug}.fields.ts`** — map `label Gherkin → sélecteur`, dérivée de `fields[].render.selector` :
  ```ts
  export const FIELDS: Record<string, string> = {
    'Champ de recherche': '[data-testid=search]',   // = fields[].render.selector, VERBATIM
  };
  ```
  > Le sélecteur vient **tel quel** du pivot (la source a choisi la convention du projet :
  > `[data-test=…]`, `[data-testid=…]`, `[data-cy=…]`…). Le target ne l'invente pas.

- **`{step.slug}.steps.ts`** — step defs `@badeball/cypress-cucumber-preprocessor`, mappant
  `interaction_method` → commande `cy` :

  | `interaction_method` | Commande générée |
  |---|---|
  | `type` | `cy.get(sel).clear().type(value).blur()` |
  | `click` | `cy.get(sel).click()` |
  | `select` | `cy.get(sel).click()` + choix de l'option |
  | `check` | `cy.get(sel).check()` |
  | `navigate` | `cy.get(sel).click()` puis `cy.url().should('include', route)` |
  | `assert-visible` | `cy.get(sel).should('be.visible')` |
  | `upload` | `cy.get(sel).selectFile(path)` |

  ```ts
  import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
  import { FIELDS } from './orders.fields';

  When('je saisis {string} dans le champ de recherche', (v: string) => {
    cy.get(FIELDS['Champ de recherche']).clear().type(v).blur();
  });
  ```

  > ⚠️ **Cucumber Expression (piège vérifié en run réel)** : si le **texte d'un step** contient un
  > caractère spécial aux Cucumber Expressions — `/` (URL !), `( )`, `{ }` — définis-le en **regex**
  > (`Given(/^…$/, …)`) et non en string, sinon *« This Cucumber Expression has a problem »* fait
  > échouer TOUT le spec. Ex. `Then(/^l'appel POST \/api\/users est emis…$/, () => {…})`.

- **`{step.slug}.intercepts.ts`** *(seulement si des `# intercept-required:` existent dans les `.feature`)* —
  `cy.intercept(...)` + helpers `wait*`, importés par le `.steps.ts` (comme un stub d'API).
  > **Ordonnancement (vérifié en run réel)** : l'intercept doit être posé **AVANT** la visite qui
  > déclenche l'appel (un `GET` sur `ngOnInit` part au `cy.visit`). Pose l'intercept dans le `Given`
  > (état de l'API) ; mets un intercept **par défaut** dans le `Background` **avant** son `cy.visit('/')` ;
  > fais **re-visiter** le step « la page se charge » puis `cy.wait('@alias')`. Assertion sur un POST :
  > `cy.wait('@alias').its('request.body').should('include', {…})`.

> Un `render.selector` partagé par plusieurs éléments (liste) : cibler une ligne avec `.first()`, `.eq(i)` ou `.contains(texte)`.
> Le texte d'un step exclut le mot-clé **complet** : avec `Étant donné que`, il commence après « que ».

**Forme de l'assertion selon `category`** (de `scenarios_index[]`) :
- `nominal` → l'élément est visible / interactif.
- `conditionnel` → l'élément apparaît/disparaît selon la condition (`should('exist')` / `should('not.exist')`).
- `liste` → `cy.get(sel).should('have.length', N)`.
- `navigation` → clic + `cy.url().should('include', route)` (route de l'annotation `# route:`).

## Étape 3 — Fixtures

Créer sous `cypress/fixtures/` les fixtures minimales référencées par `# fixture-required:`
(objet JSON avec les champs de `fixture_field_path`). Réutiliser une fixture preprod si le pivot en désigne une.

## Étape 4 — Config & enregistrement

Vérifier que `cypress.cypress_config_file` déclare bien le `stepDefinitions` couvrant
`{steps_output_dir}/**/*.steps.ts` (sinon le signaler — c'est le rôle du step `setup`).
Ne PAS lancer Cypress.

## Étape 5 — Retour

Terminer par le bloc `===PIPELINE-RETURN-START=== … ===PIPELINE-RETURN-END===`
(`agent: "cypress-generate"`, `artifacts.steps_generated`, `artifacts.fixtures_generated`,
`warnings` pour chaque `// TODO(selector)` émis).
