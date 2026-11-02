# Schéma `.shugyo.yaml`

## Rôle

Fichier de contexte partagé entre les agents du pipeline Gherkin. Quand ce fichier est présent à la racine du projet cible, **tous les agents du pipeline sautent leur Étape 0 (collecte interactive)** et lisent leurs inputs depuis ce fichier.

**Emplacement** : racine du projet cible (ex : `my-app/.shugyo.yaml`).

**Cycle de vie** :
- Créé par l'orchestrateur `shugyo` à l'initialisation
- Lu par chaque sous-agent au démarrage
- Conservé pour permettre `--resume` après interruption
- Supprimé manuellement quand le pipeline est terminé (ou laissé en place pour audits futurs)

---

## Schéma complet

```yaml
# .shugyo.yaml — version: 1
version: 1

# === PROFIL (adapters enfichables) ===
# Sélectionne quels adapters l'orchestrateur charge. Si ce bloc est ABSENT,
# l'engine applique engine/profiles/default (source manual-feature + target
# cypress-cucumber) → un projet sans surcharge fonctionne.
# Cascade de config (le dernier gagne) :
#   engine/profiles/default → defaults des adapters → overlay → ce fichier
profile:
  source: angular-components         # = dossier sous adapters/source/. Défaut: manual-feature
  target: cypress            # = dossier sous adapters/target/. Défaut: cypress-cucumber
  overlay: null                      # optionnel : dossier sous adapters/overlays/ (deltas projet)

# === SCOPE (générique, optionnel — interprété par l'adapter source) ===
# Limite le rattrapage à un sous-ensemble. ABSENT → tout le projet.
# L'engine transporte ce bloc tel quel ; c'est l'ADAPTER SOURCE qui l'interprète (il déclare
# ce qu'il sait scoper dans `manifest.scope_selectors`). L'extract n'émet que le pivot scopé,
# donc audit/generate opèrent sur ce périmètre SANS traitement supplémentaire en aval.
scope:
  selector: routes            # ce que l'adapter source sait scoper. ex angular-components : routes | component
  include: ["/orders"]        # routes (ou composants) à couvrir
  recurse_children: true      # inclure les routes/composants enfants (défaut: true)

# === IDENTIFICATION DU SUJET (optionnel) ===
# (Champs propres au profil source : l'adapter source déclare ses propres champs requis
#  dans son manifeste `inputs`.)
produit:
  slug: todo-app                          # identifiant du sujet couvert (nom de l'app ou de la feature)
  nom_complet: "Todo App"                 # libellé humain pour les en-têtes Gherkin

# === CHEMINS ===
paths:
  front_root: /home/user/my-app                 # absolu, racine du projet testé
  features_output_dir: cypress/e2e/features     # relatif à front_root
  steps_output_dir: cypress/e2e/steps           # relatif à front_root
  fixtures_dir: cypress/fixtures                # relatif à front_root
  fixtures_preprod_dir: cypress/fixtures/preprod  # relatif à front_root, optionnel

# === RUN (générique — lu par l'engine) ===
# Commande de lancement des tests, exécutée par l'orchestrateur au step `run`.
# L'engine ne connaît que ces deux clés ; leur VALEUR par défaut est fournie par l'adapter
# target (defaults.yaml). Seul placeholder générique interpolé par l'engine : {front_root}.
run:
  command: "npm run cypress:run"   # défaut du target ; un target peut définir une commande plus spécifique
  cwd: "{front_root}"              # cwd d'exécution (défaut: front_root)
  targeted: "…"                     # gabarit de relance ciblée (mutation-validate), fourni par le target :
                                   # {files} = features séparées par des espaces, {files_csv} = séparées par des virgules

# ============================================================================
# === BLOCS SPÉCIFIQUES AU PROFIL — NON lus par l'engine ===
# Consommés par les adapters du profil actif. Un autre profil déclare ses propres
# blocs. Ceux-ci illustrent un profil from-code + target Cypress.
# ============================================================================

# --- source ---
gherkin:
  pivot_json_output: pipeline/pivot.json   # chemin du pivot émis (défaut engine: pipeline/pivot.json)
  # Les autres clés `gherkin.*` (groupes de scénarios à inclure, etc.) sont définies par l'adapter source.

# --- target ---
cypress:
  consume_pivot_json: true                 # consommer le pivot au lieu d'inférer
  fixtures_strategy: preprod-or-synthetic  # preprod-only | synthetic-only | preprod-or-synthetic
  cypress_config_file: cypress.config.ts   # relatif à front_root
  # La commande de run vit dans le bloc générique `run:` ci-dessus.

# === AUDIT ===
audit:
  history_file: pipeline/coverage-history.json   # relatif à front_root
  fail_on_gaps: false                            # true → exit code != 0 si gaps détectés
  fail_on_duplicates: false                      # true → exit code != 0 si doublons (défaut false : trop agressif en début de projet)
  report_output: pipeline/audit-report.md        # relatif à front_root

# === MUTATION VALIDATE (one-shot, opt-in) ===
mutation:
  enabled: false                              # toujours false par défaut — activé via flag CLI --mutation-validate
  max_mutations_per_run: 20                   # cap dur, pour rester sous ~1h sur un projet moyen
  catalogue_overrides: []                     # IDs de mutations du catalogue target à désactiver (ex: ["M3", "M10"])
  report_output: pipeline/mutation-report.md  # relatif à front_root
  target_scope:                               # une clé par famille déclarée (`families`) par le catalogue du target
    templates: true                           # ex. Cypress / Playwright : templates, services, fixtures
    services: true
    fixtures: true                            # ex. API Java : contract, domain, security
  # NB : les recettes de mutation (M1…Mn) et leur famille sont définies par l'adapter TARGET
  #      ({target}/catalogs/mutations.yaml), pas ici. Ce bloc ne fait qu'activer/filtrer.

# === FEEDBACK LOOP ===
feedback:
  reports_dir: cypress/reports                           # relatif à front_root, où feedback-loop lit les fails (ancien nom accepté : cypress_reports_dir)
  report_format: mochawesome                             # mochawesome | playwright-json | cucumber-json (défaut fourni par le target)
  emit_format: edit-pairs                                # edit-pairs (canonique, consommable par tool Edit) | suggestion-text (markdown lisible humain)
  auto_apply_diffs: false                                # true = applique les paires de confidence "high" ; medium/low restent à valider
  feedback_output: pipeline/feedback-suggestions.md      # chemin unique du rapport feedback (relatif à front_root)

# === ORCHESTRATEUR ===
orchestrator:
  log_file: pipeline/pipeline.log          # relatif à front_root
  dry_run: false                           # true → ne génère que l'audit, n'écrit pas les .feature
  auto_fix: false                          # true → applique les diffs feedback-loop de confidence "high" et re-run (max 3 itérations)
  skip_run: false                          # true → génère les tests (step `generate`) mais ne lance pas la suite (step `run`)
  resume_from: null                        # null | extract | custom | audit | generate | run | feedback
                                            # Ordre d'exécution : extract → custom → audit → generate → run → feedback
                                            # (audit AVANT generate pour bloquer si gaps critiques détectés tôt)
                                            #
                                            # Distinction generate / run :
                                            #   generate : invoque l'adapter target (génère tests + fixtures, pas de run)
                                            #   run      : exécute run.command (lance la suite)
                                            # Cruciale en --auto-fix : après patch sur les .feature, on relance
                                            # `generate` (pour régénérer les tests) PUIS `run`. Si seuls des fichiers
                                            # de test/fixtures ont été patchés, on peut sauter directement à `run`.
```

