import {Then, When} from '@badeball/cypress-cucumber-preprocessor';
import {FIELDS} from './search-city.fields';

When('je saisis {string} dans le champ de recherche de ville', (value) => {
    cy.get(FIELDS['Champ de recherche de ville']).type(value);
});

When('je supprime {int} caractères du champ de recherche de ville', (count) => {
    cy.get(FIELDS['Champ de recherche de ville']).type('{backspace}'.repeat(count));
});

When('je choisis la première suggestion de ville', () => {
    cy.get(FIELDS['Suggestion de ville']).first().click();
});

When('je valide la recherche', () => {
    cy.get(FIELDS['Bouton de recherche']).click();
});

Then('je vois le libellé {string}', (label) => {
    cy.get(FIELDS['Libellé de recherche']).should('be.visible').and('contain', label);
});

Then('je vois le champ de recherche de ville', () => {
    cy.get(FIELDS['Champ de recherche de ville']).should('be.visible');
});

Then('je vois le bouton de recherche', () => {
    cy.get(FIELDS['Bouton de recherche']).should('be.visible');
});

Then('aucune suggestion de ville n\'est affichée', () => {
    cy.get(FIELDS['Suggestion de ville']).should('not.exist');
});

Then('aucun appel de recherche de ville n\'a été émis', () => {
    cy.get('@searchCity.all').should('have.length', 0);
});

Then('un appel de recherche de ville est émis', () => {
    cy.wait('@searchCity');
});

// La recherche de ville passe par l'API des communes (geo.api.gouv.fr), pas par Nominatim dont
// la politique d'usage interdit l'autocomplétion côté client.
Then('la recherche de ville porte sur {string}', (name) => {
    cy.get('@searchCity.all').then((calls) => {
        const last = calls[calls.length - 1];
        expect(new URL(last.request.url).searchParams.get('nom')).to.equal(name);
    });
});

Then('{int} suggestions de villes sont affichées', (count) => {
    cy.get(FIELDS['Suggestion de ville']).should('have.length', count);
});

Then('la suggestion numéro {int} contient {string}', (n, text) => {
    cy.get(FIELDS['Suggestion de ville']).eq(n - 1).should('contain', text);
});
