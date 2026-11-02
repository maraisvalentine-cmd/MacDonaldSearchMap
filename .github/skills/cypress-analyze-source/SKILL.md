---
name: cypress-analyze-source
description: "Analyse le code source Angular pour détecter la structure, les routes, les appels HTTP et rédiger des scénarios Gherkin brouillon. Utiliser quand aucun fichier .feature n'est fourni par l'utilisateur."
---

# Analyse du code source pour génération de scénarios Gherkin

> **Rôle dans le pipeline shugyo** : c'est le « cerveau » d'analyse from-code réutilisé par
> l'adapter source `angular-components` (`.github/prompts/adapters/source/angular-components/`),
> qui structure ensuite cette sortie en `pivot.json`. Utilisable aussi seul, hors pipeline.
> Les sections 6 (plan de rattrapage) et 7 (rédaction des scénarios) sont indépendantes du framework
> et réutilisées par `react-components` ; les sections 1 à 5 sont propres à Angular.

Ce skill analyse le code source d'une application Angular pour identifier les fonctionnalités testables et rédiger des scénarios Gherkin en français.

**⚠️ AVERTISSEMENT IMPORTANT :**
Les scénarios produits par ce skill sont des **brouillons dérivés du code existant**, pas des spécifications métier. Ils décrivent ce que le code fait actuellement, pas nécessairement ce qu'il devrait faire. Un bug dans le code sera documenté comme un comportement "normal" dans le scénario.

**L'utilisateur DOIT valider et corriger chaque scénario avant implémentation.** Ne jamais passer à l'implémentation des steps sans validation explicite.

---

## 1 — Détection de la structure du projet

Avant d'analyser le code source, détecter la structure réelle du projet. Ne jamais supposer une architecture hexagonale par défaut.

Chercher les patterns suivants dans `src/app/` :

| Pattern trouvé                                            | Architecture détectée |
| --------------------------------------------------------- | --------------------- |
| Dossiers `infrastructure/`, `domain/`, `application/`     | Hexagonale            |
| Dossiers `components/`, `services/`, `pages/` ou `views/` | Classique Angular     |
| Dossiers `features/` avec sous-dossiers par domaine       | Feature-based         |
| Structure plate (composants à la racine de `src/app/`)    | Minimaliste           |

Adapter la suite de l'analyse à la structure détectée. Présenter la structure détectée à l'utilisateur avant de continuer.

---

## 2 — Découverte exhaustive des routes (y compris lazy-loaded)

Ne pas se limiter à `app.routes.ts` ou `app-routing.module.ts`. Les routes enfants sont souvent définies dans des fichiers séparés.

Procéder en deux passes :

**Passe 1 — Point d'entrée :**

- Lire le fichier de routes racine. **Le nom varie** : `src/app/app.routes.ts`, `app-routing.module.ts`,
  **`app.route.ts`** (singulier), ou tout fichier exportant `const routes: Routes = […]`.
  En cas de doute, chercher `: Routes` / `RouterModule.forRoot` / `provideRouter(` dans `src/app/`.
- Repérer les entrées avec `loadChildren`/`loadComponent` (lazy) **et** `component:` (eager) — les deux existent.

**Passe 2 — Routes lazy-loaded :**

- Pour chaque `loadChildren(() => import('./[module]').then(...))`, lire le fichier de routing correspondant (`[module]-routing.module.ts` ou `[module].routes.ts`)
- Répéter récursivement jusqu'à avoir couvert toutes les routes feuilles

Produire la carte complète des routes :

```
/ → HomeComponent
/todo → TodoListComponent (lazy)
  /todo/:id → TodoDetailComponent
  /todo/new → TodoFormComponent
/admin → AdminComponent (lazy, guards: [AuthGuard, AdminGuard])
```

---

## 3 — Analyse des composants par structure détectée

Adapter selon la structure détectée en 1 :

| Architecture  | Où chercher les templates                                     | Où chercher les services    |
| ------------- | ------------------------------------------------------------- | --------------------------- |
| Hexagonale    | `infrastructure/primary/**/*.component.html`                  | `infrastructure/secondary/` |
| Classique     | `components/**/*.component.html`, `pages/**/*.component.html` | `services/**/*.service.ts`  |
| Feature-based | `features/**/*.component.html`                                | `features/**/*.service.ts`  |
| Minimaliste   | `**/*.component.html` (depuis `src/app/`)                     | `**/*.service.ts`           |

Pour chaque page/route identifiée, lire le composant associé et ses dépendances directes.

