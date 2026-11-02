import {Then, When} from '@badeball/cypress-cucumber-preprocessor';
import {FIELDS} from './selection-details.fields';

Then('le bandeau indique {string}', (title) => {
    cy.get(FIELDS['Titre du bandeau']).should('be.visible').and('contain', title);
});

Then('les détails contiennent {string}', (text) => {
    cy.get(FIELDS['Détails']).should('contain', text);
});

Then('les détails ne contiennent pas {string}', (text) => {
    cy.get(FIELDS['Détails']).should('be.visible').and('not.contain', text);
});

Then('les détails sont masqués', () => {
    cy.get(FIELDS['Détails']).should('not.exist');
});

When('je clique sur le bouton {string}', (label) => {
    cy.get(FIELDS[label]).click();
});

Then('le bouton {string} est visible', (label) => {
    cy.get(FIELDS[label]).should('be.visible');
});

Then('le bouton {string} n\'est pas affiché', (label) => {
    cy.get(FIELDS[label]).should('not.exist');
});

Then('le lien Continuer pointe vers {string}', (href) => {
    cy.get(FIELDS['Lien Continuer']).should('have.attr', 'href', href);
});
