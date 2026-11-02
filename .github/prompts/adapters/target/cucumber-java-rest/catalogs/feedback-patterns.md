# Catalogue de patterns de fail : cucumber-java-rest (Cucumber-JVM, REST Assured)

Chargé par l'agent générique `feedback-loop` via `manifest.provides.catalogs.feedback_patterns`.
Rapport lu : `cucumber.json` (plugin `json`). Chaque pattern : signature, cause racine, action.

## Pattern A : step non défini
- **Signature** : step avec `result.status: undefined` ; log : `Undefined step` ou `You can implement this step`
- **Causes** : phrase Gherkin sans définition ; phrase modifiée sans mise à jour de la classe d'étapes ; glue hors du package scanné.
- **Action** : relancer `generate` pour la ressource ; vérifier le package de glue du runner.

## Pattern B : définitions dupliquées ou ambiguës
- **Signature** : `DuplicateStepDefinitionException` ou `AmbiguousStepDefinitionsException`
- **Causes** : même expression dans deux classes d'étapes (régénération, ou phrase déjà fournie par l'infrastructure).
- **Action** : garder une seule définition ; réutiliser celle de l'infrastructure partagée.

## Pattern C : expression Cucumber invalide
- **Signature** : `This Cucumber Expression has a problem` avec `Alternative may not be empty` ou un caret sous un `/`, `(` ou `{`
- **Causes** : expression contenant `/` (chemin), `( )` ou `{ }` littéraux.
- **Action** : échapper (`\/`) ou définir le step en regex ; ne pas mettre de chemin dans la phrase.

## Pattern D : statut HTTP inattendu
- **Signature** : `expected: 201 but was: 200` (ou 400, 404, 409…)
- **Causes** : statut attendu issu d'un `http.responses[]` périmé ; règle métier différente ; corps invalide.
- **Action** : relire `http.responses[]` et le gestionnaire d'exceptions ; corriger le statut attendu dans la table de refus.

## Pattern E : 404 sur tous les appels
- **Signature** : tous les scénarios échouent par 404 dès le premier `When`.
- **Causes** : chemin de base manquant (`server.servlet.context-path`, `@ApplicationPath`, `quarkus.http.root-path`) ; chemin du pivot sans préfixe.
- **Action** : aligner `http.path` sur le chemin de base effectif ; corriger le client REST.

## Pattern F : 401 ou 403 sur tous les appels
- **Signature** : tous les appels authentifiés échouent par 401 / 403.
- **Causes** : step d'identité absent du `Background` ; jeton mal signé ; claim de rôles différent de celui que lit l'application.
- **Action** : vérifier `AuthenticationSteps` et `TestTokens` ; comparer le claim de rôles avec la configuration de sécurité.

## Pattern G : JSONPath introuvable
- **Signature** : `expected: "x" but was: null`, ou `AssertionError` sur un champ de réponse.
- **Causes** : champ renommé ou absent de l'objet de réponse ; chemin JSON erroné ; réponse paginée (le tableau est sous `content`, `items`…).
- **Action** : lire l'objet `RestXxx` de la réponse ; corriger le chemin JSON.

## Pattern H : état de base résiduel
- **Signature** : `already exists`, violation de contrainte d'unicité dans un `Given`, ou résultats d'un scénario précédent.
- **Causes** : nettoyage de base non exécuté ou mal ordonné (`@Before` sans `order`) ; traitement asynchrone qui écrit après le nettoyage.
- **Action** : vérifier l'ordre des `@Before` ; attendre la fin des traitements asynchrones avant de vider.

## Pattern I : application non démarrée
- **Signature** : `Arc.container() is null`, `No qualifying bean`, `NullPointerException` à la première injection.
- **Causes** : Quarkus : runner en `@Suite` au lieu d'une `@TestFactory` dans un `@QuarkusTest` ; classe d'étapes ou de hooks sans `@Singleton @Unremovable`. Spring : `@CucumberContextConfiguration` absent ou sans `@SpringBootTest`.
- **Action** : revoir le runner et le contexte selon le catalogue du framework.

## Pattern J : 400 à la création (corps mal construit)
- **Signature** : `expected: 201 but was: 400` sur un `POST` / `PUT` avec `DataTable`.
- **Causes** : type mal converti (nombre envoyé en chaîne) ; cellule vide envoyée comme chaîne vide au lieu d'être omise ; champ obligatoire absent.
- **Action** : corriger la conversion du tableau d'après `http.request_body.fields`.

## Pattern K : scénario non exécuté
- **Signature** : `Tests run: 0` alors que des `.feature` existent, ou build vert malgré un step en échec.
- **Causes** : surefire / failsafe antérieur à 3.6.0 avec une `@Suite` (les scénarios ne sont pas rapportés) ; dossier de features mal référencé par le runner.
- **Action** : monter surefire / failsafe à 3.6.0 ou plus ; vérifier qu'un scénario volontairement cassé fait échouer le build.

## Pattern L : traitement asynchrone non attendu
- **Signature** : assertion qui échoue par intermittence juste après l'appel ; statut `IN_PROGRESS`.
- **Causes** : l'endpoint lance un traitement en arrière-plan ; l'étape `Then` lit trop tôt.
- **Action** : attendre avec Awaitility (condition sur un nouvel appel), jamais `Thread.sleep`.
