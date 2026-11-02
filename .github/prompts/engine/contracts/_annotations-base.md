# Vocabulaire d'annotations Gherkin — base (générique)

Annotations (commentaires `#` dans les `.feature`) comprises par **tous** les profils.
Un adapter source peut ÉTENDRE ce vocabulaire via `manifest.provides.annotations` (fichier
listant ses annotations supplémentaires). `verify-adapter` (Étape 3bis) considère comme
valide toute annotation ∈ (base ∪ extensions déclarées) ; le reste devient un warning.

## Annotations de base

| Annotation | Sur | Rôle |
|---|---|---|
| `# champ:` | un scénario | `technical_name` (ou libellé) de l'unité testée → alimente `scenarios_index[].covers_field` |
| `# étape:` | un scénario | groupement/section → alimente `scenarios_index[].covers_step` |
| `# [CATEGORY]` | un scénario | catégorie de scénario → alimente `scenarios_index[].category`. La taxonomie des catégories valides est déclarée par le profil (`catalogs/scenario-groups.yaml`) ; le profil `default` n'a que `nominal`. |

> Ces trois annotations suffisent à l'agent générique `audit-coverage` pour faire le mapping
> inverse champ/catégorie → scénarios. Tout le reste (rendu, fixtures, intercepts…) est propre
> à un profil et vit dans son fichier d'annotations d'adapter.