Cas à ne pas manquer : composants à **template inline** (`template: \`…\`` dans le `.ts`, pas de `.html`) et
syntaxe de contrôle de flux moderne (`@if`, `@for`, `@switch`, `@defer`) en plus de `*ngIf` / `*ngFor`.

---

## 4 — Recensement exhaustif des appels HTTP

Pour chaque page, tracer tous les appels `HttpClient` effectués au chargement et lors des interactions :

- Chercher `this.http.get`, `this.http.post`, `this.http.put`, `this.http.delete` dans les services injectés
- Inclure les appels déclenchés par les interactions utilisateur (clics, soumissions de formulaire)
- Inclure les appels des guards actifs sur la route

Ces appels **doivent tous être interceptés** dans les tests — aucun ne doit passer à travers. Produire la liste complète par page, en précisant pour chaque appel **où passent les paramètres** (URL query params vs corps de la requête) — cette information est indispensable pour écrire des intercepts conditionnels corrects :

```
Page /todo :
  Chargement :
    - GET /api/todos → fixture: todo/todoList
      params: ?status=ACTIVE (query param → détectable via req.url)
  Interactions :
    - POST /api/todos → fixture: todo/todoCreate
      params: { title, completed } (body → détectable via req.body)
    - DELETE /api/todos/:id → 204 (pas de fixture)
      params: id dans l'URL
Page /todo/:id :
  Chargement :
    - GET /api/todos/:id → fixture: todo/todoDetail
```

Déduire de cette liste le préfixe API commun (ex: `/api/`) pour le catch-all.

---

## 5 — Données de test disponibles

Selon la structure détectée :

| Architecture              | Où chercher                                               |
| ------------------------- | --------------------------------------------------------- |
| Hexagonale                | Repositories `InMemory*` dans `infrastructure/secondary/` |
| Classique / Feature-based | Fichiers `*.mock.ts`, `*.stub.ts`, `*.fixture.ts`         |
| Minimaliste               | Variables hardcodées dans les composants ou services      |

Ces données servent de base pour générer les fixtures JSON.

---

## 6 — Priorisation et plan de rattrapage

Sur un projet avec plusieurs pages, ne pas tout générer d'un coup. Produire un plan priorisé et le valider avec l'utilisateur avant de continuer.

Critères de priorisation (dans l'ordre) :

1. **Parcours critiques** : pages sans lesquelles l'application est inutilisable
2. **Volume d'utilisation** : pages les plus fréquentées (si l'information est disponible)
3. **Risque** : pages avec le plus d'interactions et d'appels HTTP
4. **Complexité** : commencer par les pages simples pour valider la mise en place

Présenter le plan à l'utilisateur :

```
📋 Plan de rattrapage proposé (X pages détectées) :

Lot 1 — Parcours critiques (à faire en premier) :
  - /todo → TodoListComponent (3 appels HTTP)
  - /todo/:id → TodoDetailComponent (1 appel HTTP)

Lot 2 — Pages secondaires :
  - /admin → AdminComponent (5 appels HTTP)

→ On commence par quel lot ?
```

**Attendre la validation de l'utilisateur avant de générer les scénarios.** Travailler lot par lot, pas tout en une fois.

---

## 7 — Rédaction des scénarios

Pour chaque page du lot validé, rédiger des scénarios couvrant :

- L'affichage initial (section principale, titres, éléments clés)
- Les interactions utilisateur (recherche, navigation, clics, soumissions)
- Les cas limites (liste vide, élément introuvable, navigation entre pages)
- Les cas d'erreur API (500, 404) pour les appels critiques identifiés en 4

**⚠️ Rappel : ces scénarios sont des brouillons dérivés du code.** Présenter à l'utilisateur avec cet avertissement :

```
📋 Scénarios proposés pour [page] :
⚠️ Ces scénarios reflètent le comportement actuel du code, 
   pas nécessairement le comportement attendu.
   Vérifiez chaque scénario avant validation.

[scénarios...]

→ Validez, modifiez ou supprimez les scénarios avant que je les implémente.
```

**Attendre la validation explicite de l'utilisateur avant de retourner au prompt principal.**

---

## Checklist de validation du skill

- [ ] Structure du projet détectée et présentée à l'utilisateur
- [ ] Toutes les routes recensées y compris lazy-loaded
- [ ] Tous les appels HTTP de chaque page recensés, avec la localisation des paramètres (URL vs body)
- [ ] Plan de rattrapage priorisé présenté et validé par l'utilisateur
- [ ] Scénarios présentés avec l'avertissement "brouillon dérivé du code"
- [ ] Validation explicite de l'utilisateur obtenue avant de retourner au prompt principal
