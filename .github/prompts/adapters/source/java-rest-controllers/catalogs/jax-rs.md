# Catalogue framework — JAX-RS (Quarkus RESTEasy / Jakarta REST)

Utilisé quand `api.framework` vaut `jax-rs`, ou quand l'auto-détection trouve `@Path` sur une classe.

## Ressources et routes

| Élément | Où le lire |
|---|---|
| Classe de ressource | `@Path("/x")` sur la classe |
| Verbe | `@GET`, `@POST`, `@PUT`, `@PATCH`, `@DELETE` (+ `@HEAD`, `@OPTIONS`) |
| Chemin de méthode | `@Path("/{id}")` sur la méthode, concaténé au chemin de classe |
| Types de contenu | `@Consumes`, `@Produces` (classe ou méthode) |

**Chemin de base effectif** : préfixer par `@ApplicationPath` d'une sous-classe de `Application`,
`quarkus.http.root-path` et `quarkus.rest.path` (`application.properties`, profils). Dans un projet où
le préfixe est écrit dans `@Path` (`@Path("/api/todos")`), ne rien ajouter.

## Paramètres

| Annotation | Entrée du pivot (`http.*`) |
|---|---|
| `@PathParam` | `path_params[]` |
| `@QueryParam` (+ `@DefaultValue`) | `query_params[]` (`@DefaultValue` donne `required: false`) |
| `@BeanParam` | développer les champs de la classe : chacun est un `query_params[]` (ou `path_params[]`, `headers[]`) selon son annotation |
| `@HeaderParam` | `headers[]` |
| `@FormParam`, `@RestForm` | `request_body` de type formulaire |
| paramètre sans annotation | `request_body` (suivre le type jusqu'à ses champs ; un `record` suffit) |

## Réponses

- Statut nominal : un retour `Response` (`Response.created(...)`, `.noContent()`, `.status(...)`), `@ResponseStatus` (RESTEasy Reactive), ou 200 par défaut (204 pour `void`).
- Statuts d'erreur : `ExceptionMapper<…>`, `@ServerExceptionMapper`, `WebApplicationException` et ses sous-classes (`NotFoundException`…). Les lire pour établir les statuts d'erreur possibles (format `application/problem+json` possible).

## Validation

- Bean Validation (`@Valid`, `@NotNull`, `@Size`…) sur les paramètres ou le corps.
- Validation par objets valeur du domaine : suivre la conversion `RestXxx` -> domaine. Un `ParamConverter` de paramètre se lit de la même façon.

## Sécurité

- `@RolesAllowed`, `@PermitAll`, `@DenyAll`, `@Authenticated` (Quarkus) sur la méthode ou la classe.
- Politiques HTTP dans `application.properties` : `quarkus.http.auth.permission.*`.
- Autorisation dans la couche service (`@RolesAllowed` sur un service, `SecurityIdentity`) : lire le service appelé par la ressource.
- Rôles issus d'un claim personnalisé : `quarkus.oidc.roles.role-claim-path`, ou une `SecurityIdentityAugmentor`.

## À ignorer

Ressources de test (`src/test`), endpoints `/q/*` (health, metrics, openapi).
