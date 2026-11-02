---
name: shugyo
description: "修行 — Pipeline agentique GÉNÉRIQUE de rattrapage de tests E2E. Résout un profil (adapters source + target enfichables), puis chaîne extract → audit → generate → run → feedback en un workflow cohérent. L'engine ne connaît aucun produit ni framework. Utiliser pour démarrer/auditer/régénérer une couverture E2E sur n'importe quel projet. Supporte --profile, --from/--to, --dry-run, --auto-fix, --mutation-validate."
---

# Skill : Shugyo 修行 — orchestrateur générique de tests E2E

## Quand utiliser ce skill

| Situation | Commande |
|---|---|
| Rattrapage from-code Angular (cas principal) | `/shugyo --profile angular-components` |
| … limité à certaines routes (+ enfants) | `/shugyo --scope routes:/orders` |
| Projet sans surcharge (tu fournis tes `.feature`) | `/shugyo` |
| Passer un input d'adapter source | `/shugyo --set produit.slug=my-app` |
| Audit de couverture sans modification | `/shugyo --dry-run` |
| Reprendre après interruption | `/shugyo --from run` |
| Cycle complet auto-correctif | `/shugyo --auto-fix` |
| Réutiliser une config existante | `/shugyo --config ./.shugyo.yaml` |

## Ce que fait ce skill

1. **Résout le profil** (bloc `profile:` du `.shugyo.yaml`, ou `--profile`, ou `default`) → adapters source/target à charger.
2. **Collecte les inputs UNE FOIS** (ceux déclarés par l'adapter source dans son manifeste) et écrit `.shugyo.yaml`.
3. **Lance les sous-agents en séquence** via le tool `Agent`, résolus depuis le profil, chacun en mode orchestré (Étape -1 détecte `.shugyo.yaml`, saute l'Étape 0).
4. **Persiste des checkpoints** entre chaque step (`--from` pour reprendre).
5. **Émet une synthèse finale** (`pipeline/pipeline-summary.md`).

## Comment ce skill fonctionne

Suivre **strictement** les instructions de :

> `.github/prompts/engine/shugyo.prompt.md`

Ce fichier contient : le parse des flags (`--profile`, `--set`, `--from`, `--to`, `--dry-run`, `--auto-fix`, `--skip-run`, `--mutation-validate`, `--config`), la résolution du profil, le pattern d'invocation des sous-agents, la logique de checkpoint/resume, et la synthèse.

## Steps & résolution (jamais codés en dur)

| Step | Résolu depuis | Rôle |
|---|---|---|
| `extract` | `{source}/extract.prompt.md` | source de vérité → `.feature` + `pivot.json` |
| `custom` | `{source}/generate-custom.prompt.md` *(si fourni)* | .feature pour cas non-standard |
| `audit` | `engine/audit-coverage.prompt.md` | couverture pivot × .feature |
| `generate` | `{target}/generate.prompt.md` | pivot → tests + fixtures |
| `run` | orchestrateur (`run.command`) | lance la suite |
| `feedback` | `engine/feedback-loop.prompt.md` | fails → diffs |
| `mutation-validate` | `engine/mutation-validate.prompt.md` | mutation testing (opt-in) |

> **Profils** — Angular : `source: angular-components` ; React : `source: react-components` ; puis `target: cypress` ou `playwright` ;
> API REST Java : `source: java-rest-controllers` + `target: cucumber-java-rest`.
> Défaut : `manual-feature` + `cypress-cucumber`.
>
> **Réutilisation de skills** (pas de duplication) : l'adapter source `angular-components` délègue
> l'analyse du code au skill `cypress-analyze-source` ; le setup du target `cypress` s'appuie
> sur le skill `cypress-auth-bypass` pour le bypass d'authentification.

## Contrats & schémas

- `.github/prompts/engine/contracts/pivot.schema.json` — **le contrat** (pivot.json)
- `.github/prompts/engine/contracts/_pipeline-context-schema.md` — schéma `.shugyo.yaml`
- `.github/prompts/engine/contracts/_pivot-json-format.md` — format pivot détaillé
- `.github/prompts/engine/contracts/_audit-report-format.md` — format rapport audit

## Artefacts produits

Tous sous `[front_root]/pipeline/` :

```
pipeline/
├── pivot.json                    # contrat (émis par l'adapter source)
├── audit-report.md               # rapport de couverture
├── coverage-history.json         # historique des scores
├── feedback-suggestions.md       # diffs proposés
├── pipeline.log                  # log étape par étape
├── test-run.log                  # sortie du run des tests
├── pipeline.checkpoint           # état pour --from
├── auto-fix-iterations.log       # si --auto-fix
└── pipeline-summary.md           # synthèse finale
```

## Conditions de succès

- **Succès complet** (`exit 0`) : tous les steps OK, audit ≥ seuil, suite 100% verte
- **Succès partiel** (`exit 0` + warnings) : audit OK mais fails de tests non bloquants
- **Échec bloquant** (`exit 1`) : gaps critiques (`audit.fail_on_gaps: true`) ou run impossible

## Limites connues

- `--auto-fix` itère 3 fois max (anti-boucle infinie)
- Les sous-agents retournent un résumé court — l'orchestrateur ne voit pas le détail step-by-step
- Pour un sujet > 200 unités testables, la génération peut dépasser 30 min
