---
name: cypress-auth-bypass
description: "Met en place le bypass d'authentification pour les tests Cypress E2E dans un projet Angular. Utiliser uniquement quand le bypass n'est pas déjà en place."
---

# Bypass de l'authentification pour Cypress E2E

> **Rôle dans le pipeline shugyo** : prérequis de setup réutilisé par le target `cypress`
> (`.github/prompts/adapters/target/cypress/setup.prompt.md`). Utilisable aussi seul.

Ce skill met en place un mécanisme de bypass d'authentification permettant aux tests Cypress de naviguer dans l'application sans passer par le flux d'auth réel (SSO, OAuth, etc.).

---

## 1 — Audit de l'existant (OBLIGATOIRE avant toute action)

Vérifier si un bypass d'authentification est déjà en place :

1. **Chercher `enableTestAuth` (ou équivalent)** dans les fichiers `environment*.ts` — si présent et configuré, le bypass est déjà en place → **ne rien faire, ce skill est terminé**.
2. **Chercher un `TestAuthenticationService`** (ou service similaire qui override le service d'auth réel) dans `src/`.
3. **Chercher un provider conditionnel** (`provideTestAuthIfNeeded` ou équivalent) référencé dans `app.module.ts` ou `app.config.ts`.
4. **Vérifier `angular.json`** : chercher une configuration de build avec `fileReplacements` pointant vers un `environment.test.ts` ou similaire.

Présenter le résultat de l'audit :

```
📋 Audit bypass auth Cypress :
- Variable enableTestAuth présente : ✅ / ❌
- TestAuthenticationService présent : ✅ / ❌
- Provider conditionnel présent : ✅ / ❌
- Configuration angular.json dédiée : ✅ / ❌
→ Bypass déjà opérationnel : ✅ (rien à faire) / ❌ (mise en place nécessaire)
```

**Si tout est déjà en place → ce skill est terminé.**

**⚠️ Vérifier aussi les autres flags d'environnement qui affectent le routing.**

Au-delà de `enableTestAuth`, d'autres propriétés de `environment.test.ts` peuvent activer un guard différent, un service différent, ou modifier le comportement de l'application (ex: `isPartnersConnection`, `featureFlags`, etc.). Pour chaque guard identifié à l'étape 2, vérifier que les propriétés d'environnement correspondent au comportement attendu dans les scénarios. Un flag mal positionné fait tourner le mauvais code silencieusement — c'est la source d'erreur la plus difficile à diagnostiquer.

---

## 2 — Découverte du service d'authentification

Analyser dans cet ordre :

1. **Lire `src/app/app.routes.ts` ou `app-routing.module.ts`** → identifier les routes avec `canActivate`.
2. **Lire les guards référencés** (`*.guard.ts`) → identifier le service d'auth injecté et les méthodes appelées (ex: `isAuthenticated()`, `hasRole()`, `isLoggedIn()`).
3. **Lire le service d'auth** → relever :
   - Son nom de classe et son token d'injection (`InjectionToken` ou classe directe)
   - Toutes les méthodes publiques utilisées dans les guards
   - Son type de retour (booléen, observable, promise)

Si aucun guard n'est trouvé → informer l'utilisateur que l'application ne semble pas avoir d'authentification à bypasser. **Ce skill est terminé.**

---

## 3 — Mise en place du bypass

### `src/environments/environment.type.ts`

Ajouter la propriété `enableTestAuth` à l'interface d'environnement existante :

```typescript
// Ajouter à l'interface existante
enableTestAuth?: boolean;
```

### `src/environments/environment.test.ts`

Créer ce fichier en recopiant le contenu de `environment.ts` et en ajoutant `enableTestAuth: true` :

```typescript
// Basé sur environment.ts existant, avec l'ajout :
export const environment = {
  ...environmentBase, // conserver toutes les propriétés existantes
  enableTestAuth: true
};
```

### `src/test/test-authentication.service.ts`

Créer un service qui étend le vrai service d'auth et neutralise toutes ses méthodes. Adapter les méthodes overridées à celles découvertes à l'étape 2 :

```typescript
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { AuthenticationService } from '../app/[chemin-découvert]/authentication.service';

@Injectable()
export class TestAuthenticationService extends AuthenticationService {
  override configure(): void {}

  override isAuthenticated(): boolean {
    return true;
  }

  override login(): void {}
  override logout(): void {}

  override getToken(): string | null {
    return 'fake-token';
  }

  override hasRole(): boolean {
    return true;
  }

  // Override toutes les autres méthodes découvertes à l'étape 2
}
```

### `src/test/test-authentication.provider.ts`

```typescript
import { Provider } from '@angular/core';
import { environment } from '../environments/environment';
import { AuthenticationService } from '../app/[chemin-découvert]/authentication.service';
import { TestAuthenticationService } from './test-authentication.service';

export function provideTestAuthIfNeeded(): Provider[] {
  if (!environment.enableTestAuth) {
    return [];
  }
  return [{ provide: AuthenticationService, useClass: TestAuthenticationService }];
}
```

### `src/app/app.module.ts` ou `src/app/app.config.ts`

Détecter l'approche Angular du projet :

| Fichier présent         | Approche                                          | Action                                                     |
| ----------------------- | ------------------------------------------------- | ---------------------------------------------------------- |
| `src/app/app.module.ts` | NgModule (Angular < 17 ou opt-out standalone)     | Ajouter dans `providers[]` du `@NgModule`                  |
| `src/app/app.config.ts` | Standalone / `bootstrapApplication` (Angular 17+) | Ajouter dans le tableau `providers` de `ApplicationConfig` |
| Les deux présents       | Migration en cours                                | Ajouter dans `app.config.ts`                               |

**NgModule :**

```typescript
import { provideTestAuthIfNeeded } from '../test/test-authentication.provider';

@NgModule({
  providers: [
    ...provideTestAuthIfNeeded()
    // ... providers existants
  ]
})
export class AppModule {}
```

**Standalone (`app.config.ts`) :**

```typescript
import { provideTestAuthIfNeeded } from '../test/test-authentication.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    ...provideTestAuthIfNeeded()
    // ... providers existants
  ]
};
```

### `angular.json`

Ajouter une configuration de build dédiée `cypress` qui remplace `environment.ts` par `environment.test.ts`, en héritant de la configuration existante (`development` ou `local`) :

```json
"cypress": {
  "fileReplacements": [
    {
      "replace": "src/environments/environment.ts",
      "with": "src/environments/environment.test.ts"
    }
  ]
}
```

Ajouter la configuration `serve` correspondante :

```json
"serve": {
  "configurations": {
    "cypress": {
      "buildTarget": "[project-name]:build:cypress"
    }
  }
}
```

Ajouter le script dans `package.json` en incluant `--project` si monorepo :

```json
// Projet unique
"start:cypress": "ng serve --configuration=cypress"

// Monorepo (adapter [nom-projet])
"start:cypress": "ng serve --project=[nom-projet] --configuration=cypress"
```

---

## 4 — Vérification

Après la mise en place, vérifier :

- Que `environment.test.ts` ne contient pas de vraies credentials ou URLs de production
- Que `src/test/` est exclu du build de production (`tsconfig.app.json` → `exclude`)

---

## Checklist de validation du skill

- [ ] Audit effectué et présenté à l'utilisateur
- [ ] Les flags d'environnement au-delà de `enableTestAuth` ont été vérifiés pour chaque guard
- [ ] `enableTestAuth` présent dans le type d'environnement
- [ ] `environment.test.ts` créé avec `enableTestAuth: true`
- [ ] `TestAuthenticationService` créé avec toutes les méthodes overridées
- [ ] Approche Angular détectée (NgModule vs standalone) et provider injecté dans le bon fichier
- [ ] Configuration `cypress` ajoutée dans `angular.json` avec `fileReplacements`
- [ ] Script `start:cypress` ajouté dans `package.json`
- [ ] `src/test/` exclu du build de production dans `tsconfig.app.json`
- [ ] `environment.test.ts` ne contient pas de credentials de production
