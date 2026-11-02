# Catalogue de patterns de fail : playwright (playwright-bdd)

Chargé par l'agent générique `feedback-loop` via `manifest.provides.catalogs.feedback_patterns`.
Signatures relevées sur de vrais rapports Playwright + `playwright-bdd`. Chaque pattern : signature, cause racine, action.
Le message d'un fail contient des séquences ANSI à retirer avant de comparer.

## Pattern A : strict mode violation (sélecteur ambigu)
- **Signature** : `strict mode violation: locator('…') resolved to N elements`
- **Causes** : `render.selector` non unique (liste, composant répété).
- **Action** : cibler par `.filter({ hasText })`, `.nth(i)` ou `.first()`, ou fiabiliser l'attribut de test avec un identifiant.

## Pattern B : élément introuvable
- **Signature** : `TimeoutError: locator.click: Timeout …ms exceeded` suivi de `waiting for locator('…')`
- **Causes** : sélecteur erroné ; attribut de test absent du rendu ; élément conditionnel non affiché (condition non remplie) ; page non encore chargée.
- **Action** : vérifier le sélecteur dans le code ; si conditionnel, ajouter le step qui remplit la condition avant l'action.

## Pattern C : navigation inattendue
- **Signature** : `expect(page).toHaveURL(expected) failed` avec `Expected pattern` et `Received string`
- **Causes** : `# route:` du pivot différent de la vraie route ; redirection (authentification, garde de route) ; navigation asynchrone.
- **Action** : corriger la route attendue ; si la page reçue est un login, voir le pattern F.

## Pattern D : requête non stubbée
- **Signature** : échec par timeout de chargement, données réelles à l'écran, ou `waitForRequest` / `waitForResponse` en timeout.
- **Causes** : `page.route(...)` posé **après** le `page.goto` ; motif d'URL qui ne correspond pas (préfixe d'API, query string) ; intercept absent du `.intercepts.ts`.
- **Action** : poser la route avant la navigation ; élargir le motif (`**/api/x*`) ; implémenter l'intercept manquant.

## Pattern E : step manquant
- **Signature** : `bddgen` : `Missing step definitions: N` avec un extrait `When('…', async ({}) => {…})` et `From: features/x.feature:L:C`
- **Causes** : phrase Gherkin sans définition ; phrase modifiée dans le `.feature` sans mise à jour des steps.
- **Action** : relancer `generate` pour la ressource concernée, ou ajouter le step avec l'expression exacte.

## Pattern F : redirection vers l'authentification
- **Signature** : `toHaveURL` reçoit une URL de login ; éléments de la page cible introuvables ; réponses 401.
- **Causes** : `storageState` absent ou périmé ; bypass d'authentification non activé dans le build de test.
- **Action** : vérifier le projet `setup` d'authentification et `use.storageState` (voir `setup.prompt.md`, étape 0).

## Pattern G : définitions multiples d'un step
- **Signature** : `bddgen` : `Multiple definitions matched scenario step.` avec les deux emplacements `steps/…:L`
- **Causes** : même expression définie dans deux fichiers (régénération sans nettoyage).
- **Action** : supprimer le doublon ; réutiliser une seule définition.

## Pattern H : serveur de test non démarré
- **Signature** : `Timed out waiting …ms from config.webServer` ou `ERR_CONNECTION_REFUSED`.
- **Causes** : `webServer.command` ou `url` erroné ; port occupé ; build trop long pour le délai par défaut.
- **Action** : corriger `command` et `url` ; ajouter `webServer.timeout` ; vérifier le port libre.

## Pattern I : flake sous charge
- **Signature** : échec intermittent (passe seul, échoue en suite complète) ; `Timeout 30000ms exceeded` sur un test entier.
- **Causes** : serveur de développement lent ; attente par `waitForTimeout` ; assertion sur un état transitoire.
- **Action** : remplacer l'attente fixe par une assertion `expect(locator)` qui réessaie ; augmenter `timeout` / `expect.timeout` ; activer `retries` en CI.

## Pattern J : élément non actionnable
- **Signature** : `Call log` avec `element is not visible`, `element is not enabled` ou `element intercepts pointer events`
- **Causes** : élément masqué ou recouvert (modale, bandeau, animation) ; bouton désactivé tant qu'un champ n'est pas rempli.
- **Action** : ajouter le step qui ferme le recouvrement ou remplit le champ requis ; attendre l'état (`toBeEnabled()`) avant l'action.
