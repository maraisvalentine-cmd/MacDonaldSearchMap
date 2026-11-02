---
name: playwright-generate
---

# Adapter target `playwright` — implémenter les scénarios (step defs playwright-bdd réels)

Tu **implémentes** les `.feature` en step definitions `playwright-bdd` **exécutables**, en
consommant le `pivot.json` : chaque `fields[].render.selector` + `interaction_method` te donne
le vrai appel Playwright. **Tu ne devines pas les sélecteurs.** Cible : tout projet front dont
la source a émis un pivot (Angular, React…). Tu ne lances PAS Playwright (c'est le step `run`).

## Étape -1 — Mode orchestré

Détecter `.shugyo.yaml` (cf. `engine/contracts/_pipeline-context-schema.md`). Lire :
- `paths.front_root`, `paths.features_output_dir`, `paths.steps_output_dir`, `paths.fixtures_dir`
- `pivot` : `gherkin.pivot_json_output ?? "pipeline/pivot.json"`
- `playwright.config_file`, `run.command`

## Étape 1 — Charger le pivot

Lire le pivot. Sections utilisées :
- `fields[]` → `technical_name`, `render.selector`, `render.interaction_method`, `fixture_field_path`
- `steps[]` → regroupement (un dossier de steps par step)
- `scenarios_index[]` → `feature_file`, `covers_field`, `category` (pilote la forme de l'assertion)

Si `fields[]` est vide (ex. source `manual-feature`) → générer un squelette depuis les phrases
Gherkin avec un `// TODO(selector)` par step, et le signaler en warning.

## Étape 2 — Générer les step definitions

Pour chaque `step` du pivot, sous `{steps_output_dir}/{step.slug}/`, produire :

- **`{step.slug}.fields.ts`** — map `label Gherkin → sélecteur`, dérivée de `fields[].render.selector` :
  ```ts
  export const FIELDS: Record<string, string> = {
    'Champ de recherche': '[data-testid=search]',   // = fields[].render.selector, VERBATIM
  };
  ```
  > Le sélecteur vient **tel quel** du pivot (la source a choisi la convention du projet). Le target
  > ne l'invente pas.

- **`{step.slug}.steps.ts`** — steps `playwright-bdd`, mappant `interaction_method` → appel Playwright :

  | `interaction_method` | Appel généré |
  |---|---|
  | `type` | `await page.locator(sel).fill(value); await page.locator(sel).blur();` |
  | `click` | `await page.locator(sel).click()` |
  | `select` | `await page.locator(sel).selectOption(value)` pour un `<select>` natif, sinon clic + choix de l'option |
  | `check` | `await page.locator(sel).check()` ; si l'état de la case dépend d'un appel réseau (pas de mise à jour optimiste), `check()` échoue : `click()` puis `await expect(locator).toBeChecked()` |
  | `navigate` | `await page.locator(sel).click(); await expect(page).toHaveURL(new RegExp(route))` |
  | `assert-visible` | `await expect(page.locator(sel)).toBeVisible()` |
  | `upload` | `await page.locator(sel).setInputFiles(path)` |

  ```ts
  import { createBdd } from 'playwright-bdd';
  import { expect } from '@playwright/test';
  import { FIELDS } from './orders.fields';

  const { Given, When, Then } = createBdd();

  When('je saisis {string} dans le champ de recherche', async ({ page }, v: string) => {
    await page.locator(FIELDS['Champ de recherche']).fill(v);
    await page.locator(FIELDS['Champ de recherche']).blur();
  });
  ```

  > ⚠️ **`createBdd` et `defineBddConfig` viennent de `playwright-bdd`**, pas de `@playwright/test`.
  > Si des fixtures personnalisées sont nécessaires, étendre le `test` exporté par `playwright-bdd`
  > dans un fichier unique, exporter ce `test` (les fichiers générés l'importent) et en dériver
  > `Given/When/Then` avec `createBdd(test)`.

  > ⚠️ **Cucumber Expression** : si le texte d'un step contient `/` (URL), `( )` ou `{ }`, le définir
  > en **regex** (`Given(/^…$/, …)`) plutôt qu'en string. `playwright-bdd` accepte les deux formes.

- **`{step.slug}.intercepts.ts`** *(seulement si des `# intercept-required:` existent dans les `.feature`)* —
  `page.route(...)` pour le stub, `page.waitForRequest` / `page.waitForResponse` pour l'attente.
  > **Ordonnancement** : la route doit être posée **AVANT** le `page.goto` qui déclenche l'appel.
  > Poser l'intercept par défaut dans le `Background` avant la visite ; poser l'intercept spécifique
  > dans le `Given` (état de l'API). Assertion sur un POST : `const req = await page.waitForRequest(…)`
  > puis `expect(req.postDataJSON()).toMatchObject({…})`.

**Forme de l'assertion selon `category`** (de `scenarios_index[]`) :
- `nominal` → l'élément est visible / interactif (`toBeVisible()`, `toBeEnabled()`).
- `conditionnel` → l'élément apparaît/disparaît selon la condition (`toBeVisible()` / `toHaveCount(0)`).
- `liste` → `await expect(page.locator(sel)).toHaveCount(N)`.
- `navigation` → clic + `toHaveURL(new RegExp(route))` (route de l'annotation `# route:`).

> **Assertion sur une requête d'écriture (POST, PATCH, DELETE)** : ne pas poser `waitForRequest` après le clic (course).
> Enregistrer les requêtes dans le handler `page.route` du stub (tableau par page) et asserter avec `expect.poll(() => requêtes…)`.
> Un `render.selector` partagé par plusieurs éléments : `.first()`, `.nth(i)` ou `.filter({ hasText })`.
> Le texte d'un step exclut le mot-clé **complet** : avec `Étant donné que`, il commence après « que ».

> Les assertions `expect(locator)` de Playwright réessayent seules : **pas de `waitForTimeout`**.

## Étape 3 — Fixtures

Créer sous `{paths.fixtures_dir}` les fixtures minimales référencées par `# fixture-required:`
(objet JSON avec les champs de `fixture_field_path`). Réutiliser une fixture existante si le pivot en désigne une.

## Étape 4 — Config & enregistrement

Vérifier que `playwright.config_file` appelle `defineBddConfig` avec un `steps` qui couvre
`{steps_output_dir}/**/*.ts` et un `features` qui couvre `{features_output_dir}` (sinon le signaler :
c'est le rôle du step `setup`). Ne PAS lancer `bddgen` ni Playwright.

## Étape 5 — Retour

Terminer par le bloc `===PIPELINE-RETURN-START=== … ===PIPELINE-RETURN-END===`
(`agent: "playwright-generate"`, `artifacts.steps_generated`, `artifacts.fixtures_generated`,
`warnings` pour chaque `// TODO(selector)` émis).
