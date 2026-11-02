---
name: cypress-cucumber-generate
---

# Adapter target `cypress-cucumber` — génération de step defs (générique)

Génère des step definitions Cypress + Cucumber à partir des `.feature` du projet,
**sans présupposer de framework front**. Contrairement à un target spécialisé, il ne
s'appuie pas sur `pivot.fields[].render` (souvent vide pour un profil générique) : il
génère les step defs directement depuis les phrases Gherkin (Given/When/Then).

## Étape -1 — Mode orchestré

Détecter `.shugyo.yaml` (cf. `engine/contracts/_pipeline-context-schema.md`). Lire :
- `paths.front_root`, `paths.features_output_dir`, `paths.steps_output_dir`
- `run.command`

## Étape 1 — Générer les step definitions

Pour chaque `.feature` :
1. Parser les steps `Given/When/Then/And` uniques.
2. Émettre un fichier `*.steps.ts` sous `steps_output_dir` avec un squelette Cucumber
   (`Given('...', () => { ... })`) pour chaque step, en réutilisant le pivot **si** des
   `fields[]` avec `render.selector` existent (sinon, laisser un TODO de sélecteur ciblé
   `[data-testid=...]` à compléter).
3. Créer les fixtures minimales référencées.

> Note de portée : ce target générique produit un **squelette** exécutable. Un profil qui a
> des métadonnées de rendu riches (comme `cypress`) génère des step
> defs complets sans TODO. C'est le rôle d'un adapter target spécialisé.

## Étape 2 — Retour

Terminer par le bloc `===PIPELINE-RETURN-START=== … ===PIPELINE-RETURN-END===`
(cf. `engine/contracts/_pipeline-context-schema.md`), `agent: "cypress-cucumber-generate"`,
`artifacts.steps_generated`, `artifacts.fixtures_generated`.