---

## Champs obligatoires vs optionnels

### Obligatoires (sans défaut, l'orchestrateur doit les demander)

- `paths.front_root`
- `paths.features_output_dir`
- les `inputs` déclarés par l'adapter source et l'adapter target actifs (leur manifeste dit comment les déduire)

### Auto-déduits

Chaque adapter documente la déduction de ses propres chemins (voir son manifeste). L'orchestrateur ne déduit rien de lui-même.

### Avec défauts

- Tous les `gherkin.*`, `cypress.*`, `audit.*`, `feedback.*`, `orchestrator.*` ont les valeurs par défaut listées ci-dessus.

---

## Détection par les agents

Chaque agent doit, en premier lieu, exécuter cette logique :

```
1. Chercher .shugyo.yaml depuis le cwd, en remontant l'arborescence jusqu'à 5 niveaux
2. Si trouvé :
   - Lire et parser le YAML
   - Vérifier version: 1 (sinon avertir)
   - Charger toutes les valeurs nécessaires à l'agent
   - Sauter l'Étape 0 (collecte interactive)
   - Logger : "✓ Contexte détecté : .shugyo.yaml ([produit.slug])"
3. Si absent :
   - Comportement actuel (Étape 0 interactive)
```

---

## Convention de nommage des dossiers `pipeline/`

Tous les artefacts générés par le pipeline (logs, JSON pivot, rapports audit, history) sont rangés sous `[front_root]/pipeline/`. Cette convention permet :
- `.gitignore` simple : `pipeline/` + `.shugyo.yaml`
- localisation prévisible des artefacts pour les humains
- nettoyage facile entre runs

---

## Format de retour standardisé des sous-agents

**Tout sous-agent invoqué par l'orchestrateur** doit terminer son exécution en émettant un bloc final au format JSON `pipeline-return`, parsable par l'orchestrateur. Ce bloc remplace les "résumés en prose" qui sont fragiles à parser.

### Format

```
===PIPELINE-RETURN-START===
{
  "agent": "extract",
  "status": "success",
  "duration_seconds": null,
  // Toujours null côté sous-agent — mesuré par l'orchestrateur (wall clock entre START et END du step).
  "artifacts": {
    "features_generated": [
      "cypress/e2e/features/task-form.feature",
      "cypress/e2e/features/task-list.feature"
    ],
    "pivot_file": "pipeline/pivot.json",
    "scenarios_count": {
      "nominal": 124,
      "interaction_save": 9
    }
  },
  "warnings": [
    "Le champ task_title n'a pas de tooltip dans le composant — scénario [NOMINAL — CONTENU] non généré"
  ],
  "errors": [],
  "next_recommended_step": "custom"
}
===PIPELINE-RETURN-END===
```

### Champs

| Champ | Type | Description |
|---|---|---|
| `agent` | string | nom du prompt qui a tourné |
| `status` | enum | `success` \| `success_with_warnings` \| `failed` |
| `duration_seconds` | int \| null | durée d'exécution — toujours `null` côté sous-agent ; mesuré par l'orchestrateur (wall clock) |
| `artifacts` | object | chemins des fichiers produits, métriques (clés libres par agent) |
| `warnings` | array<string> | non bloquant |
| `errors` | array<string> | erreurs ayant causé `status: failed` |
| `next_recommended_step` | string \| null | ce que l'orchestrateur devrait lancer ensuite |

### Comportement orchestrateur

- L'orchestrateur parse **uniquement** ce bloc (entre les balises `===PIPELINE-RETURN-START===` et `===PIPELINE-RETURN-END===`)
- Tout texte avant/après est ignoré pour le routing — peut servir au log human-readable
- Si le bloc est absent ou invalide → traiter comme `status: failed` avec `errors: ["Pipeline return block missing or invalid"]`
