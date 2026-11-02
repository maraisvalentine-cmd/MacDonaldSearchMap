---
name: verify-adapter
---

# Agent : Conformance d'un adapter Shugyo

Tu vérifies qu'un **adapter** (source ou target) respecte les contrats de l'engine, **sans dépendre d'aucun runtime** : tu ne fais que lire des fichiers, exécuter l'extract sur une fixture d'exemple, et valider la sortie contre un JSON Schema. C'est ce test qui rend l'ajout d'un adapter self-service et sûr.

> Principe : **le schéma `pivot.json` EST le SDK.** Un adapter source est conforme si son extract produit un `pivot.json` valide + des `.feature` dont les annotations sont dans le vocabulaire (base + extensions déclarées) + un return-block valide. Tout l'aval (audit / cypress-gen / feedback / mutation) est alors garanti de fonctionner, puisqu'il ne consomme QUE le pivot.

---

## Entrées

Fournies en argument ou lues depuis `.shugyo.yaml` :

1. `adapter_path` : dossier de l'adapter à tester (ex: `.github/prompts/adapters/source/angular-components`)
2. `engine_root` : racine engine (ex: `.github/prompts/engine`) — où trouver `contracts/pivot.schema.json`
3. `example` (optionnel) : un cas de référence, une fixture `adapter_path/examples/<cas>/` (source d'entrée + `expected-pivot.json`). Si absent, prendre la première sous `adapter_path/examples/`.

---

## Étape 1 — Valider le manifeste

Lire `adapter_path/manifest.yaml`. Vérifier :

- [ ] `id` (string non vide)
- [ ] `kind` ∈ { `source`, `target` }
- [ ] `engineRange` (semver range) — **compatible** avec la version des contrats de `engine_root` : les contrats sont en version 1 (`pivot.schema.json`, `version: 1`), donc un range qui contient `1.x`
- [ ] `produces` contient `pivot@1` (pour un adapter source)
- [ ] `inputs` (liste des clés `.shugyo.yaml` réclamées) présent (peut être vide)
- [ ] `provides` (annotations / catalogs) pointe vers des fichiers existants s'il est déclaré

Toute case non cochée → `status: failed`, ne pas continuer.

---

## Étape 2 — Produire le pivot depuis la fixture

Pour un adapter **source** :

1. Charger la source d'entrée de `example/`.
2. Exécuter `adapter_path/extract.prompt.md` sur cette source en **mode orchestré simulé** : écrire un `.shugyo.yaml` temporaire à chemins absolus (sortie hors du dépôt, avec un `front_root` de travail dans lequel sont recopiés les `.feature` existants), scope = tout le projet, scénarios considérés validés (l'extract émet alors son warning « scénarios non validés », qui n'entre pas dans le statut de verify-adapter).
3. Récupérer le `pivot.json` produit.
4. Si un pivot attendu existe, faire un **diff sémantique** (mêmes champs/steps/scenarios_index, l'ordre stable près) et lister les écarts. Ignorer `scenario_line`, les libellés libres et les `warnings`. Si l'exemple contient déjà des `.feature`, l'extract n'émet que les manques : `scenarios_index` reprend alors les scénarios existants **et** les nouveaux, et le diff compare ce total. Noter si l'exécutant a lu le pivot attendu avant de dériver le sien : le diff n'est alors pas indépendant.

Pour un adapter **target** : exécuter l'Étape 2T, puis sauter à l'Étape 4.

---

## Étape 2T — Adapter target

1. `provides.steps` : chaque step déclaré (`setup`, `generate`) a son fichier `<step>.prompt.md`.
2. `provides.catalogs` : chaque fichier déclaré existe et se lit.
   - `feedback_patterns` : au moins un pattern avec signature, cause et action.
   - `mutations` : YAML valide ; `families` déclaré ; chaque entrée a `id` unique, `family` ∈ `families`, `target`,
     `expected` ∈ {`killed`, `survived`} et une `description` qui contient Localisation, Mutation et Signal attendu.
3. `defaults.yaml` (s'il existe) : YAML valide. Si un catalogue de mutations est fourni, `run.targeted` est défini et
   contient `{files}` ou `{files_csv}`.
4. `templates/` (s'il existe) : chaque fichier cité par `setup.prompt.md` ou par un catalogue existe.

Chaque violation = une entrée dans `errors`.

---

## Étape 3 — Valider le pivot contre les schémas

1. Valider le pivot produit contre `engine_root/contracts/pivot.schema.json` (**schéma de base, obligatoire pour tous**).
2. Si l'adapter fournit un overlay (`adapter_path/pivot.overlay.schema.json`), valider **aussi** contre lui (resserrement de profil : enums fermés, champs d'extension requis…).
3. Rejouer les invariants métier du format pivot (cf. `engine/contracts/_pivot-json-format.md` § Validation) :
   - [ ] tous les `steps[].fields[]` référencent un `fields[].technical_name` existant
   - [ ] aucun `technical_name` en double
   - [ ] tous les `scenarios_index[].covers_field` référencent un champ existant
   - [ ] tous les `scenarios_index[].feature_file` (relatifs à `paths.front_root`) existent sur disque
   - [ ] tous les `scenarios_index[].scenario_line` sont des entiers > 0

Chaque violation = une entrée dans `errors`.

---

## Étape 3bis — Vocabulaire d'annotations

Parser les `.feature` produits (ou fournis en fixture). Ignorer les directives Gherkin (`# language: xx`) et les commentaires libres. Chaque annotation `# xxx:` et chaque `# [CATEGORY]` doit appartenir à :

- le vocabulaire de base (`engine_root/contracts/_annotations-base.md`), **ou**
- les extensions déclarées par l'adapter (`provides.annotations`) ;
- pour `# [CATEGORY]` : les catégories de `provides.catalogs.scenario_groups` de l'adapter, sinon celles du profil `default` (`nominal`) et celles que liste `annotations.md` de l'adapter.

Toute annotation hors de cet ensemble → `warning` (pas bloquant, mais signale une taxonomie non déclarée que l'audit ne saura pas router).

---

## Étape 4 — Return-block

Pour un adapter source : vérifier que l'exécution de l'extract se termine par un bloc `===PIPELINE-RETURN-START=== … ===PIPELINE-RETURN-END===` valide (cf. `engine/contracts/_pipeline-context-schema.md` § Format de retour). Bloc absent/invalide → `errors`. Pour un adapter target, `setup` et `generate` ne sont pas exécutés par verify-adapter : vérifier seulement que chacun des deux prompts impose ce bloc (`agent`, `artifacts`, `warnings`).

---

## Sortie

Émettre un rapport lisible, PUIS le return-block standardisé :

```
===PIPELINE-RETURN-START===
{
  "agent": "verify-adapter",
  "status": "success | success_with_warnings | failed",
  "duration_seconds": null,
  "artifacts": {
    "adapter": "<id>",
    "kind": "source | target",
    "schema_valid": true,
    "overlay_valid": true,
    "business_invariants_passed": 5,
    "annotation_warnings": 0
  },
  "warnings": [],
  "errors": [],
  "next_recommended_step": null
}
===PIPELINE-RETURN-END===
```

`status: success` **uniquement si** : manifeste OK + pivot valide (base + overlay) + tous les invariants OK + return-block OK. Pour un adapter target : manifeste OK + Étape 2T sans erreur ; dans l'`artifacts` du bloc, mettre `schema_valid`, `overlay_valid` et `business_invariants_passed` à `null` et ajouter `scenarios_run` et `scenarios_passed` de l'exemple. Sinon `failed` (erreurs bloquantes) ou `success_with_warnings` (uniquement des warnings d'annotations). Les warnings propres à l'extract (« scénarios non validés », `TODO(testid)`) ne comptent pas.
