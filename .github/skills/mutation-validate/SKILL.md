---
name: mutation-validate
description: "Validation one-shot de la sensibilité de la suite Cypress par mutation testing. Applique les mutations du catalogue de l'adapter TARGET actif ({target}/catalogs/mutations.yaml — templates/services/fixtures), relance les scénarios ciblés via pivot.scenarios_index, classe killed/survived, et produit un rapport listant les angles morts de la suite avec suggestions de renforcement. À lancer une fois après stabilisation de la suite (100% verte) avant d'utiliser celle-ci comme filet de sécurité pour un refacto."
---

# Skill : mutation-validate — Validation de la sensibilité de la suite Cypress

## Quand utiliser ce skill

| Situation | Commande |
|---|---|
| La suite Cypress vient de passer 100% verte et tu veux valider que c'est un vrai filet de sécurité avant de refactorer | `/shugyo --mutation-validate` |
| Tu as renforcé manuellement les scénarios survivants identifiés au run précédent → confirmer | `/shugyo --mutation-validate` |
| Gros refacto des tests (helpers partagés, fixtures restructurées) → re-valider la sensibilité | `/shugyo --mutation-validate` |

**Ne pas utiliser** :
- Dans un run quotidien de pipeline (l'agent est exclu du mode complet et n'est jamais déclenché par défaut)
- Pour debugger un test rouge (utiliser `feedback-loop` à la place)
- Sans baseline 100% verte (l'agent refuse explicitement)

## Quoi ce skill fait

1. **Vérifie les prérequis bloquants** : suite Cypress 100% verte, `git status` clean, `.shugyo.yaml` présent, `pivot.json` avec `scenarios_index[]` rempli
2. **Charge le catalogue** de mutations depuis l'adapter target actif (`{target}/catalogs/mutations.yaml`), filtrable via `target_scope` et `catalogue_overrides` (si le target n'en fournit pas → rapport vide)
3. **Localise les sites candidats** dans le code applicatif en croisant Grep + sections du `pivot.json` (fields, callbacks, fixtures)
4. **Sélectionne** au max `max_mutations_per_run` mutations avec diversité de patterns (cap dur, défaut 20)
5. **Pour chaque mutation** : snapshot git → applique via `Edit` → lance Cypress uniquement sur les `feature_file` qui couvrent le champ muté (via `pivot.scenarios_index`) → classe `killed` / `survived` → revert via `git checkout --`
6. **Émet** `pipeline/mutation-report.md` avec score, liste détaillée des survived (fichier + ligne + scénarios + diagnostic + suggestion), récap killed, prochaines actions

## Comment ce skill fonctionne

Suivre **strictement** les instructions du fichier prompt :

> `.github/prompts/engine/mutation-validate.prompt.md`

Ce fichier contient :
- La validation des prérequis (suite verte, git clean, pivot présent)
- Le **mécanisme générique** de mutation (le catalogue lui-même est chargé depuis l'adapter target : `{target}/catalogs/mutations.yaml`)
- La boucle d'exécution avec garde-fous (scope limité à `paths.front_root`, revert systématique, détection de pollution mid-run)
- Le format du rapport et du bloc PIPELINE-RETURN

## Catalogue

Chaque target fournit son `catalogs/mutations.yaml` (un target sans catalogue donne un rapport vide). Le détail des mutations vit dans ce fichier, pas ici.

Activable/désactivable par famille via `mutation.target_scope` dans `.shugyo.yaml`, ou pattern par pattern via `mutation.catalogue_overrides`.

## Artefacts produits

Tous rangés sous `[front_root]/pipeline/` :

```
pipeline/
├── mutation-plan.json           # plan des mutations sélectionnées (audit/debug)
├── mutation-iterations.log      # une ligne par mutation (status, durée, exit code)
└── mutation-report.md           # rapport final avec score + survivantes + suggestions
```

## Prérequis durs

- **Suite de tests 100% verte** : lue depuis le rapport de test (`feedback.reports_dir`, format `feedback.report_format`). Sinon → échec explicite, redirige vers `feedback-loop`
- **`git status` propre** : les mutations utilisent `git checkout --` pour revert, ce qui détruirait des changements non commités
- **`.shugyo.yaml` présent** : pas de mode interactif autonome en V1, l'agent dépend du contexte pipeline (pivot, run.command, scenarios_index)
- **`pivot.json` avec `scenarios_index[]` rempli** : sans ça, impossible de cibler les tests par mutation → l'agent refuse

## Limites connues V1

- Pas de mutation des YAML Spring Cloud Config (repo séparé, complexité revert)
- Pas de mutation des `.feature` ni `.steps.ts` (ce serait tester l'infra de test)
- Mutations séquentielles uniquement (pas de parallélisation)
- Granularité de ciblage : fichier `.feature` entier, pas scénario individuel (limitation Cypress `--spec`)

## Interprétation du mutation score

| Score | Interprétation |
|---|---|
| ≥ 90% | Suite robuste — OK pour servir de filet de sécurité refacto |
| 70-89% | Suite correcte — quelques angles morts à renforcer avant refacto |
| < 70% | Suite faible — ne pas se reposer dessus, renforcer en priorité |
