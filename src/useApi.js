import {lookup, search} from './services/nominatimApi.js';
import {searchCommunes} from './services/geoApi.js';

/**
 * Recherche des communes de France par nom, sous la forme {display_name, lat, lon}.
 */
export const searchCity = async (city) => {
    const result = await searchCommunes({nom: city});
    if (result.status !== 200) {
        throw result.statusText;
    }
    return result.data
        .filter(commune => commune.centre)
        .map(commune => ({
            display_name: commune.departement ? `${commune.nom}, ${commune.departement.nom}` : commune.nom,
            lat: commune.centre.coordinates[1],
            lon: commune.centre.coordinates[0],
        }));
};

export const searchRestaurants = async (viewbox) => {
    const result = await search({
        viewbox: viewbox,
        bounded: 1,
        amenity: 'McDonald',
        limit: '20',
    });
    if (result.status !== 200) {
        throw result.statusText;
    }
    return result.data;
}

export const lookupRestaurant = async (osmIds) => {
    const result = await lookup({
        osm_ids: osmIds
    });
    if (result.status !== 200) {
        throw result.statusText;
    }
    return result.data[0];
}