# Catalogue framework : Quarkus

Utilisé quand `api.framework` vaut `quarkus` ou quand `quarkus-rest*` / `quarkus-resteasy*` est détecté.

## Dépendances de test

| Besoin | Dépendance |
|---|---|
| Étapes | `io.cucumber:cucumber-java` |
| Exécution | `io.cucumber:cucumber-core` (API du lanceur ; porte aussi les plugins `pretty`, `summary` et `json`) |
| Client REST | `io.rest-assured:rest-assured` (version gérée par le BOM Quarkus) |
| Jetons signés (si OIDC) | `io.quarkus:quarkus-test-security-jwt` ou `io.smallrye:smallrye-jwt-build` |
| Attente asynchrone | `org.awaitility:awaitility` (seulement si besoin) |

Versions : celles du BOM Quarkus quand il en gère ; sinon les résoudre à la source.

## Runner : une `@TestFactory` dans un `@QuarkusTest`

Une `@Suite` JUnit Platform **ne démarre pas** l'application Quarkus : l'extension `@QuarkusTest` ne s'applique
pas à une suite, et les scénarios échouent car le conteneur Arc n'existe pas. `Main.run` démarre l'application
mais rapporte un seul test JUnit pour toute la suite. Le runner est donc un `@QuarkusTest` dont une `@TestFactory`
découvre les scénarios avec l'API `cucumber-core` et produit un `DynamicTest` par scénario, nommé
« feature > scénario » : Surefire et l'IDE nomment le scénario en échec.

- Les plugins `pretty`, `summary` et `json:target/cucumber-reports/cucumber.json` sont ajoutés par défaut (le
  rapport JSON alimente `feedback-loop`) ; `cucumber.plugin` en ajoute d'autres.
- Les propriétés `cucumber.*` sont lues : `-Dcucumber.features=classpath:features/x.feature[:ligne]` (plusieurs
  séparés par des virgules), `-Dcucumber.filter.name=<regex>`, `-Dcucumber.filter.tags=<expression>`.
- La suite échoue avec `No Cucumber scenario was discovered` si la sélection est vide.
- Le cycle de vie passe par `CucumberExecutionContext` (`startTestRun`, hooks `BeforeAll`, `beforeFeature`, puis
  `finishTestRun` à la fermeture du flux de tests) : sans lui le rapport JSON n'est pas écrit.
- Surefire : `<statelessTestsetReporter implementation="org.apache.maven.plugin.surefire.extensions.junit5.JUnit5Xml30StatelessReporter"><usePhrasedTestCaseMethodName>true</usePhrasedTestCaseMethodName></statelessTestsetReporter>`
  dans la configuration du plugin, pour que le rapport XML porte le nom « feature > scénario ».

Template : `templates/quarkus/CucumberTest.java`. Écartées : `quarkus-cucumber` (options figées dans
`@CucumberOptions`, pas de sélection par propriété, échec sans nom de scénario, extension « experimental »)
et une Suite (voir plus haut).

## Injection dans les classes d'étapes

Les classes d'étapes et les hooks sont des beans CDI `@Singleton @Unremovable`, instanciés par le conteneur Arc ;
leurs dépendances arrivent par constructeur. Le runner contient une `ObjectFactory` minimale qui délègue à
`Arc.container().instance(type).get()` : pas de `META-INF/services`, pas de fabrique à écrire.
Les classes d'étapes sont donc des singletons : **aucun état dans leurs champs**.

## Hooks

Les `@Before` ont des `order` explicites (contexte, réponses, base) : l'ordre par défaut est indéterminé.
Template : `templates/quarkus/CucumberConfiguration.java`.

## Base de données

Dev Services (Testcontainers) en test. Le nettoyage découvre les tables du schéma `public` hors tables de
migration (`databasechangelog*`, `flyway_schema_history`).
Template : `templates/quarkus/DatabaseCleaner.java`.

## Authentification de test

En profil `%test`, `quarkus-oidc` (ou `smallrye-jwt`) valide les jetons avec une **clé publique statique** ; les
tests signent leurs jetons avec la clé privée correspondante et un claim de rôles (`roles`, ou le chemin défini
par `quarkus.oidc.roles.role-claim-path`). Ne jamais démarrer Keycloak pour ces tests. Le `setup` vérifie que
la paire de clés et les propriétés `%test` existent ; s'il manque quelque chose, il le signale sans le fabriquer.
Template : `templates/common/AuthenticationSteps.java`.

## Pièges

- Une fixture de données ou tout autre helper injecté dans une classe d'étapes doit être un bean `@Singleton @Unremovable`, comme `DatabaseCleaner` : Arc le résout par le point d'injection du constructeur.
- Les refus métier d'une ressource passent souvent par `@ServerExceptionMapper` : le lire pour établir statuts et clés de la table de refus.
- Features en français : annotations `io.cucumber.java.fr.*` et `# language: fr` en première ligne.

- Une classe d'étapes ou de hooks sans `@Singleton @Unremovable` n'est pas un bean : elle ne s'instancie pas (`Arc.container().instance(...)` renvoie `null`).
- Le `@Singleton` du nettoyage de base doit être `@Unremovable` : aucun point d'injection statique ne le référence.
- `rest-assured` n'a pas de port à configurer : Quarkus le fixe pour `@QuarkusTest`.
