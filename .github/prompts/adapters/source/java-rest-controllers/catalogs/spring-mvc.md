# Catalogue framework — Spring MVC

Utilisé quand `api.framework` vaut `spring-mvc`, ou quand l'auto-détection trouve `@RestController`
ou `@Controller` + `@ResponseBody`.

## Contrôleurs et routes

| Élément | Où le lire |
|---|---|
| Classe de contrôleur | `@RestController`, ou `@Controller` + `@ResponseBody` |
| Chemin de classe | `@RequestMapping("/x")` sur la classe |
| Verbe et chemin de méthode | `@GetMapping`, `@PostMapping`, `@PutMapping`, `@PatchMapping`, `@DeleteMapping`, ou `@RequestMapping(method=…)` |
| Types de contenu | attributs `consumes` et `produces` |

**Chemin de base effectif** : préfixer par `server.servlet.context-path` (`application.yml` /
`application.properties`, y compris les profils), `spring.mvc.servlet.path`, ou un
`configurePathMatch(...addPathPrefix...)` d'un `WebMvcConfigurer`. Exemple : `context-path: /api` +
`@RequestMapping("/organization-rules")` donne `/api/organization-rules`.

## Paramètres

| Annotation | Entrée du pivot (`http.*`) |
|---|---|
| `@PathVariable` | `path_params[]` |
| `@RequestParam(name, required, defaultValue)` | `query_params[]` (`defaultValue` donne `required: false`) |
| `@RequestBody` | `request_body` (suivre le type jusqu'à ses champs ; un `record` suffit) |
| `@RequestHeader` | `headers[]` |
| `@ModelAttribute` ou objet sans annotation | `query_params[]` (champs de l'objet) |

## Réponses

- Statut nominal : `@ResponseStatus`,  ou `ResponseEntity.status(...)` / `.created(...)` / `.noContent()` ; à défaut 200 (204 pour un retour `void`).
- Statuts d'erreur : `@ExceptionHandler` et `@ControllerAdvice` / `@RestControllerAdvice` (mapping exception -> statut), `ResponseStatusException`, handler `ProblemDetail`. Les lire pour établir les statuts d'erreur possibles.

## Validation

- Bean Validation : `@Valid`, `@Validated`, `@NotNull`, `@Size`, `@Min`, `@Pattern`… sur le corps ou les paramètres.
- Validation par objets valeur du domaine (constructeur qui lève une exception) : suivre la conversion
  `RestXxx` -> domaine pour lire les bornes. Même cas pour un `Converter` / `ParamConverter` de paramètre.

## Sécurité

- Sur la méthode ou la classe : `@PreAuthorize`, `@PostAuthorize`, `@Secured`, `@RolesAllowed`.
- Centralisée : `SecurityFilterChain` (`authorizeHttpRequests`, `requestMatchers(...)`), à croiser avec les chemins.
- Dans la couche service (`SecurityContextHolder`, vérification d'un rôle) : lire le service appelé par le contrôleur.
- Rôles issus d'un claim JWT personnalisé : chercher le `JwtAuthenticationConverter`.

## À ignorer

Contrôleurs de test (`src/test`), endpoints Actuator, documentation (`@Tag`, `@Operation` : utile seulement pour le libellé).
