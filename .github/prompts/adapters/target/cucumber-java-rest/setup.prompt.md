---
name: cucumber-java-rest-setup
---

# Adapter target `cucumber-java-rest` : setup de l'infrastructure Cucumber

Préalable à `generate`. Tu **détectes** l'infrastructure Cucumber déjà présente dans le projet et tu ne génères
**que ce qui manque**. Tu ne modifies jamais un fichier existant sans l'annoncer, et tu n'imposes aucune
convention : tu t'alignes sur celles du projet.

## Étape -1 : mode orchestré

Détecter `.shugyo.yaml` (cf. `engine/contracts/_pipeline-context-schema.md`). Lire `paths.front_root`,
`paths.steps_output_dir`, `paths.features_output_dir`, `api.framework`, `java.build_tool`, `run.command`.

## Étape 1 : détecter le contexte

1. **Outil de build** : `pom.xml` (Maven) ou `build.gradle[.kts]` (Gradle) ; wrapper `mvnw` / `gradlew` s'il existe.
2. **Framework** : `api.framework` s'il est fixé (`spring-mvc` côté source se lit `spring` ici), sinon dépendances (`spring-boot-starter-web*`,
   `quarkus-rest*` / `quarkus-resteasy*`). Charger **uniquement** le catalogue correspondant :
   `catalogs/spring.md` ou `catalogs/quarkus.md`. Relever les **versions** de Java et du framework.
3. **Package de base** : celui de la classe d'application (`@SpringBootApplication`) ou le préfixe commun des
   contrôleurs.
4. **Base de données** : présence d'une `DataSource` (JPA, JDBC, Liquibase, Flyway) ; stratégie de test
   (Testcontainers, base embarquée, Dev Services Quarkus).
