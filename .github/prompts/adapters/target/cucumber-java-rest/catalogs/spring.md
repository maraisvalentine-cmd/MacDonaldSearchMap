# Catalogue framework : Spring (Spring Boot)

Utilisé quand `api.framework` vaut `spring` ou quand `spring-boot-starter-web*` est détecté.

## Dépendances de test

| Besoin | Dépendance |
|---|---|
| Moteur Cucumber | `io.cucumber:cucumber-junit-platform-engine` |
| Étapes | `io.cucumber:cucumber-java` |
| Injection Spring | `io.cucumber:cucumber-spring` |
| Suite JUnit | `org.junit.platform:junit-platform-suite` |
| Client REST | `io.rest-assured:rest-assured` (défaut des templates) ; à défaut, `RestTestClient` (Spring Framework 7), `TestRestTemplate` ou `MockMvc` si le projet les utilise déjà |
| Attente asynchrone | `org.awaitility:awaitility` (seulement si besoin) |

Versions : les lire dans le `pom.xml` / `build.gradle` (propriétés, BOM Spring Boot) ; sinon les résoudre à la
source. Cucumber-JVM, JUnit Platform et REST Assured ne sont pas tous gérés par le BOM Spring Boot : vérifier.

## Runner

Classe `@Suite` avec `@IncludeEngines("cucumber")`, `@SelectDirectories("<dossier des features>")` ou
`@SelectClasspathResource("features")`, et `@ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "<package>")`.
Template : `templates/spring/CucumberTest.java`.

## Contexte Spring

Une classe `@CucumberContextConfiguration` + `@SpringBootTest(classes = <App>, webEnvironment = RANDOM_PORT)`
(+ `@ActiveProfiles("test")` si le projet a un profil de test) démarre l'application. `cucumber-spring`
résout les dépendances des classes d'étapes par constructeur. Le port aléatoire est injecté avec
`@LocalServerPort` (package selon la version de Spring Boot : vérifier l'import dans la version du projet).
Template : `templates/spring/CucumberConfiguration.java`.

## Base de données

Le plus souvent Testcontainers (`jdbc:tc:postgresql:<version>`) ou une base embarquée. Le nettoyage découvre
les tables de la `DataSource` au lieu de les nommer. Attention aux traitements `@Async` en cours qui peuvent
verrouiller un `TRUNCATE` : attendre leur fin avant de vider.
Template : `templates/spring/DatabaseCleaner.java`.

## Authentification de test

À détecter, par ordre de fréquence :
1. **Faux fournisseur d'identité** (WireMock sur port fixe) qui publie ses clés et signe les jetons de test.
2. **Clé de signature statique** déclarée dans le profil de test (`spring.security.oauth2.resourceserver.jwt.*`).
3. Rôle porté par un claim personnalisé : lire le `JwtAuthenticationConverter` pour le nom du claim.

`@WithMockUser` ne s'applique pas à un test `RANDOM_PORT` (requêtes réelles) : utiliser un vrai jeton.
Template : `templates/common/AuthenticationSteps.java` (le fournisseur de jetons reste à brancher).

## Pièges

- `@Suite(failIfNoTests = false)` (absent du template) rendrait le build vert sans aucun test si le sélecteur de dossier est faux : ne pas l'ajouter.
- `-Dcucumber.features=<chemin>.feature` et `<chemin>.feature:<ligne>` sont acceptés avec une `@Suite` + `@SelectDirectories` et restreignent le run ; un chemin invalide fait échouer la découverte (exit non nul). Surefire affiche `Tests run: 0` pour la classe `@Suite` mais le total final est exact.
- Features en français : utiliser les annotations `io.cucumber.java.fr.*` (`@Soit`, `@Quand`, `@Alors`) et `# language: fr` en **première ligne**.
- `DatabaseCleaner` : voir `templates/spring/DatabaseCleaner.java` (PostgreSQL et H2).

- **surefire / failsafe ≥ 3.6.0** avec une `@Suite` (le BOM Spring Boot en fournit une plus ancienne : surcharger la propriété `maven-surefire-plugin.version` et, si utilisé, `maven-failsafe-plugin.version`) : vérifié sur un projet minimal (Cucumber 8.0.4, JUnit Platform 6.1.3), la version 3.5.3 rapporte `Tests run: 0` et un build vert malgré des scénarios en échec ; la 3.6.0 les rapporte. Contrôler avec un scénario volontairement cassé.

- Dossier des features hors `src/test/resources` : le référencer par chemin de fichier (`@SelectDirectories`).
- Le contexte Spring est mis en cache entre scénarios : réinitialiser l'état par `@Before`, pas par un nouveau contexte.
- Une classe d'étapes n'a pas besoin d'annotation Spring si `cucumber-spring` est actif (glue) ; elle reçoit ses
  dépendances par constructeur.
