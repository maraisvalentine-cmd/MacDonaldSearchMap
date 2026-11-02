# Vocabulaire d'annotations — adapter source `react-components`

**Extension** du vocabulaire de base (`engine/contracts/_annotations-base.md`), propre au code React.
Déclaré via `manifest.provides.annotations`. Émis par `extract.prompt.md`, consommé par le target.

| Annotation | Rôle |
|---|---|
| `# composant:` | nom du composant React source du scénario (ex: `OrganizationsComponent`) |
| `# selector:` | sélecteur CSS de l'élément testé : attribut `data-*` de test **réellement employé par le projet** (`data-selector`, `data-testid`, `data-cy`…), sinon `#id` stable, `[name=…]`, `[aria-label=…]`, ou texte du libellé |
| `# route:` | route cible d'un scénario de navigation (ex: `/organizations/:id`) |
| `# render:` | condition de rendu d'un élément conditionnel (`cond && <X />`, ternaire, retour anticipé) |
| `# intercept-required:` | endpoint appelé (fetch, axios, React Query…), à stubber |
| `# fixture-required:` | fixture dont le scénario a besoin (JSON ou factory de test) |
| `# [LISTE]`, `# [CONDITIONNEL]`, `# [NAVIGATION]` | catégories déduites du code (`.map`, rendu conditionnel, `Link`/`navigate`), en plus de `# [NOMINAL]` |
| `# TODO(testid):` | l'élément n'a pas d'attribut de test → sélecteur de repli, à fiabiliser |

> Un élément sans attribut de test produit un `# TODO(testid)` et un `warning` dans le return-block :
> c'est un signal de fiabilisation, pas un blocage.
