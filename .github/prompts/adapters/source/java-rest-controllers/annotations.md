# Vocabulaire d'annotations — adapter source `java-rest-controllers`

**Extension** du vocabulaire de base (`engine/contracts/_annotations-base.md`), propre aux API REST Java.
Déclaré via `manifest.provides.annotations`. Émis par `extract.prompt.md`, consommé par le target.

| Annotation | Sur | Rôle |
|---|---|---|
| `# ressource:` | un scénario | nom de la classe de contrôleur source (ex: `RuleResource`) |
| `# endpoint:` | un scénario | endpoint principal exercé, `METHOD /chemin` avec le chemin de base effectif (ex: `GET /api/organization-rules/{id}`). Alimente `covers_field` via le `technical_name` correspondant. |
| `# auth:` | un scénario | rôle ou identité nécessaire (ex: `admin`, `anonyme`), tel que déduit du code |
| `# precondition:` | un scénario | donnée à mettre en place avant l'appel (ex: `une organisation existe`) |

> Le texte des steps reste métier : pas de code HTTP, pas de corps JSON, pas de chemin dans une phrase
> Gherkin. Le détail HTTP vit dans la classe d'étapes du target et dans le pivot (`fields[].http`).
