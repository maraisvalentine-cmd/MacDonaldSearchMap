import {Then, When} from '@badeball/cypress-cucumber-preprocessor';
import {FIELDS} from './map-view.fields';

Then('je vois la carte', () => {
    cy.get(FIELDS['Carte']).should('be.visible');
});

When('je clique sur le marqueur numéro {int}', (n) => {
    cy.get(FIELDS['Marqueur de restaurant']).eq(n - 1).click();
});

When('je clique sur Choisir', () => {
    cy.get(FIELDS['Bouton Choisir']).contains('Choisir').click();
});

Then('la popup affiche le nom {string}', (name) => {
    cy.get(FIELDS['Nom du restaurant dans la popup']).should('be.visible').and('contain', name);
});

Then('la popup propose le bouton Choisir', () => {
    cy.get(FIELDS['Bouton Choisir']).contains('Choisir').should('be.visible');
});
