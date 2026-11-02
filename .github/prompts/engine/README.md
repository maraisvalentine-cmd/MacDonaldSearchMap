# Engine Shugyo — noyau générique

> Ce dossier est **100 % générique**. Aucune référence à un produit. Il ne change jamais selon le projet.
> Tout ce qui est propre à un projet vit dans `../adapters/…` (jamais ici).

## Frontière (la règle unique)

- **`engine/`** = ce qui est vrai pour **TOUS** les projets.
- **`adapters/<source|target>/<nom>/`** = ce qui n'est vrai que pour **UN** projet (ou une famille).
- **`adapters/overlays/<nom>/`** = petits deltas d'un projet par-dessus un adapter existant.

Rien de propre à un projet ne vit dans `engine/`. Rien de générique ne vit dans un dossier de projet.

## Cascade de configuration (le dernier gagne)

```
engine/profiles/default   →   adapters du profil choisi   →   overlay   →   .shugyo.yaml du projet
   (toujours là)                (toto / …)             (deltas)        (overrides locaux)
```

C'est cette cascade qui rend les trois cas possibles :

| Cas | `.shugyo.yaml` | Effet |
|---|---|---|
| **Sans surcharge** | pas de `profile:` | `profiles/default` → `manual-feature` + `cypress-cucumber`. Ça tourne. |
| **Stack explicite** | `profile: { source: angular-components, target: cypress }` | pipeline Angular from-code |
| **Toto** | `profile: { source: toto, overlay: toto }` + overrides | source propre à toto + quelques deltas |

## Le contrat : `contracts/pivot.schema.json`

Le **pivot.json est l'interface** entre l'adapter source (le produit) et tout l'aval (audit / cypress-gen / feedback / mutation). Le schéma est **volontairement permissif** :

- il **n'exige** que le noyau générique dont l'engine dépend réellement (steps, fields+render, scenarios_index) ;
- il **laisse passer** toutes les extensions de profil (`data_type`, `render.wrapper_selector`, `callbacks`, `constraints`, `rules`…) via `additionalProperties: true` et des enums ouverts ;
- un profil peut **resserrer** en fournissant un overlay `adapters/source/<nom>/pivot.overlay.schema.json` (enums fermés, extensions requises), validé **en plus** du schéma de base par `verify-adapter`.

Conséquence : ajouter un adapter source = écrire un `extract.prompt.md` qui produit un pivot valide. Rien d'autre en aval ne bouge.

## Vérifier un adapter

`verify-adapter.prompt.md` prend un adapter + une golden fixture, exécute son extract, valide le pivot produit contre le schéma de base (+ overlay), rejoue les invariants métier et le return-block, puis émet un verdict. C'est un **prompt** (aucun binaire, aucun runtime imposé) — conforme à l'objectif « fonctionne avec n'importe quel agent/LLM ».

## État (Phase 0)

Posé ici : `contracts/pivot.schema.json`, `verify-adapter.prompt.md`, `profiles/default/manifest.yaml`.
À venir (Phase 1) : déménagement des prompts existants vers `engine/` + `adapters/`, création des adapters `manual-feature` et `cypress-cucumber`, résolution des prompts via `profile.source/target`. Voir le plan de migration.
