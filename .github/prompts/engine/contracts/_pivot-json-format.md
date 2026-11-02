# Format pivot JSON `pipeline/pivot.json`

## Rôle

Le **pivot** est un fichier JSON émis par l'adapter source. Il contient les **métadonnées techniques** extraites du projet testé (écrans, champs, sélecteurs, scénarios déjà générés).

Il est consommé par :
- l'adapter target : pour générer les step definitions (sélecteurs, interactions, fixtures) **sans avoir à inférer**
- `audit-coverage` : pour générer la matrice de couverture
- `feedback-loop` : pour mapper les échecs de test aux scénarios source

Le contrat exécutable est `pivot.schema.json`. Ce document en est une description illustrative.

**Emplacement** : `[front_root]/pipeline/pivot.json` (configurable via `gherkin.pivot_json_output` dans `.shugyo.yaml`).

`scenarios_index[].feature_file` dépend de `paths.features_output_dir`, donc du target. Pour utiliser deux targets sur
le même projet, tenir un pivot et un `.shugyo.<target>.yaml` par target (`pipeline/pivot.<target>.json`, lancés avec
`--config .shugyo.<target>.yaml`), ou régénérer le pivot à chaque changement de target.

---

## Noyau obligatoire

```json
{
  "version": 1,
  "produit": "todo-app",
  "steps": [
    {
      "slug": "task-form",
      "label": "Formulaire de tâche",
      "order": 1,
      "fields": ["task_title"]
    }
  ],
  "fields": [
    {
      "technical_name": "task_title",
      "label": "Titre",
      "step_slug": "task-form",
      "required": true,
      "render": {
        "selector": "[data-testid=task-title]",
        "interaction_method": "type"
      },
      "fixture_field_path": "task_title.value"
    }
  ],
  "scenarios_index": [
    {
      "feature_file": "features/task-form.feature",
      "scenario_line": 6,
      "scenario_name": "Le titre est obligatoire",
      "covers_field": "task_title",
      "covers_step": "task-form",
      "category": "nominal"
    }
  ]
}
```

- `produit` : identifiant du sujet couvert (nom de l'application ou de la feature). Le nom du champ est conservé pour compatibilité.
- `steps[]` : sections ou pages de l'application. `slug` et `fields[]` (liste de `technical_name`) relient les étapes aux champs.
- `fields[]` : éléments testables. `render.selector` et `render.interaction_method` permettent au target de générer la commande de test sans deviner.
- `scenarios_index[]` : une entrée par scénario déjà généré, émise après génération de tous les `.feature`.

### `scenarios_index`

- `feature_file` : chemin relatif au `front_root`
- `scenario_line` : ligne de la directive `Scénario:`
- `scenario_name` : copie exacte de la phrase après `Scénario:`
- `covers_field` : `technical_name` du champ ciblé (annotation `# champ:`), `""` si aucun
- `covers_step` : `slug` de l'étape ciblée (annotation `# étape:`), `""` si aucune
- `category` : valeur de l'annotation `# [CATEGORY]` (sans crochets), `nominal` par défaut

Cet index permet à `audit-coverage` de faire le mapping inverse champ -> scénarios sans re-parser tous les `.feature`.

---

## Extensions de profil (facultatives)

Le schéma laisse passer toute propriété supplémentaire. Un adapter source qui connaît mieux son domaine peut ajouter, par exemple :

- au niveau racine : `generated_at`, `source` (provenance des métadonnées), `callbacks`, `fixtures`, `scenarios_to_generate` (nombre de scénarios par groupe)
- sur un champ : `data_type`, `constraints`, `rules` (conditions d'affichage), `custom_component`, `render.wrapper_selector`, `render.note`
- sur une étape : `hidden_callback`

Les contrôles d'`audit-coverage` qui dépendent d'une extension ne s'appliquent que si le pivot la contient. Un adapter qui resserre le contrat fournit un `pivot.overlay.schema.json`, validé en plus du schéma de base.

---

## Conventions de génération

1. **Tri stable** : `fields[]` triés par `step_slug` puis par ordre d'apparition dans la source.
2. **Pas d'inférence textuelle** : chaque champ a son `render` calculé de façon déterministe depuis ses métadonnées (type, composant, attributs).
3. **`fixture_field_path`** : convention `[technical_name].value` par défaut, ajustable si la fixture utilise un autre chemin.

---

## Validation avant écriture

L'adapter source vérifie, avant d'écrire `pivot.json` :

- [ ] `version: 1`
- [ ] Aucun `field.technical_name` en double
- [ ] Tous les `step.fields[]` référencent un `field.technical_name` existant
- [ ] Tous les `scenarios_index[*].feature_file` existent sur disque
- [ ] Tous les `scenarios_index[*].scenario_line` sont des entiers > 0
- [ ] Tous les `scenarios_index[*].covers_field` non vides référencent un `technical_name` existant

En cas d'échec, écrire un avertissement en commentaire de tête du fichier pivot et continuer.
