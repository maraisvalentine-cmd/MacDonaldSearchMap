---
name: java-rest-controllers-extract
---

# Adapter source `java-rest-controllers` : écrire les scénarios Gherkin métier à partir des contrôleurs Java

Tu **génères** des scénarios de test métier à partir du **code** d'une API REST Java (Spring MVC ou
JAX-RS/Quarkus), et tu émets `pipeline/pivot.json` (conforme à `engine/contracts/pivot.schema.json` et
à `pivot.overlay.schema.json`) + les `.feature` annotés. Tu ne modifies PAS le code applicatif.

**Principe de rédaction.** Une feature décrit des comportements dans le vocabulaire du métier
(« la bière est ajoutée », « l'ajout est refusé : bière déjà au catalogue »). Aucun step ne cite un code
HTTP, un chemin ou un corps JSON : ils vivent dans la classe d'étapes du target et dans le pivot. Une feature
ne garde que les cas passants et les règles métier qui exigent le système réel ; un refus de saisie invalide
s'y montre par **un seul exemple**. Les cas limites techniques (bornes, longueurs, formats, champ absent,
refus d'autorisation) sont signalés comme **candidats à des tests unitaires** (`unit_test_candidates`) et
n'ont pas de scénario.

## Étape -1 : mode d'exécution

Chercher `.shugyo.yaml` (jusqu'à 5 niveaux). Si présent, **mode orchestré**, lire :
- `paths.front_root` (racine du projet testé), `paths.java_root` (défaut `src/main/java`), `paths.features_output_dir`
- `api.framework` (défaut `auto`), `scope` (optionnel, cf. Étape 1)
- `gherkin.pivot_json_output` (défaut `pipeline/pivot.json`)

Sinon, **mode interactif** : demander `front_root`, le scope éventuel, et confirmer le framework détecté.

## Étape 0 : détecter le framework et les conventions du projet

1. **Framework** : si `api.framework` est `auto`, regarder les dépendances (`pom.xml`, `build.gradle*` :
   `spring-boot-starter-web`, `quarkus-rest`, `quarkus-resteasy*`) puis les annotations
   (`@RestController` -> `catalogs/spring-mvc.md`, `@Path` sur une classe -> `catalogs/jax-rs.md`).
   Si les deux coexistent, traiter chaque contrôleur avec son catalogue. Charger **uniquement** les catalogues utiles.
2. **Features existantes** : chercher des `.feature` dans le projet (`src/test/resources`, `src/test/features`…, hors `target/` et dossiers de worktrees).
   Si elles existent :
   - adopter leur **emplacement** et la **langue** des mots-clés Gherkin (ajouter `# language:` seulement si
     le projet le fait) ; les annotations `# champ:`, `# étape:`, `# endpoint:`… gardent leur nom (vocabulaire du moteur) ;
   - **relire les scénarios et steps existants** : réutiliser leurs phrases telles quelles, et ne produire que
     les **manques** : comportements métier non couverts, jugés scénario par scénario (pas seulement par
     endpoint). Si les features existantes couvrent déjà le périmètre, n'émettre aucun scénario et le dire
     en `warnings` (« couverture déjà complète »). **Ne jamais écraser** un `.feature` existant ;
     écrire les compléments dans un nouveau fichier voisin, ou signaler l'ajout à faire dans le fichier existant ;
   - le glossaire du domaine (`CONTEXT.md`, `docs/`) se cherche dans le projet puis dans les dossiers parents
     jusqu'à la racine du dépôt.
   Sans feature existante, demander la langue (défaut : français) ; un fichier par ressource, nommé d'après son slug.
3. **Conventions** : détecter, ne rien imposer (organisation en contextes, suffixe `Resource` ou `Controller`,
   objets `RestXxx`).

## Étape 1 : résoudre le périmètre (scope)

`scope.selector ∈ { resource, package }` (déclaré dans `manifest.scope_selectors`) :
- `resource` + `include: ["RuleResource", …]` : ces classes de contrôleur.
- `package` + `include: ["fr.acme.rule"]` : tous les contrôleurs de ces packages et sous-packages.
- **Aucun `scope:`** : toute l'API.

## Étape 2 : analyser le code

Pour chaque contrôleur du périmètre (suivre le catalogue du framework) :

1. **Endpoints** : verbe, chemin complet (chemin de classe + méthode + **chemin de base effectif**), types de contenu.
2. **Paramètres** : chemin, query (avec défaut et caractère obligatoire), en-têtes, corps. Pour le corps,
   suivre le type (`record`, classe `RestXxx`) jusqu'à ses champs.
3. **Réponses** : statut nominal et statuts d'erreur possibles, en lisant les gestionnaires d'exceptions
   (`@ControllerAdvice`, `ExceptionMapper`…) et les exceptions levées par la couche application.
4. **Règles métier** : lire le service appelé et les objets du domaine : doublons, états interdits, tri,
   filtres, droits d'une organisation. C'est la matière des scénarios `regle_metier`.
5. **Validation** : annotations Bean Validation **et** validation par objets valeur du domaine
   (constructeurs qui lèvent une exception, `Assert.field(...)`, `toDomain()`) : lire la borne dans le code
   du constructeur. Ce sont les `unit_test_candidates` de kind
   `bounds`, `format`, `required-field`, `conversion`.
6. **Sécurité** : annotation sur la méthode ou la classe, configuration centralisée, ou vérification dans le
   service. Renseigner `http.security` : `authenticated`, `roles` (rôles **ou** autorités, par ex. une autorité
   d'organisation) et `checked_in` (liste de tous les niveaux où la sécurité s'applique : `config`, `controller`,
   `service`). Lire le service appelé pour établir les rôles. Les refus d'autorisation deviennent des
   `unit_test_candidates` de kind `authorization`, sauf si les features existantes les testent déjà en
   Cucumber : dans ce cas, garder un refus par type comme `refus_exemple`.
7. **Statuts inatteignables** : un statut qu'une couche en amont masque (un 404 que le contrôle d'accès
   précède par un 403) se signale dans `responses[].when`.

Présenter la structure détectée (framework, contextes, nombre d'endpoints par ressource) avant de continuer.

### Plan, brouillons et validation

Appliquer la section **6** du skill `.github/skills/cypress-analyze-source/SKILL.md` (plan de rattrapage lot
par lot, « ressource » pour « page ») avec l'ordre de priorité suivant : règles métier et endpoints d'écriture,
puis lectures et recherches, puis endpoints techniques. Appliquer aussi son avertissement « brouillon dérivé
du code » (section 7).
**Attendre la validation explicite de l'utilisateur** avant d'émettre le pivot. Sans interlocuteur
(exécution non interactive), émettre quand même le pivot et le signaler en `warnings` :
« scénarios non validés ».

## Étape 3 : structurer le résultat en `pivot.json`

- **`produit`** : nom du projet (`artifactId` du `pom.xml`, `rootProject.name` de Gradle).
- **`steps[]`** : un par ressource (contrôleur). `slug` en kebab-case dérivé du nom de classe sans le suffixe
  `Resource` / `Controller` ; `label` humain ; `order` croissant ; `fields` = ses endpoints.
- **`fields[]`** : un par endpoint.
  - `technical_name` : `<slug du step en snake_case>_<nom de méthode en snake_case>` (ex. `rule_list`), unique.
  - `label` : phrase humaine (« Lister les règles »).
  - `required` : `false` (la valeur n'a pas de sens pour un endpoint ; le schéma de base l'exige. Le caractère
    obligatoire d'un paramètre se lit dans `http.*[].required`).
  - `data_type` : `ENDPOINT`.
  - `render` : `{ "selector": "GET /api/organization-rules", "interaction_method": "http-call" }`
    (`selector` = `METHOD chemin complet`, tel que le client l'appellera).
  - `fixture_field_path` : `<technical_name>.value` (convention de base).
  - `http` : `method`, `path` (avec `{param}`), `path_params`, `query_params`, `headers`, `consumes`,
    `produces`, `request_body`, `responses[]` (`status`, `when`, `body_type`), `security`, `source` (fichier, ligne).
- **`unit_test_candidates[]`** (racine) : `endpoint`, `kind`, `detail` pour chaque cas limite écarté.
  Une règle d'état métier (ressource inconnue, double retrait, déjà dans l'état demandé) n'est **pas** un
  candidat unitaire : c'est un scénario `regle_metier`. `kind: other` reste pour ce qui ne rentre dans aucune
  autre valeur.
- **`scenarios_index[]`** : les scénarios **existants** qui exercent les endpoints du périmètre (leur `feature_file` existant) **et** les nouveaux, pour que `audit-coverage` voie la couverture complète. Le plafond de scénarios d'un lot ne compte que les nouveaux. Avec les `.feature` ; `category` = un `id` de `catalogs/scenario-groups.yaml`, tel quel
  (minuscules : `# [nominal]`). `feature_file` est relatif à `paths.front_root`.
- Un endpoint sans scénario propre (hors plafond de lot, ou couvert seulement en `Background`) est listé
  dans `warnings`, avec le préfixe `endpoint sans scénario :`. Une sécurité non établie porte le préfixe
  `sécurité non établie :`.
- **`scenarios_to_generate`** : compteurs par catégorie.

### Rédaction des scénarios

- Un scénario = un comportement métier, dans le vocabulaire du projet. Un `Background` pose le contexte
  commun (identité, données de départ) en steps métier.
- Cas passants (`nominal`) et règles qui exigent le système réel (`regle_metier`, `recherche_pagination`) ;
  un seul `refus_exemple` par type de refus métier.
- Annotations par scénario : `# ressource:`, `# endpoint:`, `# auth:`, `# precondition:` (si besoin),
  `# [CATEGORY]` (id du catalogue), `# champ:` (= `technical_name` de l'endpoint testé : celui de l'action du dernier `When`, pas ceux appelés en préparation), `# étape:` (= slug de la ressource).
- ⚠️ **Phrasé des steps** : pas de `/` (chemin), `( )`, `{ }` dans le texte (Cucumber Expressions), pas de code
  HTTP, pas de JSON. Le chemin va dans `# endpoint:`, où `{param}` est permis (les accolades ne sont
  interdites que dans le texte des steps).

## Étape 4 : validation et retour

Valider le pivot contre `engine/contracts/pivot.schema.json` **et** `pivot.overlay.schema.json` (JSON Schema
Draft 2020-12 : `jsonschema` >= 4 ou `ajv` 2020), puis les invariants de `engine/contracts/_pivot-json-format.md`, plus un contrôle propre à cet adapter : pour chaque
champ, `render.selector` == `<http.method> <http.path>`.
Terminer par le bloc `===PIPELINE-RETURN-START=== … ===PIPELINE-RETURN-END===`
(`agent: "java-rest-controllers-extract"`, `artifacts.pivot_file`, `artifacts.scope`, `artifacts.framework`,
`artifacts.scenarios_count`, `artifacts.unit_test_candidates_count`, `warnings` pour chaque endpoint dont
la sécurité n'a pas pu être établie).
