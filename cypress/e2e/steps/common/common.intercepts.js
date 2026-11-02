const NOMINATIM_HOST = 'nominatim.openstreetmap.org';
const GEO_API_HOST = 'geo.api.gouv.fr';

/** Les tuiles OpenStreetMap ne sont pas chargées : seule la structure Leaflet nous intéresse. */
export const stubTiles = () =>
    cy.intercept({method: 'GET', url: 'https://*.tile.openstreetmap.org/**'}, {
        statusCode: 200,
        headers: {'content-type': 'image/png'},
        body: '',
    });

/** Recherche de ville : GET communes sur l'API geo.api.gouv.fr (cf. searchCity). */
export const stubCitySearch = (response = {fixture: 'cities.json'}) =>
    cy.intercept({
        method: 'GET',
        hostname: GEO_API_HOST,
        pathname: '/communes',
    }, response).as('searchCity');

/** Recherche de restaurants : GET search avec amenity=McDonald (cf. searchRestaurants). */
export const stubRestaurantsSearch = (response = {fixture: 'restaurants.json'}) =>
    cy.intercept({
        method: 'GET',
        hostname: NOMINATIM_HOST,
        pathname: '/search',
        query: {amenity: 'McDonald'},
    }, response).as('searchRestaurants');

/** Détails d'un restaurant : GET lookup (cf. lookupRestaurant). */
export const stubLookup = (response = {fixture: 'lookup-restaurant.json'}) =>
    cy.intercept({
        method: 'GET',
        hostname: NOMINATIM_HOST,
        pathname: '/lookup',
    }, response).as('lookup');

export const serverError = {statusCode: 500, body: {}};

/** Nominatim répond 429 quand la limite de débit de sa politique d'usage est dépassée. */
export const tooManyRequests = {statusCode: 429, body: {}};
