import {Given, Then} from '@badeball/cypress-cucumber-preprocessor';
import {serverError, stubCitySearch, stubLookup, stubRestaurantsSearch, stubTiles} from './common.intercepts';
import {FIELDS as SEARCH} from '../search-city/search-city.fields';
import {FIELDS as MAP} from '../map-view/map-view.fields';

Given('les API externes sont simulées', () => {
    stubTiles();
    stubCitySearch();
    stubRestaurantsSearch();
    stubLookup();
});

Given('j\'ouvre la page d\'accueil', () => {
    cy.visit('/');
});

Given('l\'API de recherche de ville répond une erreur', () => {
    stubCitySearch(serverError);
});

Given('l\'API de recherche de restaurants ne retourne aucun résultat', () => {
    stubRestaurantsSearch({fixture: 'restaurants-empty.json'});
});

Given('l\'API de détails retourne un restaurant sans coordonnées de contact', () => {
    stubLookup({fixture: 'lookup-without-contact.json'});
});

Given('l\'API de détails retourne un restaurant sans site web', () => {
    stubLookup({fixture: 'lookup-without-website.json'});
});

Given('l\'API de détails répond une erreur', () => {
    stubLookup(serverError);
});

Given('j\'ai lancé la recherche de restaurants pour {string}', (city) => {
    cy.get(SEARCH['Champ de recherche de ville']).type(city);
    cy.wait('@searchCity');
    cy.get(SEARCH['Suggestion de ville']).first().click();
    cy.get(SEARCH['Bouton de recherche']).click();
    cy.wait('@searchRestaurants');
});

Given('j\'ai choisi le restaurant numéro {int}', (n) => {
    cy.get(MAP['Marqueur de restaurant']).eq(n - 1).click();
    cy.get(MAP['Bouton Choisir']).contains('Choisir').click();
    cy.wait('@lookup');
});

Then('un appel de recherche de restaurants est émis', () => {
    cy.wait('@searchRestaurants');
});

Then('aucun appel de recherche de restaurants n\'a été émis', () => {
    // Absence d'appel : on laisse un court délai à l'application pour réagir avant de vérifier.
    cy.wait(500);
    cy.get('@searchRestaurants.all').should('have.length', 0);
});

Then('un appel de détails est émis', () => {
    cy.wait('@lookup');
});

Then('{int} marqueurs sont affichés', (count) => {
    cy.get(MAP['Marqueur de restaurant']).should('have.length', count);
});

Then('aucun marqueur n\'est affiché', () => {
    cy.get(MAP['Marqueur de restaurant']).should('not.exist');
});

Then('le dernier appel de détails porte sur l\'identifiant {string}', (osmIds) => {
    cy.get('@lookup.all').then((calls) => {
        const last = calls[calls.length - 1];
        expect(last.request.url).to.include(`osm_ids=${osmIds}`);
    });
});
