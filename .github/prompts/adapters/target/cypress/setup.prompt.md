---
name: cypress-setup
---

# Adapter target `cypress` — setup Cypress + Cucumber sur un projet Angular ou React

Préalable one-shot à `generate` : mettre en place Cypress + le preprocessor Cucumber (esbuild)
et le reporter mochawesome. À exécuter une fois par projet. Le framework (Angular, React…) se détecte
dans `package.json` ; seules l'authentification et le serveur de développement en dépendent.

## Étape 0 — Authentification (prérequis)

Si l'app est protégée (guard de route, redirection vers un login), les tests ne pourront pas naviguer sans
la contourner. Auditer l'existant avant d'ajouter quoi que ce soit :

1. Un bypass déjà en place (service d'authentification de test, flag d'environnement, session injectée) : le réutiliser.
2. Projet **Angular** sans bypass : **exécuter le skill `cypress-auth-bypass`** (`TestAuthenticationService` +
   `environment.test.ts` + config de build `cypress` dans `angular.json` + script `start:cypress`). **Ne pas le
   réimplémenter ici.** La config `serve` `cypress` fournit alors l'URL du dev server.
3. **React** ou autre : poser la session en amont du test (`cy.session`, jeton injecté dans `localStorage`, ou
   interception de la requête d'identité) ; demander d'où viennent les identifiants de test.

Une app sans authentification n'a rien à faire ici.

## Étape 1 — Dépendances

> Fonctionne aussi sur un projet qui a **déjà Cypress mais pas Cucumber** (cas fréquent) :
> on **ajoute** alors la couche Gherkin (`@badeball` + esbuild) sans toucher aux tests Cypress existants.

Vérifier / installer (devDependencies) :
```
cypress
@badeball/cypress-cucumber-preprocessor
@bahmutov/cypress-esbuild-preprocessor
cypress-mochawesome-reporter
start-server-and-test        # pour lancer le dev server + Cypress ensemble
```

## Étape 2 — Config Cypress

Créer `cypress.config.ts` (ou le `cypress.cypress_config_file` du `.shugyo.yaml`) avec :
- `reporter: 'cypress-mochawesome-reporter'`, `reporterOptions.reportDir: 'cypress/reports'`,
  `json: true`. `feedback-loop` lit `cypress/reports/report.json` ou, à défaut, les `cypress/reports/.jsons/*.json`
  (le reporter écrit ces derniers par spec).
- `e2e.baseUrl` = URL du dev server (voir Étape 4).
- `e2e.specPattern`: `cypress/integration/features/**/*.feature`.
- les step definitions : `cypress/integration/steps/**/*.steps.ts`. **@badeball ne les trouve que si on les déclare** :
  `e2e.expose.stepDefinitions` à partir de Cypress 16 (`@badeball` 28, qui lit `config.expose`), `e2e.env.stepDefinitions`
  avant (vérifié sur @badeball 24 et 26). Alternative stable quelle que soit la version : la clé
  `"cypress-cucumber-preprocessor": { "stepDefinitions": [...] }` dans `package.json`.
- `e2e.supportFile: false` si le projet n'a pas de `cypress/support/e2e.ts` (Cypress l'exige sinon).
- `e2e.video: false` et `e2e.screenshotOnRunFailure: false` : en headless, une capture d'écran qui expire coûte
  30 s par test en échec et masque l'erreur réelle.
- `cypress/tsconfig.json` (types `cypress`) pour que l'éditeur et esbuild résolvent `cy`.
- `setupNodeEvents` : brancher `addCucumberPreprocessorPlugin` + le bundler esbuild
  (`createBundler` avec `createEsbuildPlugin`).

```ts
import { defineConfig } from 'cypress';
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';
import cypressMochawesomeReporter from 'cypress-mochawesome-reporter/plugin';
import { createEsbuildPlugin } from '@badeball/cypress-cucumber-preprocessor/esbuild';

export default defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: { reportDir: 'cypress/reports', json: true, html: true, overwrite: false },
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/integration/features/**/*.feature',
    supportFile: false,
    video: false,
    screenshotOnRunFailure: false,
    expose: { stepDefinitions: ['cypress/integration/steps/**/*.steps.ts'] }, // Cypress >= 16 ; `env` avant
    async setupNodeEvents(on, config) {
      cypressMochawesomeReporter(on);
      await addCucumberPreprocessorPlugin(on, config);
      on('file:preprocessor', createBundler({ plugins: [createEsbuildPlugin(config)] }));
      return config;
    },
  },
});
```

> ⚠️ **À savoir** (vérifié en run réel) : par défaut, `@badeball` ne trouve **pas** un `*.steps.ts`
> posé à côté du `.feature` — il **faut** déclarer `stepDefinitions` (clé `expose` ou `env` selon la version, voir
> plus haut). Symptôme d'une mauvaise clé : « Step implementation missing ». Alternative équivalente :
> la clé `"cypress-cucumber-preprocessor": { "stepDefinitions": [...] }` dans `package.json`.
> (Un `.cypress-cucumber-preprocessor.json` à la racine a été ignoré dans un test — éviter.)

## Étape 3 — Helper de sélecteur

Créer `cypress/support/utils.ts` avec un helper de sélecteur data-attribute, aligné sur la
convention du projet (détecter `data-test` / `data-testid` / `data-selector` / `data-cy` dans les templates ou le JSX) :
```ts
export const dataSelector = (name: string): string => `[data-testid="${name}"]`;
```
> Les sources (`angular-components`, `react-components`) émettent des sélecteurs `render.selector` dans **cette** convention ;
> le `generate` les consomme tels quels. Garder les deux cohérents.

## Étape 4 — Scripts npm

Ajouter un script de démarrage `start` s'il n'existe pas (Vite n'a que `dev` : `"start": "vite --port 5173 --strictPort"`)
et un script de run headless (consommé par le step `run` via `run.command`) :
```json
"test:e2e:cypress": "start-server-and-test start http://localhost:4200 'cypress run'"
```
Adapter le script de démarrage et l'URL **en les lisant dans le projet** : Angular `ng serve` (4200 par défaut), Vite
(5173), Create React App (3000), ou un script de démarrage dédié aux tests s'il existe. Renseigner `run.command`
(`npm run test:e2e:cypress`) et `run.targeted` du `.shugyo.yaml` en conséquence (même commande de démarrage, avec
`--spec {files_csv}` dans la commande Cypress).

## Étape 5 — Retour

Terminer par le bloc `===PIPELINE-RETURN-START=== … ===PIPELINE-RETURN-END===`
(`agent: "cypress-setup"`, `artifacts.config_written`, `artifacts.deps_installed`).
