# Catalogue de patterns de fail — cypress (Angular et React)

Chargé par l'agent générique `feedback-loop` via `manifest.provides.catalogs.feedback_patterns`.
Patterns de fail Cypress **indépendants du framework et d'une librairie de composants**. Chaque pattern : signature → cause racine → action.

## Pattern A — Élément introuvable
- **Signature** : `Timed out retrying … Expected to find element: [data-…], but never found it`
- **Causes** : sélecteur `render.selector` erroné ; `data-*` absent du template ; élément conditionnel non rendu (condition non remplie).
- **Action** : vérifier le `data-*` dans le template ; si conditionnel, ajouter le step qui remplit la condition avant l'assertion.

## Pattern B — Élément détaché du DOM
- **Signature** : `element is detached from the DOM` / `cy.click() failed because this element is detached`
- **Causes** : re-render (Angular : `@if`/`@for`, `signal` ; React : changement d'état ou de `key`) entre le `get` et l'action.
- **Action** : re-`cy.get()` juste avant l'action, ou `.should('be.visible')` avant `.click()` pour re-synchroniser.

## Pattern C — Intercept non stubbé / requête réelle
- **Signature** : test qui échoue par timeout de chargement, ou 401/500 réseau réel.
- **Causes** : `# intercept-required:` non implémenté dans `.intercepts.ts` ; alias `cy.wait('@x')` manquant.
- **Action** : ajouter/rétablir le `cy.intercept(...).as('x')` + `cy.wait('@x')` correspondant.

## Pattern D — Navigation non vérifiée / route inattendue
- **Signature** : `expected '/…' to include '/…'` après un clic de navigation.
- **Causes** : `# route:` du pivot ne correspond pas à la vraie route ; navigation asynchrone non attendue.
- **Action** : corriger la route attendue ; attendre `cy.url().should('include', route)`.

## Pattern E — Timing / flake sous charge
- **Signature** : échec intermittent (passe en isolation, échoue en full-suite).
- **Causes** : contention CPU + serveur de développement (`ng serve`, Vite), `defaultCommandTimeout` trop court.
- **Action** : augmenter `defaultCommandTimeout` / `pageLoadTimeout` ; activer `retries.runMode`.

## Pattern F — Sélecteur ambigu (multiple éléments)
- **Signature** : `cy.click() can only be called on a single element … found N`
- **Causes** : `render.selector` non unique (liste `@for` Angular, `.map` React).
- **Action** : cibler par `.eq(i)`/`.contains(...)`, ou fiabiliser le `data-*` avec un index/id.
