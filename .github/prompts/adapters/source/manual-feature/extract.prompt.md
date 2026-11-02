---
name: manual-feature-extract
---

# Adapter source `manual-feature` — indexation de .feature fournis à la main

Cet adapter ne **génère** pas de scénarios depuis une source de vérité : il **indexe**
des `.feature` Gherkin que tu as écrits toi-même, pour produire un `pivot.json` minimal
mais conforme à `engine/contracts/pivot.schema.json`. Tout l'aval générique consomme ce pivot.

## Étape -1 — Mode orchestré

Détecter `.shugyo.yaml` (cf. `engine/contracts/_pipeline-context-schema.md`). Lire :
- `paths.front_root`
- `paths.features_output_dir` (dossier des `.feature` fournis)

Si absent → mode interactif : demander ces deux chemins.

## Étape 1 — Collecter les .feature

Lister récursivement les `*.feature` sous `{front_root}/{features_output_dir}`.
Si aucun → `status: failed`, erreur « Aucun .feature trouvé : cet adapter attend des scénarios fournis à la main ».

## Étape 2 — Construire le pivot minimal

Émettre `pipeline/pivot.json` :

- `version: 1`
- `produit` : nom du projet (déduit de `front_root` ou d'un champ `produit.slug` si présent)
- `steps: []` et `fields: []` — vides (aucune métadonnée technique n'est extraite d'une source ;
  la génération de tests s'appuiera directement sur les steps Gherkin, pas sur `fields[].render`)
- `scenarios_index[]` : **une entrée par `Scenario:` / `Scénario:`** trouvé, avec
  - `feature_file` (relatif au `front_root`)
  - `scenario_line` (n° de ligne de la directive, entier > 0)
  - `scenario_name` (texte après `Scenario:`)
  - `covers_field` : valeur de l'annotation `# champ:` si présente, sinon `""`
  - `covers_step` : valeur de l'annotation `# étape:` si présente, sinon `""`
  - `category` : valeur de `# [CATEGORY]` si présente, sinon `"nominal"`
- `scenarios_to_generate: { "nominal": <nb de scénarios indexés> }`

> Le schéma de base tolère `steps`/`fields` vides et `covers_field` libre : `manual-feature`
> n'a pas les invariants métier stricts d'un adapter qui lit le code (dont la validation croisée champ↔scénario).

## Étape 3 — Retour

Valider le pivot contre `engine/contracts/pivot.schema.json`, puis terminer par le bloc
`===PIPELINE-RETURN-START=== … ===PIPELINE-RETURN-END===` (cf. `engine/contracts/_pipeline-context-schema.md`),
`agent: "manual-feature-extract"`, `artifacts.pivot_file`, `artifacts.scenarios_count`.
