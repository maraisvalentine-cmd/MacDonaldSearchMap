import {defineConfig} from 'cypress';
import {addCucumberPreprocessorPlugin} from '@badeball/cypress-cucumber-preprocessor';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';
import {createEsbuildPlugin} from '@badeball/cypress-cucumber-preprocessor/esbuild';
import cypressMochawesomeReporter from 'cypress-mochawesome-reporter/plugin.js';

export default defineConfig({
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {reportDir: 'cypress/reports', json: true, html: false, overwrite: false},
    e2e: {
        baseUrl: 'http://localhost:5173',
        specPattern: 'cypress/e2e/features/**/*.feature',
        supportFile: false,
        video: false,
        screenshotOnRunFailure: false,
        expose: {stepDefinitions: ['cypress/e2e/steps/**/*.steps.js']},
        async setupNodeEvents(on, config) {
            cypressMochawesomeReporter(on);
            await addCucumberPreprocessorPlugin(on, config);
            on('file:preprocessor', createBundler({plugins: [createEsbuildPlugin(config)]}));
            return config;
        },
    },
});
