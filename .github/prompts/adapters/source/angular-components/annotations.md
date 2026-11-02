# Vocabulaire d'annotations — adapter source `angular-components`

**Extension** du vocabulaire de base (`engine/contracts/_annotations-base.md`), propre au code Angular.
Déclaré via `manifest.provides.annotations`. Émis par `extract.prompt.md`, consommé par le target.

| Annotation | Rôle |
|---|---|
| `# composant:` | nom du composant Angular source du scénario (ex: `MesDossiersComponent`) |
| `# selector:` | sélecteur de l'élément testé — attribut `data-*` de test du projet **quel qu'il soit** (`data-selector`, `data-test`, `data-testid`, `data-cy`…), sinon `#id` stable / `[formControlName]` / balise+classe |
| `# route:` | route cible d'un scénario de navigation (ex: `/orders/detail`) |
| `# render:` | condition de rendu pour un élément conditionnel (`@if`/`*ngIf`) |
| `# intercept-required:` | endpoint appelé par un service injecté, à stubber |
| `# fixture-required:` | fixture JSON dont le scénario a besoin |
| `# [LISTE]`, `# [CONDITIONNEL]`, `# [NAVIGATION]` | catégories déduites du code (`@for`, `@if`, `routerLink`), en plus de `# [NOMINAL]` |
| `# TODO(testid):` | l'élément n'a pas de `data-testid` → sélecteur de repli, à fiabiliser |

> Le sélecteur canonique est `data-testid`. Un composant sans `data-testid` produit un `# TODO(testid)`
> (et un `warning` dans le return-block) : c'est un signal de fiabilisation, pas un blocage.
