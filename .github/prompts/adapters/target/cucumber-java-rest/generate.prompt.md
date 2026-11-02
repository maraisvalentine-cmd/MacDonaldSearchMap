---
name: cucumber-java-rest-generate
---

# Adapter target `cucumber-java-rest` : implémenter les scénarios (classes d'étapes Cucumber-JVM)

Tu **implémentes** les `.feature` métier en classes d'étapes Cucumber-JVM exécutables, en consommant le
`pivot.json` de `java-rest-controllers` : chaque champ est un endpoint avec son bloc `http` (méthode, chemin,
paramètres, corps, statuts). **Tu ne devines ni chemin ni statut.** Tu ne lances PAS les tests (c'est le
step `run`). L'infrastructure (runner, contexte, client REST, authentification) vient du step `setup`.

## Étape -1 : mode orchestré

Détecter `.shugyo.yaml`. Lire `paths.front_root`, `paths.features_output_dir`, `paths.steps_output_dir`,
`gherkin.pivot_json_output ?? "pipeline/pivot.json"`, `api.framework`.

## Étape 1 : charger le pivot et l'existant

1. Lire `fields[]` (endpoints : `render.selector`, `http.*`), `steps[]` (ressources),
   `scenarios_index[]` et `unit_test_candidates[]`.
2. Lister les **steps déjà définis** dans le projet (annotations `@Given`, `@When`, `@Then`, `@And`) et leur
   classe. Toute phrase déjà couverte est **réutilisée** : ne la redéfinir sous aucun prétexte.
3. Repérer l'infrastructure disponible (client REST, contexte de scénario, contexte de réponses,
   authentification, fixtures de données) : c'est elle que les classes d'étapes appellent.
   Le client REST offre `get`, `post`, `put`, `patch`, `delete` (un corps `String` part tel quel, utile pour un corps
   malformé), `postMultipart` et `addRequestInterceptor` ; le contexte de réponses offre `retry` (rejoue la dernière
   requête figée), `getUri`, `getResponse` et `getElement(ressource, jsonPath)` (réponse antérieure d'une ressource).

## Étape 2 : une classe d'étapes par ressource

Pour chaque `step` du pivot, créer (ou compléter) une classe `<Ressource>Steps` à l'emplacement où le projet
range ses étapes (par défaut `<contexte>/infrastructure/primary` en architecture hexagonale, sinon le dossier
des étapes existantes). Pour chaque phrase Gherkin des features de la ressource qui n'a pas de définition :

- **`@Given`** (état de départ) : poser les données par l'API (appel d'un autre endpoint du pivot) ou par la
  fixture de données du projet, jamais par du SQL en dur dans la classe d'étapes. Si la fixture manque, la
  créer dans le même package (`<Ressource>Fixture`) et y mettre le SQL ou les appels.
- **`@When`** (action) : appeler l'endpoint désigné par l'annotation `# endpoint:` du scénario, avec le
  client REST. Le chemin, les paramètres et le corps viennent de `fields[].http`. Les `DataTable` du Gherkin
  fournissent corps et critères.
- **`@Then`** (résultat) : vérifier le **comportement métier**, via le contexte de réponses.

**Le langage HTTP reste dans la classe d'étapes** : aucune phrase Gherkin ne cite un code, un chemin ou un
corps. Traduire dans le code :
- un refus métier -> statut et clé d'erreur : construire une table `refus métier -> (statut, clé)` à partir de
  `http.responses[]` et des gestionnaires d'exceptions. Elle reste dans la classe d'étapes tant qu'une seule
  ressource l'utilise ; dès que deux classes en ont besoin, la déplacer dans `shared/cucumber/rest` ;
- un résultat -> assertion sur le statut et sur un chemin JSON précis (JSONPath), jamais sur le corps entier.

Contraintes de code :
- Les `DataTable` se convertissent selon les types de `http.request_body.fields` (nombres, booléens,
  décimaux) et les cellules vides sont omises du corps. Cette conversion, ainsi que les accès base et les
  assertions de refus communs, vivent dans `shared/cucumber` dès que deux classes d'étapes en ont besoin.
- Un step qui retrouve une entité par son nom passe par la fixture de la ressource (`idOf(nom)`).
- Dépendances reçues **par le constructeur** (le catalogue du framework dit comment elles sont résolues) ;
  **aucun état dans les champs** de la classe : l'état de scénario passe par le contexte de scénario
  (statique, remis à zéro par un `@Before`).
- Pas de `Thread.sleep` : utiliser une attente avec condition (Awaitility) si une opération est asynchrone.
- Pas de commentaire qui répète le code.
- Suivre le style du projet (nommage, assertions : AssertJ ou JUnit, selon l'existant ; sans existant, JUnit, déjà présent).

- Le texte d'un step exclut le mot-clé **complet** : avec `Étant donné que`, le texte commence après « que ».
- Features en français : annotations `io.cucumber.java.fr.*` ; la première ligne du `.feature` est `# language: fr`.

> ⚠️ **Cucumber Expression** : si l'expression d'un step contient `/`, `( )` ou `{ }` littéraux, la définir
> en **regex** (`@Given("^…$")`) ; sinon elle est interprétée comme paramètre ou alternative.

## Étape 3 : authentification

Si un scénario porte `# auth:` ou si le `Background` contient une étape d'identité, vérifier que la phrase
existe (par ex. « I am logged in as admin ») ; sinon l'ajouter à la classe d'authentification du projet en
s'appuyant sur le fournisseur de jetons de test détecté au `setup`, qu'il faut étendre si le rôle demandé
(`reader`, utilisateur anonyme…) n'existe pas encore. Ne jamais utiliser de vrai fournisseur
d'identité.

## Étape 4 : ce qui n'est pas généré

- Aucun scénario, ni étape, pour les `unit_test_candidates` : les lister dans le return-block
  (`artifacts.unit_test_candidates`) pour que l'équipe les écrive en tests unitaires.
- Aucune étape pour un endpoint sans scénario.

## Étape 5 : retour

Terminer par le bloc `===PIPELINE-RETURN-START=== … ===PIPELINE-RETURN-END===`
(`agent: "cucumber-java-rest-generate"`, `artifacts.steps_files`, `artifacts.steps_reused`,
`artifacts.steps_generated`, `artifacts.unit_test_candidates`, `warnings` pour chaque phrase sans endpoint
résolu ou chaque refus dont le statut est incertain).
