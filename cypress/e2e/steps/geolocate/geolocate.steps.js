import {Given, Then, When} from '@badeball/cypress-cucumber-preprocessor';
import {FIELDS} from './geolocate.fields';

const LYON = {latitude: 45.7578, longitude: 4.832, accuracy: 10};

// Leaflet enregistre son handler locationfound APRES l'appel à map.locate() : la réponse
// du navigateur doit donc être asynchrone, comme en réel.
Given('la géolocalisation du navigateur renvoie la position de Lyon', () => {
    cy.window().then((win) => {
        cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((onSuccess) => {
            win.setTimeout(() => onSuccess({coords: LYON, timestamp: Date.now()}), 50);
        });
    });
});

Given('la géolocalisation du navigateur est refusée', () => {
    cy.window().then((win) => {
        cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((onSuccess, onError) => {
            win.setTimeout(() => onError({code: 1, message: 'User denied Geolocation'}), 50);
        });
    });
});

Then('je vois le bouton de géolocalisation', () => {
    cy.get(FIELDS['Bouton de géolocalisation']).should('be.visible');
});

When('je clique sur le bouton de géolocalisation', () => {
    cy.get(FIELDS['Bouton de géolocalisation']).click();
});