5. **Authentification de test** : comment le projet fabrique ses jetons de test (clé de signature statique,
   faux fournisseur d'identité, utilisateur simulé) ; le catalogue du framework liste les cas.

Présenter ce constat avant de générer quoi que ce soit.

## Étape 2 : inventaire de l'infrastructure existante

Chercher dans `src/test/java` et `src/test/resources` chaque composant ci-dessous (par rôle, **pas par nom**) :

| Composant | Rôle | Signal de détection |
|---|---|---|
| Runner | lance les features | `@Suite` + `@IncludeEngines("cucumber")`, `Main.run`, `@TestFactory` + `CucumberExecutionContext`, ou `@RunWith(Cucumber.class)` |
| Configuration de contexte | démarre l'application pour les scénarios | `@CucumberContextConfiguration`, `ObjectFactory` (`META-INF/services` ou classe interne du runner) |
| Contexte de scénario | état partagé entre steps | classe avec `Map` statique ou `ScenarioScope` |
| Client REST | émet les requêtes | usage de REST Assured, `RestTestClient`, `TestRestTemplate`, `MockMvc` dans des steps |
| Contexte de réponses | garde les réponses pour les assertions | classe qui enregistre les `Response` |
| Authentification | pose l'identité | step « logged in » ou équivalent |
| Nettoyage de la base | repart d'un état connu | `TRUNCATE`, `@Before` qui vide les tables |
| Dépendances | bibliothèques Cucumber / REST | `pom.xml`, `build.gradle` |

Pour chaque composant : `présent` (alors l'utiliser tel quel, noter son nom et son API), `partiel` ou
`absent`.

## Étape 3 : générer ce qui manque

Pour chaque composant `absent` ou `partiel`, instancier le template du dossier `templates/` (`common/` puis
`spring/` ou `quarkus/`), en remplaçant :

- `__PACKAGE__` : package de base ; `__PACKAGE_PATH__` : le même avec des `/` ;
- `__APP_CLASS__` : classe d'application Spring (inutile pour Quarkus).

Règles :
- Emplacement : celui des fichiers de test existants (`paths.steps_output_dir`, défaut `src/test/java`). Sinon `src/test/java/__PACKAGE_PATH__/shared/cucumber/`
  pour l'infrastructure, et `<contexte>/infrastructure/primary` pour les classes d'étapes (convention
  hexagonale) si le projet l'applique, sinon `steps/`.
- **Aucun mot du domaine** dans l'infrastructure partagée : elle sert tous les contextes.
- Le client REST ne connaît ni chemin ni vocabulaire métier ; les classes d'étapes portent les chemins et le
  vocabulaire.
- Ne jamais écrire deux step definitions avec la même expression (Cucumber lève `DuplicateStepDefinition`).
- Ne pas générer le nettoyage de base s'il n'y a pas de base. Le `DatabaseCleaner` du template gère PostgreSQL et H2 ;
  pour une autre base, adapter la requête de tables et la façon de vider, puis **vérifier au premier run que des
  tables sont bien trouvées** (un nettoyage qui ne trouve rien ne fait aucune erreur et la suite reste verte sans isolation).
- Ne pas générer l'authentification si l'API est publique (aucun `http.security.authenticated: true` dans le pivot) :
  ne pas générer `AuthenticationSteps` ni `TestTokens`, et retirer du client REST les lignes marquées `// @auth` (import, ajout du filtre de jeton) et les blocs
  `// @auth-begin` … `// @auth-end`.
- Spring : retirer `@ActiveProfiles("test")` de la configuration si le projet n'a pas de profil de test.
- Si le projet a un formateur ou un contrôle de style (spotless, checkstyle), le lancer sur les fichiers générés.
- Où le template contient un `TODO`, **demander** à l'utilisateur ou lire le projet : ne pas inventer
  (par ex. `TestTokens`, qui fabrique les jetons de test).

## Étape 4 : dépendances et configuration de build

Ajouter, **seulement si absentes**, les dépendances de test listées dans le catalogue du framework
(Cucumber-JVM, REST Assured, JUnit Platform Suite selon le cas). **Résoudre les versions à la source**
(BOM du framework, sinon `maven-metadata.xml` de l'artefact sur `repo1.maven.org` : l'index de recherche
`search.maven.org` peut être en retard, et `start.spring.io` peut annoncer une version absente de Central) ; ne pas recopier les versions des templates. Si le projet sépare
tests unitaires et tests d'intégration par nom (surefire / failsafe), nommer et configurer le runner selon
cette règle.

**Plugins de test** : avec un runner `@Suite`, surefire / failsafe doivent être en version 3.6.0 ou plus (voir
`catalogs/spring.md`, pièges). Après le setup, un scénario volontairement cassé doit faire échouer le build.

Configurer le plugin de rapport JSON, utilisé par `feedback-loop` :
`cucumber.plugin=pretty, json:target/cucumber-reports/cucumber.json` (`src/test/resources/junit-platform.properties`
pour une Suite, argument `--plugin` de `Main.run`, ou plugin ajouté par le runner Quarkus du template). Adapter `target/` à Gradle (`build/`).

## Étape 5 : commande de run

Choisir `run.command` d'après l'outil de build et le runner détectés, puis l'écrire dans `.shugyo.yaml` :

| Outil | Commande type |
|---|---|
| Maven | `./mvnw -B test -Dtest=<Runner>` (surefire) ou `./mvnw -B verify -Dit.test=<Runner>` (failsafe) |
| Gradle | `./gradlew test --tests '*<Runner>'` |

Utiliser `mvn` / `gradle` si le wrapper est absent. Mettre `feedback.reports_dir` en cohérence avec le
dossier du rapport JSON.

## Étape 6 : retour

Terminer par le bloc `===PIPELINE-RETURN-START=== … ===PIPELINE-RETURN-END===`
(`agent: "cucumber-java-rest-setup"`, `artifacts.framework`, `artifacts.build_tool`,
`artifacts.infrastructure` = état de chaque composant (`present` / `generated` / `skipped`),
`artifacts.files_generated`, `artifacts.run_command`, `warnings` pour chaque `TODO` laissé).
