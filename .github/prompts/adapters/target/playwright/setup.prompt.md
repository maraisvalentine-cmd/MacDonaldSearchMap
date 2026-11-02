---
name: playwright-setup
---

# Adapter target `playwright` — setup Playwright + playwright-bdd

Préalable one-shot à `generate` : mettre en place Playwright, `playwright-bdd` et le reporter JSON
sur un projet Angular ou React. À exécuter une fois par projet. Ne touche pas aux tests
Playwright existants : le setup ajoute la couche Gherkin et ne remplace rien.

## Étape 0 — Authentification (prérequis)

Si l'app est protégée (guard de route, redirection vers un login), les tests ne pourront pas naviguer
sans contournement. Auditer l'existant avant d'ajouter quoi que ce soit :

1. Un bypass déjà en place (`TestAuthenticationService` Angular, flag d'environnement de test,
   `storageState` Playwright) → le réutiliser, ne rien générer.
2. Projet Angular sans bypass → exécuter le skill `cypress-auth-bypass` : il modifie l'app, pas l'outil
   de test, donc il sert aussi pour Playwright. **Ne pas le réimplémenter ici.**
3. Autre cas (React, ou authentification par session) → proposer un projet Playwright `setup` qui
   se connecte une fois (appel API ou formulaire) et écrit un `storageState`, puis le référencer dans
   `use.storageState`. Demander à l'utilisateur d'où viennent les identifiants de test.

## Étape 1 — Dépendances

Vérifier / installer (devDependencies) : `@playwright/test`, `playwright-bdd`. Prérequis de
`playwright-bdd` : Node.js 20.18+ et Playwright 1.53+ (vérifier la version installée avant d'ajouter
le paquet). Installer les navigateurs : `npx playwright install`.

## Étape 2 — Config Playwright

Créer `playwright.config.ts` (ou `playwright.config_file` du `.shugyo.yaml`). Adapter les chemins à
`paths.features_output_dir` et `paths.steps_output_dir` ; les chemins relatifs sont résolus depuis
le fichier de config.

```ts
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'tests/e2e/features/**/*.feature',
  steps: 'tests/e2e/steps/**/*.ts',
  language: 'fr',                       // seulement si les .feature sont en français
});

export default defineConfig({
  testDir,
  reporter: [['list'], ['json', { outputFile: 'playwright-report/results.json' }]],
  use: { baseURL: 'http://localhost:4200', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
  },
});
```

Valeurs propres au projet, à **détecter** et non à imposer :
- **`command` et `url` du `webServer`** : lire les scripts de `package.json` et la config du dev server
  (Angular : `ng serve`, port 4200 par défaut ; Vite : 5173 ; Create React App : 3000). Si un script de
  démarrage dédié aux tests existe (config de build `cypress`, mode `test`), le préférer.
- **`language`** : à omettre si les `.feature` sont en anglais.
- **Reporter JSON** : le chemin `playwright-report/results.json` doit rester celui de
  `feedback.reports_dir` (feedback-loop le lit).

## Étape 3 — Scripts npm et ignorés

Ajouter un script de run headless (consommé par le step `run` via `run.command`) :
```json
"test:e2e": "bddgen && playwright test"
```
Ajouter au `.gitignore` : `.features-gen/` (tests générés par `bddgen`), `playwright-report/`, `test-results/`.
Renseigner `run.command` du `.shugyo.yaml` si le script diffère du défaut.

## Étape 4 — Retour

Terminer par le bloc `===PIPELINE-RETURN-START=== … ===PIPELINE-RETURN-END===`
(`agent: "playwright-setup"`, `artifacts.config_written`, `artifacts.deps_installed`).
