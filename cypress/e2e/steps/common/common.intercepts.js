const NOMINATIM_HOST = 'nominatim.openstreetmap.org';

/** Les tuiles OpenStreetMap ne sont pas chargées : seule la structure Leaflet nous intéresse. */
export const stubTiles = () =>
    cy.intercept({method: 'GET', url: 'https://*.tile.openstreetmap.org/**'}, {
        statusCode: 200,
        headers: {'content-type': 'image/png'},
        body: '',
    });

/** Recherche de ville : GET search avec featureType=city (cf. searchCity). */
export const stubCitySearch = (response = {fixture: 'cities.json'}) =>
    cy.intercept({
        method: 'GET',
        hostname: NOMINATIM_HOST,
        pathname: '/search',
        query: {featureType: 'city'},
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
