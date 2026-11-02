---
name: react-components-extract
---

# Adapter source `react-components` — écrire les scénarios Gherkin à partir du code React

Tu **génères** les scénarios de test à partir du **code** (composants JSX/TSX, routes, appels HTTP),
et tu émets `pipeline/pivot.json` (conforme à `engine/contracts/pivot.schema.json`) + les `.feature`
annotés. Le pivot porte les sélecteurs : le target ne les devine pas.

Tu ne modifies PAS les composants : tu lis, tu déduis, tu écris des `.feature` + le pivot.

## Étape -1 — Mode d'exécution

Chercher `.shugyo.yaml` (jusqu'à 5 niveaux). Si présent → **mode orchestré**, lire :
- `paths.front_root`, `paths.app_root` (défaut `src`), `paths.routing_file` (optionnel)
- `scope` (optionnel, cf. Étape 1)
- `gherkin.pivot_json_output` (défaut `pipeline/pivot.json`), `paths.features_output_dir`

Sinon → **mode interactif** : demander `front_root`, `app_root` et le scope éventuel.

## Étape 1 — Résoudre le périmètre (scope)

Lire le bloc `scope:` (cf. `engine/contracts/_pipeline-context-schema.md`). Cet adapter accepte
`scope.selector ∈ { routes, component }` :

- `routes` + `include: ["/organizations", …]` → ces routes, **+ leurs routes enfants** si
  `recurse_children: true` (défaut).
- `component` + `include: ["OrganizationsComponent", …]` → ces composants comme racines.
- **Aucun `scope:`** → toute l'app.

Le périmètre **borne l'analyse de l'Étape 2**.

## Étape 2 — Analyser le code

### 2.1 — Structure et routes

1. Détecter la structure (feature-based, hexagonale `primary/` + `secondary/`, plate…) et la présenter
   avant de continuer. Ne jamais supposer une architecture.
2. Localiser les routes : `paths.routing_file`, sinon chercher `createBrowserRouter`, `createRoutesFromElements`,
   `<Routes>`, `<Route`, `useRoutes(`. Le routeur peut être dans `main.tsx` ou `App.tsx`.
3. Résoudre **récursivement** :
   - routes imbriquées : `<Route element={<Layout />}>` avec `<Route path=… />` enfants, `children: [...]`,
     `index` ; une route de layout ne produit pas de scénario propre, elle fournit le contexte aux enfants ;
   - composants **lazy** : `lazy(() => import('…'))`, y compris avec re-export nommé
     (`const { X } = await import(...); return { default: X }`) ;
   - redirections (`<Navigate>`) et routes protégées (garde, composant d'authentification, `loader` qui redirige).
4. Produire la carte des routes (route -> composant racine -> composants enfants).

### 2.2 — Éléments testables par composant

Lire le composant racine de chaque route du périmètre et ses composants enfants (suivre les imports
locaux, pas `node_modules`). Recenser :
- champs de saisie, boutons, liens, cases à cocher, listes déroulantes ;
- rendu conditionnel (`cond && <X />`, ternaire, retour anticipé) ;
- listes (`.map(`) ;
- navigation (`<Link to>`, `<NavLink>`, `navigate(...)`, `<a href>`).

Le rendu conditionnel est parfois masqué : états de chargement ou d'erreur d'un hook (`useLoader`, `useQuery`),
composants wrapper (`<LoaderComponent>`), callbacks `onSuccess`. Les suivre jusqu'au rendu final.

**Composants d'une librairie UI.** Un composant de librairie (`<Button dataSelector="…">`) peut recevoir un prop
qui devient l'attribut de test, et dériver des sélecteurs enfants absents du source (`….control.input`,
`….option.KEY`). Chercher d'abord ces sélecteurs dans les tests e2e et fixtures existants du projet, puis
dans `node_modules/<lib>` ; à défaut, `# TODO(testid)`.

### 2.3 — Appels HTTP

Pour chaque page, tracer les appels déclenchés au chargement et par les interactions :
- `fetch`, `axios`, `ky`, ou un client maison (en architecture hexagonale, les classes `*Http` de `secondary/`) ;
- hooks de données : `useQuery` / `useMutation` (React Query), `createApi` (RTK Query), `loader` / `action` d'un routeur de données ;
- appels des gardes de route actifs.

Pour chaque appel, noter méthode, URL et **où passent les paramètres** (query string vs corps), car les
intercepts conditionnels du target en dépendent. Ces appels sont tous à stubber dans les tests.

### 2.4 — Plan, brouillons et validation

Appliquer les sections **6** (plan de rattrapage priorisé, lot par lot) et **7** (rédaction des scénarios
avec l'avertissement « brouillon dérivé du code ») du skill `.github/skills/cypress-analyze-source/SKILL.md` : elles ne dépendent
pas du framework. **Attendre la validation explicite de l'utilisateur** avant d'émettre le pivot. Sans interlocuteur
(exécution non interactive), émettre quand même le pivot et le signaler en `warnings` :
« scénarios non validés ».

> Les sections 1 à 5 du skill sont propres à Angular : ne pas les suivre.

## Étape 3 — Structurer le résultat en `pivot.json`

- **`steps[]`** : un par page ou composant racine de route (slug en kebab-case, label humain). Une modale ou
  un panneau ouvert depuis une page appartient à l'étape de cette page, sauf s'il a assez de contenu propre
  pour justifier la sienne. `covers_step` d'un scénario = slug de cette étape.
- **`fields[]`** : un par élément interactif, plus chaque élément dont un scénario vérifie la présence ou le
  contenu. `technical_name` en snake_case préfixé par le slug de l'étape (`rules_search`). Un élément répété
  par `.map(` donne **un seul** champ, au sélecteur commun : le target choisit la ligne par texte ou par index.
  `label` = libellé visible, à défaut le `technical_name`. `required: true` seulement si le code l'impose
  (`required`, validation). `render.selector` = **la convention réellement utilisée dans le
  code**, par ordre de préférence :
  1. l'attribut `data-*` de test du projet **quel qu'il soit** (`data-selector`, `data-testid`, `data-cy`…).
     Repérer lequel est employé, **ne pas présumer `data-testid`**. Si une config Testing Library
     (`testIdAttribute`) existe, elle le désigne ;
  2. `#id` stable (rejeter les id construits dynamiquement : `id={`row-${i}`}`) ;
  3. `[name=…]` ou `[aria-label=…]` pour un champ de formulaire ;
  4. pour un bouton ou un lien sans attribut stable, un **sélecteur textuel** sur le libellé visible
     (attention aux libellés internationalisés : `t('key')` -> lire la valeur dans le fichier de traduction,
     et noter la langue dans un commentaire du `.feature`) ;
  5. en dernier recours, balise + classe + `# TODO(testid)`.

  `render.interaction_method` selon l'élément :

  | Élément | interaction_method |
  |---|---|
  | `<input>` / `<textarea>` (`onChange`) | `type` |
  | `<button>`, `onClick` | `click` |
  | `<select>` ou composant de liste déroulante | `select` |
  | `<input type=checkbox|radio>` | `check` |
  | `<Link>`, `<NavLink>`, `navigate(...)` | `navigate` |
  | `<a href>` | `click` |
  | `<input type=file>` | `upload` |
  | titre, compteur, texte : élément seulement vérifié | `assert-visible` |

  `fixture_field_path` : `[technical_name].value` par défaut.
- **`scenarios_index[]`** + `.feature` (ceux validés à l'Étape 2.4), catégorie déduite :
  `nominal` / `conditionnel` (rendu conditionnel) / `liste` (`.map`) / `navigation` (`Link`, `navigate`).
  Les appels HTTP recensés deviennent des annotations `# intercept-required:`.
- **`scenarios_to_generate`** : compteurs par catégorie.

Chaque scénario porte les annotations `# composant:`, `# selector:`, `# route:` (si navigation),
`# intercept-required:` (si HTTP), `# [CATEGORY]`, `# champ:` (cf. `annotations.md` et
`engine/contracts/_annotations-base.md`).

> ⚠️ **Phrasé des steps** : le texte d'un step Gherkin ne doit PAS contenir de caractère spécial aux
> Cucumber Expressions, surtout `/` (une URL), ni `( ) { }`. Mettre l'endpoint dans l'annotation
> `# intercept-required: GET /api/users` et phraser le step sans URL.

## Étape 4 — Validation et retour

Valider le pivot contre `engine/contracts/pivot.schema.json` (JSON Schema Draft 2020-12 : prendre un validateur qui le supporte, par ex. `jsonschema` >= 4 en Python ou `ajv` 2020) et les invariants de
`engine/contracts/_pivot-json-format.md`. Terminer par le bloc
`===PIPELINE-RETURN-START=== … ===PIPELINE-RETURN-END===` (`agent: "react-components-extract"`,
`artifacts.pivot_file`, `artifacts.scope` = périmètre résolu, `artifacts.scenarios_count`,
`warnings` pour chaque `# TODO(testid)` émis).
